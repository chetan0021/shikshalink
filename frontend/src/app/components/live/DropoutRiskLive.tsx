"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/app/contexts/session-context";
import { apiGet, apiPost } from "@/app/lib/api";

type RiskCard = {
  student_id: string;
  student_name: string;
  school_name: string;
  district: string;
  state: string;
  band: string;
  score: number;
  factors: { label?: string; detail?: string; key?: string }[];
  risk_engine?: string | null;
};

export function DropoutRiskLive() {
  const qc = useQueryClient();
  const { session } = useSession();
  const schoolId = session?.schoolId ?? "";

  const cards = useQuery({
    queryKey: ["dropout-risk", "cards", schoolId],
    enabled: Boolean(schoolId),
    queryFn: () => apiGet<RiskCard[]>(`/api/dropout-risk/cards?school_id=${encodeURIComponent(schoolId)}`)
  });

  const refresh = useMutation({
    mutationFn: () => apiPost<{ snapshots_created: number }>("/api/dropout-risk/refresh", { school_id: schoolId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dropout-risk", "cards", schoolId] })
  });

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => refresh.mutate()}
        disabled={refresh.isPending || !schoolId}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-800 disabled:opacity-50"
      >
        {refresh.isPending ? "Refreshing…" : "Recompute risk with latest attendance"}
      </button>
      {refresh.isError && (
        <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 border border-rose-200">
          <p className="font-semibold">Refresh failed</p>
          <p className="mt-1 opacity-80">
            {refresh.error instanceof Error ? refresh.error.message : "An unknown error occurred"}
          </p>
        </div>
      )}
      <div className="space-y-2">
        {!schoolId ? (
          <p className="text-sm text-slate-500">Sign in again to attach a school scope.</p>
        ) : cards.isLoading ? (
          <p className="text-sm text-slate-500">Loading risk cards…</p>
        ) : cards.isError ? (
          <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 border border-rose-200">
            <p className="font-semibold">Unable to load risk cards</p>
            <p className="mt-1 opacity-80">
              {cards.error instanceof Error ? cards.error.message : "Network error or backend offline."}
            </p>
          </div>
        ) : cards.data?.length === 0 ? (
          <p className="text-sm text-slate-500">No risk cards found for this school.</p>
        ) : (
          cards.data?.map((c) => (
            <article key={c.student_id} className="rounded-xl border border-slate-200 bg-white/95 p-3 text-sm shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{c.student_name}</p>
                  <p className="text-xs text-slate-500">
                    {c.school_name} · {c.district}, {c.state}
                  </p>
                  {c.risk_engine ? (
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                      Engine · {c.risk_engine}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    c.band === "Green"
                      ? "bg-emerald-100 text-emerald-800"
                      : c.band === "Yellow"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {c.band} · {c.score}
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {c.factors.slice(0, 4).map((f, idx) => (
                  <li key={`${c.student_id}-f-${idx}`}>
                    <span className="font-medium text-slate-700">{f.label ?? f.key}</span>: {f.detail}
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
