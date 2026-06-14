import AdminWithdrawalsTable from "@/components/admin/AdminWithdrawalsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminWithdrawalRequests } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminWithdrawalsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const requests = await getAdminWithdrawalRequests();
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
        <CardTitle>Withdrawals</CardTitle>
        <CardDescription>Review seller payout requests and mark completed transfers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} withdrawals
          </p>
          <PaginationControls
            pathname="/admin/withdrawals"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminWithdrawalsTable requests={paginatedRequests} />
      </CardContent>
    </Card>
  );
}
