"""Runs the stages in order, resumably, with cost gates.

A stage already marked done is skipped unless forced. Inside a stage, finished
scenes are skipped too, so re-running after a crash or a fix continues from
where it stopped. Before any stage that can spend money, the estimate is checked
against cost.limit_usd and the run stops for confirmation if it is higher.
"""

from __future__ import annotations

from typing import Callable

from . import cost
from .asset_manager import run_assets
from .editor import run_editing
from .planning import estimate_seconds
from .project import DONE, STAGES, Project
from .quality_control import run_quality_control
from .renderer import run_render
from .research import run_research
from .scene_generator import run_scenes
from .script import run_script
from .subtitles import run_subtitles
from .voiceover import run_voiceover

STAGE_FUNCS: dict[str, Callable[[Project], object]] = {
    "research": run_research, "script": run_script, "scenes": run_scenes, "assets": run_assets,
    "voiceover": run_voiceover, "subtitles": run_subtitles, "editing": run_editing,
    "quality_control": run_quality_control, "render": run_render,
}
PAID = {"research", "script", "scenes", "assets", "voiceover"}


def summary(project: Project) -> dict:
    wpm = float(project.config.get_path("planning.words_per_minute", 150))
    secs = project.manifest["outputs"].get("timeline_seconds") or \
        sum(estimate_seconds(s["narration"], wpm) for s in project.scenes)
    est = cost.estimate_all(project)
    return {"total_scenes": len(project.scenes), "estimated_minutes": round(secs / 60, 1),
            "estimated_cost_usd": est["total_usd"], "cost_by_stage": est["stages"],
            "spent_usd": cost.spent(project)}


def run(project: Project, stages: list[str] | None = None, confirm: bool = False, force: bool = False,
        on_event: Callable[[str, dict], None] | None = None) -> dict:
    order = [s for s in STAGES if not stages or s in stages]
    emit = on_event or (lambda *_: None)
    for name in order:
        if project.stage(name).get("status") == DONE and not force:
            continue
        if name in PAID:
            est = cost.check_budget(project, name, confirm)
            if est["usd"] > 0:
                project.log(name, f"estimated cost ${est['usd']:.2f} ({est['detail']})")
        emit("stage_start", {"stage": name})
        with project.running_stage(name):
            STAGE_FUNCS[name](project)
        emit("stage_done", {"stage": name})
        if name == "scenes":
            s = summary(project)
            project.log("scenes", f"TOTAL SCENES {s['total_scenes']} | ESTIMATED LENGTH "
                                  f"{s['estimated_minutes']} min | ESTIMATED API COST ${s['estimated_cost_usd']:.2f}")
            emit("summary", s)
    return project.manifest["outputs"]


def retry_failed(project: Project, confirm: bool = False) -> dict:
    """Redo only scenes that failed, in the stages where they failed, then rebuild what depends on them."""
    redo = []
    for stage in ("assets", "voiceover", "editing"):
        if project.failed_scenes(stage):
            redo.append(stage)
    if not redo:
        return {"retried": []}
    first = min(STAGES.index(s) for s in redo)
    for later in STAGES[first:]:
        project.stage(later)["status"] = "pending"
    project.save()
    run(project, STAGES[first:], confirm=confirm)
    return {"retried": redo}
