import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-primary-soft/80 ring-1 ring-border/40",
        className
      )}
    />
  );
}

export function CardGridSkeleton({
  cards = 4,
  className
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="gi-panel-card rounded-3xl border border-border/80 bg-white p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
          <Skeleton className="mt-8 h-10 w-28" />
        </div>
      ))}
    </div>
  );
}

export function MarketplaceCardSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="gi-panel-card overflow-hidden rounded-3xl border border-border/80 bg-white p-3"
        >
          <Skeleton className="aspect-[5/4] rounded-[28px]" />
          <div className="space-y-4 p-4">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
