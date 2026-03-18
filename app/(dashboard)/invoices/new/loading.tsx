import { Skeleton } from "@/components/ui/skeleton";

export default function NewInvoiceLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <Skeleton className="h-9 w-44 mb-6" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-10 w-full rounded-lg mb-6" />
          <Skeleton className="h-5 w-28 mb-3" />
          <Skeleton className="h-10 w-full rounded-lg mb-6" />
          <Skeleton className="h-5 w-20 mb-3" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg mb-2" />
          ))}
          <Skeleton className="h-10 w-32 rounded-lg mt-4" />
        </div>
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
          <Skeleton className="h-6 w-28 mb-6" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 16, paddingTop: 16 }}>
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
