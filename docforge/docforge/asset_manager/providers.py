"""Photo providers. All free; none need an API key.

openverse - Creative Commons search over Flickr, Wikimedia and others (licence + attribution)
loc       - Library of Congress Prints & Photographs; only "No known restrictions" items
nasa      - NASA Image Library (US government work, public domain; satellite views)
wikimedia - Wikimedia Commons (often rate-limited from shared cloud IPs; see HostBreaker)
"""

from __future__ import annotations

import re
import threading
import time
from dataclasses import dataclass, field
from urllib.parse import urlparse

import requests


@dataclass
class Candidate:
    provider: str
    url: str                 # full-size image to download
    width: int
    height: int
    title: str
    creator: str = ""
    license: str = ""        # normalised: cc0, pdm, by, by-sa, public domain, no known restrictions
    license_url: str = ""
    landing_url: str = ""
    date: str = ""
    tags: list[str] = field(default_factory=list)
    attribution: str = ""

    def credit(self) -> str:
        if self.attribution:
            return self.attribution
        who = f" by {self.creator}" if self.creator else ""
        return f"\"{self.title}\"{who}, {self.license.upper()} {self.license_url} ({self.landing_url})".strip()


class HostBreaker:
    """Stops calling a host for the rest of the run once it answers 429 (rate limited)."""

    def __init__(self):
        self._blocked: dict[str, float] = {}
        self._lock = threading.Lock()

    def blocked(self, url: str) -> bool:
        host = urlparse(url).hostname or ""
        with self._lock:
            return any(host.endswith(h) for h in self._blocked)

    def hosts(self) -> list[str]:
        with self._lock:
            return sorted(self._blocked)

    def trip(self, url: str) -> None:
        host = urlparse(url).hostname or ""
        base = ".".join(host.split(".")[-2:])  # block the whole site, e.g. wikimedia.org
        with self._lock:
            self._blocked[base] = time.time()


class HTTP:
    def __init__(self, user_agent: str, delay: float, breaker: HostBreaker):
        self.session = requests.Session()
        self.session.headers["User-Agent"] = user_agent
        self.delay = delay
        self.breaker = breaker
        self._last = 0.0

    def get(self, url: str, **kw) -> requests.Response | None:
        if self.breaker.blocked(url):
            return None
        wait = self.delay - (time.time() - self._last)
        if wait > 0:
            time.sleep(wait)
        self._last = time.time()
        try:
            r = self.session.get(url, timeout=kw.pop("timeout", 45), **kw)
        except requests.RequestException:
            return None
        if r.status_code == 429:
            self.breaker.trip(url)
            return None
        return r if r.ok else None


def _int(v) -> int:
    try:
        return int(v)
    except (TypeError, ValueError):
        return 0


class Openverse:
    name = "openverse"
    API = "https://api.openverse.org/v1/images/"

    def __init__(self, http: HTTP, licenses: list[str]):
        self.http = http
        self.licenses = [l for l in licenses if l in ("cc0", "pdm", "by", "by-sa")]

    def search(self, query: str, limit: int) -> list[Candidate]:
        # No "size" filter: Openverse's "large" class is dominated by Wikimedia; real widths are
        # checked after download. Sources whose host is rate-limited are excluded up front.
        # Anonymous requests are capped at 20 per page, so read up to two pages.
        results = []
        for page in (1, 2):
            params = {"q": query, "page_size": 20, "page": page, "license": ",".join(self.licenses),
                      "mature": "false"}
            if self.http.breaker.blocked("https://upload.wikimedia.org/"):
                params["excluded_source"] = "wikimedia"
            r = self.http.get(self.API, params=params)
            if not r:
                break
            data = r.json()
            results += data.get("results", [])
            if len(results) >= limit or page >= data.get("page_count", 1):
                break
        out = []
        for it in results:
            if self.http.breaker.blocked(it.get("url", "")):
                continue
            out.append(Candidate(
                provider=f"openverse/{it.get('source', '')}", url=it.get("url", ""),
                width=_int(it.get("width")), height=_int(it.get("height")), title=it.get("title") or "",
                creator=it.get("creator") or "", license=(it.get("license") or "").lower(),
                license_url=it.get("license_url") or "", landing_url=it.get("foreign_landing_url") or "",
                tags=[t.get("name", "") for t in it.get("tags") or []], attribution=it.get("attribution") or "",
            ))
        return out


