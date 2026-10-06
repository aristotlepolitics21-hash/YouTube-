"""Stage 9 - quality control on the assembled master, before the final render.

Each check returns issues {check, severity, scene, message}. Severity "error"
blocks the final render; "warning" is reported. Where a fix is mechanical the
stage applies it and re-checks (re-fetch a missing asset, re-render a broken or
mis-timed clip, re-mix clipped audio). Checks marked heuristic flag things for
a human to look at; they cannot prove historical accuracy.
"""

from __future__ import annotations

import json
import re

from .. import media
from ..asset_manager.manager import hamming
from ..project import FAILED, Project
from ..scene_generator.prompts import period_year


def _issue(check: str, severity: str, message: str, scene: str = "") -> dict:
    return {"check": check, "severity": severity, "scene": scene, "message": message}


def check_scenes(project: Project) -> list[dict]:
    issues = []
    ids = [s["id"] for s in project.scenes]
    expected = [f"scene_{i:03d}" for i in range(1, len(ids) + 1)]
    if not ids:
        issues.append(_issue("missing_scenes", "error", "the manifest has no scenes"))
    if ids != expected:
        issues.append(_issue("scene_order", "error", "scene ids are not consecutive and in order"))
    plan = project.path("scenes", "scene_plan.json")
    if plan.exists():
        n = len(json.loads(plan.read_text())["scenes"])
        if n != len(ids):
            issues.append(_issue("missing_scenes", "error", f"scene plan has {n} scenes, manifest {len(ids)}"))
    prev_end = 0.0
    for s in project.scenes:
        t = s.get("timing")
        if not t:
            issues.append(_issue("durations", "error", "no timing", s["id"]))
            continue
        if abs(t["start"] - prev_end) > 1e-3:
            issues.append(_issue("scene_order", "error", f"starts at {t['start']:.3f}, previous ended {prev_end:.3f}", s["id"]))
        if t["audio_start"] + t["audio_duration"] > t["end"] + 0.02:
            issues.append(_issue("durations", "error", "narration runs past the end of its shot", s["id"]))
        prev_end = t["end"]
    return issues


def check_assets(project: Project) -> list[dict]:
    issues = []
    for s in project.scenes:
        assets = s.get("assets", [])
        if not assets:
            issues.append(_issue("missing_assets", "error", "no visual asset", s["id"]))
        for a in assets:
            if not project.path(a["path"]).exists():
                issues.append(_issue("missing_assets", "error", f"file missing: {a['path']}", s["id"]))
        if not project.path(s.get("audio", {}).get("path", "missing")).exists():
            issues.append(_issue("missing_assets", "error", "narration audio missing", s["id"]))
    return issues


def check_repetition(project: Project) -> list[dict]:
    issues = []
    limit = int(project.config.get_path("quality_control.duplicate_hash_distance", 6))
    seen: list[tuple[str, int, str]] = []
    for s in project.scenes:
        for a in s.get("assets", []):
            if a.get("type") != "image" or a.get("ahash") is None:
                continue
            for sid, h, src in seen:
                if sid != s["id"] and (hamming(h, int(a["ahash"])) <= limit or src == a.get("source_url")):
                    issues.append(_issue("repetition", "warning", f"image repeats {sid}'s image", s["id"]))
                    break
            seen.append((s["id"], int(a["ahash"]), a.get("source_url", "")))
    run, max_run = 1, int(project.config.get_path("planning.max_same_kind_in_a_row", 4))
    scenes = project.scenes
    for prev, cur in zip(scenes, scenes[1:]):
        run = run + 1 if cur["visual"]["kind"] == prev["visual"]["kind"] else 1
        if run == max_run + 1:
            issues.append(_issue("repetition", "warning", f"{run} '{cur['visual']['kind']}' scenes in a row", cur["id"]))
    return issues


def check_history(project: Project) -> list[dict]:
    """Heuristic: photos dated after the scene's period, and AI prompts without period guards."""
    issues = []
    for s in project.scenes:
        year = period_year(s["visual"].get("period", ""))
        for a in s.get("assets", []):
            y = period_year(a.get("date", ""))
            if year and y and y > year + 5:
                issues.append(_issue("historical_detail", "warning",
                                     f"photo dated {y} used for a {year} scene ({a.get('title', '')[:60]})", s["id"]))
        if s["visual"]["kind"] in ("ai_image", "ai_video") and year and year < 1990 \
                and "historically accurate" not in s["visual"].get("prompt", ""):
            issues.append(_issue("historical_detail", "warning", "AI prompt lacks a period guard", s["id"]))
    return issues


def check_continuity(project: Project) -> list[dict]:
    """Heuristic: a scene's photo should come from the place the scene is about."""
    issues = []
    for s in project.scenes:
        loc = (s["visual"].get("location") or "").lower().split(",")[0].strip()
        if not loc or s["visual"]["kind"] != "photo":
            continue
        for a in s.get("assets", []):
            text = f"{a.get('title', '')} {a.get('query', '')}".lower()
            if loc not in text:
                issues.append(_issue("visual_continuity", "warning",
                                     f"image title doesn't mention '{loc}': {a.get('title', '')[:60]}", s["id"]))
    return issues


