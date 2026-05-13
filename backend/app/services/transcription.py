"""Local Whisper transcription with graceful fallback for constrained environments."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path


def transcribe_audio_file(path: Path, language: str | None = None) -> tuple[str, str]:
    """
    Returns (transcript, backend_label).
    backend_label is 'whisper-tiny', 'whisper-base', or 'fallback-text'.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(str(path))

    model_name = os.getenv("WHISPER_MODEL", "tiny")

    try:
        import whisper

        model = whisper.load_model(model_name)
        kwargs: dict = {}
        if language:
            kwargs["language"] = {"kn": "kn", "hi": "hi", "en": "en"}.get(language, language)
        result = model.transcribe(str(path), **kwargs)
        text = (result.get("text") or "").strip()
        return text or _fallback_from_filename(path.name), f"whisper-{model_name}"
    except Exception:
        return _fallback_from_filename(path.name), "fallback-text"


def _fallback_from_filename(name: str) -> str:
    base = Path(name).stem.replace("_", " ").replace("-", " ")
    return (
        f"Voice note received ({base}). Whisper runtime unavailable in this environment — "
        "upload again on a machine with PyTorch and openai-whisper installed for full transcription."
    )
