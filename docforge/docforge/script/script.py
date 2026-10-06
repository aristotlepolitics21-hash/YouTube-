"""Stage 2 - documentary script.

claude mode: writes script/script.json from research.json, sized to the target
length, following the configured section structure. If the word count lands
outside the target range, it asks for one revision.

manual mode: validates a script/script.json you supply.

Both modes run the same checks: length, banned generic openers, and a hook that
fits in the first 30 seconds.
"""

from __future__ import annotations

import json

from ..llm import Claude
from ..planning import count_words, plan_length
from ..project import Project
from ..schemas import Research, Script, claude_schema

SYSTEM = (
    "You write narration for premium long-form documentaries: vivid, precise, human. "
    "Short sentences that are easy to speak aloud. Questions, contrasts and unexpected facts. "
    "Never sound like an encyclopaedia, never open with a channel greeting. Use only facts "
    "marked confirmed in the research; never invent numbers, quotes or events."
)


def length_plan(project: Project):
    p = project.config.get_path
    return plan_length(float(p("project.target_minutes")), float(p("planning.words_per_minute")),
                       float(p("planning.min_scene_seconds")), float(p("planning.target_scene_seconds")),
                       float(p("planning.max_scene_seconds")))


def check_script(project: Project, script: Script) -> list[str]:
    """Return a list of problems (empty when the script passes)."""
    problems = []
    plan = length_plan(project)
    words = count_words(script.full_text())
    if not plan.words_min <= words <= plan.words_max:
        problems.append(f"length: {words} words, target {plan.words_min}-{plan.words_max} "
                        f"for {plan.target_minutes:g} minutes")
    first = script.sections[0].narration[0].lower() if script.sections and script.sections[0].narration else ""
    for banned in project.config.get_path("script.banned_openers", []):
        if banned in first:
            problems.append(f"opening uses a generic greeting: '{banned}'")
    hook_words = count_words(" ".join(script.sections[0].narration)) if script.sections else 0
    wpm = float(project.config.get_path("planning.words_per_minute"))
    if hook_words * 60 / wpm > 45:
        problems.append(f"hook section runs ~{hook_words * 60 / wpm:.0f}s; keep the hook under ~30-40s")
    if len(script.title_options) < 3:
        problems.append("fewer than 3 title options")
    return problems


def _prompt(project: Project, research: Research, revision_note: str = "") -> str:
    plan = length_plan(project)
    structure = project.config.get_path("script.structure", [])
    confirmed = {
        "sections": [
            {"topic": s.topic, "facts": [f.claim for f in s.facts if f.status == "confirmed"]}
            for s in research.sections
        ],
        "statistics": [s.model_dump() for s in research.statistics if s.status == "confirmed"],
    }
    return (
        f"Topic: {project.config.get_path('project.topic')}\n"
        f"Style: {project.config.get_path('project.style')}\n"
        f"Target: {plan.target_minutes:g} minutes = {plan.words_target} spoken words "
        f"(allowed {plan.words_min}-{plan.words_max}).\n\n"
        f"Sections, in order (one script section each; id = lowercase-hyphenated title):\n"
        + "\n".join(f"- {s}" for s in structure)
        + "\n\nThe first 30 seconds must create curiosity with a contrast, question or surprising fact. "
        "Write narration as paragraphs of 2-4 sentences. Spell numbers the way a narrator says them "
        "when that avoids ambiguity. Give 5 title options under 60 characters.\n\n"
        f"Confirmed research:\n{json.dumps(confirmed, indent=1, ensure_ascii=False)}\n"
        + (f"\nRevision required: {revision_note}\n" if revision_note else "")
    )


def run_script(project: Project) -> Script:
    out = project.path("script", "script.json")
    if project.config.get_path("llm.provider") == "claude" and not out.exists():
        research = Research.model_validate_json(project.path("research", "research.json").read_text())
        claude = Claude(project, "script")
        script = Script.model_validate(claude.json(SYSTEM, _prompt(project, research),
                                                   claude_schema(Script), what="script"))
        problems = [p for p in check_script(project, script) if p.startswith("length")]
        if problems:
            project.log("script", f"revising: {problems[0]}")
            script = Script.model_validate(claude.json(
                SYSTEM, _prompt(project, research, problems[0]), claude_schema(Script),
                what="script revision"))
        script.generated_by = "claude"
        out.write_text(script.model_dump_json(indent=2))
    elif out.exists():
        script = Script.model_validate_json(out.read_text())
    else:
        raise FileNotFoundError(f"{project.rel(out)} does not exist (llm.provider is manual).")

    project.path("script", "script.md").write_text(
        f"# {script.title_options[0] if script.title_options else script.topic}\n\n"
        + "\n\n".join(f"## {s.title}\n\n" + "\n\n".join(s.narration) for s in script.sections) + "\n"
    )
    for problem in check_script(project, script):
        project.log("script", f"WARNING: {problem}")
    project.log("script", f"{count_words(script.full_text())} words in {len(script.sections)} sections")
    return script
