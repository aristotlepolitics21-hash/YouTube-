"""A small local web interface (standard library only).

  docforge ui --dir projects --port 8765   then open http://localhost:8765

Enter a topic and settings, watch each stage's progress, approve costs above
the limit, and open the outputs. Runs one background pipeline per project.
"""

from __future__ import annotations

import json
import mimetypes
import threading
import traceback
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

import yaml

from .. import cost
from ..project import STAGES, Project

INDEX = Path(__file__).with_name("index.html")


class Jobs:
    def __init__(self, root: Path):
        self.root = root
        self.threads: dict[str, threading.Thread] = {}
        self.state: dict[str, dict] = {}
        self.lock = threading.Lock()

    def running(self, slug: str) -> bool:
        t = self.threads.get(slug)
        return bool(t and t.is_alive())

    def start(self, slug: str, confirm: bool) -> None:
        if self.running(slug):
            return
        from ..pipeline import run

        def work():
            self.state[slug] = {"state": "running"}
            try:
                run(Project(self.root / slug), confirm=confirm)
                self.state[slug] = {"state": "finished"}
            except cost.CostLimitExceeded as exc:
                self.state[slug] = {"state": "awaiting_confirmation", "message": str(exc)}
            except Exception as exc:
                self.state[slug] = {"state": "stopped", "message": f"{type(exc).__name__}: {exc}",
                                    "trace": traceback.format_exc()[-1500:]}

        t = threading.Thread(target=work, daemon=True)
        self.threads[slug] = t
        t.start()


def project_view(root: Path, slug: str, jobs: Jobs) -> dict:
    p = Project(root / slug)
    stages = [{"name": s, **{k: v for k, v in p.stage(s).items() if k in ("status", "progress", "note", "error")},
               "failed_scenes": len(p.failed_scenes(s)) if s in ("assets", "voiceover", "editing") else 0}
              for s in STAGES]
    est = p.manifest["cost"].get("estimates", {})
    outputs = p.manifest["outputs"].get("final", {})
    return {
        "slug": slug, "topic": p.config.get_path("project.topic"),
        "settings": p.config.get("project", {}), "voice": p.config.get_path("voiceover.piper_voice"),
        "stages": stages, "scenes": len(p.scenes),
        "minutes": round(p.manifest["outputs"].get("timeline_seconds", 0) / 60, 2),
        "estimate": est.get("total_usd"), "spent": cost.spent(p),
        "job": jobs.state.get(slug, {"state": "running" if jobs.running(slug) else "idle"}),
        "outputs": outputs, "log": p.log_tail(25),
    }


def make_handler(root: Path, jobs: Jobs):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):  # quiet
            pass

        def _json(self, data, status=HTTPStatus.OK):
            body = json.dumps(data).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _body(self) -> dict:
            n = int(self.headers.get("Content-Length", 0) or 0)
            return json.loads(self.rfile.read(n) or b"{}")

        def do_GET(self):
            path = unquote(urlparse(self.path).path)
            if path == "/":
                body = INDEX.read_bytes()
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            elif path == "/api/projects":
                slugs = sorted(p.name for p in root.iterdir() if (p / "manifest.json").exists()) if root.exists() else []
                self._json([project_view(root, s, jobs) for s in slugs])
            elif path.startswith("/api/projects/"):
                slug = path.split("/")[3]
                if not (root / slug / "manifest.json").exists():
                    return self._json({"error": "not found"}, HTTPStatus.NOT_FOUND)
                self._json(project_view(root, slug, jobs))
            elif path.startswith("/files/"):
                _, _, slug, *rest = path.split("/")
                target = (root / slug / "/".join(rest)).resolve()
                if not str(target).startswith(str((root / slug / "final").resolve())) or not target.is_file():
                    return self._json({"error": "not found"}, HTTPStatus.NOT_FOUND)
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", mimetypes.guess_type(target.name)[0] or "application/octet-stream")
                self.send_header("Content-Length", str(target.stat().st_size))
                self.end_headers()
                with open(target, "rb") as fh:
                    while chunk := fh.read(1 << 20):
                        self.wfile.write(chunk)
            else:
                self._json({"error": "not found"}, HTTPStatus.NOT_FOUND)

        def do_POST(self):
            path = urlparse(self.path).path
            data = self._body()
            if path == "/api/projects":
                topic = (data.get("topic") or "").strip()
                if not topic:
                    return self._json({"error": "topic is required"}, HTTPStatus.BAD_REQUEST)
                res = str(data.get("resolution", "1920x1080"))
                w, h = (int(x) for x in res.lower().split("x"))
                settings = {"target_minutes": float(data.get("minutes", 15)), "style": data.get("style", ""),
                            "language": data.get("language", "en"), "aspect_ratio": data.get("aspect_ratio", "16:9"),
                            "resolution": [1920, 1080], "render_4k": (w, h) == (3840, 2160)}
                p = Project.create(root, topic, settings)
                cfg = yaml.safe_load(p.path("config.yaml").read_text())
                if data.get("voice"):
                    cfg.setdefault("voiceover", {})["piper_voice"] = data["voice"]
                if data.get("video_model") and data["video_model"] != "none":
                    cfg.setdefault("assets", {}).update({"ai_video_provider": "fal", "ai_image_provider": "fal",
                                                         "fal": {"video_model": data["video_model"]}})
                cfg["llm"] = {"provider": data.get("llm", "manual")}
                p.path("config.yaml").write_text(yaml.safe_dump(cfg, sort_keys=False))
                jobs.start(p.root.name, confirm=False)
                return self._json({"slug": p.root.name})
            if path.startswith("/api/projects/") and path.endswith("/run"):
                slug = path.split("/")[3]
                jobs.start(slug, confirm=bool(data.get("confirm")))
                return self._json({"ok": True})
            self._json({"error": "not found"}, HTTPStatus.NOT_FOUND)

    return Handler


def serve(root: Path, port: int = 8765) -> None:
    root.mkdir(parents=True, exist_ok=True)
    jobs = Jobs(root)
    server = ThreadingHTTPServer(("127.0.0.1", port), make_handler(root, jobs))
    print(f"DocForge UI on http://localhost:{port}  (projects in {root.resolve()})")
    server.serve_forever()

