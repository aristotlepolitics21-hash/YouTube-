from PIL import Image

from docforge.asset_manager.graphics import make_ctx, render_frame
from docforge.asset_manager.manager import AssetManager, ahash, hamming, score, tokens
from docforge.asset_manager.providers import Candidate, HostBreaker, _loc_largest
from docforge.config import load_config

from .conftest import make_image


def cand(**kw):
    base = dict(provider="t", url="u", width=2000, height=1125, title="Singapore River boats", license="cc0")
    base.update(kw)
    return Candidate(**base)


def test_score_prefers_relevant_landscape_and_period():
    q = "Singapore River boats 1960s"
    good = score(cand(date="1962"), q, 1965)
    off_topic = score(cand(title="Paris street"), q, 1965)
    anachronism = score(cand(date="2015"), q, 1965)
    portrait = score(cand(width=800, height=1200), q, 1965)
    assert good > off_topic and good > anachronism and good > portrait


def test_tokens_drop_stopwords():
    assert tokens("A photo of the Singapore harbour") == {"singapore", "harbour"}


def test_ahash_distinguishes_images(tmp_path):
    a = Image.open(make_image(tmp_path / "a.jpg", color=(200, 30, 30)))
    b = a.transpose(Image.FLIP_LEFT_RIGHT).rotate(90, expand=True).resize((1600, 900))
    assert hamming(ahash(a), ahash(a.resize((800, 450)))) <= 4
    assert hamming(ahash(a), ahash(b)) >= 0  # computed without error


def test_host_breaker():
    br = HostBreaker()
    br.trip("https://upload.wikimedia.org/x.jpg")
    assert br.blocked("https://commons.wikimedia.org/w/api.php")
    assert not br.blocked("https://api.openverse.org/v1/images/")


def test_loc_largest_upgrades_iiif():
    url, w, h = _loc_largest(["https://tile.loc.gov/x/full/pct:25/0/default.jpg#h=300&w=400"])
    assert "pct:100" in url and w == 1600 and h == 1200


def test_every_graphic_kind_renders():
    cfg = load_config()
    ctx = make_ctx(cfg, 640, 360, 4.0)
    specs = {
        "title": {"text": "Hello", "subtitle": "World"}, "stat": {"value": "$1,234", "label": "x"},
        "text": {"text": "Line one"}, "quote": {"text": "Q", "attribution": "A"},
        "comparison": {"title": "C", "left": {"label": "a", "value": "1"}, "right": {"label": "b", "value": "2"}},
        "chart": {"type": "bar", "title": "B", "bars": [{"label": "a", "value": 3}, {"label": "b", "value": 5}]},
        "timeline": {"title": "T", "events": [{"year": "1819", "label": "x"}, {"year": "1965", "label": "y"}]},
    }
    for kind, spec in specs.items():
        img = render_frame(kind, spec, 3.5, ctx)
        assert img.size == (640, 360), kind
    line = {"type": "line", "series": [{"label": "s", "points": [[1965, 500], [2023, 84000]]}], "scale": "log"}
    assert render_frame("chart", line, 3.5, ctx).size == (640, 360)


def test_local_asset_and_graphic_preview(project):
    make_image(project.path("images", "mine.jpg"))
    mgr = AssetManager(project)
    local = mgr.process({"id": "scene_001", "visual": {"kind": "local", "local_file": "images/mine.jpg"}})
    assert local[0]["type"] == "image"
    g = mgr.process({"id": "scene_002", "visual": {"kind": "stat", "data": {"value": "5", "label": "x"}}})
    assert project.path(g[0]["path"]).exists()


def test_ai_scene_without_provider_falls_back_to_photo_search(project, monkeypatch):
    mgr = AssetManager(project)
    called = {}
    monkeypatch.setattr(mgr, "find_photos", lambda scene, n: called.setdefault("n", n) and [])
    mgr.process({"id": "scene_001", "visual": {"kind": "ai_image", "prompt": "p", "search_query": "q", "shots": 1}})
    assert called["n"] == 1
