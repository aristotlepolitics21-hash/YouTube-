"""Stage 3 - scene breakdown, pacing and prompts.

claude mode: one structured call per script section turns its narration into
scenes of roughly 3-8 seconds, each with a full visual spec. Each section is
cached in scenes/section_<id>.json, so a failure only re-runs that section.

manual mode: reads scenes/scene_plan.json.

Either way the plan is checked against the script (no narration lost), paced
(long scenes get extra shots, repetitive runs are flagged), given production
prompts, and merged into the manifest without discarding finished work for
scenes that did not change.
"""

from __future__ import annotations

import difflib
import hashlib
import json
import math

from ..llm import Claude
from ..planning import count_words, estimate_seconds
from ..project import Project
from ..schemas import (Scene, ScenePlan, Script, SectionScenes, StyleBible, Visual,
                       claude_schema)
from .prompts import build_prompt

GRAPHIC_KINDS = {"map", "chart", "timeline", "stat", "title", "comparison", "quote", "text"}

DATA_FORMATS = """Graphic payloads (data_json, a JSON string; "{}" for photo/ai kinds):
map: {"title": str, "focus": [country names], "context": [country names], "bbox": [lon_min, lat_min, lon_max, lat_max], "points": [{"name": str, "lat": num, "lon": num}], "routes": [{"from": [lat, lon], "to": [lat, lon], "label": str}]}
chart: {"type": "bar"|"line", "title": str, "unit": str, "source": str, "bars": [{"label": str, "value": num}] | "series": [{"label": str, "points": [[x, y], ...]}]}
timeline: {"title": str, "events": [{"year": str, "label": str}], "highlight": index}
stat: {"value": str, "label": str, "source": str}
title: {"text": str, "subtitle": str}
comparison: {"title": str, "left": {"label": str, "value": str}, "right": {"label": str, "value": str}}
quote: {"text": str, "attribution": str}
text: {"text": str}"""

SYSTEM = (
    "You are a documentary editor and director of photography. You cut narration into shots "
    "and choose exactly the right picture for each line: real archival or present-day photos for "
    "places, people and events; maps for geography; charts for numbers; timelines for sequences. "
    "Never pick a random or generic image. Keep continuity: the same place looks the same "
    "throughout, and historical scenes show only what existed then. Graphics must show only "
    "numbers stated in the narration or research."
)


def _norm(text: str) -> list[str]:
    return [w.lower().strip(".,;:!?\"'()—–-") for w in text.split()]


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(a=_norm(a), b=_norm(b), autojunk=False).ratio()


def _section_prompt(project: Project, section, style_bible: str) -> str:
    p = project.config.get_path
    return (
        f"Documentary: {p('project.topic')}\nStyle bible: {style_bible}\n"
        f"Section: {section.title}\n\nNarration:\n" + "\n\n".join(section.narration)
        + f"\n\nSplit this narration into consecutive scenes. Each scene's narration is a verbatim, "
        f"contiguous piece of the text above (together they must reproduce it exactly, in order). "
        f"Aim for {p('planning.target_scene_seconds')} seconds per scene at "
        f"{p('planning.words_per_minute')} words per minute (about "
        f"{int(float(p('planning.target_scene_seconds')) * float(p('planning.words_per_minute')) / 60)} words), "
        f"never under {p('planning.min_scene_seconds')} seconds; split at sentence or clause boundaries.\n"
        "Choose a kind for each: photo (search_query must be specific: place + subject + decade), "
        "map, chart, timeline, stat, title, comparison, quote, text, ai_image or ai_video "
        "(only for things no real photo can show). Vary kinds; no more than 3 graphics in a row. "
        "Set period to a year or decade. Mark 1-2 scenes per section as short_candidate if the "
        "line would hook a viewer on its own.\n\n" + DATA_FORMATS
    )


def _draft_to_scene(draft, section_id: str) -> Scene:
    data = json.loads(draft.data_json or "{}")
    visual = Visual(kind=draft.kind, description=draft.description, camera=draft.camera,
                    location=draft.location, period=draft.period, characters=draft.characters,
                    environment=draft.environment, lighting=draft.lighting, mood=draft.mood,
                    search_query=draft.search_query, data=data)
    return Scene(id="", section=section_id, narration=draft.narration, visual=visual, sfx=draft.sfx,
                 music_mood=draft.music_mood, transition=draft.transition,
                 short_candidate=draft.short_candidate)


