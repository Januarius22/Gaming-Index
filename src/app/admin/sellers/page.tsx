import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminSellers } from "@/lib/data";
import { formatDate, paginateItems, parsePageParam, statusVariant } from "@/lib/utils";

export default async function AdminSellersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sellers = await getAdminSellers();
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedSellers,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(sellers, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sellers</CardTitle>
        <CardDescription>
          Users who unlocked seller tools, their verification posture, and onboarding recency.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} sellers
          </p>
          <PaginationControls
            pathname="/admin/sellers"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">KYC Status</th>
                <th className="px-4 py-3 font-medium">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No seller-enabled users yet.
                  </td>
                </tr>
              ) : (
                paginatedSellers.map((seller) => (
                  <tr key={seller.id} className="border-b border-border/60">
                    <td className="px-4 py-4 font-medium text-foreground">{seller.full_name}</td>
                    <td className="px-4 py-4">@{seller.username}</td>
                    <td className="px-4 py-4">{seller.email}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(seller.kyc_status)}>{seller.kyc_status}</Badge>
                    </td>
                    <td className="px-4 py-4">{formatDate(seller.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
