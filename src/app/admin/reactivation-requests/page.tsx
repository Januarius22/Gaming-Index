import AdminReactivationRequestsTable from "@/components/admin/AdminReactivationRequestsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminAccountReactivationRequests } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminReactivationRequestsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const [requests, params] = await Promise.all([
    getAdminAccountReactivationRequests(),
    searchParams ?? Promise.resolve({} as { page?: string })
  ]);
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedRequests,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(requests, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactivation Requests</CardTitle>
        <CardDescription>
          Review users asking to restore deactivated accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} requests
          </p>
          <PaginationControls
            pathname="/admin/reactivation-requests"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminReactivationRequestsTable requests={paginatedRequests} />
      </CardContent>
    </Card>
  );
}
