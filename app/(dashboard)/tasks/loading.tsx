import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <Skeleton className="h-9 w-24 mb-6" />
      {/* Quick create bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: 16, borderRadius: 12, border: "1px solid var(--border-light)", background: "var(--surface)" }}>
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      {/* Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      {/* Task list */}
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden", background: "var(--surface)" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
