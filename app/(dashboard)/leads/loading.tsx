import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      {/* Table */}
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden", background: "var(--surface)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 0.5fr", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border-light)" }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
        {[...Array(6)].map((_, row) => (
          <div key={row} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 0.5fr", gap: 16, padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
            {[...Array(6)].map((_, col) => <Skeleton key={col} className="h-4 w-full" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
