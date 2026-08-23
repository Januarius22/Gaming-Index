import { MarketplaceCardSkeleton } from "@/components/ui/Skeleton";

export default function AccountMarketplaceLoading() {
  return (
    <div className="space-y-6">
      <div className="gi-panel-card rounded-[28px] border border-border/80 bg-white p-5">
        <div className="h-5 w-40 animate-pulse rounded-full bg-primary-soft" />
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-primary-soft/80" />
          ))}
        </div>
      </div>
      <MarketplaceCardSkeleton />
    </div>
  );
}
