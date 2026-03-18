import { Skeleton } from "@/components/ui/skeleton";

export default function DocketsLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <Skeleton className="h-9 w-32 mb-6" />
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 20, background: "var(--surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div style={{ display: "flex", gap: 8 }}>
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
