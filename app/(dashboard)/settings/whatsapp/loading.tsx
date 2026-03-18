import { Skeleton } from "@/components/ui/skeleton";

export default function WhatsAppLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
      <Skeleton className="h-9 w-56 mb-2" />
      <Skeleton className="h-4 w-80 mb-8" />
      {/* Info card */}
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 20, background: "var(--surface)", marginBottom: 24 }}>
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      {/* Form card */}
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-28 rounded-lg mt-4" />
      </div>
    </div>
  );
}
