import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { completeCheckoutAction } from "@/actions/account";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { requireAccountProfile } from "@/lib/auth";
import { getBuyerOrderDetail } from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  isPendingCheckoutActive,
  statusVariant,
  titleCase
} from "@/lib/utils";

function getNoticeMessage(notice?: string) {
  switch (notice) {
    case "checkout-resumed":
      return {
        message: "You already had an unfinished checkout for this listing, so we brought you back here.",
        tone: "success" as const
      };
    case "payment-invalid":
      return {
        message: "Please review the payment details and try again.",
        tone: "error" as const
      };
    case "payment-failed":
      return {
        message: "We could not complete payment right now. Please try again.",
        tone: "error" as const
      };
    case "checkout-unavailable":
      return {
        message: "This checkout is no longer available for the current listing state.",
        tone: "error" as const
      };
    default:
      return {
        message: "",
        tone: "success" as const
      };
  }
}

export default async function AccountCheckoutPage({
  params,
  searchParams
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ notice?: string }>;
}) {
  const profile = await requireAccountProfile();
  const [{ orderId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<{ notice?: string }>({})
  ]);
  const orderDetail = await getBuyerOrderDetail(profile, orderId);
  const noticeState = getNoticeMessage(resolvedSearchParams.notice);

  if (!orderDetail) {
    return (
      <Card className="max-w-4xl">
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
              Checkout not found
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              We could not find that checkout record inside your buyer workspace.
            </p>
            <Link
              href="/account/orders"
              className={buttonClassName({ className: "mt-6 rounded-2xl" })}
            >
              Back to Order History
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { order, listing, paymentConfirmed } = orderDetail;
  const checkoutActive = isPendingCheckoutActive(order);
  const checkoutBlocked =
    order.status === "cancelled" ||
    !checkoutActive ||
    !listing ||
    (!paymentConfirmed && listing.status !== "approved");

  if (paymentConfirmed) {
    redirect(`/account/checkout/${order.id}/success`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to order history
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Secure checkout</CardTitle>
            <CardDescription>
              Review this order, complete payment, and then unlock the seller delivery vault from
              your order page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <FormMessage message={noticeState.message} tone={noticeState.tone} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)]">
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
                <Badge variant={statusVariant(order.status)}>{titleCase(order.status)}</Badge>
                <Badge variant="warning">Awaiting payment</Badge>
              </div>

              <div className="space-y-3">
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  {order.listing_title}
                </h1>
                <p className="text-sm leading-7 text-muted-foreground">
                  {listing?.description ||
                    "This order record still exists, but the original listing preview is no longer available."}
                </p>
              </div>

              <div className="grid gap-4 rounded-3xl bg-surface p-5 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-muted-foreground">Seller</p>
                  <p className="mt-1 break-words font-semibold text-foreground">
                    {listing ? `@${listing.seller_username}` : "Unknown seller"}
                  </p>
                </div>
                <div className="min-w-0 sm:text-right">
                  <p className="text-muted-foreground">Price</p>
                  <p className="mt-1 break-words font-heading text-2xl font-semibold text-foreground">
                    {formatCurrency(order.amount)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground">Order created</p>
                  <p className="mt-1 font-semibold text-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="min-w-0 sm:text-right">
                  <p className="text-muted-foreground">Login method</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {listing?.login_method || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/account/orders/${order.id}`}
                  className={buttonClassName({
                    variant: "secondary",
                    className: "rounded-2xl"
                  })}
                >
                  View Order
                </Link>
                {listing ? (
                  <Link
                    href={`/account/marketplace/${listing.id}`}
                    className={buttonClassName({
                      variant: "ghost",
                      className: "rounded-2xl"
                    })}
                  >
                    View Listing
                  </Link>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {checkoutBlocked ? (
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Checkout unavailable</CardTitle>
                <CardDescription>
                  This order can no longer move forward from the current listing state.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-muted-foreground">
                  The listing is no longer ready for payment, so this checkout has been paused.
                  You can return to the order record or head back into the marketplace.
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/account/orders/${order.id}?notice=checkout-unavailable`}
                    className={buttonClassName({
                      variant: "secondary",
                      className: "rounded-2xl"
                    })}
                  >
                    Open Order
                  </Link>
                  <Link
                    href="/account/marketplace"
                    className={buttonClassName({
                      className: "rounded-2xl"
                    })}
                  >
                    Browse Marketplace
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Secure payment</CardTitle>
                <CardDescription>
                  Complete payment securely to continue with this order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={completeCheckoutAction} className="space-y-5">
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="paymentMode" value="paystack_mock" />

                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="buyerPhone"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Phone number
                      </label>
                      <Input
                        id="buyerPhone"
                        name="buyerPhone"
                        type="tel"
                        autoComplete="tel"
                        defaultValue={order.buyer_phone || ""}
                        placeholder="+234 801 234 5678"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="buyerEmail"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Email address
                      </label>
                      <Input
                        id="buyerEmail"
                        defaultValue={profile.email}
                        readOnly
                        className="bg-surface"
                      />
                    </div>
                  </div>

                  <div className="space-y-5 rounded-3xl bg-surface p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount payable</p>
                        <p className="mt-2 font-heading text-4xl font-semibold text-foreground">
                          {formatCurrency(order.amount)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                        <CreditCard className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Card", "Bank transfer", "USSD"].map((method) => (
                        <div
                          key={method}
                          className="rounded-2xl border border-border/80 bg-white px-4 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs leading-6 text-muted-foreground">
                      By continuing, you confirm that you reviewed the listing details and understand
                      that third-party platform rules may affect account transfers.
                    </p>
                  </div>

                  <SubmitButton pendingLabel="Processing..." size="lg" className="w-full rounded-2xl">
                    Pay securely with Paystack
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
