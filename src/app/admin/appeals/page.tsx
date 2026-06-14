import AdminSuspensionAppealsTable from "@/components/admin/AdminSuspensionAppealsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminSuspensionAppeals } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminAppealsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const appeals = await getAdminSuspensionAppeals();
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedAppeals,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(appeals, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspension appeals</CardTitle>
        <CardDescription>
          Review account restoration requests from suspended users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} appeals
          </p>
          <PaginationControls
            pathname="/admin/appeals"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminSuspensionAppealsTable appeals={paginatedAppeals} />
      </CardContent>
    </Card>
  );
}
