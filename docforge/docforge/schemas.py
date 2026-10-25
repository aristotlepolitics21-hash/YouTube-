"""Data shapes shared by every stage, validated with pydantic.

These are also turned into JSON Schemas for Claude's structured outputs, so a
Claude-written file and a hand-written file go through the same validation.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

# --------------------------------------------------------------------- research


class Fact(BaseModel):
    claim: str
    status: Literal["confirmed", "uncertain"]
    sources: list[str] = Field(default_factory=list)
    note: str = ""


class ResearchSection(BaseModel):
    topic: str
    facts: list[Fact]


class Statistic(BaseModel):
    name: str
    value: str
    year: str = ""
    source: str = ""
    status: Literal["confirmed", "uncertain"] = "confirmed"


class Source(BaseModel):
    url: str
    title: str = ""


class Research(BaseModel):
    topic: str
    sections: list[ResearchSection]
    statistics: list[Statistic] = Field(default_factory=list)
    sources: list[Source] = Field(default_factory=list)
    generated_by: str = "manual"


# ----------------------------------------------------------------------- script


class ScriptSection(BaseModel):
    id: str
    title: str
    narration: list[str]  # paragraphs


class Script(BaseModel):
    topic: str
    title_options: list[str]
    sections: list[ScriptSection]
    generated_by: str = "manual"

    def full_text(self) -> str:
        return "\n\n".join(p for s in self.sections for p in s.narration)


# ------------------------------------------------------------------------ scenes

VisualKind = Literal[
    "photo", "map", "chart", "timeline", "stat", "title", "comparison", "quote", "text",
    "ai_image", "ai_video", "local",
]
Camera = Literal["push_in", "pull_out", "pan_left", "pan_right", "tilt_up", "tilt_down",
                 "static", "drone_forward"]
Transition = Literal["cut", "crossfade", "dip"]


class Visual(BaseModel):
    kind: VisualKind
    description: str
    camera: Camera = "push_in"
    location: str = ""
    period: str = ""           # "1965", "1960s", "present"
    characters: str = ""
    environment: str = ""
    lighting: str = ""
    mood: str = ""
    search_query: str = ""     # photo: what to search for
    alt_queries: list[str] = Field(default_factory=list)
    pinned: str = ""           # photo: a specific image URL to use instead of searching
    local_file: str = ""       # local: a file you supply, relative to the project
    prompt: str = ""           # ai_image / ai_video: filled in by the prompt builder if empty
    data: dict = Field(default_factory=dict)  # graphics: chart/map/timeline/stat payload
    shots: int = 1             # how many distinct images to cut between inside this scene


class Scene(BaseModel):
    id: str
    section: str
    narration: str
    visual: Visual
    sfx: list[str] = Field(default_factory=list)
    music_mood: str = ""
    transition: Transition = "crossfade"
    short_candidate: bool = False

    @field_validator("narration")
    @classmethod
    def _not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("narration is empty")
        return v.strip()


class ScenePlan(BaseModel):
    style_bible: str = ""      # one paragraph every AI prompt inherits for continuity
    scenes: list[Scene]


def claude_schema(model: type[BaseModel]) -> dict:
    """JSON Schema for structured outputs: every object closed, every field required."""
    schema = model.model_json_schema()

    def close(node):
        if isinstance(node, dict):
            if node.get("type") == "object" and "properties" in node:
                node["additionalProperties"] = False
                node["required"] = list(node["properties"].keys())
            for key in ("default", "title"):
                node.pop(key, None)
            for v in node.values():
                close(v)
        elif isinstance(node, list):
            for v in node:
                close(v)
        return node

    return close(schema)


class SceneDraft(BaseModel):
    """What Claude returns per scene. `data_json` carries graphic payloads as a JSON string,
    because structured outputs need closed objects and graphic payloads vary by kind."""
    narration: str
    kind: VisualKind
    description: str
    camera: Camera
    location: str
    period: str
    characters: str
    environment: str
    lighting: str
    mood: str
    search_query: str
    data_json: str
    sfx: list[str]
    music_mood: str
    transition: Transition
    short_candidate: bool


class SectionScenes(BaseModel):
    scenes: list[SceneDraft]


class StyleBible(BaseModel):
    style_bible: str