def _claude_plan(project: Project, script: Script) -> ScenePlan:
    claude = Claude(project, "scenes")
    bible_path = project.path("scenes", "style_bible.json")
    if bible_path.exists():
        bible = json.loads(bible_path.read_text())["style_bible"]
    else:
        bible = claude.json(SYSTEM, (
            f"Write a one-paragraph visual style bible for a documentary about "
            f"{project.config.get_path('project.topic')} in the style "
            f"'{project.config.get_path('project.style')}': colour palette, lens and film look, "
            "lighting, recurring locations and how they must look in each era."),
            claude_schema(StyleBible), what="style bible")["style_bible"]
        bible_path.write_text(json.dumps({"style_bible": bible}))
    scenes: list[Scene] = []
    for i, section in enumerate(script.sections):
        cache = project.path("scenes", f"section_{section.id}.json")
        if cache.exists():
            scenes += [Scene.model_validate(s) for s in json.loads(cache.read_text())]
            continue
        target = "\n\n".join(section.narration)
        for attempt in range(2):
            out = SectionScenes.model_validate(claude.json(
                SYSTEM, _section_prompt(project, section, bible), claude_schema(SectionScenes),
                what=f"scenes {section.id}"))
            drafted = [_draft_to_scene(d, section.id) for d in out.scenes]
            if similarity(" ".join(s.narration for s in drafted), target) >= 0.98:
                break
            project.log("scenes", f"section {section.id}: narration drifted from the script, retrying")
        else:
            raise ValueError(f"section {section.id}: scene narration does not match the script")
        cache.write_text(json.dumps([s.model_dump() for s in drafted], indent=1, ensure_ascii=False))
        scenes += drafted
        project.set_progress("scenes", (i + 1) / len(script.sections), section.title)
    return ScenePlan(style_bible=bible, scenes=scenes)


def pacing_report(project: Project, plan: ScenePlan) -> list[str]:
    """Apply automatic pacing fixes in place and return notes about anything left to review."""
    p = project.config.get_path
    wpm = float(p("planning.words_per_minute"))
    lo, target, hi = (float(p("planning.min_scene_seconds")), float(p("planning.target_scene_seconds")),
                      float(p("planning.max_scene_seconds")))
    notes = []
    for scene in plan.scenes:
        secs = estimate_seconds(scene.narration, wpm)
        if secs > hi and scene.visual.kind in ("photo", "ai_image", "local") and scene.visual.shots == 1:
            scene.visual.shots = max(2, math.ceil(secs / target))
            notes.append(f"{scene.id}: ~{secs:.0f}s, cutting between {scene.visual.shots} shots")
        elif secs > hi * 1.5 and scene.visual.kind in GRAPHIC_KINDS:
            notes.append(f"{scene.id}: graphic holds ~{secs:.0f}s; consider splitting the line")
        elif secs < lo * 0.6:
            notes.append(f"{scene.id}: only ~{secs:.1f}s of narration; the shot will hold for the minimum")
    run, max_run = 1, int(p("planning.max_same_kind_in_a_row"))
    for prev, cur in zip(plan.scenes, plan.scenes[1:]):
        run = run + 1 if cur.visual.kind == prev.visual.kind else 1
        if run == max_run + 1:
            notes.append(f"{cur.id}: {run} '{cur.visual.kind}' scenes in a row (repetitive)")
    queries = {}
    for scene in plan.scenes:
        q = scene.visual.search_query.strip().lower()
        if q and scene.visual.kind == "photo":
            queries.setdefault(q, []).append(scene.id)
    for q, ids in queries.items():
        if len(ids) > 2:
            notes.append(f"search '{q}' is used by {len(ids)} scenes ({', '.join(ids)}); vary it")
    return notes


def _scene_hash(scene: dict) -> str:
    keep = {k: scene[k] for k in ("narration", "visual", "section")}
    return hashlib.sha1(json.dumps(keep, sort_keys=True).encode()).hexdigest()[:12]


