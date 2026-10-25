"""Cost estimates before expensive stages, and a ledger of what was actually spent.

Prices live in config (cost.prices) and are estimates you should check against
each provider's current pricing page. Free/offline providers cost 0.
"""

from __future__ import annotations

import time

from .project import Project


class CostLimitExceeded(RuntimeError):
    """Raised when an estimate is above cost.limit_usd and nobody confirmed it."""


def _p(project: Project, key: str) -> float:
    return float(project.config.get_path(f"cost.prices.{key}", 0.0))


def estimate_stage(project: Project, stage: str) -> dict:
    """Return {"usd": float, "detail": str} for one stage, using the current manifest."""
    cfg = project.config
    scenes = project.scenes
    minutes = float(cfg.get_path("project.target_minutes", 15))
    llm = cfg.get_path("llm.provider") == "claude"
    usd, detail = 0.0, "free (offline or manual)"

    if stage == "research" and llm:
        searches = int(cfg.get_path("llm.web_search_max_uses", 20))
        # Search results are read back as input tokens; a heavy research turn is ~150k in, ~20k out.
        usd = searches / 1000 * _p(project, "web_search_per_1k") \
            + 0.15 * _p(project, "claude_input_per_mtok") + 0.03 * _p(project, "claude_output_per_mtok")
        detail = f"Claude research with up to {searches} web searches"
    elif stage == "script" and llm:
        out_mtok = minutes * 150 * 1.6 / 1e6 * 4  # words -> tokens, plus thinking and JSON overhead
        usd = 0.05 * _p(project, "claude_input_per_mtok") + out_mtok * _p(project, "claude_output_per_mtok")
        detail = "Claude script writing"
    elif stage == "scenes" and llm:
        n = max(len(scenes), int(minutes * 60 / float(cfg.get_path("planning.target_scene_seconds", 6))))
        usd = n * (2500 / 1e6 * _p(project, "claude_input_per_mtok") + 900 / 1e6 * _p(project, "claude_output_per_mtok"))
        detail = f"Claude scene breakdown for ~{n} scenes"
    elif stage == "assets":
        n_img = sum(1 for s in scenes if s.get("visual", {}).get("kind") == "ai_image")
        n_vid = sum(1 for s in scenes if s.get("visual", {}).get("kind") == "ai_video")
        if cfg.get_path("assets.ai_image_provider") == "fal":
            usd += n_img * _p(project, "fal_image_each")
        if cfg.get_path("assets.ai_video_provider") == "fal":
            secs = float(cfg.get_path("assets.fal.video_seconds", 5))
            # Image-to-video needs a still first.
            usd += n_vid * (secs * _p(project, "fal_video_per_second") + _p(project, "fal_image_each"))
        detail = f"{n_img} AI images, {n_vid} AI video clips; photos and graphics are free"
    elif stage == "voiceover" and cfg.get_path("voiceover.provider") == "elevenlabs":
        chars = sum(len(s.get("narration", "")) for s in scenes)
        usd = chars / 1000 * _p(project, "elevenlabs_per_1k_chars")
        detail = f"ElevenLabs, {chars:,} characters"
    return {"usd": round(usd, 2), "detail": detail}


def estimate_all(project: Project) -> dict:
    stages = ["research", "script", "scenes", "assets", "voiceover"]
    per = {s: estimate_stage(project, s) for s in stages}
    total = round(sum(v["usd"] for v in per.values()), 2)
    project.manifest["cost"]["estimates"] = {"stages": per, "total_usd": total,
                                             "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
    project.save()
    return project.manifest["cost"]["estimates"]


def check_budget(project: Project, stage: str, confirmed: bool) -> dict:
    """Raise CostLimitExceeded if this stage's estimate is over the limit and not confirmed."""
    est = estimate_stage(project, stage)
    limit = float(project.config.get_path("cost.limit_usd", 0))
    approvals = project.manifest["cost"].setdefault("approved_stages", [])
    if est["usd"] > limit and not confirmed and stage not in approvals:
        raise CostLimitExceeded(
            f"{stage}: estimated ${est['usd']:.2f} ({est['detail']}) is over the "
            f"${limit:.2f} limit. Re-run with confirmation to proceed."
        )
    if confirmed and stage not in approvals:
        approvals.append(stage)
        project.save()
    return est


def record(project: Project, stage: str, usd: float, detail: str) -> None:
    project.manifest["cost"]["ledger"].append(
        {"stage": stage, "usd": round(usd, 4), "detail": detail, "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
    )
    project.save()


def spent(project: Project) -> float:
    return round(sum(e["usd"] for e in project.manifest["cost"]["ledger"]), 4)
