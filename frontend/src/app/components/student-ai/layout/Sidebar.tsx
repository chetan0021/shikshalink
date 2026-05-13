"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Code2, Brain, MessageSquare, BookOpen, AlertTriangle, PhoneCall } from "lucide-react";
import { cn } from "@/app/lib/student-ai/utils";

const navItems = [
    { href: "/workspace/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/workspace/student/planner", label: "Study Planner", icon: BookOpen },
    { href: "/workspace/student/tutor", label: "AI Tutor", icon: Brain },
    { href: "/workspace/student/interview", label: "Discussion AI", icon: MessageSquare },
    { href: "/workspace/student/code-lab", label: "Practice Lab", icon: Code2 },
    { href: "/workspace/student/dropout-risk", label: "Dropout Risk", icon: AlertTriangle },
    { href: "/workspace/student/parent-voice", label: "Parent Voice", icon: PhoneCall },
] as const;

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-[var(--sl-paper)]/20 backdrop-blur-2xl border-r border-black/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)] shrink-0 flex flex-col relative z-20">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-black/10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5ec4b1] to-[#7dd3c0] flex items-center justify-center shadow-[0_0_15px_rgba(94,196,177,0.4)]">
                        <span className="text-lg text-white">🎓</span>
                    </div>
                    <span className="text-xl font-bold text-zinc-100 tracking-tight">Shiksha Link</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                isActive
                                    ? "text-zinc-100 font-semibold flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 bg-[var(--sl-primary)]/10 border border-[var(--sl-primary)]/20 shadow-[0_0_15px_rgba(94,196,177,0.15)]"
                                    : "text-zinc-300 hover:bg-white/5 hover:text-zinc-100 flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                            )}
                        >
                            <Icon
                                size={18}
                                className={isActive ? "text-[#5ec4b1]" : "text-zinc-400"}
                            />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-black/10">
                <p className="text-xs text-zinc-500 text-center font-medium">
                    Shiksha Link — v1.0
                </p>
            </div>
        </aside >
    );
}
