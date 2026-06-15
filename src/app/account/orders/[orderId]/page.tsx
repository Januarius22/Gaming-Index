import Link from "next/link";
import { LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";
import { revealOrderDeliveryAction } from "@/actions/account";
import FormMessage from "@/components/auth/FormMessage";
import CopyValueButton from "@/components/account/CopyValueButton";
import OrderDisputeForm from "@/components/account/OrderDisputeForm";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Badge from "@/components/ui/Badge";
import Button, { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAccountProfile } from "@/lib/auth";
import { getBuyerOrderDetail } from "@/lib/data";
import { formatCurrency, formatDate, statusVariant } from "@/lib/utils";

function getNoticeMessage(notice?: string) {
  switch (notice) {
    case "payment-confirmed":
      return {
        message: "Payment confirmed. Delivery access is ready.",
        tone: "success" as const
      };
    case "payment-already-confirmed":
      return {
        message: "This order has already been paid.",
        tone: "success" as const
      };
    case "delivery-revealed":
      return {
        message: "Delivery details are now visible for this paid order.",
        tone: "success" as const
      };
    case "delivery-locked":
      return {
        message: "Delivery details unlock after payment.",
        tone: "error" as const
      };
    case "delivery-unavailable":
      return {
        message: "This order does not have releasable delivery details yet.",
        tone: "error" as const
      };
    case "checkout-unavailable":
      return {
        message: "This checkout can no longer continue for the current listing state.",
        tone: "error" as const
      };
    default:
      return {
        message: "",
        tone: "success" as const
      };
  }
}

export default async function AccountOrderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ notice?: string; showDelivery?: string; fromPage?: string }>;
}) {
  const profile = await requireAccountProfile();
  const [{ orderId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ??
      Promise.resolve<{ notice?: string; showDelivery?: string; fromPage?: string }>({})
  ]);

  const showDelivery = resolvedSearchParams.showDelivery === "1";
  const returnToHistory =
    resolvedSearchParams.fromPage && resolvedSearchParams.fromPage !== "1"
      ? `/account/orders?page=${resolvedSearchParams.fromPage}`
      : "/account/orders";
  const orderDetail = await getBuyerOrderDetail(profile, orderId, {
    includeDeliveryDetails: showDelivery
  });
  const noticeState = getNoticeMessage(resolvedSearchParams.notice);

  if (!orderDetail) {
    return (
      <Card className="max-w-4xl">
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
              <ReceiptText className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
              Order not found
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              We could not find that order inside your buyer workspace.
            </p>
            <Link
              href={returnToHistory}
              className={buttonClassName({ className: "mt-6 rounded-2xl" })}
            >
              Back to Order History
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { order, listing, paymentConfirmed, deliveryAvailable, deliveryDetails } = orderDetail;
  const deliveryVisible = Boolean(showDelivery && deliveryDetails && paymentConfirmed);
  const revealedDeliveryDetails = deliveryVisible ? deliveryDetails : null;
  const canOpenDispute =
    paymentConfirmed &&
    order.escrow_status !== "disputed" &&
    order.escrow_status !== "refunded";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
          <CardDescription>
            Review payment status and delivery access for this order.
          </CardDescription>
        </CardHeader>
      </Card>

      <FormMessage message={noticeState.message} tone={noticeState.tone} />

      <Card className="border-border/70">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="mt-2 font-heading text-3xl font-semibold text-foreground">
              {order.id.slice(0, 8)}
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="mt-2 font-heading text-3xl font-semibold text-foreground">
              {formatCurrency(order.amount)}
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-2">
              <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
            </div>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="mt-2 font-semibold text-foreground">{formatDate(order.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <Card className="border-border/70">
          <CardContent className="space-y-6 p-5 lg:p-6">
            {listing ? (
              <Link href={`/account/marketplace/${listing.id}`} className="mx-auto block max-w-xl">
                <ListingPhotoGrid listing={listing} className="rounded-[28px]" />
              </Link>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border bg-surface p-8 text-sm text-muted-foreground">
                This listing snapshot is no longer available.
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                {listing ? (
                  <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                    {listing.game}
                  </span>
                ) : null}
                <Badge variant={paymentConfirmed ? "success" : "warning"}>
                  {paymentConfirmed ? "Payment confirmed" : "Awaiting payment"}
                </Badge>
              </div>

              <div className="space-y-3">
                <h2 className="font-heading text-3xl font-semibold text-foreground">
                  {order.listing_title}
                </h2>
                {listing ? (
                  <p className="text-sm leading-7 text-muted-foreground">{listing.description}</p>
                ) : (
                  <p className="text-sm leading-7 text-muted-foreground">
                    This order record still exists, but the listing details are no longer available
                    for preview.
                  </p>
                )}
              </div>

              <div className="grid gap-4 rounded-3xl bg-surface p-5 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-muted-foreground">Seller</p>
                  <p className="mt-1 break-words font-semibold text-foreground">
                    {listing ? `@${listing.seller_username}` : "Unknown seller"}
                  </p>
                </div>
                <div className="min-w-0 sm:text-right">
                  <p className="text-muted-foreground">Login method</p>
                  <p className="mt-1 break-words font-semibold text-foreground">
                    {listing?.login_method || "Not available"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground">Platform</p>
                  <p className="mt-1 break-words font-semibold text-foreground">
                    {listing?.platform || "Not available"}
                  </p>
                </div>
                <div className="min-w-0 sm:text-right">
                  <p className="text-muted-foreground">Account level</p>
                  <p className="mt-1 break-words font-semibold text-foreground">
                    {listing?.account_level || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={returnToHistory}
                  className={buttonClassName({
                    variant: "secondary",
                    className: "flex-1 rounded-2xl sm:flex-none"
                  })}
                >
                  Back to Order History
                </Link>
                {listing ? (
                  <Link
                    href={`/account/marketplace/${listing.id}`}
                    className={buttonClassName({
                      variant: "ghost",
                      className: "flex-1 rounded-2xl sm:flex-none"
                    })}
                  >
                    View Listing
                  </Link>
                ) : null}
                {!paymentConfirmed ? (
                  <Link
                    href={`/account/checkout/${order.id}`}
                    className={buttonClassName({
                      className: "flex-1 rounded-2xl sm:flex-none"
                    })}
                  >
                    Continue Checkout
                  </Link>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Delivery vault</CardTitle>
              <CardDescription>
                Private account access for this purchase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!paymentConfirmed ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white p-3 text-amber-700 shadow-sm">
                      <LockKeyhole className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Delivery details are locked</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Complete payment to unlock the account details.
                      </p>
                      <Link
                        href={`/account/checkout/${order.id}`}
                        className={buttonClassName({
                          className: "mt-4 rounded-2xl"
                        })}
                      >
                        Continue Checkout
                      </Link>
                    </div>
                  </div>
                </div>
              ) : revealedDeliveryDetails ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Delivery details revealed</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Use the details below to access the account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-3xl bg-surface p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">Account login</p>
                          <p className="mt-2 break-all font-semibold text-foreground">
                            {revealedDeliveryDetails.account_login_id}
                          </p>
                        </div>
                        <CopyValueButton value={revealedDeliveryDetails.account_login_id} />
                      </div>
                    </div>
                    <div className="rounded-3xl bg-surface p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">Password</p>
                          <p className="mt-2 break-all font-semibold text-foreground">
                            {revealedDeliveryDetails.account_password}
                          </p>
                        </div>
                        <CopyValueButton value={revealedDeliveryDetails.account_password} />
                      </div>
                    </div>
                    <div className="rounded-3xl bg-surface p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">Recovery details</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                            {revealedDeliveryDetails.recovery_details || "Not provided."}
                          </p>
                        </div>
                        {revealedDeliveryDetails.recovery_details ? (
                          <CopyValueButton value={revealedDeliveryDetails.recovery_details} />
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-surface p-5">
                      <p className="text-sm text-muted-foreground">Transfer note</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                        {revealedDeliveryDetails.transfer_note || "Not provided."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : deliveryAvailable ? (
                <form action={revealOrderDeliveryAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input
                    type="hidden"
                    name="fromPage"
                    value={resolvedSearchParams.fromPage ?? "1"}
                  />
                  <div className="rounded-3xl border border-primary/12 bg-primary-soft/55 p-5">
                    <p className="font-semibold text-foreground">Delivery details are ready</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Reveal the private account access for this order.
                    </p>
                    <Button type="submit" className="mt-4 rounded-2xl">
                      Reveal delivery details
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-3xl border border-border bg-surface p-5">
                  <p className="font-semibold text-foreground">Delivery details unavailable</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    No delivery details are attached to this order.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {canOpenDispute ? (
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Payment record</CardTitle>
                <CardDescription>
                  Reference details captured for this completed checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-surface p-5">
                  <p className="text-sm text-muted-foreground">Payment reference</p>
                  <p className="mt-2 break-all font-semibold text-foreground">
                    {order.payment_reference || "Not available"}
                  </p>
                </div>
                <div className="rounded-3xl bg-surface p-5">
                  <p className="text-sm text-muted-foreground">Payment method</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {order.payment_last4
                      ? `Card ending in ${order.payment_last4}`
                      : "Card payment"}
                  </p>
                </div>
                <div className="rounded-3xl bg-surface p-5">
                  <p className="text-sm text-muted-foreground">Payment status</p>
                  <p className="mt-2 font-semibold capitalize text-foreground">
                    {order.payment_status || "successful"}
                  </p>
                </div>
                <div className="rounded-3xl bg-surface p-5">
                  <p className="text-sm text-muted-foreground">Paid on</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {order.paid_at ? formatDate(order.paid_at) : formatDate(order.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {paymentConfirmed ? (
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Report a problem</CardTitle>
                <CardDescription>
                  Open a dispute if the delivered account has an issue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderDisputeForm orderId={order.id} />
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Secure the account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Change the password.</p>
              <p>Update recovery email or phone where available.</p>
              <p>Keep this order record for reference.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
