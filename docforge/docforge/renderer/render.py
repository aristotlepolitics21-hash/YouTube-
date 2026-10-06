"""Stage 10 - final render and publishing kit.

final/<slug>_1080p.mp4      the film (subtitles burned in only if subtitles.burn_in)
final/<slug>_2160p.mp4      optional 4K (an upscale of the 1080p master; say so if you publish it)
final/<slug>.srt            closed captions
final/thumbnail.jpg         1280x720
final/youtube.md            title options, description with chapters, tags, credits
final/shorts/short_N.mp4    vertical clips with burned-in captions
"""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

from .. import media
from ..asset_manager.graphics import first_font, font, hex_rgb, text_w, wrap
from ..editor.clips import encode_args
from ..project import Project
from ..schemas import Research, Script
from ..subtitles import cues_from_words, srt_time

STOP = set("the a an of and or to in on for with how why what is are was were its from by at as".split())


def fmt_ts(t: float) -> str:
    t = int(t)
    h, m, s = t // 3600, t % 3600 // 60, t % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def chapters(project: Project) -> list[tuple[float, str]]:
    """Section starts, following YouTube's rules: first at 0:00, at least 3, each at least 10 s."""
    titles = {}
    sp = project.path("script", "script.json")
    if sp.exists():
        titles = {s.id: s.title for s in Script.model_validate_json(sp.read_text()).sections}
    out: list[tuple[float, str]] = []
    for s in project.scenes:
        if not out or s["section"] != out[-1][2]:
            out.append((s["timing"]["start"], titles.get(s["section"], s["section"].replace("-", " ").title()),
                        s["section"]))
    merged: list[tuple[float, str]] = []
    total = project.manifest["outputs"].get("timeline_seconds", 0)
    for i, (t, title, _) in enumerate(out):
        nxt = out[i + 1][0] if i + 1 < len(out) else total
        if merged and nxt - t < 10:
            continue  # too short to be its own chapter; it stays inside the previous one
        merged.append((0.0 if not merged else t, title))
    return merged if len(merged) >= 3 else []


def final_video(project: Project, slug: str) -> Path:
    master = project.path(project.manifest["outputs"]["master"])
    out = project.path("final", f"{slug}_1080p.mp4")
    if project.config.get_path("subtitles.burn_in", False):
        srt = project.path("subtitles", "subtitles.srt")
        style = "FontName=Inter,FontSize=20,Outline=1,Shadow=0,MarginV=40"
        media.run(["-i", str(master), "-vf", f"subtitles={srt}:force_style='{style}'",
                   *encode_args(project.config, final=True)[:-1], "-c:a", "copy", str(out)])
    else:
        shutil.copy(master, out)
    return out


def video_4k(project: Project, src: Path, slug: str) -> Path:
    out = project.path("final", f"{slug}_2160p.mp4")
    media.run(["-i", str(src), "-vf", "scale=3840:2160:flags=lanczos", "-c:v", "libx264", "-preset",
               project.config.get_path("editor.video_preset", "medium"), "-crf", "18", "-pix_fmt", "yuv420p",
               "-c:a", "copy", "-movflags", "+faststart", str(out)])
    return out


