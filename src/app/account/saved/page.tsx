import Link from "next/link";
import { Bookmark } from "lucide-react";
import FormMessage from "@/components/auth/FormMessage";
import MarketplacePreview from "@/components/public/MarketplacePreview";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import {
  getCartMarketplaceListingIds,
  getCurrencyRates,
  getProfileSettings,
  getSavedMarketplaceListingIds,
  getSavedMarketplaceListings
} from "@/lib/data";
import { requireAccountProfile } from "@/lib/auth";

function getNoticeMessage(notice?: string) {
  switch (notice) {
    case "listing-saved":
      return { message: "Listing saved for later.", tone: "success" as const };
    case "listing-unsaved":
      return { message: "Listing removed from your saved list.", tone: "success" as const };
    case "account-limited":
      return {
        message: "Your account is currently limited. Checkout is unavailable while our team reviews your account.",
        tone: "error" as const
      };
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
  const profile = await requireAccountProfile();
  const resolvedSearchParams = searchParams ?? Promise.resolve<{ notice?: string }>({});
  const [{ notice }, savedListings, savedListingIds, cartListingIds, settings, currencyRates] = await Promise.all([
    resolvedSearchParams,
    getSavedMarketplaceListings(),
    getSavedMarketplaceListingIds(),
    getCartMarketplaceListingIds(),
    getProfileSettings(profile.id),
    getCurrencyRates()
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
          <CardContent className="p-4 sm:p-6">
            <EmptyState
              icon={<Bookmark className="h-7 w-7" />}
              title="No saved listings yet"
              description="Tap the heart icon on any buyer-dashboard listing and it will stay here for later review."
              action={
              <Link
                href="/account/marketplace"
                className={buttonClassName({ className: "rounded-2xl" })}
              >
                Browse Marketplace
              </Link>
              }
            />
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
          displayCurrency={settings.display_currency}
          currencyRates={currencyRates}
          itemsPerPage={6}
          className="pb-0 pt-0"
        />
      )}
    </div>
  );
}
