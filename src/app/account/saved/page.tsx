import Link from "next/link";
import { Bookmark } from "lucide-react";
import FormMessage from "@/components/auth/FormMessage";
import MarketplacePreview from "@/components/public/MarketplacePreview";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  getCartMarketplaceListingIds,
  getSavedMarketplaceListingIds,
  getSavedMarketplaceListings
} from "@/lib/data";

function getNoticeMessage(notice?: string) {
  switch (notice) {
    case "listing-saved":
      return { message: "Listing saved for later.", tone: "success" as const };
    case "listing-unsaved":
      return { message: "Listing removed from your saved list.", tone: "success" as const };
    case "listing-remove-failed":
    case "listing-save-failed":
      return { message: "We could not update your saved list right now.", tone: "error" as const };
    case "cart-added":
      return { message: "Saved listing moved into your cart.", tone: "success" as const };
    case "cart-removed":
      return { message: "Listing removed from your cart.", tone: "success" as const };
    case "cart-add-failed":
      return { message: "We could not add that saved listing to your cart right now.", tone: "error" as const };
    default:
      return { message: "", tone: "success" as const };
  }
}

export default async function AccountSavedPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string }>;
}) {
  const resolvedSearchParams = searchParams ?? Promise.resolve<{ notice?: string }>({});
  const [{ notice }, savedListings, savedListingIds, cartListingIds] = await Promise.all([
    resolvedSearchParams,
    getSavedMarketplaceListings(),
    getSavedMarketplaceListingIds(),
    getCartMarketplaceListingIds()
  ]);
  const noticeState = getNoticeMessage(notice);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved listings</CardTitle>
          <CardDescription>
            Keep favorite accounts here so you can compare them later without leaving your
            buyer dashboard.
          </CardDescription>
        </CardHeader>
      </Card>

      <FormMessage message={noticeState.message} tone={noticeState.tone} />

      {savedListings.length === 0 ? (
        <Card className="mx-auto max-w-4xl">
          <CardContent>
            <div className="flex min-h-[44vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
                <Bookmark className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
                No saved listings yet
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Tap the heart icon on any buyer-dashboard listing and it will stay here for
                later review.
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
        <MarketplacePreview
          listings={savedListings}
          showHeader={false}
          showViewAll={false}
          context="account"
          savedListingIds={savedListingIds}
          cartListingIds={cartListingIds}
          itemsPerPage={6}
          className="pb-0 pt-0"
        />
      )}
    </div>
  );
}
