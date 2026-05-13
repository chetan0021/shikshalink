"use client";

import AppLayout from "@/app/components/student-ai/layout/AppLayout";
import ProtectedRoute from "@/app/components/student-ai/layout/ProtectedRoute";
import { ParentVoiceLive } from "@/app/components/live/ParentVoiceLive";

export default function StudentParentVoicePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-sl-text tracking-normal drop-shadow-sm">Parent Voice AI</h1>
            <p className="text-sm font-medium text-black/60 mt-1">Direct communication with parents</p>
          </div>
          
          <div className="relative rounded-3xl p-[1px] overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_75%,#3b82f6_100%)] animate-[spin_4s_linear_infinite]" />
            <div className="rounded-[calc(1.5rem-1px)] border-0 bg-gradient-to-br from-blue-500/5 via-blue-950/20 to-black/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-3xl p-6 relative z-10 transition-all duration-500">
                <ParentVoiceLive />
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
