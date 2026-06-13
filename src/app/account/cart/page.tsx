import Link from "next/link";
import { Heart, ReceiptText, ShieldCheck, Trash2 } from "lucide-react";
import {
  buyNowAction,
  removeCartListingAction,
  toggleSavedListingAction
} from "@/actions/account";
import FormMessage from "@/components/auth/FormMessage";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Badge from "@/components/ui/Badge";
import Button, { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import {
  getCartMarketplaceListings,
  getSavedMarketplaceListingIds
} from "@/lib/data";
import { formatCompactCurrency, formatDate, paginateItems, parsePageParam } from "@/lib/utils";

function getNoticeMessage(notice?: string) {
  switch (notice) {
    case "buy-now-failed":
      return { message: "We could not start checkout for that listing right now.", tone: "error" as const };
    case "cart-added":
      return { message: "Listing added to your cart.", tone: "success" as const };
    case "cart-removed":
      return { message: "Listing removed from your cart.", tone: "success" as const };
    case "cart-add-failed":
    case "cart-remove-failed":
      return { message: "We could not update your cart right now.", tone: "error" as const };
    case "listing-saved":
      return { message: "Listing saved for later as well.", tone: "success" as const };
    case "listing-unsaved":
      return { message: "Listing removed from your saved list.", tone: "success" as const };
    case "listing-save-failed":
      return { message: "We could not update your saved items right now.", tone: "error" as const };
    default:
      return { message: "", tone: "success" as const };
  }
}

export default async function AccountCartPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; page?: string }>;
}) {
  const resolvedSearchParams =
    searchParams ?? Promise.resolve<{ notice?: string; page?: string }>({});
  const [{ notice, page }, cartListings, savedListingIds] = await Promise.all([
    resolvedSearchParams,
    getCartMarketplaceListings(),
    getSavedMarketplaceListingIds()
  ]);
  const noticeState = getNoticeMessage(notice);
  const cartTotal = cartListings.reduce((sum, listing) => sum + listing.price, 0);
  const requestedPage = parsePageParam(page);
  const {
    items: paginatedCartListings,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(cartListings, requestedPage, 4);
  const returnTo = currentPage > 1 ? `/account/cart?page=${currentPage}` : "/account/cart";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cart</CardTitle>
          <CardDescription>
            Review the accounts you have set aside and decide which ones you want to move
            forward with next.
          </CardDescription>
        </CardHeader>
      </Card>

      <FormMessage message={noticeState.message} tone={noticeState.tone} />

      {cartListings.length === 0 ? (
        <Card className="mx-auto max-w-4xl">
          <CardContent>
            <div className="flex min-h-[44vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
                <ReceiptText className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
                Your cart is empty
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Use the cart icon in your buyer dashboard to collect accounts here, then launch
                checkout whenever you are ready.
              </p>
              <Link
                href="/account/marketplace"
                className={buttonClassName({ className: "mt-6 rounded-2xl" })}
              >
                Browse Marketplace
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border/70">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              <div className="rounded-3xl bg-surface p-5">
                <p className="text-sm text-muted-foreground">Items in cart</p>
                <p className="mt-2 font-heading text-4xl font-semibold text-foreground">
                  {cartListings.length}
                </p>
              </div>
              <div className="rounded-3xl bg-surface p-5">
                <p className="text-sm text-muted-foreground">Cart total</p>
                <p className="mt-2 font-heading text-4xl font-semibold text-foreground">
                  {formatCompactCurrency(cartTotal)}
                </p>
              </div>
              <div className="rounded-3xl border border-primary/10 bg-primary-soft/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Checkout starts from the listings you trust</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Keep your shortlist here, compare details, and launch checkout only when
                      you are ready to pay for a specific account.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pageStart}-{pageEnd} of {totalCount} cart items
              </p>
              <PaginationControls
                pathname="/account/cart"
                currentPage={currentPage}
                totalPages={totalPages}
                query={{ notice }}
              />
            </div>
            {paginatedCartListings.map((listing) => {
              const isSaved = savedListingIds.includes(listing.id);
              const isSold = listing.status === "sold";

              return (
                <Card key={listing.id} className="border-border/70">
                  <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(260px,320px)_1fr] lg:p-6">
                    <Link href={`/account/marketplace/${listing.id}`} className="block">
                      <ListingPhotoGrid listing={listing} className="rounded-[28px]" />
                    </Link>

                    <div className="flex flex-col gap-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                          {listing.game}
                        </span>
                        <Badge
                          variant={isSold ? "danger" : "success"}
                          className="capitalize"
                        >
                          {isSold ? "Sold" : "Ready"}
                        </Badge>
                        <Badge variant="neutral">{listing.platform}</Badge>
                      </div>

                      <div className="space-y-3">
                        <Link href={`/account/marketplace/${listing.id}`}>
                          <h2 className="font-heading text-3xl font-semibold text-foreground transition hover:text-primary-dark">
                            {listing.title}
                          </h2>
                        </Link>
                        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                          {listing.description}
                        </p>
                      </div>

                      <div className="grid gap-3 rounded-3xl bg-surface p-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">Seller</p>
                          <p className="mt-1 font-semibold text-foreground">
                            @{listing.seller_username}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Account level</p>
                          <p className="mt-1 font-semibold text-foreground">{listing.account_level}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Added</p>
                          <p className="mt-1 font-semibold text-foreground">
                            {formatDate(listing.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="mt-1 font-heading text-2xl font-semibold text-foreground">
                            {formatCompactCurrency(listing.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!isSold ? (
                          <form action={buyNowAction}>
                            <input type="hidden" name="listingId" value={listing.id} />
                            <input type="hidden" name="returnTo" value={returnTo} />
                            <Button type="submit" className="rounded-2xl">
                              Checkout
                            </Button>
                          </form>
                        ) : null}

                        <Link
                          href={`/account/marketplace/${listing.id}`}
                          className={buttonClassName({
                            variant: "secondary",
                            className: "rounded-2xl"
                          })}
                        >
                          Review Listing
                        </Link>

                        <form action={toggleSavedListingAction}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <Button
                            type="submit"
                            variant={isSaved ? "danger" : "secondary"}
                            className="h-12 w-14 rounded-2xl px-0"
                            aria-label={isSaved ? "Remove from saved listings" : "Save listing"}
                            title={isSaved ? "Remove from saved listings" : "Save listing"}
                          >
                            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                          </Button>
                        </form>

                        <form action={removeCartListingAction}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <Button
                            type="submit"
                            variant="ghost"
                            className="h-12 w-14 rounded-2xl px-0"
                            aria-label="Remove from cart"
                            title="Remove from cart"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>

                      {isSold ? (
                        <p className="text-sm text-danger">
                          This listing is already marked sold, so keep it only for reference.
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
