export type UserRole = "teacher" | "parent" | "student" | "beo" | "district" | "vendor";

export type AuthSession = {
  role: UserRole;
  displayName: string;
  schoolId: string;
  schoolName: string;
};

const STORAGE_KEY = "shiksha_link_session_v1";

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as AuthSession;
    if (!v?.role || !v.schoolId || !v.displayName) return null;
    return v;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
