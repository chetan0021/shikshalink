# 🎓 Shiksha Link — Intelligent Command Center for Indian Public Education

> **Bridging the last-mile gap between government data, school administrators, parents, and district officers — in real time, in every Indian language.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js)](https://nextjs.org)
[![Twilio](https://img.shields.io/badge/Calls-Twilio_Voice-F22F46?logo=twilio)](https://twilio.com)
[![LightGBM](https://img.shields.io/badge/ML-LightGBM-3B9C3B)](https://lightgbm.readthedocs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🔥 The Problem We Are Solving

India's public school system serves **260 million+ students** across 1.5 million schools — yet the infrastructure connecting teachers, parents, and district officials remains fragmented, paper-based, and inaccessible in real time.

### Pain Points We Directly Address

| # | Pain Point | Who It Hurts | How Shiksha Link Fixes It |
|---|-----------|-------------|--------------------------|
| 1 | **Dropout blindness** — schools have no early warning system for at-risk students | District Officers, Headmasters | AI-powered Dropout Risk Engine predicts risk scores *before* a student drops out, using attendance streaks, family income, distance, and gender factors |
| 2 | **Parent unreachability** — absent students' parents are never notified in their native language | Parents (esp. rural, non-English) | Real Twilio Voice calls deliver multilingual (Kannada / Hindi / English) spoken alerts directly to parents' phones — no smartphone or app required |
| 3 | **Data silos** — UDISE data exists but is locked in PDFs and spreadsheets, invisible to on-ground staff | BEOs, District Officers | One-click UDISE CSV ingestion + live India choropleth heatmap shows enrollment, dropout, gender parity across every state |
| 4 | **Paper-based administration** — teacher voice notes, inspection reports, and admin tasks are still handwritten | Headmasters, Block Education Officers | AI Admin Bot transcribes voice notes (Whisper), extracts structured data with LangChain, and exports audit-ready PDFs |
| 5 | **Career guidance vacuum** — students in rural India have zero exposure to career options beyond their immediate environment | Students (Grade 6–12) | Semantic Career Mapper matches each student's profile to real opportunities using SentenceTransformer embeddings, far beyond keyword search |
| 6 | **BEO task opacity** — district-level task delegation has no visibility or escalation trail | Block Education Officers | BEO Control Center provides task assignment, status tracking, and automatic escalation for overdue items |

---

## ✨ What Makes This Genuinely Different

- 🗣️ **Phone calls, not push notifications** — Parents in rural India have feature phones. We call them. Twilio Voice + TwiML `<Say>` reads the absence alert *in their language* over a real PSTN call.
- 🧠 **Explainable AI** — LightGBM dropout predictions come with leaf-contribution factor breakdowns ("High risk because: 12 consecutive absences, income < ₹5,000/mo, distance > 5 km").
- 🌍 **Live India heatmap** — GeoJSON-backed choropleth map with real-time metric switching (enrollment, dropout rate, gender parity ratio) across all Indian states.
- ⚡ **WebSocket-first realtime** — Every event (call queued, call completed, risk updated) fans out via `/ws/events` to all connected dashboards instantly — no polling.
- 📊 **One monorepo, full stack** — Next.js 15 + FastAPI in a single `npm run dev` command. No Docker required for local development.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Next.js 15 Frontend (port 3000)    │
│  Landing Page │ Auth │ Workspace │ India Map    │
└──────────────────────┬──────────────────────────┘
                       │ REST + WebSocket
┌──────────────────────▼──────────────────────────┐
│              FastAPI Backend (port 8000)         │
│                                                  │
│  /api/parent-voice-ai  ──►  Twilio Voice API    │
│  /api/admin-bot        ──►  Whisper + LangChain │
│  /api/dropout-risk     ──►  LightGBM ML model  │
│  /api/career-mapper    ──►  SentenceTransformer │
│  /api/beo-tasks        ──►  Delegation engine   │
│  /api/metrics          ──►  India heatmap data  │
│  /ws/events            ──►  WebSocket hub       │
└──────────────────────────────────────────────────┘
              │ SQLAlchemy ORM
┌─────────────▼──────────┐
│  SQLite (dev)          │
│  PostgreSQL (prod)     │
└────────────────────────┘
```

---

## 🧩 Module Breakdown

### 1. 📞 Parent Voice AI *(Flagship Feature)*
Real outbound phone calls to parents when a student is absent — in their native language.

- **Twilio Voice** places a real PSTN call from your Twilio number to any verified phone
- **TwiML `<Say>`** reads a pre-written script in Kannada, Hindi, or English
- **Demo mode** — works without Twilio credentials by queuing a simulated call event
- **Sentiment capture** — finalize a call with a sentiment score, feeding back into the dropout risk model
- **WebSocket broadcast** — every call event instantly updates all connected dashboards

### 2. 🚨 Dropout Risk Engine
AI-powered early warning system with explainable predictions.

- **LightGBM regression** trained on synthetic but representative Indian school data
- **Heuristic fallback** when the ML model is unavailable — always returns a result
- **Risk bands**: Critical / High / Medium / Low with colour-coded cards
- **Factor breakdown**: Each score explained by contributing features (attendance streak, income bracket, distance, gender)
- **Risk snapshots** stored per student for longitudinal trend tracking

### 3. 🎤 AI Admin Bot
Voice-first administrative assistant for headmasters and BEOs.

- **Whisper transcription** converts uploaded voice notes to text
- **LangChain prompt templates** extract structured data (UDISE codes, dates, issues) from free-form speech
- **Deterministic UDISE parser** validates and normalises school codes
- **PDF export** generates audit-ready reports from transcribed and validated data

### 4. 🧭 Career Mapper
Semantic career guidance for rural students — beyond keyword matching.

- **SentenceTransformer** (`all-MiniLM-L6-v2`) encodes both student profiles and career opportunities
- **Cosine similarity** ranking returns the most contextually relevant careers
- **Grade-range filters** ensure opportunities are age-appropriate
- **Toggle** between semantic AI ranking and traditional keyword search

### 5. 🗺️ India Education Heatmap
Live, interactive choropleth showing education metrics across every Indian state.

- **Real-time metric switching**: Enrollment numbers, Dropout rates, Gender Parity Index
- **GeoJSON proxy** with automatic CDN fallback for reliable map rendering
- **`react-simple-maps`** choropleth with hover tooltips and smooth colour gradients
- **State-level drill-down** ready for district-level data integration

### 6. 📋 BEO Control Center
Task management and escalation for Block Education Officers.

- Create and assign tasks with roles, deadlines, and descriptions
- Track status transitions (pending → in-progress → completed)
- Automatic escalation flag on overdue tasks
- Full audit trail via timestamped database records

### 7. ⚡ Realtime WebSocket Hub
All modules share a single `/ws/events` broadcast hub.

- `parent_call_queued` — fires when a call is triggered
- `parent_call_completed` — fires when sentiment is captured
- Every connected frontend client receives live updates with no polling

---

## 🗂️ Repository Layout

```
shiksha-link/
├── frontend/                    # Next.js 15 app
│   └── src/app/
│       ├── page.tsx             # Marketing landing page
│       ├── workspace/           # Main dashboard
│       └── components/
│           ├── live/            # Real-time widgets
│           │   ├── ParentVoiceLive.tsx   # Twilio calling UI
│           │   └── DropoutRiskLive.tsx   # Risk cards
│           └── IndiaMap.tsx     # Choropleth heatmap
├── backend/
│   └── app/
│       ├── main.py              # FastAPI app + router registration
│       ├── schemas.py           # Pydantic request/response models
│       ├── db/                  # SQLAlchemy models + session
│       ├── routers/             # API route handlers
│       │   ├── parent_voice_ai.py  # Twilio + TTS + call events
│       │   ├── admin_bot.py        # Whisper + LangChain
│       │   ├── dropout_risk.py     # LightGBM predictions
│       │   └── career_mapper.py    # Semantic ranking
│       ├── services/            # Business logic + ML models
│       └── realtime/            # WebSocket hub
├── ai/                          # ML research notes + helpers
├── voice/                       # SIP/browser adapter stubs
├── db/                          # Reference SQL schemas
├── shared/                      # Cross-service route contracts
├── docker-compose.yml           # PostgreSQL + app orchestration
└── README.md
```

---

## ⚙️ Configuration

Copy `backend/.env.example` to `backend/.env` and fill in your values:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | No | PostgreSQL URI. Omit for SQLite (`./shiksha_link.db`) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed browser origins |
| `GROQ_API_KEY` | Optional | Groq LLM API for enhanced LangChain extraction |
| `TWILIO_ACCOUNT_SID` | For real calls | From [console.twilio.com](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | For real calls | From [console.twilio.com](https://console.twilio.com) |
| `TWILIO_FROM_NUMBER` | For real calls | Your Twilio purchased number (e.g. `+19787319522`) |
| `WHISPER_MODEL` | Optional | Whisper checkpoint: `tiny`, `base`, `small` (default `base`) |
| `SENTENCE_TRANSFORMER_MODEL` | Optional | Defaults to `all-MiniLM-L6-v2` |
| `INDIA_STATES_GEOJSON_URL` | Optional | Override GeoJSON source URL |

> ⚠️ **Never commit `.env` to Git.** It is already in `.gitignore`. Use `.env.example` as the template.

> 📞 **Twilio Trial accounts** can only call phone numbers verified in your Twilio console at [console.twilio.com/verified-caller-ids](https://console.twilio.com/verified-caller-ids).

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+

### One-Command Start (recommended)

```bash
# From repo root — starts FastAPI on :8000 and Next.js on :3000
npm install
npm run dev
```

> First time only: also run `cd frontend && npm install --legacy-peer-deps`

### Manual Start

**Terminal 1 — Backend:**
```powershell
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

App opens at **http://localhost:3000**. Backend API docs at **http://localhost:8000/docs**.

Demo data (schools, students, attendance, metrics, career corpus) seeds automatically on first boot.

---

## 🎮 Demo Flows

1. **Parent Voice Call** — Go to Workspace → Parent Voice AI → Enter your verified phone number → Select language → Click *Call now*. Your phone rings with a spoken school absence alert.
2. **Dropout Risk** — Trigger a call → Finalize with sentiment → Watch the risk cards update in real time via WebSocket.
3. **Admin Bot** — Upload a voice note → Get transcript + structured extraction → Download PDF report.
4. **Career Mapper** — Toggle semantic vs keyword mode → See ranked career suggestions change in real time.
5. **India Heatmap** — Switch between enrollment, dropout, and gender parity metrics on the live choropleth.

---

## 📈 Phase Tracker

| Phase | Description | Status |
|-------|-------------|--------|
| 1–3 | Scaffold, UI shell, API + persistence | ✅ Complete |
| 4 | AI stacks (Whisper, LangChain, LightGBM, SentenceTransformers, Edge TTS) | ✅ Complete |
| 5 | WebSocket realtime fan-out | ✅ Complete |
| 6 | Glass command-center UI polish + motion + interactive map | ✅ Complete |
| 7 | Realistic seed dataset across multiple states | ✅ Complete |
| 8 | **Real Twilio Voice calling with multilingual TwiML** | ✅ Complete |
| 9 | Production hardening (Clerk auth, Alembic migrations, Bhashini enterprise TTS) | 🔜 Planned |

---

## 🔮 Roadmap

- **Bhashini API** — Replace Edge TTS with India's official government TTS for authentic regional language voices
- **Clerk authentication** — Role-based access (Teacher / Headmaster / BEO / District Officer)
- **Alembic migrations** — Schema versioning for production PostgreSQL
- **Asterisk AMI** — On-premise SIP trunk integration for schools without internet
- **Mobile PWA** — Offline-capable teacher companion app
- **DIKSHA integration** — Pull learning outcome data for richer dropout risk modelling

---

## 🙏 Acknowledgements

Built with ❤️ for the children of India's public school system.

- [Twilio Voice](https://twilio.com/voice) — Real PSTN calling infrastructure
- [OpenAI Whisper](https://github.com/openai/whisper) — Speech transcription
- [LightGBM](https://lightgbm.readthedocs.io) — Gradient boosting for risk prediction
- [SentenceTransformers](https://sbert.net) — Semantic similarity for career mapping
- [LangChain](https://langchain.com) — LLM prompt orchestration
- [react-simple-maps](https://react-simple-maps.io) — India choropleth
- [FastAPI](https://fastapi.tiangolo.com) — High-performance Python API framework
