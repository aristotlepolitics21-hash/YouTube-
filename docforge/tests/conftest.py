import json
import shutil
import subprocess
from pathlib import Path

import pytest
from PIL import Image

from docforge.project import Project

HAVE_FFMPEG = shutil.which("ffmpeg") is not None


@pytest.fixture
def project(tmp_path) -> Project:
    return Project.create(tmp_path, "Test Topic", {"target_minutes": 1})


def make_image(path: Path, size=(1600, 900), color=(120, 90, 60)) -> Path:
    img = Image.new("RGB", size, color)
    for x in range(0, size[0], 40):  # some texture so hashes differ by colour
        for y in range(0, size[1], 40):
            img.putpixel((x, y), (255 - color[0], 255 - color[1], 255 - color[2]))
    img.save(path)
    return path


def make_tone(path: Path, seconds: float) -> Path:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"sine=frequency=220:duration={seconds}",
                    "-ac", "1", "-ar", "48000", str(path)], check=True)
    return path


def tiny_plan(project: Project) -> None:
    """Three scenes in two sections: a graphic, a local photo and a map."""
    make_image(project.path("images", "a.jpg"))
    plan = {"style_bible": "", "scenes": [
        {"id": "", "section": "one", "narration": "Alpha bravo charlie delta echo foxtrot.",
         "visual": {"kind": "stat", "description": "", "data": {"value": "42%", "label": "share"}}},
        {"id": "", "section": "one", "narration": "Golf hotel india juliet kilo lima.",
         "visual": {"kind": "local", "description": "", "local_file": "images/a.jpg"}},
        {"id": "", "section": "two", "narration": "Mike november oscar papa quebec romeo.",
         "visual": {"kind": "title", "description": "", "data": {"text": "THE END"}}},
    ]}
    project.path("scenes", "scene_plan.json").write_text(json.dumps(plan))
