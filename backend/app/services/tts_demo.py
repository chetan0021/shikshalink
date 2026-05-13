"""Demo-safe multilingual TTS: Edge TTS (no API key) with graceful degradation."""

from __future__ import annotations

import asyncio
import io
import wave
from typing import Literal

Lang = Literal["kn", "hi", "en"]

VOICES = {
    "kn": "kn-IN-GaganNeural",
    "hi": "hi-IN-MadhurNeural",
    "en": "en-IN-NeerjaNeural",
}


async def synthesize_spoken_message(text: str, lang: Lang) -> tuple[bytes, str]:
    """
    Returns (audio_bytes, mime_type).
    Prefers Edge TTS MP3; falls back to silent WAV if offline.
    """
    voice = VOICES.get(lang, VOICES["en"])
    try:
        import edge_tts

        communicate = edge_tts.Communicate(text, voice)
        buf = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.extend(chunk["data"])
        if buf:
            return bytes(buf), "audio/mpeg"
    except Exception:
        pass
    return _silent_wav(), "audio/wav"


def _silent_wav(duration_sec: float = 0.3) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        frames = int(16000 * duration_sec)
        wf.writeframes(b"\x00\x00" * frames)
    return buf.getvalue()


def run_tts_sync(text: str, lang: Lang) -> tuple[bytes, str]:
    return asyncio.run(synthesize_spoken_message(text, lang))