def check_narration(project: Project) -> list[dict]:
    issues = []
    lo = float(project.config.get_path("quality_control.narration_match_min", 0.8))
    for s in project.scenes:
        m = s.get("narration_match")
        if m is not None and m < lo:
            issues.append(_issue("narration_mismatch", "warning",
                                 f"heard \"{s.get('transcript', '')[:90]}\" ({m:.0%} match)", s["id"]))
    narration = project.path("voiceover", "narration.wav")
    if narration.exists():
        out = media.analyze(narration, "silencedetect=noise=-45dB:d=" +
                            str(project.config.get_path("quality_control.silence_max_seconds", 2.5)))
        for m in re.finditer(r"silence_start: ([\d.]+).*?silence_end: ([\d.]+)", out, re.S):
            a, b = float(m.group(1)), float(m.group(2))
            if b < project.manifest["outputs"].get("timeline_seconds", 1e9) - 3:
                issues.append(_issue("audio_gaps", "warning", f"{b - a:.1f}s of silence at {a:.1f}s"))
    return issues


def check_subtitles(project: Project) -> list[dict]:
    issues = []
    srt = project.path("subtitles", "subtitles.srt")
    if not srt.exists():
        return [_issue("subtitle_sync", "error", "subtitles.srt missing")]
    times = re.findall(r"(\d\d):(\d\d):(\d\d),(\d{3}) --> (\d\d):(\d\d):(\d\d),(\d{3})", srt.read_text())
    total = project.manifest["outputs"].get("timeline_seconds", 0)
    prev = -1.0
    for i, t in enumerate(times, 1):
        a = int(t[0]) * 3600 + int(t[1]) * 60 + int(t[2]) + int(t[3]) / 1000
        b = int(t[4]) * 3600 + int(t[5]) * 60 + int(t[6]) + int(t[7]) / 1000
        if b <= a or a < prev - 1e-3 or (total and b > total + 0.05):
            issues.append(_issue("subtitle_sync", "error", f"cue {i} is out of order or outside the video"))
        prev = b
    words = json.loads(project.path("subtitles", "words.json").read_text()) if \
        project.path("subtitles", "words.json").exists() else []
    spans = {s["id"]: s["timing"] for s in project.scenes}
    for w in words:
        t = spans.get(w.get("scene"))
        if t and not (t["audio_start"] - 0.05 <= w["start"] <= t["audio_start"] + t["audio_duration"] + 0.05):
            issues.append(_issue("subtitle_sync", "warning", f"word '{w['word']}' timed outside its line", w["scene"]))
            break
    return issues


def check_media(project: Project) -> list[dict]:
    issues = []
    fps = int(project.config.get_path("project.fps", 30))
    for s in project.scenes:
        clip = s.get("clip")
        if not clip or not project.path(clip["path"]).exists():
            issues.append(_issue("corrupt_files", "error", "clip missing", s["id"]))
            continue
        try:
            got = media.frame_count(project.path(clip["path"]))
        except Exception as exc:
            issues.append(_issue("corrupt_files", "error", f"unreadable clip: {exc}", s["id"]))
            continue
        if got != clip["frames"]:
            issues.append(_issue("durations", "error", f"clip has {got} frames, expected {clip['frames']}", s["id"]))
    master = project.path(project.manifest["outputs"].get("master", "renders/master.mp4"))
    if not master.exists():
        return issues + [_issue("corrupt_files", "error", "master.mp4 missing")]
    errors = media.decode_errors(master)
    if errors:
        issues.append(_issue("corrupt_files", "error", f"master decode errors: {errors[:200]}"))
    expected = project.manifest["outputs"].get("timeline_seconds", 0)
    got = media.duration(master)
    if expected and abs(got - expected) > 1.5 / fps + 0.05:
        issues.append(_issue("durations", "error", f"master is {got:.2f}s, timeline is {expected:.2f}s"))
    peak = media.max_volume_db(project.path("renders", "mix.wav"))
    if peak > float(project.config.get_path("quality_control.clip_peak_db", -0.1)):
        issues.append(_issue("audio_clipping", "error", f"mix peaks at {peak:.1f} dBFS"))
    out = media.analyze(master, "blackdetect=d={}:pix_th={}".format(
        project.config.get_path("quality_control.black_min_seconds", 1.0),
        project.config.get_path("quality_control.black_pixel_threshold", 0.1)), video=True)
    for m in re.finditer(r"black_start:([\d.]+) black_end:([\d.]+)", out):
        a, b = float(m.group(1)), float(m.group(2))
        scene = next((s["id"] for s in project.scenes if s["timing"]["start"] <= a < s["timing"]["end"]), "")
        issues.append(_issue("black_frames", "error", f"black from {a:.2f}s to {b:.2f}s", scene))
    return issues


