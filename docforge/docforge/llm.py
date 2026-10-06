"""Claude client for the research, script and scene-breakdown stages.

Requires credentials: ANTHROPIC_API_KEY, or a profile from `ant auth login`.
Every request streams (long outputs), uses adaptive thinking with an explicit
effort level, and opts into server-side refusal fallbacks ("default" routing).
Token usage is written to the project's cost ledger.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from dataclasses import dataclass, field

from . import cost
from .project import Project

FALLBACK_BETA = "server-side-fallback-2026-07-01"
WEB_SEARCH_TOOL = "web_search_20260209"


class LLMUnavailable(RuntimeError):
    """No Claude credentials, or the anthropic package is missing."""


class LLMError(RuntimeError):
    pass


def credentials_available() -> bool:
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return True
    ant = shutil.which("ant")
    if not ant:
        return False
    try:
        out = subprocess.run([ant, "auth", "status"], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        return False
    return out.returncode == 0


@dataclass
class LLMResult:
    text: str
    sources: list[dict] = field(default_factory=list)
    input_tokens: int = 0
    output_tokens: int = 0
    searches: int = 0


class Claude:
    def __init__(self, project: Project, stage: str):
        try:
            import anthropic  # noqa: F401
        except ImportError as exc:  # pragma: no cover - dependency is in requirements.txt
            raise LLMUnavailable("pip install anthropic") from exc
        if not credentials_available():
            raise LLMUnavailable(
                "No Claude credentials. Set ANTHROPIC_API_KEY or run `ant auth login`, "
                "or set llm.provider: manual and supply the stage's files yourself."
            )
        import anthropic

        self.anthropic = anthropic
        self.client = anthropic.Anthropic()
        self.project = project
        self.stage = stage
        self.model = project.config.get_path("llm.model", "claude-opus-5-5")
        self.effort = project.config.get_path("llm.effort", "high")

    # ------------------------------------------------------------------
    def _stream(self, **kwargs):
        with self.client.beta.messages.stream(
            model=self.model,
            thinking={"type": "adaptive"},
            betas=[FALLBACK_BETA],
            fallbacks="default",
            **kwargs,
        ) as stream:
            return stream.get_final_message()

    def _record_usage(self, result: LLMResult, what: str) -> None:
        p = self.project.config.get_path
        usd = (result.input_tokens / 1e6 * float(p("cost.prices.claude_input_per_mtok", 0))
               + result.output_tokens / 1e6 * float(p("cost.prices.claude_output_per_mtok", 0))
               + result.searches / 1000 * float(p("cost.prices.web_search_per_1k", 0)))
        cost.record(self.project, self.stage, usd,
                    f"{what}: {result.input_tokens} in / {result.output_tokens} out tokens, "
                    f"{result.searches} searches")

    @staticmethod
    def _check_stop(message) -> None:
        if message.stop_reason == "refusal":
            details = getattr(message, "stop_details", None)
            raise LLMError(f"Claude declined the request ({getattr(details, 'category', None)}).")
        if message.stop_reason == "max_tokens":
            raise LLMError("Output hit max_tokens; raise the limit or split the request.")

    # ------------------------------------------------------------------
    def research(self, system: str, prompt: str, max_tokens: int = 64000) -> LLMResult:
        """Free-form research with Anthropic's server-side web search. Returns text + cited URLs."""
        tools = [{"type": WEB_SEARCH_TOOL, "name": "web_search",
                  "max_uses": int(self.project.config.get_path("llm.web_search_max_uses", 20))}]
        messages = [{"role": "user", "content": prompt}]
        result = LLMResult(text="")
        for _ in range(6):  # continue through pause_turn
            msg = self._stream(max_tokens=max_tokens, system=system, messages=messages, tools=tools,
                               output_config={"effort": self.effort})
            result.input_tokens += msg.usage.input_tokens
            result.output_tokens += msg.usage.output_tokens
            server_use = getattr(msg.usage, "server_tool_use", None)
            result.searches += int(getattr(server_use, "web_search_requests", 0) or 0)
            for block in msg.content:
                if block.type == "text":
                    result.text += block.text
                    for c in getattr(block, "citations", None) or []:
                        url = getattr(c, "url", None)
                        if url:
                            result.sources.append({"url": url, "title": getattr(c, "title", "")})
            if msg.stop_reason != "pause_turn":
                self._check_stop(msg)
                break
            messages.append({"role": "assistant", "content": msg.content})
        self._record_usage(result, "research")
        seen, unique = set(), []
        for s in result.sources:
            if s["url"] not in seen:
                seen.add(s["url"])
                unique.append(s)
        result.sources = unique
        return result

    def json(self, system: str, prompt: str, schema: dict, max_tokens: int = 64000,
             what: str = "json") -> dict:
        """One structured-output call; the reply is guaranteed to match `schema`."""
        msg = self._stream(
            max_tokens=max_tokens, system=system,
            messages=[{"role": "user", "content": prompt}],
            output_config={"effort": self.effort, "format": {"type": "json_schema", "schema": schema}},
        )
        self._check_stop(msg)
        result = LLMResult(text=next(b.text for b in msg.content if b.type == "text"),
                           input_tokens=msg.usage.input_tokens, output_tokens=msg.usage.output_tokens)
        self._record_usage(result, what)
        return json.loads(result.text)
