import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg mb-2" />
          <Skeleton className="h-12 w-full rounded-lg mb-2" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
