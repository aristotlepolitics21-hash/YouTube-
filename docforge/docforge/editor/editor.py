"""Stage 8 - editing: scene clips -> sections -> picture lock, plus the audio mix.

Timing comes from scene["timing"] (set by the voiceover stage) in whole frames.
Within a section, scenes marked "crossfade" dissolve into the next (the outgoing
clip is rendered longer by the dissolve length so nothing shifts); "cut" scenes
cut. Each section fades in from and out to black ("dip"). Sections are encoded
separately and joined without re-encoding, so the picture is exactly as long as
the narration timeline.
"""

from __future__ import annotations

from pathlib import Path

from .. import media
from ..project import DONE, FAILED, Project
from .audio import build_music, build_sfx, mix
from .clips import encode_args, render_scene_clip


def frame_plan(project: Project) -> list[dict]:
    """Per scene: span frames, clip frames (span + dissolve overlap) and transition."""
    fps = int(project.config.get_path("project.fps", 30))
    d = int(round(float(project.config.get_path("editor.crossfade_seconds", 0.5)) * fps))
    scenes = project.scenes
    plan = []
    for i, s in enumerate(scenes):
        start = int(round(s["timing"]["start"] * fps))
        end = int(round(s["timing"]["end"] * fps))
        nxt = scenes[i + 1] if i + 1 < len(scenes) else None
        dissolve = bool(nxt and nxt["section"] == s["section"] and s.get("transition", "crossfade") == "crossfade"
                        and end - start > 2 * d and int(round(nxt["timing"]["end"] * fps)) - end > 2 * d)
        plan.append({"id": s["id"], "section": s["section"], "start": start, "span": end - start,
                     "clip": end - start + (d if dissolve else 0), "dissolve_next": dissolve})
    return plan


def render_clips(project: Project, plan: list[dict], force: bool = False) -> None:
    by_id = {p["id"]: p for p in plan}
    todo = [s for s in project.scenes
            if force or project.scene_status(s, "editing") != DONE
            or s.get("clip", {}).get("frames") != by_id[s["id"]]["clip"]
            or not project.path(s.get("clip", {}).get("path", "missing")).exists()]
    for i, scene in enumerate(todo):
        frames = by_id[scene["id"]]["clip"]
        try:
            out = render_scene_clip(project, scene, frames)
            got = media.frame_count(out)
            if got != frames:
                raise RuntimeError(f"clip has {got} frames, expected {frames}")
            scene["clip"] = {"path": project.rel(out), "frames": frames}
            project.mark_scene(scene, "editing", DONE)
        except Exception as exc:
            project.mark_scene(scene, "editing", FAILED, f"{type(exc).__name__}: {exc}")
            project.log("editing", f"{scene['id']}: FAILED {exc}")
        project.set_progress("editing", 0.8 * (i + 1) / max(1, len(todo)), f"clip {scene['id']}")
    failed = project.failed_scenes("editing")
    if failed:
        raise RuntimeError(f"{len(failed)} clips failed to render: {[s['id'] for s in failed][:10]}")


def assemble_section(project: Project, items: list[dict], out: Path, first: bool, last: bool) -> None:
    fps = int(project.config.get_path("project.fps", 30))
    d = int(round(float(project.config.get_path("editor.crossfade_seconds", 0.5)) * fps))
    dip = float(project.config.get_path("editor.section_dip_seconds", 0.5)) / 2
    inputs, graph = [], []
    for k, it in enumerate(items):
        inputs += ["-i", str(project.path(project.scene(it["id"])["clip"]["path"]))]
        graph.append(f"[{k}:v]settb=AVTB,setpts=PTS-STARTPTS,fps={fps}[v{k}]")
    acc, acc_frames = "v0", items[0]["clip"]
    for k in range(1, len(items)):
        prev = items[k - 1]
        label = f"x{k}"
        if prev["dissolve_next"]:
            offset = (acc_frames - d) / fps
            graph.append(f"[{acc}][v{k}]xfade=transition=fade:duration={d / fps:.4f}:offset={offset:.4f}[{label}]")
            acc_frames += items[k]["clip"] - d
        else:
            graph.append(f"[{acc}][v{k}]concat=n=2:v=1:a=0[{label}]")
            acc_frames += items[k]["clip"]
        acc = label
    total = sum(it["span"] for it in items)
    fades = []
    if not first:
        fades.append(f"fade=t=in:st=0:d={dip:.3f}")
    if not last:
        fades.append(f"fade=t=out:st={total / fps - dip:.3f}:d={dip:.3f}")
    graph.append(f"[{acc}]{','.join(fades + ['format=yuv420p']) if fades else 'format=yuv420p'}[out]")
    media.run([*inputs, "-filter_complex", ";".join(graph), "-map", "[out]", "-frames:v", str(total),
               *encode_args(project.config, final=True), str(out)])


def assemble(project: Project, plan: list[dict]) -> Path:
    sections: list[list[dict]] = []
    for it in plan:
        if not sections or sections[-1][0]["section"] != it["section"]:
            sections.append([])
        sections[-1].append(it)
    parts = []
    for i, items in enumerate(sections):
        out = project.path("renders", f"section_{i:02d}.mp4")
        assemble_section(project, items, out, first=i == 0, last=i == len(sections) - 1)
        parts.append(out)
        project.set_progress("editing", 0.8 + 0.15 * (i + 1) / len(sections), f"section {i + 1}/{len(sections)}")
    lst = project.path("renders", "sections.txt")
    lst.write_text("".join(f"file '{p}'\n" for p in parts))
    video = project.path("renders", "picture.mp4")
    media.run(["-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(video)])
    return video


def run_editing(project: Project, force_clips: bool = False) -> dict:
    plan = frame_plan(project)  # dissolves never cross a section boundary
    render_clips(project, plan, force_clips)
    picture = assemble(project, plan)
    fps = int(project.config.get_path("project.fps", 30))
    total = sum(p["span"] for p in plan) / fps
    narration = project.path("voiceover", "narration.wav")
    music = build_music(project, total)
    sfx = build_sfx(project, total)
    audio = mix(project, narration, music, sfx, project.path("renders", "mix.wav"), total)
    master = project.path("renders", "master.mp4")
    media.run(["-i", str(picture), "-i", str(audio), "-map", "0:v", "-map", "1:a", "-c:v", "copy",
               "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(master)])
    project.manifest["outputs"].update({"picture": project.rel(picture), "mix": project.rel(audio),
                                        "master": project.rel(master), "timeline_seconds": round(total, 3)})
    project.save()
    project.log("editing", f"master assembled: {total / 60:.2f} min")
    return {"master": master, "seconds": total}
