import Link from "next/link";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import SellerRatingPanel from "@/components/public/SellerRatingPanel";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getCurrentProfile, getDashboardRoute } from "@/lib/auth";
import { getMarketplaceListingById, getSellerRatingState } from "@/lib/data";
import {
  formatCurrency,
  formatDate
} from "@/lib/utils";

export default async function MarketplaceListingDetailPage({
  params
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const profile = await getCurrentProfile();
  const listing = await getMarketplaceListingById(listingId);

  if (!listing) {
    notFound();
  }

  const ratingState = await getSellerRatingState(listing.seller_id, profile?.id);

  const ctaHref = profile ? getDashboardRoute(profile.role) : "/auth/login";
  const ctaLabel = profile
    ? profile.role === "admin"
      ? "Open admin dashboard"
      : "Go to your dashboard"
    : "Login to continue";

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
          <div className="space-y-6">
            <ListingPhotoGrid listing={listing} size="detail" />

            <Card className="border-border/70">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Account overview
                  </p>
                  <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                    {listing.title}
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                    {listing.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-surface p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Seller</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {listing.seller_name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          @{listing.seller_username}
                        </p>
                      </div>
                      {ratingState.tag === "top_seller" ? (
                        <Badge variant="info" className="uppercase tracking-[0.12em]">
                          Top Seller
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <p className="text-sm font-semibold text-foreground">
                        {ratingState.average.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        from {ratingState.reviews}{" "}
                        {ratingState.reviews === 1 ? "buyer rating" : "buyer ratings"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-surface p-5">
                    <p className="text-sm font-semibold text-foreground">Posted</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatDate(listing.created_at)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {listing.status === "sold"
                        ? "This account has already been sold."
                        : "Listing is currently live in the marketplace."}
                    </p>
                  </div>
                </div>

                <SellerRatingPanel
                  listingId={listing.id}
                  sellerId={listing.seller_id}
                  sellerName={listing.seller_name}
                  average={ratingState.average}
                  reviews={ratingState.reviews}
                  tag={ratingState.tag}
                  canRate={Boolean(profile && profile.role !== "admin")}
                  currentRating={ratingState.buyerRating}
                />

                <div className="rounded-3xl border border-border/70 bg-white p-5 sm:p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Seller notes
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {listing.extra_notes || "No extra notes were added for this listing yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 xl:sticky xl:top-28">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                  {listing.game}
                </span>
                <Badge
                  variant={listing.status === "sold" ? "danger" : "success"}
                  className="capitalize"
                >
                  {listing.status === "sold" ? "Sold" : "Active"}
                </Badge>
                {listing.seller_tag === "top_seller" ? (
                  <Badge variant="info" className="capitalize">
                    Top Seller
                  </Badge>
                ) : null}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="mt-2 font-heading text-5xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(listing.price)}
                </p>
              </div>

              <div className="rounded-3xl bg-surface p-5 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-semibold text-foreground">{listing.platform}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="text-muted-foreground">Account level</span>
                  <span className="font-semibold text-foreground">{listing.account_level}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="text-muted-foreground">Seller</span>
                  <span className="font-semibold text-foreground">@{listing.seller_username}</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="text-muted-foreground">Seller rating</span>
                  <span className="font-semibold text-foreground">
                    {ratingState.average.toFixed(1)} / 5
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/10 bg-primary-soft/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Reviewed marketplace listing</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      This page keeps the full account specs, seller notes, screenshots, and buyer
                      rating signals in one place before you move into your buyer dashboard and
                      secure checkout flow.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={ctaHref}
                className={buttonClassName({ size: "lg", className: "w-full rounded-2xl" })}
              >
                {ctaLabel}
              </Link>
              {!profile ? (
                <p className="text-center text-sm text-muted-foreground">
                  Need an account first?{" "}
                  <Link href="/auth/register" className="font-semibold text-primary">
                    Create one
                  </Link>
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
