"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Device, Call } from "@twilio/voice-sdk";

import { apiGet, apiPost } from "@/app/lib/api";

type DemoStudent = {
  id: string;
  name: string;
  grade: number;
  parent_phone: string | null;
  school_udise: string | null;
};

type DemoContext = { students: DemoStudent[] };

type CallEvent = {
  id: string;
  student_id: string;
  language: string;
  call_status: string;
  sentiment_score: number | null;
  created_at: string;
};

export function ParentVoiceLive() {
  const qc = useQueryClient();
  const [language, setLanguage] = useState<"kn" | "hi" | "en">("kn");
  const [customPhone, setCustomPhone] = useState("");
  
  // Live Browser Call State
  const [device, setDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "open" | "failed">("idle");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const demo = useQuery({
    queryKey: ["demo-context"],
    queryFn: () => apiGet<DemoContext>("/api/system/demo-context")
  });

  const firstStudentId = useMemo(() => demo.data?.students[0]?.id, [demo.data?.students]);

  // ── Outbound PSTN Trigger ──────────────────────────────────────────────────
  const trigger = useMutation({
    mutationFn: (studentId: string) => {
      let phone = customPhone.trim();
      if (/^\d{10}$/.test(phone)) {
        phone = `+91${phone}`;
      }
      return apiPost<CallEvent>("/api/parent-voice-ai/trigger-call", {
        student_id: studentId,
        language,
        ...(phone ? { custom_phone_number: phone } : {}),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["demo-context"] })
  });

  const finalize = useMutation({
    mutationFn: (callId: string) =>
      apiPost<CallEvent>(`/api/parent-voice-ai/finalize-demo/${callId}`, {
        sentiment_score: -0.2,
        transcript_summary: "Parent confirmed transport constraints; school follow-up scheduled."
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dropout-risk"] });
    }
  });

  // ── Live Browser Calling Logic ─────────────────────────────────────────────
  
  const setupDevice = async () => {
    try {
      setTokenError(null);
      const { token } = await apiGet<{ token: string }>("/api/parent-voice-ai/token");
      
      const newDevice = new Device(token, {
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      });

      newDevice.on("error", (error) => {
        console.error("Twilio Device Error:", error);
        setTokenError(`Device Error: ${error.message}`);
      });

      setDevice(newDevice);
      return newDevice;
    } catch (err: any) {
      setTokenError("Failed to get voice token. Ensure TWILIO_API_KEY/SECRET and APP_SID are set in .env");
      return null;
    }
  };

  const handleBrowserCall = async () => {
    let currentDevice = device;
    if (!currentDevice) {
      currentDevice = await setupDevice();
    }
    if (!currentDevice) return;

    let phone = customPhone.trim();
    if (!phone) {
      setTokenError("Please enter a phone number for the browser call.");
      return;
    }
    if (/^\d{10}$/.test(phone)) {
      phone = `+91${phone}`;
    }

    setCallStatus("connecting");
    try {
      const call = await currentDevice.connect({ params: { To: phone } });
      
      call.on("accept", () => {
        setCallStatus("open");
        setActiveCall(call);
      });

      call.on("disconnect", () => {
        setCallStatus("idle");
        setActiveCall(null);
      });

      call.on("error", (error) => {
        console.error("Call Error:", error);
        setCallStatus("failed");
        setTokenError(`Call Error: ${error.message}`);
      });

    } catch (err: any) {
      setCallStatus("failed");
      setTokenError(`Connection failed: ${err.message}`);
    }
  };

  const handleHangup = () => {
    if (activeCall) {
      activeCall.disconnect();
    }
  };

  const studentId = firstStudentId ?? "";

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 p-3 text-xs text-indigo-950">
        <p className="font-semibold text-indigo-900">Real PSTN / SIP (production)</p>
        <p className="mt-1 text-indigo-900/90">
          Twilio Voice is now active. Choose between <strong>Automated Alert</strong> (reads script) or <strong>Live Browser Call</strong> (talk directly).
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(
          [
            ["kn", "Kannada"],
            ["hi", "Hindi"],
            ["en", "English"]
          ] as const
        ).map(([code, label]) => (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              language === code
                ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-700">
        {demo.isLoading ? (
          "Loading demo roster…"
        ) : demo.isError ? (
          <span className="text-rose-600">Demo roster unavailable (check API).</span>
        ) : (
          <span>
            First demo student:{" "}
            <span className="font-semibold">{demo.data?.students[0]?.name ?? "None"}</span>
          </span>
        )}
      </div>

      {/* ── Destination Input ── */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 space-y-1.5">
        <label
          htmlFor="custom-phone-input"
          className="block text-xs font-semibold text-emerald-800"
        >
          📞 Phone Number (Verified Twilio Number)
        </label>
        <input
          id="custom-phone-input"
          type="tel"
          value={customPhone}
          onChange={(e) => setCustomPhone(e.target.value)}
          placeholder="+91XXXXXXXXXX"
          className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* ── Call Buttons ── */}
      <div className="grid gap-2 grid-cols-2">
        <button
          type="button"
          disabled={!studentId || trigger.isPending}
          onClick={() => trigger.mutate(studentId)}
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3 text-center text-xs font-bold text-indigo-700 disabled:opacity-50 transition-all hover:bg-indigo-100"
        >
          {trigger.isPending ? "Placing..." : "📣 SEND AUTOMATED ALERT"}
        </button>

        {callStatus === "open" ? (
          <button
            type="button"
            onClick={handleHangup}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-center text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 animate-pulse"
          >
            🛑 HANG UP LIVE CALL
          </button>
        ) : (
          <button
            type="button"
            disabled={!customPhone.trim() || callStatus === "connecting"}
            onClick={handleBrowserCall}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center text-xs font-bold text-emerald-700 disabled:opacity-50 transition-all hover:bg-emerald-100"
          >
            {callStatus === "connecting" ? "CONNECTING..." : "🎙️ START LIVE BROWSER CALL"}
          </button>
        )}
      </div>

      {/* ── Status & Errors ── */}
      {trigger.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <strong>Alert Error:</strong> {(trigger.error as any)?.detail || "Failed to trigger automated call."}
        </div>
      ) : null}

      {tokenError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <strong>Live Call Error:</strong> {tokenError}
          <p className="mt-1 opacity-70">Make sure your .env has API_KEY, API_SECRET and APP_SID.</p>
        </div>
      ) }

      {trigger.data ? (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
           <p className="text-xs text-amber-800 font-medium">Automated call queued (ID: {trigger.data.id})</p>
           <button
            type="button"
            disabled={finalize.isPending}
            onClick={() => finalize.mutate(trigger.data!.id)}
            className="w-full rounded-lg bg-amber-200/50 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200"
          >
            {finalize.isPending ? "Finalizing…" : "Complete demo flow"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
