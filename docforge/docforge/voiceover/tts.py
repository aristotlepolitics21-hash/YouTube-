"""Text-to-speech providers.

piper      - offline neural TTS, free. Voices download once into voiceover.piper_voice_dir.
elevenlabs - premium voices; needs ELEVENLABS_API_KEY and voiceover.elevenlabs.voice_id.
             UNTESTED here (no key available); follows ElevenLabs' documented REST API.
"""

from __future__ import annotations

import os
import subprocess
import sys
import tempfile
from pathlib import Path

import requests


def to_wav48(src: Path, dest: Path) -> None:
    """Normalise any audio file to 48 kHz mono 16-bit WAV."""
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1", "-ar", "48000",
                    "-c:a", "pcm_s16le", str(dest)], check=True)


class Piper:
    def __init__(self, voice: str, voice_dir: str, length_scale: float, sentence_silence: float):
        self.dir = Path(voice_dir).expanduser()
        self.voice = voice
        self.length_scale = length_scale
        self.sentence_silence = sentence_silence
        self.model = self.dir / f"{voice}.onnx"
        if not self.model.exists():
            self.dir.mkdir(parents=True, exist_ok=True)
            subprocess.run([sys.executable, "-m", "piper.download_voices", "--download-dir", str(self.dir), voice],
                           check=True, capture_output=True)

    def synth(self, text: str, dest: Path) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            raw = Path(tmp) / "raw.wav"
            subprocess.run([sys.executable, "-m", "piper", "-m", str(self.model), "-f", str(raw),
                            "--length-scale", str(self.length_scale),
                            "--sentence-silence", str(self.sentence_silence)],
                           input=text.encode(), check=True, capture_output=True)
            to_wav48(raw, dest)


class ElevenLabs:
    API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}"

    def __init__(self, voice_id: str, model_id: str):
        self.key = os.environ.get("ELEVENLABS_API_KEY")
        if not self.key or not voice_id:
            raise RuntimeError("ElevenLabs needs ELEVENLABS_API_KEY and voiceover.elevenlabs.voice_id")
        self.voice_id, self.model_id = voice_id, model_id

    def synth(self, text: str, dest: Path, previous_text: str = "", next_text: str = "") -> None:
        r = requests.post(self.API.format(voice=self.voice_id),
                          params={"output_format": "mp3_44100_128"},
                          headers={"xi-api-key": self.key, "Content-Type": "application/json"},
                          json={"text": text, "model_id": self.model_id,
                                "previous_text": previous_text, "next_text": next_text},
                          timeout=180)
        r.raise_for_status()
        with tempfile.TemporaryDirectory() as tmp:
            mp3 = Path(tmp) / "a.mp3"
            mp3.write_bytes(r.content)
            to_wav48(mp3, dest)


def make_tts(config):
    g = config.get_path
    if g("voiceover.provider") == "elevenlabs":
        return ElevenLabs(g("voiceover.elevenlabs.voice_id", ""), g("voiceover.elevenlabs.model_id"))
    return Piper(g("voiceover.piper_voice"), g("voiceover.piper_voice_dir"),
                 float(g("voiceover.length_scale", 1.0)), float(g("voiceover.sentence_silence", 0.3)))
