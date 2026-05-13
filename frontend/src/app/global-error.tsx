"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1rem",
            background: "#f5f4f0",
            color: "#2c2e2d",
          }}
        >
          <h1 style={{ fontSize: "1.5rem" }}>Something went wrong</h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.8, textAlign: "center", maxWidth: "28rem" }}>
            {error.message || "Please refresh the page or restart the dev server."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#4f6f64",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
