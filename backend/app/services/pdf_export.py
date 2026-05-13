"""Generate a compact PDF summary for Admin Bot outputs."""

from __future__ import annotations

import io
from typing import Any

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def build_admin_form_pdf(title: str, form_payload: dict[str, Any]) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 48
    c.setFont("Helvetica-Bold", 14)
    c.drawString(48, y, "SHIKSHA LINK — Government form summary")
    y -= 28
    c.setFont("Helvetica", 10)
    c.drawString(48, y, f"Title: {title}")
    y -= 18
    for key, val in form_payload.items():
        if isinstance(val, (dict, list)):
            continue
        line = f"{key}: {val}"
        while len(line) > 110:
            c.drawString(48, y, line[:110])
            line = line[110:]
            y -= 14
            if y < 72:
                c.showPage()
                y = height - 48
        c.drawString(48, y, line[:180])
        y -= 14
        if y < 72:
            c.showPage()
            y = height - 48
    c.showPage()
    c.save()
    return buf.getvalue()
