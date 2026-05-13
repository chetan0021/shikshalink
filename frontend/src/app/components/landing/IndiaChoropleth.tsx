"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/app/lib/api";

type Metric = {
  state_code: string;
  state_name: string;
  metric_key: string;
  value: number;
  updated_at: string;
};

type GeoFeature = {
  type: string;
  properties: Record<string, string | number | undefined>;
  geometry: unknown;
};

type GeoJSON = {
  type: string;
  features: GeoFeature[];
};

const METRICS = [
  ["dropout_risk", "Dropout risk"],
  ["attendance", "Attendance"],
  ["budget_utilization", "Budget"],
  ["parent_engagement", "Parent engagement"]
] as const;

function regionName(geo: GeoFeature): string | undefined {
  const p = geo.properties || {};
  const candidates = [p.NAME_1, p.ST_NM, p.NAME, p.name, p.state];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return undefined;
}

function buildMetricLookup(rows: Metric[] | undefined, metric: string) {
  const map = new Map<string, number>();
  rows
    ?.filter((r) => r.metric_key === metric)
    .forEach((r) => map.set(r.state_name.toLowerCase(), r.value));
  return map;
}

function pickMetric(map: Map<string, number>, label?: string) {
  if (!label) return undefined;
  const key = label.toLowerCase().trim();
  if (map.has(key)) return map.get(key);
  for (const [name, val] of map.entries()) {
    if (key.includes(name) || name.includes(key)) return val;
  }
  return undefined;
}

function fillForMetric(metric: (typeof METRICS)[number][0], value: number | undefined) {
  if (value === undefined) return "rgba(148,163,184,0.35)";
  if (metric === "dropout_risk") {
    if (value >= 0.38) return "#fb7185";
    if (value >= 0.3) return "#fbbf24";
    return "#4ade80";
  }
  if (metric === "attendance" || metric === "budget_utilization" || metric === "parent_engagement") {
    if (value >= 0.85) return "#4ade80";
    if (value >= 0.72) return "#22c55e";
    if (value >= 0.55) return "#facc15";
    return "#fb923c";
  }
  return "#94a3b8";
}

/** Per-state GeoJSON choropleth backed by the same FastAPI as the new monorepo frontend. */
export function IndiaChoropleth() {
  const [metric, setMetric] = useState<(typeof METRICS)[number][0]>("dropout_risk");
  const qs = useMemo(() => `?metric_key=${metric}`, [metric]);

  const metrics = useQuery({
    queryKey: ["heatmap", "metrics", metric],
    queryFn: () => apiGet<Metric[]>(`/api/india-heatmap/metrics${qs}`)
  });

  const geo = useQuery({
    queryKey: ["heatmap", "geojson"],
    queryFn: () => apiGet<GeoJSON>(`/api/india-heatmap/geojson`)
  });

  const lookup = useMemo(
    () => buildMetricLookup(metrics.data, metric),
    [metrics.data, metric]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {METRICS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMetric(key)}
            className={
              metric === key
                ? "rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <motion.div layout className="overflow-hidden rounded-xl border border-white/10 bg-[#070712]/80">
        <div className="relative aspect-[16/11] w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
          {geo.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-white/70">Loading map…</div>
          ) : geo.isError || !geo.data?.features?.length ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-white/75">
              <p>GeoJSON unavailable. Start the API (`uvicorn` on port 8000) and check `NEXT_PUBLIC_API_URL`.</p>
            </div>
          ) : (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 1180, center: [82, 23] }}
              className="h-full w-full"
            >
              <Geographies geography={geo.data as unknown as GeoJSON}>
                {({ geographies }: { geographies: unknown[] }) =>
                  geographies.map((geoObj) => {
                    const nm = regionName(geoObj as unknown as GeoFeature);
                    const val = pickMetric(lookup, nm);
                    return (
                      <Geography
                        key={(geoObj as { rsmKey: string }).rsmKey}
                        geography={geoObj}
                        fill={fillForMetric(metric, val)}
                        stroke="rgba(248,250,252,0.35)"
                        strokeWidth={0.35}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            outline: "none",
                            fill: "#fde68a",
                            stroke: "#0f172a",
                            strokeWidth: 0.55
                          },
                          pressed: { outline: "none" }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-[11px] text-white/90">
            <span className="mr-3 inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-sm bg-green-400" /> Strong
            </span>
            <span className="mr-3 inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-sm bg-amber-300" /> Watch
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-sm bg-rose-400" /> Pressure
            </span>
          </div>
        </div>
      </motion.div>

      {metrics.isError ? (
        <p className="text-xs text-rose-300">Metrics API offline — set `NEXT_PUBLIC_API_URL` to your FastAPI base.</p>
      ) : null}
    </div>
  );
}