class LibraryOfCongress:
    name = "loc"
    API = "https://www.loc.gov/photos/"

    def __init__(self, http: HTTP):
        self.http = http

    def search(self, query: str, limit: int) -> list[Candidate]:
        r = self.http.get(self.API, params={"q": query, "fo": "json", "c": min(limit, 25),
                                            "fa": "online-format:image|partof:prints and photographs division"})
        if not r:
            return []
        out = []
        for it in r.json().get("results", [])[:limit]:
            item = self.http.get(it["url"], params={"fo": "json"})
            if not item:
                continue
            info = item.json().get("item", {})
            rights = str(info.get("rights_advisory") or "")
            if "no known restrictions" not in rights.lower():
                continue
            urls = [u for u in it.get("image_url", []) if u.startswith("http")]
            best = _loc_largest(urls)
            if not best:
                continue
            out.append(Candidate(
                provider="loc", url=best[0], width=best[1], height=best[2], title=it.get("title", ""),
                creator=", ".join(it.get("contributor", [])[:2]) if isinstance(it.get("contributor"), list) else "",
                license="no known restrictions", license_url="https://www.loc.gov/legal/",
                landing_url=it["url"], date=str(it.get("date", "")), tags=it.get("subject", [])[:10]
                if isinstance(it.get("subject"), list) else [],
                attribution=f"{it.get('title', '')}. Library of Congress, Prints & Photographs Division, {it['url']}",
            ))
        return out


def _loc_largest(urls: list[str]):
    best = None
    for u in urls:
        m = re.search(r"#h=(\d+)&w=(\d+)", u)
        h, w = (int(m.group(1)), int(m.group(2))) if m else (0, 0)
        clean = u.split("#")[0]
        # IIIF images can be requested larger than the listed thumbnail.
        if "/full/pct:" in clean:
            clean = re.sub(r"/full/pct:\d+/", "/full/pct:100/", clean)
            pct = re.search(r"pct:(\d+)", u)
            if pct and h:
                scale = 100 / int(pct.group(1))
                h, w = int(h * scale), int(w * scale)
        if best is None or w > best[1]:
            best = (clean, w, h)
    return best


class NASA:
    name = "nasa"
    API = "https://images-api.nasa.gov/search"

    def __init__(self, http: HTTP):
        self.http = http

    def search(self, query: str, limit: int) -> list[Candidate]:
        r = self.http.get(self.API, params={"q": query, "media_type": "image", "page_size": min(limit, 30)})
        if not r:
            return []
        out = []
        for it in r.json().get("collection", {}).get("items", [])[:limit]:
            data = (it.get("data") or [{}])[0]
            files = self.http.get(it["href"])
            if not files:
                continue
            urls = [u.replace("http://", "https://") for u in files.json() if isinstance(u, str)]
            pick = next((u for u in urls if u.endswith("~large.jpg")), None) or \
                next((u for u in urls if u.endswith("~orig.jpg")), None)
            if not pick:
                continue
            out.append(Candidate(
                provider="nasa", url=pick, width=0, height=0, title=data.get("title", ""),
                creator=f"NASA {data.get('center', '')}".strip(), license="public domain",
                license_url="https://www.nasa.gov/nasa-brand-center/images-and-media/",
                landing_url=f"https://images.nasa.gov/details/{data.get('nasa_id', '')}",
                date=data.get("date_created", "")[:10], tags=data.get("keywords", [])[:10],
                attribution=f"{data.get('title', '')} - NASA (public domain), "
                            f"https://images.nasa.gov/details/{data.get('nasa_id', '')}",
            ))
        return out


class Wikimedia:
    name = "wikimedia"
    API = "https://commons.wikimedia.org/w/api.php"

    def __init__(self, http: HTTP):
        self.http = http

    def search(self, query: str, limit: int) -> list[Candidate]:
        r = self.http.get(self.API, params={
            "action": "query", "format": "json", "generator": "search",
            "gsrsearch": f"{query} filetype:bitmap", "gsrnamespace": 6, "gsrlimit": min(limit, 30),
            "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 2560})
        if not r:
            return []
        out = []
        for page in (r.json().get("query", {}).get("pages", {}) or {}).values():
            ii = (page.get("imageinfo") or [{}])[0]
            meta = ii.get("extmetadata", {})
            lic = re.sub(r"<[^>]+>", "", meta.get("LicenseShortName", {}).get("value", "")).lower()
            norm = ("cc0" if "cc0" in lic else "pdm" if "public domain" in lic else
                    "by-sa" if "by-sa" in lic else "by" if "cc by" in lic else lic)
            artist = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", ""))
            out.append(Candidate(
                provider="wikimedia", url=ii.get("thumburl") or ii.get("url", ""),
                width=_int(ii.get("thumbwidth") or ii.get("width")),
                height=_int(ii.get("thumbheight") or ii.get("height")),
                title=page.get("title", "").removeprefix("File:"), creator=artist, license=norm,
                license_url=meta.get("LicenseUrl", {}).get("value", ""),
                landing_url=ii.get("descriptionurl", ""),
                date=re.sub(r"<[^>]+>", "", meta.get("DateTimeOriginal", {}).get("value", ""))[:20],
            ))
        return out
