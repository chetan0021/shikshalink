"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/student-ai/firebase";
import { useAppStore } from "@/app/lib/student-ai/store";

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const { setUser, setLoading } = useAppStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        // Unsubscribe from listener on unmount
        return () => unsubscribe();
    }, [setUser, setLoading]);

    return <>{children}</>;
}
