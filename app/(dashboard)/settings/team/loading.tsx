import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div style={{ flex: 1 }}>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