def thumbnail(project: Project, text: str) -> Path:
    """Strongest present-day photo from the opening, darkened left, with 2-4 words of text."""
    g = project.config.get_path
    candidates = []
    for i, s in enumerate(project.scenes):
        for a in s.get("assets", []):
            if a.get("type") == "image" and a.get("width", 0) >= 1600:
                candidates.append((s.get("short_candidate", False), -i, a))
    out = project.path("final", "thumbnail.jpg")
    W, H = 1280, 720
    if candidates:
        candidates.sort(key=lambda c: (c[0], c[1]), reverse=True)
        img = ImageOps.fit(Image.open(project.path(candidates[0][2]["path"])).convert("RGB"), (W, H), Image.LANCZOS)
        img = ImageEnhance.Contrast(img).enhance(1.15)
    else:
        img = Image.new("RGB", (W, H), hex_rgb(g("graphics.colors.background")))
    shade = Image.new("L", (W, H))
    ImageDraw.Draw(shade).rectangle([0, 0, W, H], fill=0)
    for x in range(W):
        ImageDraw.Draw(shade).line([(x, 0), (x, H)], fill=int(215 * max(0, 1 - x / (W * 0.75))))
    img = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), img, shade.filter(ImageFilter.GaussianBlur(20)))
    d = ImageDraw.Draw(img)
    fb = first_font(g("graphics.font_bold", []))
    size = 150
    lines = wrap(d, text.upper(), font(fb, size), int(W * 0.6))
    while (len(lines) > 3 or any(text_w(d, l, font(fb, size)) > W * 0.62 for l in lines)) and size > 60:
        size -= 8
        lines = wrap(d, text.upper(), font(fb, size), int(W * 0.6))
    y = (H - len(lines) * size * 1.05) / 2
    accent = hex_rgb(g("graphics.colors.accent"))
    for i, line in enumerate(lines):
        col = accent if i == len(lines) - 1 else (255, 255, 255)
        d.text((60, y + i * size * 1.05), line, font=font(fb, size), fill=col,
               stroke_width=3, stroke_fill=(0, 0, 0))
    img.save(out, quality=92)
    return out


def tags_for(project: Project, script: Script | None) -> list[str]:
    custom = project.config.get_path("render.tags", [])
    if custom:
        return custom
    topic = project.config.get_path("project.topic", "")
    words = [w for w in re.findall(r"[A-Za-z][A-Za-z'-]+", topic) if w.lower() not in STOP]
    tags = [topic.split(":")[0].strip().lower()] + [w.lower() for w in words[:6]]
    tags += ["documentary", "history documentary", "economic history"]
    if script:
        tags += [s.title.lower() for s in script.sections[1:6]]
    seen, out = set(), []
    for t in tags:
        if t and t not in seen and sum(len(x) + 1 for x in out) + len(t) < 480:
            seen.add(t)
            out.append(t)
    return out


def publishing_kit(project: Project, script: Script | None) -> Path:
    titles = script.title_options if script else [project.config.get_path("project.topic")]
    hook = script.sections[0].narration[0] if script else ""
    chaps = chapters(project)
    research_path = project.path("research", "research.json")
    sources = []
    if research_path.exists():
        sources = [s.url for s in Research.model_validate_json(research_path.read_text()).sources][:15]
    credits = project.path("final", "credits.txt").read_text() if project.path("final", "credits.txt").exists() else ""
    desc = [hook, ""]
    if chaps:
        desc += ["CHAPTERS"] + [f"{fmt_ts(t)} {title}" for t, title in chaps] + [""]
    if sources:
        desc += ["SOURCES"] + [f"- {u}" for u in sources] + [""]
    desc += [credits.strip(), "", "Narration: AI voice." if project.config.get_path("voiceover.provider") in
             ("piper", "elevenlabs") else ""]
    md = ["# YouTube upload kit", "", "## Title options", ""]
    md += [f"{i}. {t}  ({len(t)} chars{', may truncate' if len(t) > 60 else ''})" for i, t in enumerate(titles, 1)]
    md += ["", "## Description", "", "```", *desc, "```", "", "## Tags", "", ", ".join(tags_for(project, script)), ""]
    out = project.path("final", "youtube.md")
    out.write_text("\n".join(md))
    return out


