import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden", background: "var(--surface)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border-light)" }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
        {[...Array(5)].map((_, row) => (
          <div key={row} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr", gap: 16, padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
            {[...Array(5)].map((_, col) => <Skeleton key={col} className="h-4 w-full" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
