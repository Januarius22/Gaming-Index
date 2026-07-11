import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import PurchaseCelebration from "@/components/account/PurchaseCelebration";
import PurchaseSuccessScrollReset from "@/components/account/PurchaseSuccessScrollReset";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { requireAccountProfile } from "@/lib/auth";
import { getBuyerOrderDetail, getCurrencyRates, getProfileSettings } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function PurchaseSuccessPage({
  params
}: {
  params: Promise<{ orderId: string }>;
}) {
  const profile = await requireAccountProfile();
  const { orderId } = await params;
  const [orderDetail, settings, currencyRates] = await Promise.all([
    getBuyerOrderDetail(profile, orderId),
    getProfileSettings(profile.id),
    getCurrencyRates()
  ]);

  if (!orderDetail) {
    redirect("/account/orders");
  }

  const { order, listing, paymentConfirmed, deliveryAvailable } = orderDetail;
  const displayCurrency = settings.display_currency;

  if (!paymentConfirmed) {
    redirect(`/account/checkout/${order.id}`);
  }

  return (
    <div className="relative min-h-[calc(100svh-9rem)] overflow-hidden rounded-[32px] border border-border/70 bg-white shadow-[0_28px_90px_-58px_rgba(6,43,99,0.45)]">
      <PurchaseSuccessScrollReset />
      <PurchaseCelebration />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 py-14 text-center sm:px-8 lg:py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary text-white shadow-[0_24px_55px_-28px_rgba(0,87,255,0.85)]">
          <Sparkles className="h-9 w-9" />
        </div>

        <Badge variant="success" className="mt-6 px-4 py-2">
          Payment confirmed
        </Badge>

        <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Thank you for purchasing.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          Your payment is complete and your order has been created. You can now open your order
          page to reveal delivery details when you are ready to secure the account.
        </p>

        <Card className="mt-8 w-full max-w-2xl border-border/70 text-left">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-3xl bg-surface p-4">
              <p className="text-sm text-muted-foreground">Account</p>
              <p className="mt-2 break-words font-semibold text-foreground">
                {order.listing_title}
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-4">
              <p className="text-sm text-muted-foreground">Amount paid</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-foreground">
                {formatCurrency(order.amount, displayCurrency, currencyRates)}
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-4">
              <p className="text-sm text-muted-foreground">Seller</p>
              <p className="mt-2 break-words font-semibold text-foreground">
                {listing ? `@${listing.seller_username}` : "Seller"}
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-4">
              <p className="text-sm text-muted-foreground">Delivery</p>
              <p className="mt-2 font-semibold text-foreground">
                {deliveryAvailable ? "Ready to reveal" : "Awaiting seller details"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/account/orders/${order.id}?notice=payment-confirmed`}
            className={buttonClassName({
              size: "lg",
              className: "gap-2 rounded-2xl"
            })}
          >
            <PackageCheck className="h-4 w-4" />
            Open Order Details
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/account/marketplace"
            className={buttonClassName({
              variant: "secondary",
              size: "lg",
              className: "gap-2 rounded-2xl"
            })}
          >
            <ShieldCheck className="h-4 w-4" />
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
