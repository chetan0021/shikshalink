"use client";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    // Authentication protection disabled as per user request
    return <>{children}</>;
}
