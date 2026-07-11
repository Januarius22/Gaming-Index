import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminSellerOverview } from "@/lib/data";
import {
  formatCompactCurrency,
  formatDate,
  paginateItems,
  parsePageParam,
  statusVariant,
  titleCase
} from "@/lib/utils";

export default async function AdminSellersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sellers = await getAdminSellerOverview();
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
          Seller identity, marketplace activity, ratings, disputes, and contact shortcuts.
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
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">KYC</th>
                <th className="px-4 py-3 font-medium">Marketplace</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No seller-enabled users yet.
                  </td>
                </tr>
              ) : (
                paginatedSellers.map((seller) => (
                  <tr key={seller.id} className="border-b border-border/60">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{seller.full_name}</p>
                      <p className="text-muted-foreground">@{seller.username}</p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">{seller.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Joined {formatDate(seller.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(seller.kyc_status)}>{titleCase(seller.kyc_status)}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {seller.active_listings_count} active
                      </p>
                      <p className="text-muted-foreground">{seller.listings_count} total listings</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{seller.paid_orders_count} paid</p>
                      <p className="text-muted-foreground">
                        {formatCompactCurrency(seller.seller_revenue)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {seller.reviews_count > 0 ? seller.average_rating.toFixed(1) : "New"}
                      </p>
                      <p className="text-muted-foreground">{seller.reviews_count} reviews</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <Badge variant={seller.open_disputes_count > 0 ? "warning" : "neutral"}>
                          {seller.open_disputes_count} open disputes
                        </Badge>
                        {seller.seller_strikes && seller.seller_strikes > 0 ? (
                          <Badge variant="danger">{seller.seller_strikes} strikes</Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`mailto:${seller.email}`}
                          className={buttonClassName({ variant: "secondary", size: "sm" })}
                        >
                          Email
                        </a>
                        <Link
                          href={`/admin/disputes`}
                          className={buttonClassName({ variant: "ghost", size: "sm" })}
                        >
                          Cases
                        </Link>
                      </div>
                    </td>
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
