function Pulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />
  );
}

export function StatsRowSkeleton() {
  return (
    <div>
      {/* Welcome header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Pulse className="h-8 w-56" />
          <Pulse className="h-4 w-40" />
        </div>
        <Pulse className="h-10 w-40 rounded-md" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <Pulse className="h-9 w-9 rounded-lg mb-3" />
            <Pulse className="h-7 w-16 mb-1" />
            <Pulse className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Level progress */}
      <div className="rounded-xl border border-border bg-card p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <Pulse className="h-4 w-20" />
          <Pulse className="h-3 w-32" />
        </div>
        <Pulse className="h-2.5 w-full rounded-full" />
        <Pulse className="h-3 w-48 mt-2" />
      </div>
    </div>
  );
}

export function CoursesListSkeleton() {
  return (
    <section>
      <Pulse className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Pulse className="h-5 w-48" />
                <Pulse className="h-4 w-32" />
                <Pulse className="h-1.5 w-full" />
              </div>
              <Pulse className="h-8 w-20 rounded-md shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HeatmapSkeleton() {
  return (
    <section>
      <Pulse className="h-5 w-32 mb-4" />
      <div className="rounded-xl border border-border bg-card p-5">
        <Pulse className="h-32 w-full" />
      </div>
    </section>
  );
}

export function RecommendedSkeleton() {
  return (
    <section>
      <Pulse className="h-5 w-36 mb-4" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <Pulse className="h-5 w-16 rounded-full" />
            <Pulse className="h-5 w-40" />
            <Pulse className="h-8 w-full" />
            <Pulse className="h-3 w-28" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Leaderboard */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <Pulse className="h-5 w-28" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Pulse className="h-4 w-4" />
            <Pulse className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <Pulse className="h-5 w-28" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Pulse className="h-10 w-10 rounded-lg" />
              <Pulse className="h-2 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <Pulse className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Pulse className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-1">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
