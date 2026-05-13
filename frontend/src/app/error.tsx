"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--sl-paper)] px-4 text-[var(--sl-ink)]">
      <h1 className="font-display text-2xl">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-[var(--sl-ink-muted)]">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg border border-black/[0.12] bg-[var(--sl-primary)] px-5 py-2 text-sm text-white"
      >
        Try again
      </button>
    </div>
  );
}