def _merge_into_manifest(project: Project, plan: ScenePlan) -> None:
    old = {s["id"]: s for s in project.scenes}
    merged = []
    for scene in plan.scenes:
        d = scene.model_dump()
        d["hash"] = _scene_hash(d)
        prev = old.get(d["id"])
        if prev and prev.get("hash") == d["hash"]:
            for key in ("status", "errors", "assets", "audio", "timing", "clip"):
                if key in prev:
                    d[key] = prev[key]
        else:
            d["status"] = {}
        merged.append(d)
    project.manifest["scenes"] = merged
    project.manifest["style_bible"] = plan.style_bible
    project.save()


def write_breakdown(project: Project, plan: ScenePlan) -> None:
    wpm = float(project.config.get_path("planning.words_per_minute"))
    lines = [f"# Scene breakdown: {project.config.get_path('project.topic')}", "",
             f"Style bible: {plan.style_bible}", ""]
    for s in plan.scenes:
        v = s.visual
        lines += [
            f"## {s.id.upper()}  ({s.section})",
            f"- **Duration (est.):** {estimate_seconds(s.narration, wpm):.1f} s",
            f"- **Narration:** “{s.narration}”",
            f"- **Visual ({v.kind}{', ' + str(v.shots) + ' shots' if v.shots > 1 else ''}):** {v.description}",
            f"- **Camera:** {v.camera}  **Location:** {v.location or '-'}  **Period:** {v.period or '-'}",
            f"- **Characters:** {v.characters or '-'}  **Environment:** {v.environment or '-'}",
            f"- **Lighting:** {v.lighting or '-'}  **Mood:** {v.mood or '-'}",
            f"- **SFX:** {', '.join(s.sfx) or '-'}  **Music mood:** {s.music_mood or '-'}  **Transition:** {s.transition}",
        ]
        if v.search_query:
            lines.append(f"- **Search:** {v.search_query}")
        if v.prompt:
            lines.append(f"- **Generation prompt:** {v.prompt}")
        lines.append("")
    project.path("scenes", "scenes.md").write_text("\n".join(lines))


def run_scenes(project: Project) -> ScenePlan:
    plan_path = project.path("scenes", "scene_plan.json")
    script_path = project.path("script", "script.json")
    script = Script.model_validate_json(script_path.read_text()) if script_path.exists() else None

    if plan_path.exists():
        plan = ScenePlan.model_validate_json(plan_path.read_text())
    elif project.config.get_path("llm.provider") == "claude" and script:
        plan = _claude_plan(project, script)
    else:
        raise FileNotFoundError(f"{project.rel(plan_path)} does not exist (llm.provider is manual).")

    for i, scene in enumerate(plan.scenes, 1):
        scene.id = f"scene_{i:03d}"

    if script:
        sim = similarity(" ".join(s.narration for s in plan.scenes), script.full_text())
        if sim < 0.98:
            project.log("scenes", f"WARNING: scene narration matches the script at only {sim:.1%}")
        known = {s.id for s in script.sections}
        unknown = sorted({s.section for s in plan.scenes} - known)
        if unknown:
            project.log("scenes", f"WARNING: scenes reference unknown sections: {unknown}")

    notes = pacing_report(project, plan)
    for scene in plan.scenes:
        if scene.visual.kind not in GRAPHIC_KINDS:
            built = build_prompt(scene, plan.style_bible)
            if not scene.visual.prompt:
                scene.visual.prompt = built["prompt"]
            project.path("prompts", f"{scene.id}.txt").write_text(
                f"PROMPT:\n{scene.visual.prompt}\n\nNEGATIVE:\n{built['negative_prompt']}\n")

    plan_path.write_text(plan.model_dump_json(indent=1))
    _merge_into_manifest(project, plan)
    write_breakdown(project, plan)
    project.path("scenes", "pacing.txt").write_text("\n".join(notes) + "\n")

    wpm = float(project.config.get_path("planning.words_per_minute"))
    total = sum(estimate_seconds(s.narration, wpm) for s in plan.scenes)
    words = sum(count_words(s.narration) for s in plan.scenes)
    project.log("scenes", f"{len(plan.scenes)} scenes, {words} words, ~{total / 60:.1f} min of "
                          f"narration; {len(notes)} pacing notes")
    for note in notes[:15]:
        project.log("scenes", f"pacing: {note}")
    return plan