def check_length(project: Project) -> list[dict]:
    target = float(project.config.get_path("project.target_minutes", 0)) * 60
    total = project.manifest["outputs"].get("timeline_seconds", 0)
    ratio = float(project.config.get_path("quality_control.min_length_ratio", 0.9))
    if target and total < target * ratio:
        return [_issue("target_length", "error", f"film is {total / 60:.2f} min; target is {target / 60:g} min "
                                             f"(minimum {target * ratio / 60:.1f})")]
    if target and total > target * 1.2:
        return [_issue("target_length", "warning", f"film is {total / 60:.1f} min, well over the {target / 60:g} min target")]
    return []


CHECKS = [check_length, check_scenes, check_assets, check_repetition, check_history, check_continuity,
          check_narration, check_subtitles, check_media]


def run_checks(project: Project) -> list[dict]:
    issues = []
    for fn in CHECKS:
        try:
            issues += fn(project)
        except Exception as exc:
            issues.append(_issue(fn.__name__, "error", f"check crashed: {type(exc).__name__}: {exc}"))
    return issues


def autofix(project: Project, issues: list[dict]) -> list[str]:
    """Apply mechanical fixes. Returns a list of what was done."""
    from ..asset_manager import run_assets
    from ..editor import run_editing
    done = []
    asset_scenes = {i["scene"] for i in issues if i["check"] == "missing_assets" and i["scene"]
                    and "narration" not in i["message"]}
    clip_scenes = {i["scene"] for i in issues if i["check"] in ("corrupt_files", "durations", "black_frames")
                   and i["scene"]}
    remix = any(i["check"] == "audio_clipping" for i in issues)
    remaster = any(i["check"] in ("corrupt_files", "durations") and not i["scene"] for i in issues)
    if asset_scenes:
        for sid in asset_scenes:
            project.mark_scene(project.scene(sid), "assets", FAILED, "QC: asset missing")
        run_assets(project, only_failed=True)
        clip_scenes |= asset_scenes
        done.append(f"re-fetched assets for {sorted(asset_scenes)}")
    if remix:
        tp = float(project.config.get_path("editor.true_peak_db", -1.5)) - 1.0
        project.config["editor"]["true_peak_db"] = tp
        done.append(f"lowered true peak to {tp} dB and re-mixed")
    if clip_scenes or remix or remaster:
        for sid in clip_scenes:
            project.mark_scene(project.scene(sid), "editing", FAILED, "QC: re-render")
        run_editing(project)
        done.append(f"re-rendered clips {sorted(clip_scenes)} and re-assembled the master")
    return done


def write_report(project: Project, issues: list[dict], fixes: list[str]) -> None:
    project.path("final", "qc_report.json").write_text(json.dumps({"issues": issues, "fixes": fixes}, indent=1))
    errors = [i for i in issues if i["severity"] == "error"]
    lines = ["# Quality control report", "",
             f"**Result:** {'PASS' if not errors else 'FAIL'} — {len(errors)} errors, "
             f"{len(issues) - len(errors)} warnings", ""]
    if fixes:
        lines += ["## Automatic fixes", ""] + [f"- {f}" for f in fixes] + [""]
    checks = ["target_length", "missing_scenes", "missing_assets", "scene_order", "audio_gaps", "narration_mismatch", "repetition",
              "visual_continuity", "historical_detail", "durations", "subtitle_sync", "audio_clipping",
              "black_frames", "corrupt_files"]
    lines += ["## Checklist", ""]
    for c in checks:
        n = [i for i in issues if i["check"] == c]
        mark = "☑" if not n else ("☒" if any(i["severity"] == "error" for i in n) else "⚠")
        lines.append(f"- {mark} {c.replace('_', ' ')}" + (f" ({len(n)})" if n else ""))
    lines += ["", "_visual continuity and historical detail are heuristics: review flagged scenes by eye._", ""]
    if issues:
        lines += ["## Issues", "", "| Severity | Check | Scene | Detail |", "|---|---|---|---|"]
        lines += [f"| {i['severity']} | {i['check']} | {i['scene']} | {i['message'].replace('|', '/')} |"
                  for i in issues]
    project.path("final", "qc_report.md").write_text("\n".join(lines) + "\n")


def run_quality_control(project: Project, max_rounds: int = 2) -> dict:
    fixes: list[str] = []
    issues = run_checks(project)
    for _ in range(max_rounds):
        fixable = [i for i in issues if i["severity"] == "error" and i["check"] in
                   ("missing_assets", "corrupt_files", "durations", "black_frames", "audio_clipping")]
        if not fixable:
            break
        fixes += autofix(project, fixable)
        issues = run_checks(project)
    write_report(project, issues, fixes)
    errors = [i for i in issues if i["severity"] == "error"]
    project.manifest["outputs"]["qc"] = {"errors": len(errors), "warnings": len(issues) - len(errors)}
    project.save()
    project.log("quality_control", f"{len(errors)} errors, {len(issues) - len(errors)} warnings, "
                                   f"{len(fixes)} automatic fixes")
    if errors:
        raise RuntimeError(f"QC found {len(errors)} errors; see final/qc_report.md")
    return {"errors": 0, "warnings": len(issues), "fixes": fixes}
