"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

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

  const demo = useQuery({
    queryKey: ["demo-context"],
    queryFn: () => apiGet<DemoContext>("/api/system/demo-context")
  });

  const firstStudentId = useMemo(() => demo.data?.students[0]?.id, [demo.data?.students]);

  const trigger = useMutation({
    mutationFn: (studentId: string) =>
      apiPost<CallEvent>("/api/parent-voice-ai/trigger-call", {
        student_id: studentId,
        language,
        ...(customPhone.trim() ? { custom_phone_number: customPhone.trim() } : {}),
      }),
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

  const studentId = firstStudentId ?? "";

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 p-3 text-xs text-indigo-950">
        <p className="font-semibold text-indigo-900">Real PSTN / SIP (production)</p>
        <p className="mt-1 text-indigo-900/90">
          Wire Twilio or Asterisk as in <code className="rounded bg-white/80 px-1">deep-research-report.md</code> (CallerAgent,{" "}
          <a
            href="https://github.com/SABARNO-PRAMANICK/CallerAgent"
            className="font-medium underline"
            target="_blank"
            rel="noreferrer"
          >
            CallerAgent repo
          </a>
          ). This button hits the FastAPI <strong>demo</strong> queue only.
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
            {demo.data?.students[0]?.parent_phone ? (
              <span className="block text-xs text-slate-500">Phone on file (masked in UI in prod)</span>
            ) : null}
          </span>
        )}
      </div>
      {/* ── Real Twilio call: enter a verified Twilio number (e.g. +919876543210) ── */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 space-y-1.5">
        <label
          htmlFor="custom-phone-input"
          className="block text-xs font-semibold text-emerald-800"
        >
          📞 Real Twilio Call — Enter Verified Phone Number
        </label>
        <input
          id="custom-phone-input"
          type="tel"
          value={customPhone}
          onChange={(e) => setCustomPhone(e.target.value)}
          placeholder="+91XXXXXXXXXX  (leave blank for demo queue)"
          className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <p className="text-[11px] text-emerald-700/80">
          Trial accounts can only call numbers verified in your Twilio console.
        </p>
      </div>

      <button
        type="button"
        disabled={!studentId || trigger.isPending}
        onClick={() => trigger.mutate(studentId)}
        className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-left text-sm font-medium text-indigo-700 disabled:opacity-50"
      >
        {trigger.isPending
          ? "Placing call…"
          : customPhone.trim()
          ? `📲 Call ${customPhone.trim()} now`
          : "Trigger safe demo parent call (API)"}
      </button>
      {trigger.data ? (
        <button
          type="button"
          disabled={finalize.isPending}
          onClick={() => finalize.mutate(trigger.data.id)}
          className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm font-medium text-amber-800 disabled:opacity-50"
        >
          {finalize.isPending ? "Finalizing…" : "Complete demo call + sentiment capture"}
        </button>
      ) : null}
      {trigger.data ? <p className="text-xs text-slate-500">Queued call id: {trigger.data.id}</p> : null}
    </div>
  );
}
