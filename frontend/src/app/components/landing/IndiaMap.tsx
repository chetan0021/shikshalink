"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/app/lib/utils";
import { INDIA_METRICS, getStateStatByName, indiaStateStats } from "@/app/lib/indiaMapData";
import { Button } from "@/app/components/ui/Button";
import { CounterAnimation } from "@/app/components/ui/CounterAnimation";
import { IndiaChoropleth } from "@/app/components/landing/IndiaChoropleth";

type MapMode = "before" | "impact";

export function IndiaMap() {
  const [mode, setMode] = React.useState<MapMode>("before");
  const [selected, setSelected] = React.useState<string>("Karnataka");

  return (
    <section id="impact" className="scroll-mt-28 bg-sl-dark py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-sl-primary">
              INDIA AT A GLANCE
            </div>
            <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
              Every District. Every Child. One Picture.
            </h2>
            <p className="mt-3 max-w-2xl text-white/70">
              A clean, showcase-ready view of dropout risk and rollout status. Toggle to see projected impact turning the
              map greener.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="rounded-full border border-white/12 bg-white/5 p-1 backdrop-blur">
              <button
                onClick={() => setMode("before")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  mode === "before"
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white",
                )}
              >
                Before Shiksha Link
              </button>
              <button
                onClick={() => setMode("impact")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  mode === "impact"
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white",
                )}
              >
                Projected Impact
              </button>
            </div>
            <Button
              variant="outlineOnDark"
              size="sm"
              onClick={() => setMode((m) => (m === "before" ? "impact" : "before"))}
            >
              Toggle
            </Button>
          </div>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-xl p-4 md:p-6 sl-panel">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(43,179,167,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(122,203,140,0.10),transparent_44%)]" />

          <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <div className="relative">
              <IndiaChoropleth />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                  Hover a state on the right to preview details
                </div>
                <div className="text-xs text-white/55">GeoJSON states via Shiksha Link API proxy</div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl bg-[#0b0b12]/45 p-4 sl-panel">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                  States (sample)
                </div>
                <div className="mt-3 max-h-[340px] space-y-2 overflow-auto pr-1">
                  {indiaStateStats
                    .filter((s) => ["Karnataka", "Tamil Nadu", "Maharashtra", "Uttar Pradesh", "Bihar", "Rajasthan", "Gujarat", "Kerala", "West Bengal", "Telangana"].includes(s.name))
                    .map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onMouseEnter={() => setSelected(s.name)}
                        onFocus={() => setSelected(s.name)}
                        onClick={() => setSelected(s.name)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          selected === s.name
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-white/10 bg-white/5 text-white/75 hover:text-white",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">{s.name}</div>
                          <div className="rounded-full bg-white/8 px-2 py-1 text-xs text-white/75">
                            {s.status}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-white/60">
                          Dropout: {(mode === "before" ? s.dropoutRate : s.projectedDropoutRate).toFixed(1)}% · Literacy:{" "}
                          {s.literacyRate.toFixed(1)}%
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="mt-4">
                <MapTooltipCard name={selected} mode={mode} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <MetricCard
            label="Total govt schools"
            value={<CounterAnimation value={INDIA_METRICS.totalGovtSchools} />}
          />
          <MetricCard
            label="Students enrolled"
            value={<CounterAnimation value={INDIA_METRICS.studentsEnrolled} />}
          />
          <MetricCard
            label="Annual dropouts"
            value={<CounterAnimation value={INDIA_METRICS.annualDropouts} />}
          />
          <MetricCard
            label="States with <60% literacy"
            value={<CounterAnimation value={INDIA_METRICS.statesBelow60Literacy} />}
          />
        </div>

        <p className="mt-4 text-xs text-white/55">
          State polygons load from your Shiksha Link API (GeoJSON proxy + metrics). Toggle “Before / Impact” still
          affects the sample list on the right; map colors follow the live metric slice you select above the map.
        </p>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
      <div className="rounded-xl p-4 sl-panel sl-panel-hover">
      <div className="text-xs uppercase tracking-[0.14em] text-white/60">{label}</div>
      <div className="mt-2 font-display text-2xl text-white">{value}</div>
    </div>
  );
}

function MapTooltipCard({
  name,
  mode,
}: {
  name: string;
  mode: MapMode;
}) {
  const stat = getStateStatByName(name);
  const before = stat?.dropoutRate ?? 8.5;
  const after = stat?.projectedDropoutRate ?? Math.max(2.5, before * 0.65);
  const rate = mode === "before" ? before : after;

  return (
    <div
      className="w-full rounded-xl p-4 text-white sl-panel"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-medium">{stat?.name ?? name}</div>
        <div className="rounded-full bg-white/8 px-2 py-1 text-xs text-white/80">
          {stat?.status ?? "Coming Soon"}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-xs text-white/60">Dropout rate</div>
          <div className="mt-1 font-medium">{rate.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-xs text-white/60">Literacy</div>
          <div className="mt-1 font-medium">
            {(stat?.literacyRate ?? 72.0).toFixed(1)}%
          </div>
        </div>
        <div className="col-span-2 rounded-lg bg-white/5 p-2">
          <div className="text-xs text-white/60">Govt schools</div>
          <div className="mt-1 font-medium">
            {(stat?.govtSchools ?? 24000).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  );
}
