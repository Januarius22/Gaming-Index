import AdminDisputesTable from "@/components/admin/AdminDisputesTable";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminDisputes } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminDisputesPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const disputes = await getAdminDisputes();
  const statusSummaries = [
    { label: "Pending Review", status: "pending_admin_review" },
    { label: "Awaiting Seller", status: "awaiting_seller_response" },
    { label: "Investigation", status: "under_investigation" },
    { label: "Resolved", status: "resolved" },
    { label: "Rejected", status: "rejected" }
  ].map((item) => ({
    ...item,
    count: disputes.filter((dispute) => dispute.status === item.status).length
  }));
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedDisputes,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(disputes, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disputes</CardTitle>
        <CardDescription>Review buyer reports tied to paid orders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statusSummaries.map((item) => (
            <div key={item.status} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-heading text-3xl font-semibold text-foreground">{item.count}</p>
                <Badge variant={item.count > 0 ? "warning" : "neutral"}>Cases</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} disputes
          </p>
          <PaginationControls
            pathname="/admin/disputes"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminDisputesTable disputes={paginatedDisputes} />
      </CardContent>
    </Card>
  );
}
