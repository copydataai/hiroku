import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
        <div style={{ marginBottom: 20 }}>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg mt-4" />
      </div>
    </div>
  );
}
