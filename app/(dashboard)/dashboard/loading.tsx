import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Greeting */}
      <Skeleton className="h-9 w-72 mb-2" />
      <Skeleton className="h-5 w-48 mb-8" />

      {/* 4 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* 2 sections side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
          <Skeleton className="h-6 w-40 mb-4" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </div>
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
          <Skeleton className="h-6 w-36 mb-4" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