def shorts(project: Project, video: Path) -> list[Path]:
    g = project.config.get_path
    n, lo, hi = int(g("render.shorts.count", 3)), float(g("render.shorts.min_seconds", 30)), \
        float(g("render.shorts.max_seconds", 58))
    scenes = project.scenes
    starts = [i for i, s in enumerate(scenes) if s.get("short_candidate")] or \
             [i for i, s in enumerate(scenes) if i == 0 or s["section"] != scenes[i - 1]["section"]]
    windows, used_until = [], -1.0
    for i in starts:
        if scenes[i]["timing"]["start"] < used_until:
            continue
        a = scenes[i]["timing"]["audio_start"]
        j = i
        while j + 1 < len(scenes) and scenes[j]["timing"]["end"] - a < lo:
            j += 1
        end = scenes[j]["timing"]["audio_start"] + scenes[j]["timing"]["audio_duration"] + 0.6
        if lo <= end - a <= hi:
            windows.append((a, end))
            used_until = end
        if len(windows) >= n:
            break
    words_path = project.path("subtitles", "words.json")
    words = json.loads(words_path.read_text()) if words_path.exists() else []
    outdir = project.path("final", "shorts")
    outdir.mkdir(exist_ok=True)
    fb = first_font(g("graphics.font_bold", []))
    font_name = "Inter Display" if "Inter" in fb else "DejaVu Sans"
    made = []
    for k, (a, b) in enumerate(windows, 1):
        seg = [dict(w, start=w["start"] - a, end=w["end"] - a) for w in words if a <= w["start"] < b]
        ass = outdir / f"short_{k}.ass"
        _write_ass(cues_from_words(seg, max_chars=22, max_lines=2, max_seconds=3.0), ass, font_name)
        out = outdir / f"short_{k}.mp4"
        vf = ("[0:v]split=2[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
              "boxblur=30:3,eq=brightness=-0.15[b];[fg]scale=1080:-2[f];[b][f]overlay=(W-w)/2:(H-h)/2-120,"
              f"ass={ass}[v]")
        media.run(["-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", str(video), "-filter_complex", vf, "-map", "[v]",
                   "-map", "0:a", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                   "-c:a", "aac", "-b:a", "160k", "-af", f"afade=t=out:st={b - a - 0.5:.2f}:d=0.5",
                   "-movflags", "+faststart", str(out)])
        made.append(out)
    return made


def _write_ass(cues: list[dict], path: Path, font_name: str) -> None:
    def ts(t):
        return srt_time(t).replace(",", ".")[:-1]
    head = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\n"
            "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Alignment, "
            "Outline, Shadow, MarginV\n"
            f"Style: Cap,{font_name},84,&H00FFFFFF,&H00000000,&H64000000,1,2,6,0,420\n\n"
            "[Events]\nFormat: Layer, Start, End, Style, Text\n")
    body = "".join(f"Dialogue: 0,{ts(c['start'])},{ts(c['end'])},Cap,{c['text'].replace(chr(10), chr(92) + 'N')}\n"
                   for c in cues)
    path.write_text(head + body, encoding="utf-8")


def run_render(project: Project) -> dict:
    from ..project import slugify
    slug = slugify(project.config.get_path("project.topic", "documentary"))[:40]
    sp = project.path("script", "script.json")
    script = Script.model_validate_json(sp.read_text()) if sp.exists() else None
    outputs = {}
    video = final_video(project, slug)
    outputs["video_1080p"] = project.rel(video)
    project.set_progress("render", 0.2, "1080p")
    shutil.copy(project.path("subtitles", "subtitles.srt"), project.path("final", f"{slug}.srt"))
    outputs["srt"] = f"final/{slug}.srt"
    thumb_text = project.config.get_path("render.thumbnail_text") or \
        (script.title_options[0] if script else project.config.get_path("project.topic"))
    outputs["thumbnail"] = project.rel(thumbnail(project, thumb_text))
    outputs["youtube_kit"] = project.rel(publishing_kit(project, script))
    project.set_progress("render", 0.35, "shorts")
    outputs["shorts"] = [project.rel(p) for p in shorts(project, video)]
    if project.config.get_path("project.render_4k", False):
        project.set_progress("render", 0.6, "4K upscale")
        outputs["video_2160p"] = project.rel(video_4k(project, video, slug))
    project.manifest["outputs"]["final"] = outputs
    project.save()
    project.log("render", f"final outputs: {json.dumps(outputs)}")
    return outputs
