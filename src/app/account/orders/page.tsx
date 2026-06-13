import Link from "next/link";
import { ReceiptText } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { requireAccountProfile } from "@/lib/auth";
import { getBuyerOrders } from "@/lib/data";
import { formatCurrency, formatDate, paginateItems, parsePageParam, statusVariant } from "@/lib/utils";

export default async function AccountOrdersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const profile = await requireAccountProfile();
  const params = (await searchParams) ?? {};
  const orders = await getBuyerOrders(profile);
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
        <CardTitle>Order history</CardTitle>
        <CardDescription>
          Every checkout tied to your buyer account will appear here, from unfinished payment steps
          to completed account handoffs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="mx-auto flex min-h-[44vh] max-w-4xl flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
              <ReceiptText className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
              No order history yet
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              Start checkout from a listing or from your cart and the full order record will
              show up here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pageStart}-{pageEnd} of {totalCount} orders
              </p>
              <PaginationControls
                pathname="/account/orders"
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Game Account</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60">
                    <td className="px-4 py-4 font-medium text-foreground">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-4">{order.listing_title}</td>
                    <td className="px-4 py-4">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-4">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={
                          order.status === "pending"
                            ? `/account/checkout/${order.id}`
                            : `/account/orders/${order.id}?fromPage=${currentPage}`
                        }
                        className={buttonClassName({
                          variant: "secondary",
                          size: "sm",
                          className: "rounded-2xl"
                        })}
                      >
                        {order.status === "pending" ? "Continue Checkout" : "Open Order"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
