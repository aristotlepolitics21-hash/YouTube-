import json

import pytest

from docforge.llm import LLMUnavailable, credentials_available
from docforge.research import run_research
from docforge.scene_generator import build_prompt, run_scenes
from docforge.scene_generator.scenes import similarity
from docforge.schemas import Research, Scene, Script, claude_schema
from docforge.script import check_script, run_script

from .conftest import tiny_plan


def test_manual_research_requires_file(project):
    with pytest.raises(FileNotFoundError):
        run_research(project)


def test_manual_research_validates_and_renders(project):
    data = {"topic": "T", "sections": [{"topic": "Geography", "facts": [
        {"claim": "Small.", "status": "confirmed", "sources": ["https://example.org"]},
        {"claim": "Maybe.", "status": "uncertain", "note": "one source"}]}]}
    project.path("research", "research.json").write_text(json.dumps(data))
    r = run_research(project)
    md = project.path("research", "research.md").read_text()
    assert r.sections[0].facts[1].status == "uncertain"
    assert "⚠️ uncertain" in md and "✅" in md


def test_research_rejects_bad_status(project):
    bad = {"topic": "T", "sections": [{"topic": "x", "facts": [{"claim": "c", "status": "probably"}]}]}
    project.path("research", "research.json").write_text(json.dumps(bad))
    with pytest.raises(Exception):
        run_research(project)


def test_script_checks_length_and_greeting(project):
    s = Script(topic="T", title_options=["a"], sections=[
        {"id": "hook", "title": "Hook", "narration": ["Welcome to our channel, today we look at things."]}])
    problems = check_script(project, s)
    assert any(p.startswith("length") for p in problems)
    assert any("greeting" in p for p in problems)
    assert any("title options" in p for p in problems)


def test_manual_script_roundtrip(project):
    s = {"topic": "T", "title_options": ["One", "Two", "Three"],
         "sections": [{"id": "hook", "title": "Hook", "narration": ["word " * 140]}]}
    project.path("script", "script.json").write_text(json.dumps(s))
    out = run_script(project)
    assert out.sections[0].id == "hook"
    assert project.path("script", "script.md").exists()


def test_claude_schema_is_closed():
    schema = claude_schema(Research)
    obj = schema["$defs"]["Fact"]
    assert obj["additionalProperties"] is False
    assert set(obj["required"]) == set(obj["properties"])


def test_prompt_has_period_guard_and_style():
    scene = Scene(id="s", section="a", narration="x", visual={
        "kind": "ai_image", "description": "Harbour with bumboats", "period": "1965", "location": "Singapore River"})
    p = build_prompt(scene, "warm 35mm")
    assert "1960s" in p["prompt"] and "no smartphones" in p["prompt"]
    assert "warm 35mm" in p["prompt"]
    assert "extra fingers" in p["negative_prompt"]


def test_scenes_ids_prompts_breakdown(project):
    tiny_plan(project)
    plan = run_scenes(project)
    assert [s.id for s in plan.scenes] == ["scene_001", "scene_002", "scene_003"]
    assert project.path("prompts", "scene_002.txt").exists()  # photo-like scenes get prompts
    assert not project.path("prompts", "scene_001.txt").exists()  # graphics don't
    assert "SCENE_001" in project.path("scenes", "scenes.md").read_text()
    assert len(project.scenes) == 3


def test_scene_merge_keeps_unchanged_work(project):
    tiny_plan(project)
    run_scenes(project)
    project.mark_scene(project.scenes[0], "assets", "done")
    plan = json.loads(project.path("scenes", "scene_plan.json").read_text())
    plan["scenes"][1]["narration"] = "Changed line here."
    project.path("scenes", "scene_plan.json").write_text(json.dumps(plan))
    run_scenes(project)
    assert project.scene_status(project.scenes[0], "assets") == "done"
    assert project.scene_status(project.scenes[1], "assets") == "pending"


def test_long_photo_scene_gets_extra_shots(project):
    tiny_plan(project)
    plan = json.loads(project.path("scenes", "scene_plan.json").read_text())
    plan["scenes"][1]["narration"] = " ".join(["word"] * 40)  # ~16 s at 150 wpm
    project.path("scenes", "scene_plan.json").write_text(json.dumps(plan))
    out = run_scenes(project)
    assert out.scenes[1].visual.shots >= 2


def test_similarity():
    assert similarity("One two three.", "one two three") == 1.0
    assert similarity("one two three", "one four three") < 1.0


def test_claude_mode_without_credentials_says_so(project, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    monkeypatch.setattr("shutil.which", lambda _: None)
    project.config["llm"]["provider"] = "claude"
    assert credentials_available() is False
    with pytest.raises(LLMUnavailable):
        run_research(project)


def test_inserting_a_scene_keeps_work_of_shifted_scenes(project):
    tiny_plan(project)
    run_scenes(project)
    for sc in project.scenes:
        sc["assets"] = [{"type": "graphic", "path": f"x/{sc['narration'][:5]}"}]
        project.mark_scene(sc, "assets", "done")
    plan = json.loads(project.path("scenes", "scene_plan.json").read_text())
    new = dict(plan["scenes"][0], narration="A brand new first line.")
    plan["scenes"].insert(0, new)
    project.path("scenes", "scene_plan.json").write_text(json.dumps(plan))
    run_scenes(project)
    assert project.scene_status(project.scenes[0], "assets") == "pending"
    for sc in project.scenes[1:]:
        assert project.scene_status(sc, "assets") == "done"
        assert sc["assets"][0]["path"] == f"x/{sc['narration'][:5]}"
