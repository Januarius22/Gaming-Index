import Link from "next/link";
import { ReceiptText } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PaginationControls from "@/components/ui/PaginationControls";
import { requireAccountProfile } from "@/lib/auth";
import { getBuyerOrders, getCurrencyRates, getProfileSettings } from "@/lib/data";
import {
  BASE_CURRENCY_CODE,
  formatCurrency,
  formatCurrencyValue,
  formatDate,
  isPendingCheckoutActive,
  paginateItems,
  parsePageParam,
  statusVariant,
  titleCase
} from "@/lib/utils";

export default async function AccountOrdersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const profile = await requireAccountProfile();
  const params = (await searchParams) ?? {};
  const [orders, settings, currencyRates] = await Promise.all([
    getBuyerOrders(profile),
    getProfileSettings(profile.id),
    getCurrencyRates()
  ]);
  const displayCurrency = settings.display_currency;
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedOrders,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(orders, requestedPage, 10);
  const getOrderAmountLabel = (order: (typeof orders)[number]) => {
    const snapshotCurrency = order.buyer_display_currency ?? displayCurrency;

    if (
      order.buyer_display_amount &&
      snapshotCurrency &&
      snapshotCurrency !== BASE_CURRENCY_CODE
    ) {
      return formatCurrencyValue(order.buyer_display_amount, snapshotCurrency);
    }

    return formatCurrency(order.amount, displayCurrency, currencyRates);
  };

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
          <EmptyState
            icon={<ReceiptText className="h-7 w-7" />}
            title="No order history yet"
            description="Start checkout from a listing or from your cart and the full order record will show up here automatically."
          />
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
                {paginatedOrders.map((order) => {
                  const canContinueCheckout = isPendingCheckoutActive(order);

                  return (
                    <tr key={order.id} className="border-b border-border/60">
                      <td className="px-4 py-4 font-medium text-foreground">{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-4">{order.listing_title}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">{getOrderAmountLabel(order)}</div>
                        {displayCurrency !== BASE_CURRENCY_CODE ? (
                          <div className="text-xs text-muted-foreground">
                            Base: {formatCurrency(order.amount, BASE_CURRENCY_CODE, currencyRates)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariant(order.status)}>{titleCase(order.status)}</Badge>
                      </td>
                      <td className="px-4 py-4">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={
                            canContinueCheckout
                              ? `/account/checkout/${order.id}`
                              : `/account/orders/${order.id}?fromPage=${currentPage}`
                          }
                          className={buttonClassName({
                            variant: "secondary",
                            size: "sm",
                            className: "rounded-2xl"
                          })}
                        >
                          {canContinueCheckout ? "Continue Checkout" : "Open Order"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
