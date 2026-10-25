"""Render one scene to an intermediate clip (H.264, no audio, exact frame count).

photo/ai_image/local image: a "plate" is prepared at 2x output size (cover crop
when the shape is close to 16:9, otherwise the image framed on a blurred,
darkened copy of itself), then FFmpeg's zoompan applies the camera move.
Multi-shot scenes cut between their images.

graphics: frames are streamed from the graphics renderer straight into FFmpeg.
Once the animation settles (identical frames), the last frame is held, which
keeps long graphic scenes fast to render.

video: scaled/cropped to cover; slowed (up to 1.5x) or held on the last frame
if shorter than the scene, trimmed if longer.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from .. import media
from ..asset_manager.graphics import make_ctx, render_frame

GRAPHIC_KINDS = {"map", "chart", "timeline", "stat", "title", "comparison", "quote", "text"}


def encode_args(config, final: bool = False) -> list[str]:
    g = config.get_path
    preset = g("editor.video_preset") if final else g("editor.intermediate_preset", "veryfast")
    return ["-c:v", "libx264", "-preset", preset, "-crf", str(g("editor.video_crf", 18)),
            "-pix_fmt", "yuv420p", "-r", str(g("project.fps", 30)), "-an"]


def make_plate(src: Path, dest: Path, w: int, h: int) -> None:
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    W, H = w * 2, h * 2
    aspect, target = img.width / img.height, W / H
    if 0.85 * target <= aspect <= 1.35 * target and img.width >= w * 0.9:
        plate = ImageOps.fit(img, (W, H), Image.LANCZOS)
    else:
        bg = ImageOps.fit(img, (W // 8, H // 8), Image.BILINEAR).filter(ImageFilter.GaussianBlur(6))
        bg = ImageEnhance.Brightness(bg.resize((W, H), Image.BICUBIC)).enhance(0.45)
        fg = img.copy()
        fg.thumbnail((int(W * 0.92), int(H * 0.92)), Image.LANCZOS)
        if fg.height < H * 0.7 and fg.width < W * 0.7:  # small archival print: enlarge gently
            k = min(W * 0.92 / fg.width, H * 0.92 / fg.height)
            fg = fg.resize((int(fg.width * k), int(fg.height * k)), Image.LANCZOS)
        shadow = Image.new("RGB", (fg.width + 40, fg.height + 40), (0, 0, 0))
        bg.paste(shadow.filter(ImageFilter.GaussianBlur(18)), ((W - fg.width) // 2 - 20, (H - fg.height) // 2 - 10))
        bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2))
        plate = bg
    plate.save(dest, quality=95)


def zoompan_expr(camera: str, frames: int, zoom: float, w: int, h: int) -> str:
    n = max(1, frames - 1)
    p = f"(on/{n})"
    smooth = f"(3*{p}*{p}-2*{p}*{p}*{p})"  # ease in-out
    centre_x, centre_y = "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    z_hold = f"{1 + zoom:.4f}"
    if camera in ("push_in", "drone_forward"):
        amount = zoom * (1.6 if camera == "drone_forward" else 1)
        z, x, y = f"1+{amount:.4f}*{smooth}", centre_x, centre_y
    elif camera == "pull_out":
        z, x, y = f"{1 + zoom:.4f}-{zoom:.4f}*{smooth}", centre_x, centre_y
    elif camera == "pan_left":
        z, x, y = z_hold, f"(iw-iw/zoom)*(1-{smooth})", centre_y
    elif camera == "pan_right":
        z, x, y = z_hold, f"(iw-iw/zoom)*{smooth}", centre_y
    elif camera == "tilt_up":
        z, x, y = z_hold, centre_x, f"(ih-ih/zoom)*(1-{smooth})"
    elif camera == "tilt_down":
        z, x, y = z_hold, centre_x, f"(ih-ih/zoom)*{smooth}"
    else:  # static: a barely perceptible drift keeps stills alive
        z, x, y = f"1.02+0.01*{smooth}", centre_x, centre_y
    return f"zoompan=z='{z}':x='{x}':y='{y}':d={frames}:s={w}x{h}:fps=30"


def render_image_shot(plate: Path, out: Path, frames: int, camera: str, config) -> None:
    w, h = config.get_path("project.resolution")
    fps = int(config.get_path("project.fps", 30))
    zoom = float(config.get_path("editor.ken_burns_zoom", 0.08))
    vf = zoompan_expr(camera, frames, zoom, w, h).replace("fps=30", f"fps={fps}") + ",format=yuv420p"
    media.run(["-loop", "1", "-framerate", str(fps), "-i", str(plate), "-vf", vf,
               "-frames:v", str(frames), *encode_args(config), str(out)])


def render_graphic(kind: str, data: dict, out: Path, frames: int, config) -> None:
    w, h = config.get_path("project.resolution")
    fps = int(config.get_path("project.fps", 30))
    ctx = make_ctx(config, int(w), int(h), frames / fps)
    cmd = ["ffmpeg", "-hide_banner", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{w}x{h}", "-r", str(fps), "-i", "-",
           "-vf", f"tpad=stop_mode=clone:stop_duration={frames / fps + 1:.3f}",
           "-frames:v", str(frames), *encode_args(config), str(out)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    prev, same = None, 0
    try:
        for i in range(frames):
            frame = render_frame(kind, data, i / fps, ctx).tobytes()
            proc.stdin.write(frame)
            same = same + 1 if frame == prev else 0
            prev = frame
            if same >= 6:  # settled: let tpad hold the last frame
                break
        proc.stdin.close()
    except BrokenPipeError:
        pass
    err = proc.stderr.read().decode(errors="replace")
    if proc.wait() != 0:
        raise media.FFmpegError(f"graphic render failed: {err[-800:]}")


def render_video_asset(src: Path, out: Path, frames: int, config) -> None:
    w, h = config.get_path("project.resolution")
    fps = int(config.get_path("project.fps", 30))
    need = frames / fps
    have = media.duration(src)
    cover = f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps={fps}"
    if have >= need:
        vf = cover
    elif have * 1.5 >= need:
        vf = f"setpts={need / have:.4f}*PTS,{cover}"
    else:
        vf = f"setpts=1.5*PTS,{cover},tpad=stop_mode=clone:stop_duration={need:.3f}"
    media.run(["-i", str(src), "-vf", vf + ",format=yuv420p", "-frames:v", str(frames),
               *encode_args(config), str(out)])


def concat_clips(parts: list[Path], out: Path) -> None:
    lst = out.with_suffix(".txt")
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
    media.run(["-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(out)])
    lst.unlink(missing_ok=True)


def render_scene_clip(project, scene: dict, frames: int) -> Path:
    cfg = project.config
    out = project.path("video_clips", f"{scene['id']}.mp4")
    kind = scene["visual"]["kind"]
    assets = scene.get("assets", [])
    if kind in GRAPHIC_KINDS:
        render_graphic(kind, scene["visual"].get("data", {}), out, frames, cfg)
        return out
    videos = [a for a in assets if a["type"] == "video"]
    if videos:
        render_video_asset(project.path(videos[0]["path"]), out, frames, cfg)
        return out
    images = [a for a in assets if a["type"] == "image"]
    if not images:
        raise FileNotFoundError(f"{scene['id']} has no image or video asset")
    w, h = cfg.get_path("project.resolution")
    camera = scene["visual"].get("camera", "push_in")
    moves = [camera, "pan_right" if camera != "pan_right" else "pan_left", "pull_out", "push_in"]
    shots = len(images)
    base_len = frames // shots
    parts = []
    for k, asset in enumerate(images):
        n = base_len if k < shots - 1 else frames - base_len * (shots - 1)
        plate = project.path("renders", "plates", f"{scene['id']}_{k + 1}.jpg")
        plate.parent.mkdir(parents=True, exist_ok=True)
        make_plate(project.path(asset["path"]), plate, int(w), int(h))
        part = out if shots == 1 else project.path("renders", "plates", f"{scene['id']}_{k + 1}.mp4")
        render_image_shot(plate, part, n, moves[k % len(moves)], cfg)
        parts.append(part)
    if shots > 1:
        concat_clips(parts, out)
    return out
