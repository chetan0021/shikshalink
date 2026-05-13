"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/app/components/ui/Button";
import { useSession } from "@/app/contexts/session-context";

const tiles: { href: string; title: string; desc: string; roles: string[] }[] = [
  {
    href: "/workspace/parent-voice",
    title: "Parent Voice AI",
    desc: "Interactive demo for parental voice alerts and communication.",
    roles: ["teacher", "parent", "beo", "student"]
  },
  {
    href: "/workspace/dropout",
    title: "Dropout Risk Dashboard",
    desc: "AI-powered school-scoped risk analytics and intervention planning.",
    roles: ["teacher", "beo"]
  },
  {
    href: "/workspace/student",
    title: "AI Mentor Dashboard",
    desc: "Personalized VLSI study roadmap and interactive tutor powered by AI.",
    roles: ["student"]
  }
];

export default function WorkspacePage() {
  const { session, logout, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated) {
      if (!session) {
        router.replace("/auth");
      } else if (session.role === "student") {
        router.replace("/workspace/student");
      }
    }
  }, [hydrated, session, router]);

  if (!hydrated || !session) {
    return (
      <main className="min-h-dvh bg-sl-dark px-4 py-16 text-center text-white/80">
        Loading workspace…
      </main>
    );
  }

  const visible = tiles.filter((t) => t.roles.includes(session.role));

  return (
    <main className="min-h-dvh bg-[var(--sl-paper)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sl-primary">Workspace</p>
            <h1 className="mt-2 font-display text-3xl text-sl-text">Hello, {session.displayName}</h1>
            <p className="mt-2 text-sm text-black/60">
              Role: <span className="font-semibold capitalize">{session.role}</span> · School:{" "}
              <span className="font-semibold">{session.schoolName}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="light" size="sm" asChild>
              <Link href="/">Landing</Link>
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => { logout(); router.push("/"); }}>
              Sign out
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {visible.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:border-sl-primary/40 hover:shadow-md"
            >
              <p className="font-display text-lg text-sl-text">{t.title}</p>
              <p className="mt-2 text-sm text-black/60">{t.desc}</p>
            </Link>
          ))}
        </section>

        <p className="text-center text-xs text-black/50">
          More API modules (admin bot, career mapper, BEO, UDISE) live in the FastAPI backend — extend this workspace with new pages when you need them.
        </p>
      </div>
    </main>
  );
}
