"""Stage 5 - visual asset management.

For every scene, find or make the visual(s) it needs and record them in the
manifest with full provenance (provider, licence, credit, source page):

photo     - search the configured free providers, score candidates for relevance,
            resolution, shape and period, reject duplicates, download the best
map/chart/timeline/stat/title/comparison/quote/text
          - render a preview still (this also validates the graphic's data early)
ai_image  - generate with fal if configured, else fall back to a photo search (logged)
ai_video  - image-to-video with fal if configured, else fall back to ai_image rules
local     - a file you supplied in the project folder

A scene that fails is marked failed and the stage carries on; fix its query
and run `docforge retry` to redo only failed scenes.
"""

from __future__ import annotations

import io
import re

from PIL import Image, ImageOps

from ..project import DONE, FAILED, Project
from ..scene_generator.prompts import NEGATIVE, period_year
from .graphics import make_ctx, render_frame
from .providers import (HTTP, NASA, Candidate, HostBreaker, LibraryOfCongress, Openverse,
                        Wikimedia)

GRAPHIC_KINDS = {"map", "chart", "timeline", "stat", "title", "comparison", "quote", "text"}
STOP = set("a an the of in on at to and or for with from by as is are was were its it this that "
           "photo image picture view old historic historical".split())


def tokens(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP and len(w) > 1}


def ahash(img: Image.Image) -> int:
    g = ImageOps.grayscale(img).resize((8, 8), Image.BILINEAR)
    px = list(g.tobytes())
    avg = sum(px) / 64
    return sum(1 << i for i, v in enumerate(px) if v >= avg)


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def score(c: Candidate, query: str, scene_year: int | None) -> float:
    q = tokens(query)
    if not q:
        return 0.0
    hay = tokens(c.title + " " + " ".join(c.tags))
    s = len(q & hay) / len(q)
    if c.width and c.height:
        aspect = c.width / c.height
        s += 0.15 if c.width >= 1920 else 0.0
        s += 0.10 if 1.3 <= aspect <= 2.1 else (-0.25 if aspect < 1.0 else 0.0)
    y = period_year(c.date)
    if scene_year and y:
        if y > scene_year + 5:
            s -= 0.6  # a newer photo would be an anachronism
        elif abs(y - scene_year) <= 15:
            s += 0.15
    return s


