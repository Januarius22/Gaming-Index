import AdminSuspendedAccountsTable from "@/components/admin/AdminSuspendedAccountsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminSuspendedAccounts } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminSuspendedUsersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const [accounts, params] = await Promise.all([
    getAdminSuspendedAccounts(),
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
        <CardTitle>Suspended Accounts</CardTitle>
        <CardDescription>
          Review banned users, appeal windows, and accounts eligible for deletion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} suspended accounts
          </p>
          <PaginationControls
            pathname="/admin/suspended-users"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminSuspendedAccountsTable accounts={paginatedAccounts} />
      </CardContent>
    </Card>
  );
}
