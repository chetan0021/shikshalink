"use client";

import AppLayout from "@/app/components/student-ai/layout/AppLayout";
import ProtectedRoute from "@/app/components/student-ai/layout/ProtectedRoute";
import { DropoutRiskLive } from "@/app/components/live/DropoutRiskLive";

export default function StudentDropoutRiskPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-sl-text tracking-normal drop-shadow-sm">Dropout Risk</h1>
            <p className="text-sm font-medium text-black/60 mt-1">School-scoped predictive analytics</p>
          </div>
          
          <div className="relative rounded-3xl p-[1px] overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_75%,#ef4444_100%)] animate-[spin_4s_linear_infinite]" />
            <div className="rounded-[calc(1.5rem-1px)] border-0 bg-gradient-to-br from-red-500/5 via-red-950/20 to-black/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-3xl p-6 relative z-10 transition-all duration-500">
                <DropoutRiskLive />
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
