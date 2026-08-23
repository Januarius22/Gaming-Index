import { CardGridSkeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton cards={5} className="xl:grid-cols-5" />
      <div className="gi-panel-card h-72 animate-pulse rounded-3xl border border-border/80 bg-white" />
    </div>
  );
}
