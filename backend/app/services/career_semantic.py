"""Sentence-transformer semantic ranking over career opportunities."""

from __future__ import annotations

import os
from functools import lru_cache

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import CareerOpportunity

MODEL_NAME = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def _encoder():
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer(MODEL_NAME)
    except Exception:
        return None


def semantic_rank_opportunities(
    db: Session,
    query_text: str,
    *,
    grade: int | None,
    region: str | None,
    limit: int = 12,
) -> list[tuple[CareerOpportunity, float]]:
    stmt = select(CareerOpportunity)
    rows = list(db.scalars(stmt).all())
    if grade is not None:
        rows = [r for r in rows if r.min_grade <= grade <= r.max_grade]
    if region:
        reg = region.lower()
        rows = [r for r in rows if reg in r.region_hint.lower()]
    if not rows:
        return []

    enc = _encoder()
    if enc is None:
        q = (query_text or "").lower()
        scored: list[tuple[CareerOpportunity, float]] = []
        for r in rows:
            blob = f"{r.title} {r.description} {r.category}".lower()
            scored.append((r, 1.0 if q and q in blob else 0.35))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:limit]

    corpus_texts = [
        f"{r.title}. {r.category}. {r.description}. Region: {r.region_hint}" for r in rows
    ]
    try:
        from sentence_transformers import util

        q_t = enc.encode(query_text or "vocational pathway India public school", convert_to_tensor=True)
        doc_t = enc.encode(corpus_texts, convert_to_tensor=True)
        sims = util.cos_sim(q_t, doc_t)[0].detach().cpu().numpy()
    except Exception:
        q_emb = np.asarray(enc.encode(query_text or "vocational pathway"))
        doc_emb = np.asarray(enc.encode(corpus_texts))
        q_emb = q_emb / max(np.linalg.norm(q_emb), 1e-12)
        doc_emb = doc_emb / np.maximum(np.linalg.norm(doc_emb, axis=1, keepdims=True), 1e-12)
        sims = doc_emb @ q_emb

    order = np.argsort(-sims)
    out: list[tuple[CareerOpportunity, float]] = []
    for idx in order[:limit]:
        out.append((rows[int(idx)], float(sims[int(idx)])))
    return out
