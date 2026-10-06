"""Configuration: default.yaml deep-merged with a project's config.yaml."""

from __future__ import annotations

import copy
from pathlib import Path
from typing import Any

import yaml

DEFAULT_CONFIG = Path(__file__).resolve().parent.parent / "config" / "default.yaml"


def deep_merge(base: dict, override: dict) -> dict:
    """Return base with override applied recursively. Lists are replaced, not merged."""
    out = copy.deepcopy(base)
    for key, value in (override or {}).items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = copy.deepcopy(value)
    return out


class Config(dict):
    """A dict with dotted lookup: cfg.get_path("editor.music.volume_db")."""

    def get_path(self, dotted: str, default: Any = None) -> Any:
        node: Any = self
        for part in dotted.split("."):
            if not isinstance(node, dict) or part not in node:
                return default
            node = node[part]
        return node


def load_config(project_config: Path | None = None, overrides: dict | None = None) -> Config:
    data = yaml.safe_load(DEFAULT_CONFIG.read_text()) or {}
    if project_config and project_config.exists():
        data = deep_merge(data, yaml.safe_load(project_config.read_text()) or {})
    if overrides:
        data = deep_merge(data, overrides)
    return Config(data)
