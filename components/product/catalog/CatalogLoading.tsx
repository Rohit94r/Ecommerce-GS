import { SiteShell } from "@/components/layout/SiteShell";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

export function CatalogListLoading() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SkeletonBlock className="h-4 w-56" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="mt-4 h-12 max-w-md" />
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
          </div>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SkeletonBlock className="aspect-[4/3] w-full" />
              <SkeletonBlock className="mt-4 h-4 w-2/3" />
              <SkeletonBlock className="mt-3 h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

export function ProductDetailLoading() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SkeletonBlock className="h-4 w-72" />
        <div className="mt-9 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="grid gap-4 lg:grid-cols-[76px_1fr]">
            <div className="order-2 grid grid-flow-col auto-cols-[64px] gap-3 lg:order-1 lg:grid-flow-row">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-16 w-16" />
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <SkeletonBlock className="aspect-[4/3] w-full" />
              <SkeletonBlock className="mt-3 h-14 w-full" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full" />
              <SkeletonBlock className="h-7 w-24 rounded-full" />
            </div>
            <SkeletonBlock className="mt-6 h-10 w-5/6" />
            <SkeletonBlock className="mt-3 h-10 w-3/4" />
            <div className="mt-6 space-y-3">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
            <SkeletonBlock className="mt-7 h-11 w-44" />
            <div className="mt-7 grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-14 w-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
