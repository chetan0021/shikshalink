"use client";

import { cn } from "@/app/lib/utils";

export type PillOption<T extends string> = { value: T; label: string };

export function PillSelector<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: PillOption<T>[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-colors",
            value === o.value
              ? "border-sl-primary bg-sl-primary/10 text-sl-text shadow-[0_0_0_1px_rgba(255,107,53,0.25),0_0_24px_rgba(255,107,53,0.10)]"
              : "border-black/10 bg-white text-black/70 hover:text-black",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

