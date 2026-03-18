import { Skeleton } from "@/components/ui/skeleton";

export default function LeadDetailLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        {/* Left info card */}
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
          <Skeleton className="h-7 w-40 mb-4" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <Skeleton className="h-10 w-full rounded-lg mb-3" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        {/* Right tabs area */}
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: "1px solid var(--border-light)", paddingBottom: 12 }}>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-3 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
