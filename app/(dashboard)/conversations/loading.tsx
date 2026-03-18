import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationsLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <Skeleton className="h-9 w-52 mb-6" />
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, height: "calc(100vh - 200px)" }}>
        {/* Conversation list */}
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 16, background: "var(--surface)", overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
        {/* Message thread */}
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)", display: "flex", flexDirection: "column" }}>
          <Skeleton className="h-6 w-40 mb-6" />
          <div style={{ flex: 1 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-start" : "flex-end", marginBottom: 16 }}>
                <Skeleton className="h-12 rounded-2xl" style={{ width: "60%" }} />
              </div>
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
