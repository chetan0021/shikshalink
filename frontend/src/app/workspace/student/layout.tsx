"use client";

import AuthProvider from "@/app/components/student-ai/AuthProvider";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthProvider>{children}</AuthProvider>;
}
