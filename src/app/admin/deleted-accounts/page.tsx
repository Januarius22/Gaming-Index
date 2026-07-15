import AdminDeletedAccountsTable from "@/components/admin/AdminDeletedAccountsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminDeletedAccounts } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminDeletedAccountsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const [accounts, params] = await Promise.all([
    getAdminDeletedAccounts(),
    searchParams ?? Promise.resolve({} as { page?: string })
  ]);
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedAccounts,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(accounts, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deleted Accounts</CardTitle>
        <CardDescription>
          Archived account snapshots kept for audit and recovery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} deleted accounts
          </p>
          <PaginationControls
            pathname="/admin/deleted-accounts"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminDeletedAccountsTable accounts={paginatedAccounts} />
      </CardContent>
    </Card>
  );
}
