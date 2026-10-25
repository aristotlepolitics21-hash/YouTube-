"""Project folders, the manifest (single source of truth) and stage state.

The manifest records every scene, the assets that belong to it, and the status
of each stage per scene. Every stage reads it, skips work already marked done,
and saves after each scene, so an interrupted run resumes where it stopped and
a failed scene can be retried on its own.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

import yaml

from .config import Config, load_config

FOLDERS = [
    "research", "script", "scenes", "prompts", "images", "video_clips", "voiceover",
    "music", "sfx", "subtitles", "renders", "final", "logs",
]

STAGES = [
    "research", "script", "scenes", "assets", "voiceover", "subtitles",
    "editing", "quality_control", "render",
]

DONE, FAILED, PENDING, RUNNING, SKIPPED = "done", "failed", "pending", "running", "skipped"


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60] or "project"


class Project:
    def __init__(self, root: Path):
        self.root = Path(root).resolve()
        self._lock = threading.RLock()
        self.config: Config = load_config(self.root / "config.yaml")
        self.manifest: dict[str, Any] = self._load_manifest()

    # ----- creation -------------------------------------------------------
    @classmethod
    def create(cls, parent: Path, topic: str, settings: dict | None = None,
               slug: str | None = None) -> "Project":
        root = Path(parent).resolve() / (slug or slugify(topic))
        root.mkdir(parents=True, exist_ok=True)
        for name in FOLDERS:
            (root / name).mkdir(exist_ok=True)
        cfg_path = root / "config.yaml"
        if not cfg_path.exists():
            project_cfg = {"project": {"topic": topic, **(settings or {})}}
            cfg_path.write_text(yaml.safe_dump(project_cfg, sort_keys=False, allow_unicode=True))
        project = cls(root)
        project.save()
        return project

    # ----- paths ----------------------------------------------------------
    def path(self, *parts: str) -> Path:
        return self.root.joinpath(*parts)

    def rel(self, path: Path | str) -> str:
        return os.path.relpath(Path(path).resolve(), self.root)

    # ----- manifest -------------------------------------------------------
    def _load_manifest(self) -> dict[str, Any]:
        path = self.root / "manifest.json"
        if path.exists():
            return json.loads(path.read_text())
        return {
            "version": 1,
            "created": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "stages": {s: {"status": PENDING} for s in STAGES},
            "scenes": [],
            "cost": {"estimates": {}, "ledger": []},
            "outputs": {},
        }

    def save(self) -> None:
        with self._lock:
            path = self.root / "manifest.json"
            tmp = path.with_suffix(".json.tmp")
            tmp.write_text(json.dumps(self.manifest, indent=2, ensure_ascii=False))
            os.replace(tmp, path)

    def reload(self) -> None:
        with self._lock:
            self.config = load_config(self.root / "config.yaml")
            self.manifest = self._load_manifest()

    @property
    def scenes(self) -> list[dict]:
        return self.manifest["scenes"]

    def scene(self, scene_id: str) -> dict:
        for scene in self.scenes:
            if scene["id"] == scene_id:
                return scene
        raise KeyError(scene_id)

    # ----- per-scene stage status ----------------------------------------
    def scene_status(self, scene: dict, stage: str) -> str:
        return scene.setdefault("status", {}).get(stage, PENDING)

    def mark_scene(self, scene: dict, stage: str, status: str, error: str | None = None) -> None:
        with self._lock:
            scene.setdefault("status", {})[stage] = status
            errors = scene.setdefault("errors", {})
            if error:
                errors[stage] = error
            else:
                errors.pop(stage, None)
            self.save()

    def failed_scenes(self, stage: str) -> list[dict]:
        return [s for s in self.scenes if self.scene_status(s, stage) == FAILED]

    # ----- stage status ---------------------------------------------------
    def stage(self, name: str) -> dict:
        return self.manifest["stages"].setdefault(name, {"status": PENDING})

    @contextmanager
    def running_stage(self, name: str) -> Iterator[dict]:
        state = self.stage(name)
        state.update(status=RUNNING, started=time.strftime("%Y-%m-%dT%H:%M:%S"),
                     error=None, progress=0.0)
        self.save()
        self.log(name, "started")
        try:
            yield state
        except Exception as exc:
            state.update(status=FAILED, error=f"{type(exc).__name__}: {exc}")
            self.save()
            self.log(name, f"FAILED: {exc}")
            raise
        else:
            if state.get("status") == RUNNING:
                state["status"] = DONE
            state.update(finished=time.strftime("%Y-%m-%dT%H:%M:%S"), progress=1.0)
            self.save()
            self.log(name, f"finished ({state['status']})")

    def set_progress(self, name: str, fraction: float, note: str = "") -> None:
        state = self.stage(name)
        state["progress"] = round(max(0.0, min(1.0, fraction)), 4)
        if note:
            state["note"] = note
        self.save()

    def reset_stage(self, name: str) -> None:
        """Mark a stage and everything after it as pending (scene results are kept)."""
        idx = STAGES.index(name)
        for later in STAGES[idx:]:
            self.manifest["stages"][later] = {"status": PENDING}
        self.save()

    # ----- logging --------------------------------------------------------
    def log(self, stage: str, message: str) -> None:
        line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} [{stage}] {message}"
        with self._lock:
            with open(self.root / "logs" / "pipeline.log", "a", encoding="utf-8") as fh:
                fh.write(line + "\n")
        print(line, flush=True)

    def log_tail(self, lines: int = 40) -> list[str]:
        path = self.root / "logs" / "pipeline.log"
        if not path.exists():
            return []
        return path.read_text(encoding="utf-8").splitlines()[-lines:]
