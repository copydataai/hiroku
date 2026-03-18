import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
      <Skeleton className="h-9 w-56 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-28 flex-1" />
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
