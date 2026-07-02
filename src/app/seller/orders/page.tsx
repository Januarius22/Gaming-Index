import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getSellerOrders } from "@/lib/data";
import { requireSellerProfile } from "@/lib/auth";
import { formatCurrency, formatDate, paginateItems, parsePageParam, statusVariant, titleCase } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export default async function SellerOrdersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const profile = await requireSellerProfile();
  const orders = await getSellerOrders(profile);
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedOrders,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(orders, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Track buyer orders connected to your approved gaming accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} orders
          </p>
          <PaginationControls
            pathname="/seller/orders"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Buyer Name</th>
                <th className="px-4 py-3 font-medium">Game Account</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60">
                    <td className="px-4 py-4 font-medium text-foreground">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-4">{order.buyer_name}</td>
                    <td className="px-4 py-4">{order.listing_title}</td>
                    <td className="px-4 py-4">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(order.status)}>{titleCase(order.status)}</Badge>
                    </td>
                    <td className="px-4 py-4">{formatDate(order.created_at)}</td>
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
