"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/app/lib/student-ai/firebase";
import { useAppStore } from "@/app/lib/student-ai/store";
import { Button } from "@/app/components/ui/Button";

export default function Topbar() {
    const { user } = useAppStore();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/auth");
        } catch {
            // AuthProvider's onAuthStateChanged listener will handle state reset
        }
    };

    return (
        <header className="h-16 bg-[var(--sl-paper)]/20 backdrop-blur-md border-b border-black/10 shrink-0 flex items-center justify-between px-6 relative z-10">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user ? "bg-[#5ec4b1]" : "bg-gray-400"} shadow-[0_0_8px_rgba(94,196,177,0.8)] animate-pulse` } />
                <span className="text-sm font-medium text-black/60">{user ? "Connected" : "Guest Mode"}</span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-black/70 truncate max-w-[220px]">
                    {user?.email ?? "Guest Student"}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-black/50 hover:text-sl-primary hover:bg-sl-primary/10 gap-1.5 transition-colors"
                >
                    <LogOut size={15} />
                    Logout
                </Button>
            </div>
        </header>
    );
}
