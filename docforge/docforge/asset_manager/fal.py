"""fal.ai adapter for AI images (e.g. FLUX) and image-to-video clips (e.g. Kling).

Needs FAL_KEY. Uses fal's queue REST API: submit, poll status, fetch result.
UNTESTED in this repository's CI and sandbox (no key was available) - the
request shapes follow fal's documented queue API; check the model pages for
parameter names if a model rejects a request.
"""

from __future__ import annotations

import os
import time

import requests

QUEUE = "https://queue.fal.run"


class FalUnavailable(RuntimeError):
    pass


class Fal:
    def __init__(self):
        key = os.environ.get("FAL_KEY")
        if not key:
            raise FalUnavailable("FAL_KEY is not set")
        self.headers = {"Authorization": f"Key {key}", "Content-Type": "application/json"}

    def _run(self, model: str, payload: dict, timeout: float = 900) -> dict:
        r = requests.post(f"{QUEUE}/{model}", json=payload, headers=self.headers, timeout=60)
        r.raise_for_status()
        job = r.json()
        status_url, response_url = job["status_url"], job["response_url"]
        deadline = time.time() + timeout
        while time.time() < deadline:
            s = requests.get(status_url, headers=self.headers, timeout=60)
            s.raise_for_status()
            state = s.json().get("status")
            if state == "COMPLETED":
                out = requests.get(response_url, headers=self.headers, timeout=60)
                out.raise_for_status()
                return out.json()
            if state in ("FAILED", "ERROR", "CANCELLED"):
                raise RuntimeError(f"fal job {state}: {s.text[:300]}")
            time.sleep(4)
        raise TimeoutError(f"fal job did not finish in {timeout:.0f}s")

    def image(self, model: str, prompt: str, negative: str) -> str:
        res = self._run(model, {"prompt": prompt, "negative_prompt": negative,
                                "image_size": "landscape_16_9", "num_images": 1})
        return res["images"][0]["url"]

    def video(self, model: str, prompt: str, image_url: str, seconds: int) -> str:
        res = self._run(model, {"prompt": prompt, "image_url": image_url, "duration": str(seconds),
                                "aspect_ratio": "16:9"})
        return res["video"]["url"]


def download(url: str, dest) -> None:
    r = requests.get(url, timeout=300)
    r.raise_for_status()
    dest.write_bytes(r.content)
