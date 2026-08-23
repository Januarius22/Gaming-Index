import { CardGridSkeleton } from "@/components/ui/Skeleton";

export default function AccountDashboardLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton cards={4} />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="gi-panel-card h-72 animate-pulse rounded-3xl border border-border/80 bg-white" />
        <div className="gi-panel-card h-72 animate-pulse rounded-3xl border border-border/80 bg-white" />
      </div>
    </div>
  );
}
