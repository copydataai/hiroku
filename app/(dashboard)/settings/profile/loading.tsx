import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
      <Skeleton className="h-9 w-52 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />
      <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: 24, background: "var(--surface)" }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-28 rounded-lg mt-4" />
      </div>
    </div>
  );
}
