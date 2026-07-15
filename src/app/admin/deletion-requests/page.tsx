import AdminDeletionRequestsTable from "@/components/admin/AdminDeletionRequestsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminAccountDeletionRequests } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminDeletionRequestsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const [requests, params] = await Promise.all([
    getAdminAccountDeletionRequests(),
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
        <CardTitle>Account Deletion Requests</CardTitle>
        <CardDescription>
          Review user-requested deletions after account, wallet, order, and dispute checks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} requests
          </p>
          <PaginationControls
            pathname="/admin/deletion-requests"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminDeletionRequestsTable requests={paginatedRequests} />
      </CardContent>
    </Card>
  );
}
