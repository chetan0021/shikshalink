"""Structured admin field extraction using LangChain prompt templates plus deterministic parsing."""

from __future__ import annotations

import re
from typing import Any

from langchain_core.prompts import ChatPromptTemplate


def _extract_fields(transcript: str) -> dict[str, Any]:
    text = transcript.strip()
    school = None
    district = None
    udise = None
    month_year = None

    m_udise = re.search(r"\b(\d{11})\b", text)
    if m_udise:
        udise = m_udise.group(1)

    m_dist = re.search(
        r"district\s*(?:is|:)?\s*([A-Za-z][A-Za-z\s]{2,48})", text, re.IGNORECASE
    )
    if m_dist:
        district = m_dist.group(1).strip()

    m_school = re.search(
        r"(?:school|institution)\s*(?:name)?\s*(?:is|:)?\s*([^\.\n]{4,120})", text, re.IGNORECASE
    )
    if m_school:
        school = m_school.group(1).strip()

    m_my = re.search(
        r"(20\d{2})\s*[-\/]\s*(0?[1-9]|1[0-2])|(0?[1-9]|1[0-2])\s*[-\/]\s*(20\d{2})",
        text,
    )
    if m_my:
        month_year = m_my.group(0).replace("/", "-")

    validation_errors: list[str] = []
    if not udise:
        validation_errors.append("UDISE code not detected in transcript")
    if not district:
        validation_errors.append("District name not detected clearly")

    return {
        "school_name": school or "Not extracted — verify voice note",
        "district": district or "Not extracted — verify voice note",
        "udise_code": udise,
        "reporting_period": month_year or "Current academic month",
        "validation_errors": validation_errors,
        "raw_transcript_excerpt": text[:800],
    }


_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Normalize teacher voice transcripts for Indian government school UDISE-linked admin workflows.",
        ),
        ("human", "{transcript}"),
    ]
)


def extract_form_payload(transcript: str) -> dict[str, Any]:
    try:
        prompt_value = _PROMPT.invoke({"transcript": transcript})
        messages = prompt_value.to_messages()
        human_text = str(messages[-1].content)
    except Exception:
        human_text = transcript
    return _extract_fields(human_text)
