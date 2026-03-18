"use client";

import { TriangleAlert } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="animate-fade-up max-w-md w-full rounded-xl p-10 text-center"
        style={{
          border: "1px solid var(--border-light)",
          background: "var(--surface)",
        }}
      >
        <TriangleAlert
          size={48}
          style={{ color: "var(--danger)" }}
          className="mx-auto mb-4"
        />

        <h2
          className="text-xl mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          Something went wrong
        </h2>

        <p
          className="text-sm mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          {error.message || "An unexpected error occurred."}
        </p>

        <button
          onClick={reset}
          className="rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            padding: "10px 24px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
