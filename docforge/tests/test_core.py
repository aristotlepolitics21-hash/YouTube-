import json

import pytest

from docforge import cost
from docforge.config import deep_merge, load_config
from docforge.planning import count_words, plan_length
from docforge.project import DONE, FAILED, Project


def test_deep_merge_overrides_nested_and_replaces_lists():
    base = {"a": {"b": 1, "c": 2}, "l": [1, 2]}
    out = deep_merge(base, {"a": {"c": 3}, "l": [9]})
    assert out == {"a": {"b": 1, "c": 3}, "l": [9]}
    assert base["a"]["c"] == 2  # not mutated


def test_project_config_overrides_default(project):
    assert project.config.get_path("project.target_minutes") == 1
    assert project.config.get_path("planning.words_per_minute") == 150


def test_project_folders_exist(project):
    for name in ("research", "script", "scenes", "prompts", "images", "video_clips", "voiceover",
                 "music", "sfx", "subtitles", "renders", "final"):
        assert project.path(name).is_dir()


@pytest.mark.parametrize("minutes,words_lo,words_hi", [(10, 1200, 1500), (20, 2500, 3000), (60, 7500, 9000)])
def test_length_plan_scales(minutes, words_lo, words_hi):
    lp = plan_length(minutes, 150, 3, 6, 8)
    assert words_lo <= lp.words_target <= words_hi
    assert lp.scenes_min < lp.scenes_target < lp.scenes_max
    assert lp.scenes_target == round(minutes * 60 / 6)


def test_count_words():
    assert count_words("Singapore's GDP rose 5,000% — remarkably.") == 5


def test_manifest_resume_roundtrip(project):
    project.manifest["scenes"] = [{"id": "scene_001", "narration": "x"}]
    project.mark_scene(project.scenes[0], "assets", FAILED, "boom")
    again = Project(project.root)
    assert again.scene_status(again.scenes[0], "assets") == FAILED
    assert again.failed_scenes("assets")[0]["errors"]["assets"] == "boom"
    again.mark_scene(again.scenes[0], "assets", DONE)
    assert Project(project.root).failed_scenes("assets") == []


def test_running_stage_records_failure(project):
    with pytest.raises(ValueError):
        with project.running_stage("research"):
            raise ValueError("nope")
    assert project.stage("research")["status"] == "failed"
    assert "nope" in project.stage("research")["error"]


def test_cost_gate_blocks_until_confirmed(project):
    project.config["llm"]["provider"] = "claude"
    project.config["cost"]["limit_usd"] = 0.01
    with pytest.raises(cost.CostLimitExceeded):
        cost.check_budget(project, "research", confirmed=False)
    est = cost.check_budget(project, "research", confirmed=True)
    assert est["usd"] > 0
    cost.check_budget(project, "research", confirmed=False)  # remembered approval


def test_free_providers_cost_nothing(project):
    assert cost.estimate_all(project)["total_usd"] == 0


def test_cost_ledger(project):
    cost.record(project, "script", 0.5, "x")
    cost.record(project, "script", 0.25, "y")
    assert cost.spent(project) == 0.75
    assert json.loads(project.path("manifest.json").read_text())["cost"]["ledger"][1]["usd"] == 0.25
