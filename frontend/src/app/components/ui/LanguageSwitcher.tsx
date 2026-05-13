"use client";

import * as React from "react";
import { ChevronDown, Languages } from "lucide-react";

import { cn } from "@/app/lib/utils";
import {
  getDefaultLanguageCode,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from "@/app/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState(getDefaultLanguageCode());

  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (v) setLang(v);
    } catch {}
  }, []);

  const selected =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white/70 px-3 py-2 text-sm text-[var(--sl-ink)] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur transition-colors hover:bg-white"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages className="size-4 text-[var(--sl-ink-muted)]" />
        <span className="hidden sm:inline">
          {selected.nativeLabel === selected.label
            ? selected.nativeLabel
            : (
                <>
                  {selected.nativeLabel}
                  <span className="text-[var(--sl-ink-muted)]"> · {selected.label}</span>
                </>
              )}
        </span>
        <span className="sm:hidden">{selected.nativeLabel}</span>
        <ChevronDown className="size-4 text-[var(--sl-ink-muted)]" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close language menu"
          />
          <div className="absolute right-0 z-50 mt-2 w-[240px] overflow-hidden rounded-xl border border-black/[0.08] bg-[color-mix(in_srgb,var(--sl-paper)_94%,white)] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-md">
            <div className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[var(--sl-ink-muted)]">
              Language
            </div>
            <ul role="listbox" className="max-h-[280px] overflow-auto">
              {SUPPORTED_LANGUAGES.map((l) => {
                const active = l.code === selected.code;
                return (
                  <li key={l.code}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-[color-mix(in_srgb,var(--sl-primary)_14%,transparent)] text-[var(--sl-ink)]"
                          : "text-[var(--sl-ink-muted)] hover:bg-black/[0.04] hover:text-[var(--sl-ink)]",
                      )}
                      onClick={() => {
                        setLang(l.code);
                        try {
                          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, l.code);
                        } catch {}
                        window.dispatchEvent(
                          new CustomEvent("shiksha:language", { detail: { code: l.code } }),
                        );
                        setOpen(false);
                      }}
                    >
                      <span className="font-medium">{l.nativeLabel}</span>
                      <span className="text-xs text-[var(--sl-ink-muted)]">{l.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
