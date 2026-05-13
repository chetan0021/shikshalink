"use client";

import * as React from "react";

function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Drop `hero-bg.webp` or `hero-bg.gif` into `public/backgrounds/` (see README).
 * Renders a very subtle background layer when found.
 */
export function OptionalHeroBackground() {
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const candidates = ["/backgrounds/hero-bg.webp", "/backgrounds/hero-bg.gif"];

    (async () => {
      for (const url of candidates) {
        if (cancelled) return;
        if (await probeImage(url)) {
          if (!cancelled) setSrc(url);
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!src) return null;

  const isGif = src.endsWith(".gif");

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[var(--sl-bg-dark)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={
          isGif
            ? "h-full w-full scale-[1.02] object-cover opacity-[0.85] mix-blend-lighten contrast-[1.1] saturate-[1.1]"
            : "h-full w-full scale-105 object-cover opacity-[0.4] mix-blend-screen"
        }
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--sl-bg-dark)]/10 to-[var(--sl-bg-dark)]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(18,20,19,0.4)_100%)]" />
    </div>
  );
}

