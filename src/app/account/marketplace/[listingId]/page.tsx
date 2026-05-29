import Link from "next/link";
import {
  ArrowLeft,
  Star
} from "lucide-react";
import { notFound } from "next/navigation";
import {
  buyNowAction,
} from "@/actions/account";
import BuyerListingDetailActions from "@/components/account/BuyerListingDetailActions";
import FormMessage from "@/components/auth/FormMessage";
import SellerRatingPanel from "@/components/public/SellerRatingPanel";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Button, { buttonClassName } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  getCartMarketplaceListingIds,
  getMarketplaceListingById,
  getSavedMarketplaceListingIds,
  getSellerRatingState
} from "@/lib/data";
import { requireAccountProfile } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

function getNoticeMessage(notice?: string) {
  switch (notice) {
    case "buy-now-failed":
      return {
        message: "We could not start checkout for that listing right now.",
        tone: "error" as const
      };
    case "listing-saved":
      return { message: "Listing saved for later.", tone: "success" as const };
    case "listing-unsaved":
      return { message: "Listing removed from saved items.", tone: "success" as const };
    case "listing-save-failed":
      return { message: "We could not update saved items right now.", tone: "error" as const };
    case "cart-added":
      return { message: "Listing added to your cart.", tone: "success" as const };
    case "cart-removed":
      return { message: "Listing removed from your cart.", tone: "success" as const };
    case "cart-add-failed":
      return { message: "We could not add that listing to your cart right now.", tone: "error" as const };
    default:
      return { message: "", tone: "success" as const };
  }
}

export default async function AccountMarketplaceListingDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ listingId: string }>;
  searchParams?: Promise<{ notice?: string }>;
}) {
  const profile = await requireAccountProfile();
  const { listingId } = await params;
  const listing = await getMarketplaceListingById(listingId);

  if (!listing) {
    notFound();
  }

  const resolvedSearchParams = searchParams ?? Promise.resolve<{ notice?: string }>({});
  const [{ notice }, ratingState, savedListingIds, cartListingIds] = await Promise.all([
    resolvedSearchParams,
    getSellerRatingState(listing.seller_id, profile.id),
    getSavedMarketplaceListingIds(),
    getCartMarketplaceListingIds()
  ]);

  const noticeState = getNoticeMessage(notice);
  const isSaved = savedListingIds.includes(listing.id);
  const isInCart = cartListingIds.includes(listing.id);

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          href="/account/marketplace"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to account marketplace
        </Link>

        <FormMessage message={noticeState.message} tone={noticeState.tone} />

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
                        : "Listing is currently live in your buyer dashboard."}
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
                  canRate
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
                {ratingState.tag === "top_seller" ? (
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

              <div className="space-y-3">
                <form action={buyNowAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/account/marketplace/${listing.id}`}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={listing.status === "sold"}
                    className="w-full rounded-2xl"
                  >
                    Buy Now
                  </Button>
                </form>

                <BuyerListingDetailActions
                  listingId={listing.id}
                  initialSaved={isSaved}
                  initialInCart={isInCart}
                  isSold={listing.status === "sold"}
                />
              </div>

              <Link
                href="/account/cart"
                className={buttonClassName({
                  variant: "ghost",
                  size: "md",
                  className: "w-full rounded-2xl"
                })}
              >
                Open Cart
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
