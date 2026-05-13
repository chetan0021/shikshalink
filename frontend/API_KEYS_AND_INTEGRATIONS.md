# API keys and integrations (Shiksha Link)

Use a **single env file** for the Next.js app (`frontend/`) and the FastAPI backend (`backend/`). Never commit real secrets; add `.env` / `.env.local` to `.gitignore` (already ignored in most setups).

---

## 1. Groq (free tier LLM — text)

- **Site:** [https://console.groq.com](https://console.groq.com)
- **Create:** account → **API Keys** → create key.
- **Env (backend or server route):** `GROQ_API_KEY=gsk_...`
- **Usage:** OpenAI-compatible chat at `https://api.groq.com/openai/v1/chat/completions` with header `Authorization: Bearer ...`. Prefer calling Groq **from the backend** so the key is not exposed in the browser.
- **Settings:** pick a small fast model (e.g. Llama 3.x) for demos; set rate limits in console if you share a project.

---

## 2. Twilio (real parent phone calls — paid / trial)

- **Site:** [https://www.twilio.com](https://www.twilio.com)
- **Create:** account → **Console** → copy `Account SID` and `Auth Token`.
- **Buy / verify:** a Twilio phone number; for trial, only **verified** destination numbers work.
- **Env:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (E.164, e.g. `+1415...`).
- **Backend:** implement `POST /api/call-parent` as in `deep-research-report.md` (TwiML URL must be **HTTPS** in production).
- **India:** use compliant templates; respect DND and consent (report Section 11).

---

## 3. Asterisk / SIP (self-hosted — no per-minute to Twilio)

- **Docs:** Asterisk AMI or SIP originate (see report Section 1 & 8).
- **Env:** host, port, trunk user/password — project-specific.
- **Testing:** softphones (Zoiper, Linphone) on LAN before PSTN.

---

## 4. CallerAgent (GitHub reference)

- **Repo:** [https://github.com/SABARNO-PRAMANICK/CallerAgent](https://github.com/SABARNO-PRAMANICK/CallerAgent)
- **Use:** clone, configure `config.json` / `.env`, run locally; adapt outbound call step to your `student_id` → parent phone lookup from DB.
- **Prod:** run as a sidecar service; your FastAPI only enqueues jobs and stores call status.

---

## 5. This repo’s FastAPI (already wired for demos)

- **Env:** `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` in **`frontend/.env.local`** so the landing choropleth and auth demo can reach the API.
- **CORS:** backend `CORS_ORIGINS` must include `http://localhost:3000` (default in `backend` config).
- **Optional DB:** `DATABASE_URL` for Postgres; else SQLite `shiksha_link.db` under `backend/`.

---

## 6. Whisper / speech (optional)

- Heavy on Windows; often run in **Linux/WSL** or use a hosted STT API instead.
- If you add a cloud STT key (e.g. Deepgram, AssemblyAI), store it server-side only.

---

## 7. Edge TTS / other

- Current backend uses **edge-tts** for samples without a key in many regions; if Microsoft blocks, add documented fallback.

---

### Checklist before you paste keys into chat

1. **Rotate** any key that was ever pasted into a chat or committed to git.  
2. Prefer **backend-only** keys; frontend only `NEXT_PUBLIC_*` for **non-secret** base URLs.  
3. One file per environment: `.env.local` (Next), `.env` (uvicorn / dotenv).

When you have keys ready, share **only variable names and non-secret endpoints** in chat; paste real secrets only inside your local `.env` files.
