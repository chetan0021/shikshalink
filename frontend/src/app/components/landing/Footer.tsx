"use client";

import Link from "next/link";

import { brand } from "@/app/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-sl-dark py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="font-display text-2xl text-white">{brand.name}</div>
            <div className="mt-2 text-sm text-white/70">{brand.tagline}</div>
            <div className="mt-6 text-sm text-white/65">
              Built for Bharat. Powered by AI.
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                Links
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <a className="text-white/75 hover:text-white" href="#about">
                  About
                </a>
                <a className="text-white/75 hover:text-white" href="#platform">
                  Platform
                </a>
                <a className="text-white/75 hover:text-white" href="#impact">
                  Impact
                </a>
                <Link className="text-white/75 hover:text-white" href="/auth">
                  Contact
                </Link>
                <a className="text-white/75 hover:text-white" href="#">
                  Privacy Policy
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                Social
              </div>
              <div className="mt-4 flex items-center gap-3">
                <SocialIcon label="Twitter" fallback="X" />
                <SocialIcon label="LinkedIn" fallback="in" />
                <SocialIcon label="GitHub" fallback="gh" />
                <SocialIcon label="Facebook" fallback="f" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs text-white/50">
          © {new Date().getFullYear()} Shiksha Link. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  label,
  fallback,
}: {
  label: string;
  fallback?: string;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="grid size-10 place-items-center rounded-full border border-white/12 bg-white/5 text-white/80 transition-colors hover:text-white"
    >
      <span className="text-xs font-semibold uppercase">{fallback ?? "•"}</span>
    </a>
  );
}

