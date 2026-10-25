"""Command line interface.

  docforge new "Singapore: How a Tiny Country Became Rich" --minutes 20 [--dir projects]
  docforge plan  projects/<slug>            # scene count, length and cost estimate
  docforge run   projects/<slug> [--stage assets ...] [--yes] [--force]
  docforge status projects/<slug>
  docforge retry projects/<slug>            # redo failed scenes only
  docforge reset projects/<slug> --from editing
  docforge ui [--dir projects] [--port 8765]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import cost
from .planning import plan_length
from .project import STAGES, Project


def cmd_new(a) -> int:
    settings = {"target_minutes": a.minutes, "style": a.style, "language": a.language}
    p = Project.create(Path(a.dir), a.topic, settings)
    overrides = {}
    if a.voice:
        overrides.setdefault("voiceover", {})["piper_voice"] = a.voice
    if a.llm:
        overrides["llm"] = {"provider": a.llm}
    if overrides:
        import yaml
        cfg = yaml.safe_load(p.path("config.yaml").read_text())
        cfg.update(overrides)
        p.path("config.yaml").write_text(yaml.safe_dump(cfg, sort_keys=False))
    print(f"Created {p.root}")
    return 0


def cmd_plan(a) -> int:
    p = Project(Path(a.project))
    g = p.config.get_path
    lp = plan_length(float(g("project.target_minutes")), float(g("planning.words_per_minute")),
                     float(g("planning.min_scene_seconds")), float(g("planning.target_scene_seconds")),
                     float(g("planning.max_scene_seconds")))
    est = cost.estimate_all(p)
    print(f"Target: {lp.target_minutes:g} min -> {lp.words_min}-{lp.words_max} words "
          f"(aim {lp.words_target}), {lp.scenes_min}-{lp.scenes_max} scenes (aim {lp.scenes_target})")
    if p.scenes:
        print(f"Planned scenes: {len(p.scenes)}")
    print(f"Estimated API cost: ${est['total_usd']:.2f}")
    for stage, e in est["stages"].items():
        print(f"  {stage:<10} ${e['usd']:>6.2f}  {e['detail']}")
    print(f"Cost limit before confirmation: ${float(g('cost.limit_usd')):.2f}")
    return 0


def cmd_run(a) -> int:
    from .cost import CostLimitExceeded
    from .pipeline import run
    p = Project(Path(a.project))
    try:
        run(p, a.stage or None, confirm=a.yes, force=a.force)
    except CostLimitExceeded as exc:
        print(f"\n{exc}")
        if sys.stdin.isatty() and input("Proceed? [y/N] ").strip().lower() == "y":
            run(p, a.stage or None, confirm=True, force=a.force)
        else:
            return 2
    except Exception as exc:
        print(f"\nStopped: {exc}\nFix the problem and run the same command again to resume.")
        return 1
    print(json.dumps(p.manifest["outputs"].get("final", {}), indent=2))
    return 0


def cmd_status(a) -> int:
    p = Project(Path(a.project))
    for name in STAGES:
        st = p.stage(name)
        failed = len(p.failed_scenes(name)) if name in ("assets", "voiceover", "editing") else 0
        extra = f"  ({failed} failed scenes)" if failed else ""
        err = f"  error: {st.get('error')}" if st.get("error") else ""
        print(f"{name:<16} {st.get('status', 'pending'):<8} {int(100 * st.get('progress', 0)):>3}%{extra}{err}")
    print(f"scenes: {len(p.scenes)}   spent: ${cost.spent(p):.2f}")
    return 0


def cmd_retry(a) -> int:
    from .pipeline import retry_failed
    print(retry_failed(Project(Path(a.project)), confirm=a.yes))
    return 0


def cmd_reset(a) -> int:
    p = Project(Path(a.project))
    p.reset_stage(a.from_stage)
    print(f"Stages from {a.from_stage} on are pending; finished scenes are kept.")
    return 0


def cmd_ui(a) -> int:
    from .ui.server import serve
    serve(Path(a.dir), a.port)
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="docforge", description="Long-form documentary production pipeline")
    sub = ap.add_subparsers(dest="cmd", required=True)
    n = sub.add_parser("new", help="start a project")
    n.add_argument("topic")
    n.add_argument("--minutes", type=float, default=15)
    n.add_argument("--style", default="premium cinematic documentary")
    n.add_argument("--language", default="en")
    n.add_argument("--voice", default="")
    n.add_argument("--llm", choices=["claude", "manual"], default="")
    n.add_argument("--dir", default="projects")
    n.set_defaults(fn=cmd_new)
    for name, fn in (("plan", cmd_plan), ("status", cmd_status)):
        s = sub.add_parser(name)
        s.add_argument("project")
        s.set_defaults(fn=fn)
    r = sub.add_parser("run", help="run (or resume) the pipeline")
    r.add_argument("project")
    r.add_argument("--stage", action="append", choices=STAGES)
    r.add_argument("--yes", action="store_true", help="approve estimated costs above the limit")
    r.add_argument("--force", action="store_true", help="re-run stages already marked done")
    r.set_defaults(fn=cmd_run)
    t = sub.add_parser("retry", help="redo failed scenes only")
    t.add_argument("project")
    t.add_argument("--yes", action="store_true")
    t.set_defaults(fn=cmd_retry)
    z = sub.add_parser("reset", help="mark a stage and later stages as pending")
    z.add_argument("project")
    z.add_argument("--from", dest="from_stage", choices=STAGES, required=True)
    z.set_defaults(fn=cmd_reset)
    u = sub.add_parser("ui", help="start the web interface")
    u.add_argument("--dir", default="projects")
    u.add_argument("--port", type=int, default=8765)
    u.set_defaults(fn=cmd_ui)
    a = ap.parse_args(argv)
    return a.fn(a)


if __name__ == "__main__":
    raise SystemExit(main())
