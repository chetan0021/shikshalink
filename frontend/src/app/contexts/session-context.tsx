"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthSession, clearSession, readSession, writeSession } from "@/app/lib/auth-session";

type SessionContextValue = {
  session: AuthSession | null;
  setSession: (s: AuthSession) => void;
  logout: () => void;
  hydrated: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSessionState(readSession());
    setHydrated(true);
  }, []);

  const setSession = useCallback((s: AuthSession) => {
    writeSession(s);
    setSessionState(s);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({ session, setSession, logout, hydrated }),
    [session, setSession, logout, hydrated]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
