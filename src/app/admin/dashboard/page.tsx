import AdminStatsCards from "@/components/admin/AdminStatsCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminDashboardStats } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { stats, activity } = await getAdminDashboardStats();
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedActivity,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(activity, requestedPage, 6);

  return (
    <div className="space-y-6">
      <AdminStatsCards stats={stats} />
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Operational signals for onboarding, review work, and marketplace flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {pageStart}-{pageEnd} of {totalCount} activity items
            </p>
            <PaginationControls
              pathname="/admin/dashboard"
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
          {paginatedActivity.map((item) => (
            <div key={item.id} className="rounded-3xl bg-surface p-5">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
