"""Voiceover timeline, subtitles, editing, QC and render on a tiny synthetic project.

TTS is replaced by FFmpeg sine tones (Piper is exercised by the end-to-end
run, not here) and alignment uses the proportional aligner, so these tests
need only FFmpeg.
"""

import json

import pytest

from docforge import media
from docforge.editor import frame_plan, run_editing
from docforge.quality_control import run_checks
from docforge.quality_control.checks import write_report
from docforge.renderer import chapters, run_render
from docforge.scene_generator import run_scenes
from docforge.subtitles import cues_from_words, run_subtitles, srt_time
from docforge.subtitles.subtitles import align, spoken_form
from docforge.voiceover import voiceover as vo

from .conftest import HAVE_FFMPEG, make_tone, tiny_plan

pytestmark = pytest.mark.skipif(not HAVE_FFMPEG, reason="needs ffmpeg")


class ToneTTS:
    def synth(self, text, dest):
        make_tone(dest, 0.25 + 0.08 * len(text.split()))


@pytest.fixture
def voiced(project, monkeypatch):
    tiny_plan(project)
    project.config["subtitles"]["aligner"] = "proportional"
    project.config["editor"]["video_preset"] = "ultrafast"
    project.config["project"]["resolution"] = [640, 360]
    run_scenes(project)
    from docforge.asset_manager import run_assets
    run_assets(project)
    monkeypatch.setattr(vo, "make_tts", lambda cfg: ToneTTS())
    vo.run_voiceover(project)
    return project


def test_timeline_is_contiguous_and_frame_snapped(voiced):
    fps = 30
    prev = 0.0
    for s in voiced.scenes:
        t = s["timing"]
        assert abs(t["start"] - prev) < 1e-9
        assert abs(t["end"] * fps - round(t["end"] * fps)) < 1e-6
        assert t["audio_start"] + t["audio_duration"] <= t["end"]
        assert t["end"] - t["start"] >= 3.0 - 1e-6  # min scene length
        prev = t["end"]
    assert voiced.path("voiceover", "narration.wav").exists()


def test_section_gap_longer_than_scene_gap(voiced):
    s1, s2, s3 = voiced.scenes
    gap_scene = s2["timing"]["audio_start"] - (s1["timing"]["audio_start"] + s1["audio"]["duration"])
    gap_section = s3["timing"]["audio_start"] - (s2["timing"]["audio_start"] + s2["audio"]["duration"])
    assert gap_section > gap_scene or s2["timing"]["end"] - s2["timing"]["start"] == 3.0


def test_frame_plan_dissolves_only_within_sections(voiced):
    plan = frame_plan(voiced)
    assert plan[0]["dissolve_next"] is True       # same section
    assert plan[1]["dissolve_next"] is False      # next is a new section
    assert plan[0]["clip"] == plan[0]["span"] + 15


def test_full_media_chain(voiced):
    run_subtitles(voiced)
    srt = voiced.path("subtitles", "subtitles.srt").read_text()
    assert "Alpha bravo" in srt
    run_editing(voiced)
    master = voiced.path("renders", "master.mp4")
    total = voiced.manifest["outputs"]["timeline_seconds"]
    assert abs(media.duration(master) - total) < 0.1
    assert media.max_volume_db(voiced.path("renders", "mix.wav")) <= -0.5
    issues = run_checks(voiced)
    errors = [i for i in issues if i["severity"] == "error"]
    assert errors == [], errors
    write_report(voiced, issues, [])
    assert "PASS" in voiced.path("final", "qc_report.md").read_text()
    out = run_render(voiced)
    assert voiced.path(out["video_1080p"]).exists()
    assert voiced.path(out["thumbnail"]).exists()
    assert "Title options" in voiced.path(out["youtube_kit"]).read_text()


def test_qc_catches_missing_asset_and_bad_order(voiced):
    voiced.scenes[1]["assets"][0]["path"] = "images/nope.jpg"
    voiced.scenes[2]["timing"]["start"] += 1
    checks = {i["check"] for i in run_checks(voiced)}
    assert {"missing_assets", "scene_order"} <= checks


def test_cues_respect_limits():
    words = [{"word": w, "start": i * 0.3, "end": i * 0.3 + 0.25}
             for i, w in enumerate("one two three four five six seven eight nine ten. eleven twelve".split())]
    cues = cues_from_words(words, max_chars=30, max_lines=2)
    assert all(len(line) <= 30 for c in cues for line in c["text"].split("\n"))
    assert all(a["end"] < b["start"] for a, b in zip(cues, cues[1:]))
    assert cues[0]["text"].replace("\n", " ").endswith("ten.")


def test_srt_time():
    assert srt_time(3725.5) == "01:02:05,500"


def test_align_maps_script_words_to_heard_times():
    heard = [{"word": w, "start": i * 0.5, "end": i * 0.5 + 0.4} for i, w in enumerate(["it", "cost", "$500", "today"])]
    timed, sim = align("It cost five hundred dollars today.".split(), heard, 10.0, 2.0)
    assert timed[0]["start"] == 10.0 and timed[-1]["word"] == "today."
    assert all(a["start"] <= b["start"] for a, b in zip(timed, timed[1:]))
    assert sim > 0.9


def test_spoken_form():
    assert spoken_form("$80,000 in 1965") == "eighty thousand dollars in nineteen sixty five"


def test_chapters_follow_youtube_rules(voiced):
    voiced.manifest["outputs"]["timeline_seconds"] = voiced.scenes[-1]["timing"]["end"]
    # Only two short sections here, so YouTube's 3-chapter minimum isn't met.
    assert chapters(voiced) == []
