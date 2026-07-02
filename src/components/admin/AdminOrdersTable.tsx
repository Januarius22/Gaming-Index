"use client";

import type { ComponentProps } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { releaseSellerFundsInlineAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate, statusVariant, titleCase } from "@/lib/utils";
import type { Order } from "@/types";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

function getEscrowVariant(status: NonNullable<Order["escrow_status"]>): BadgeVariant {
  if (status === "released") {
    return "success";
  }

  if (status === "holding") {
    return "warning";
  }

  if (status === "disputed" || status === "refunded") {
    return "danger";
  }

  return "neutral";
}

export default function AdminOrdersTable({
  orders,
  currentPage
}: {
  orders: Order[];
  currentPage: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [visibleOrders, setVisibleOrders] = useState(orders);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setVisibleOrders(orders);
  }, [orders]);

  const submitRelease = (formData: FormData) => {
    const orderId = String(formData.get("orderId") ?? "");
    setPendingOrderId(orderId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await releaseSellerFundsInlineAction(formData);

        if (result.status === "success" && result.orderId) {
          setVisibleOrders((currentOrders) =>
            currentOrders.map((order) =>
              order.id === result.orderId
                ? {
                    ...order,
                    escrow_status: "released",
                    seller_released_at: new Date().toISOString()
                  }
                : order
            )
          );
          router.refresh();
        }

        setFeedback({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingOrderId(null);
      })();
    });
  };

  return (
    <>
      <FormMessage message={feedback?.message} tone={feedback?.tone} />
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Game Account</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Platform Fee</th>
              <th className="px-4 py-3 font-medium">Seller Payout</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Escrow</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => {
                const escrowStatus = order.escrow_status ?? "not_started";
                const canReleaseFunds =
                  order.payment_status === "successful" &&
                  (order.status === "processing" || order.status === "completed") &&
                  escrowStatus === "holding";
                const isReleasing = pendingOrderId === order.id;

                return (
                  <tr key={order.id} className="border-b border-border/60">
                    <td className="px-4 py-4 font-medium text-foreground">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{order.buyer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.buyer_email}</div>
                    </td>
                    <td className="px-4 py-4">{order.listing_title}</td>
                    <td className="px-4 py-4">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-4">
                      {formatCurrency(order.platform_fee_amount ?? 0)}
                    </td>
                    <td className="px-4 py-4">
                      {formatCurrency(order.seller_payout_amount ?? order.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={statusVariant(order.status)}>{titleCase(order.status)}</Badge>
                        <Badge variant={order.payment_status === "successful" ? "success" : "neutral"}>
                          {titleCase(order.payment_status ?? "pending")}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <Badge variant={getEscrowVariant(escrowStatus)}>{titleCase(escrowStatus)}</Badge>
                        {order.seller_hold_expires_at && escrowStatus === "holding" ? (
                          <div className="text-xs text-muted-foreground">
                            Hold ends {formatDate(order.seller_hold_expires_at)}
                          </div>
                        ) : null}
                        {order.seller_released_at && escrowStatus === "released" ? (
                          <div className="text-xs text-muted-foreground">
                            Released {formatDate(order.seller_released_at)}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-4">
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          submitRelease(new FormData(event.currentTarget));
                        }}
                      >
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="returnTo" value={`/admin/orders?page=${currentPage}`} />
                        <Button
                          type="submit"
                          size="sm"
                          variant={canReleaseFunds ? "primary" : "secondary"}
                          disabled={!canReleaseFunds || isReleasing}
                          className="whitespace-nowrap"
                        >
                          {isReleasing ? "Releasing..." : "Release funds"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
