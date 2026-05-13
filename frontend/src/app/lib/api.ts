function stripTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

/**
 * When unset (or empty), use same-origin `/api/...` so Next.js can rewrite to FastAPI
 * (avoids CORS and fixes LAN `Network` URLs vs `127.0.0.1`).
 * Set `NEXT_PUBLIC_API_URL` to call the API directly (e.g. hosted backend).
 */
export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw != null && raw.trim() !== "") {
    return stripTrailingSlash(raw.trim());
  }
  return "";
}

export const API_BASE = getApiBase();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: string
  ) {
    super(message);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(`GET ${path} failed`, res.status, body);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(`POST ${path} failed`, res.status, body);
  }
  return res.json() as Promise<T>;
}

export async function apiUpload(path: string, file: File): Promise<unknown> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(`POST ${path} failed`, res.status, body);
  }
  return res.json();
}
