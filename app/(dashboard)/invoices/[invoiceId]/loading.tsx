import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Header with status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Skeleton className="h-8 w-48" />
        <div style={{ display: "flex", gap: 8 }}>
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      {/* Detail card */}
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        {/* Items table */}
        <Skeleton className="h-5 w-24 mb-3" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-2 rounded-lg" />
        ))}
        <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 200 }}>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