class AssetManager:
    def __init__(self, project: Project):
        self.p = project
        cfg = project.config.get_path
        self.breaker = HostBreaker()
        self.http = HTTP(cfg("assets.user_agent"), float(cfg("assets.request_delay_seconds", 1.0)), self.breaker)
        self.licenses = [l.lower() for l in cfg("assets.allowed_licenses", [])]
        self.min_width = int(cfg("assets.min_width", 1280))
        self.limit = int(cfg("assets.candidates_per_query", 20))
        self.min_score = float(cfg("assets.min_relevance", 0.34))
        available = {"openverse": Openverse(self.http, self.licenses), "loc": LibraryOfCongress(self.http),
                     "nasa": NASA(self.http), "wikimedia": Wikimedia(self.http)}
        self.providers = [available[n] for n in cfg("assets.photo_providers", []) if n in available]
        self.used_urls: set[str] = set()
        self.used_hashes: list[int] = []
        for scene in project.scenes:
            for a in scene.get("assets", []):
                self.used_urls.add(a.get("source_url", ""))
                if a.get("ahash") is not None:
                    self.used_hashes.append(int(a["ahash"]))

    # ------------------------------------------------------------- photos
    def _license_ok(self, c: Candidate) -> bool:
        return any(c.license == l or c.license.startswith(l) for l in self.licenses)

    def _download(self, url: str) -> Image.Image | None:
        r = self.http.get(url, timeout=120)
        if not r:
            return None
        try:
            img = Image.open(io.BytesIO(r.content))
            img.load()
            return ImageOps.exif_transpose(img).convert("RGB")
        except Exception:
            return None

    def _is_duplicate(self, h: int) -> bool:
        limit = int(self.p.config.get_path("quality_control.duplicate_hash_distance", 6))
        return any(hamming(h, u) <= limit for u in self.used_hashes)

    def find_photos(self, scene: dict, count: int) -> list[dict]:
        v = scene["visual"]
        queries = [q for q in [v.get("search_query", ""), *v.get("alt_queries", [])] if q.strip()]
        if not queries:
            queries = [v.get("description", "")]
        # Archive search engines often return nothing for "1960s"-style terms; retry without them.
        for q in list(queries):
            bare = re.sub(r"\b(1[5-9]|20)\d0s\b|\b(1[5-9]|20)\d\d\b", "", q)
            bare = re.sub(r"\s+", " ", bare).strip()
            if bare and bare != q and bare not in queries:
                queries.append(bare)
        scene_year = period_year(v.get("period", ""))
        # Archival photos are rarely large; the editor frames small images on a blurred fill.
        min_w = self.min_width if not scene_year or scene_year >= 1980 else \
            int(self.p.config.get_path("assets.min_width_archival", 640))
        found: list[dict] = []
        for query in queries:
            pool: list[tuple[float, Candidate]] = []
            for prov in self.providers:
                limit = self.limit if prov.name == "openverse" else min(self.limit, 8)
                for c in prov.search(query, limit):
                    if not c.url or c.url in self.used_urls or not self._license_ok(c):
                        continue
                    if c.width and c.width < min_w:
                        continue
                    pool.append((score(c, query, scene_year), c))
            pool.sort(key=lambda x: -x[0])
            for sc, c in pool:
                if len(found) >= count:
                    return found
                if sc < self.min_score:
                    break
                img = self._download(c.url)
                if img is None or img.width < min_w * 0.75:
                    continue
                h = ahash(img)
                if self._is_duplicate(h):
                    continue
                k = len(found) + 1
                dest = self.p.path("images", f"{scene['id']}_{k}.jpg")
                if img.width > 3840:
                    img.thumbnail((3840, 3840), Image.LANCZOS)
                img.save(dest, quality=92)
                self.used_urls.add(c.url)
                self.used_hashes.append(h)
                found.append({"type": "image", "path": self.p.rel(dest), "provider": c.provider,
                              "title": c.title, "credit": c.credit(), "license": c.license,
                              "license_url": c.license_url, "landing_url": c.landing_url,
                              "source_url": c.url, "date": c.date, "width": img.width,
                              "height": img.height, "ahash": h, "query": query, "score": round(sc, 3)})
            if len(found) >= count:
                break
        return found

    # ------------------------------------------------------------ others
    def graphic_preview(self, scene: dict) -> list[dict]:
        w, h = self.p.config.get_path("project.resolution", [1920, 1080])
        ctx = make_ctx(self.p.config, int(w), int(h), 8.0)
        img = render_frame(scene["visual"]["kind"], scene["visual"].get("data", {}), 7.9, ctx)
        dest = self.p.path("images", f"{scene['id']}_graphic.png")
        img.save(dest)
        return [{"type": "graphic", "path": self.p.rel(dest), "provider": "docforge-graphics",
                 "credit": scene["visual"].get("data", {}).get("source", ""), "license": "original",
                 "ahash": ahash(img)}]

    def ai(self, scene: dict, video: bool) -> list[dict]:
        cfg = self.p.config.get_path
        provider = cfg("assets.ai_video_provider" if video else "assets.ai_image_provider")
        if provider != "fal":
            self.p.log("assets", f"{scene['id']}: no AI {'video' if video else 'image'} provider "
                                 "configured; falling back to a photo search")
            return self.find_photos(scene, int(scene["visual"].get("shots", 1)))
        from .fal import Fal, download
        fal = Fal()
        v = scene["visual"]
        still_url = fal.image(cfg("assets.fal.image_model"), v["prompt"], NEGATIVE)
        still = self.p.path("images", f"{scene['id']}_ai.png")
        download(still_url, still)
        out = [{"type": "image", "path": self.p.rel(still), "provider": f"fal:{cfg('assets.fal.image_model')}",
                "credit": "AI-generated image", "license": "generated", "prompt": v["prompt"]}]
        if video:
            clip_url = fal.video(cfg("assets.fal.video_model"), v["prompt"], still_url,
                                 int(cfg("assets.fal.video_seconds", 5)))
            clip = self.p.path("video_clips", f"{scene['id']}_ai.mp4")
            download(clip_url, clip)
            out.insert(0, {"type": "video", "path": self.p.rel(clip),
                           "provider": f"fal:{cfg('assets.fal.video_model')}",
                           "credit": "AI-generated video", "license": "generated", "prompt": v["prompt"]})
        return out

    def local(self, scene: dict) -> list[dict]:
        src = self.p.path(scene["visual"]["local_file"])
        if not src.exists():
            raise FileNotFoundError(f"local_file not found: {src}")
        kind = "video" if src.suffix.lower() in (".mp4", ".mov", ".mkv", ".webm") else "image"
        return [{"type": kind, "path": self.p.rel(src), "provider": "local",
                 "credit": scene["visual"].get("data", {}).get("credit", "supplied by the producer"),
                 "license": "supplied"}]

    def pinned(self, scene: dict) -> list[dict]:
        url = scene["visual"]["pinned"]
        img = self._download(url)
        if img is None:
            raise RuntimeError(f"could not download pinned image {url}")
        dest = self.p.path("images", f"{scene['id']}_1.jpg")
        img.save(dest, quality=92)
        data = scene["visual"].get("data", {})
        return [{"type": "image", "path": self.p.rel(dest), "provider": "pinned", "source_url": url,
                 "credit": data.get("credit", url), "license": data.get("license", "see credit"),
                 "width": img.width, "height": img.height, "ahash": ahash(img)}]

    # ---------------------------------------------------------------- run
    def process(self, scene: dict) -> list[dict]:
        v = scene["visual"]
        kind = v["kind"]
        if kind in GRAPHIC_KINDS:
            return self.graphic_preview(scene)
        if kind == "local":
            return self.local(scene)
        if v.get("pinned"):
            return self.pinned(scene)
        if kind == "photo":
            return self.find_photos(scene, int(v.get("shots", 1)))
        if kind in ("ai_image", "ai_video"):
            return self.ai(scene, video=kind == "ai_video")
        raise ValueError(f"unknown visual kind {kind}")


