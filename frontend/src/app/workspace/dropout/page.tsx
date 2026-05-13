import Link from "next/link";

import { DropoutRiskLive } from "@/app/components/live/DropoutRiskLive";
import { Button } from "@/app/components/ui/Button";

export default function WorkspaceDropoutPage() {
  return (
    <main className="min-h-dvh bg-[var(--sl-paper)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-sl-text">Dropout risk</h1>
          <Button variant="light" size="sm" asChild>
            <Link href="/workspace">← Back</Link>
          </Button>
        </div>
        <DropoutRiskLive />
      </div>
    </main>
  );
}