def run_assets(project: Project, only_failed: bool = False) -> dict:
    mgr = AssetManager(project)
    scenes = project.scenes
    todo = [s for s in scenes if project.scene_status(s, "assets") != DONE
            and (not only_failed or project.scene_status(s, "assets") == FAILED)]
    for i, scene in enumerate(todo):
        try:
            assets = mgr.process(scene)
            want = int(scene["visual"].get("shots", 1)) if scene["visual"]["kind"] == "photo" else 1
            if not assets:
                raise RuntimeError(f"no usable image for '{scene['visual'].get('search_query')}'")
            scene["assets"] = assets
            if len(assets) < want:
                project.log("assets", f"{scene['id']}: wanted {want} shots, found {len(assets)}")
            project.mark_scene(scene, "assets", DONE)
        except Exception as exc:  # keep going; the scene can be retried on its own
            project.mark_scene(scene, "assets", FAILED, f"{type(exc).__name__}: {exc}")
            project.log("assets", f"{scene['id']}: FAILED {exc}")
        project.set_progress("assets", (i + 1) / max(1, len(todo)), scene["id"])
    write_credits(project)
    failed = project.failed_scenes("assets")
    if mgr.breaker.hosts():
        project.log("assets", f"rate-limited hosts skipped this run: {mgr.breaker.hosts()}")
    return {"processed": len(todo), "failed": [s["id"] for s in failed]}


def write_credits(project: Project) -> None:
    lines, seen = [], set()
    for scene in project.scenes:
        for a in scene.get("assets", []):
            if a.get("type") == "graphic" or a.get("license") in ("original", "generated"):
                continue
            key = a.get("source_url") or a.get("path")
            if key in seen:
                continue
            seen.add(key)
            lines.append(f"- {a.get('credit', '')}")
    text = "IMAGE CREDITS\n" + "\n".join(lines) + "\n\nMaps: Natural Earth (public domain). " \
           "Charts and graphics: original.\n"
    project.path("final", "credits.txt").write_text(text)

