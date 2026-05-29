import MarketplacePreview from "@/components/public/MarketplacePreview";
import FormMessage from "@/components/auth/FormMessage";
import {
  getCartMarketplaceListingIds,
  getMarketplaceCatalog,
  getSavedMarketplaceListingIds
} from "@/lib/data";

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
      return { message: "Listing removed from your saved list.", tone: "success" as const };
    case "listing-save-failed":
      return { message: "We could not update your saved items right now.", tone: "error" as const };
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

export default async function AccountMarketplacePage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string }>;
}) {
  const resolvedSearchParams = searchParams ?? Promise.resolve<{ notice?: string }>({});
  const [{ notice }, listings, savedListingIds, cartListingIds] = await Promise.all([
    resolvedSearchParams,
    getMarketplaceCatalog(),
    getSavedMarketplaceListingIds(),
    getCartMarketplaceListingIds()
  ]);
  const noticeState = getNoticeMessage(notice);

  return (
    <div className="space-y-6">
      <FormMessage message={noticeState.message} tone={noticeState.tone} />

      <MarketplacePreview
        listings={listings}
        showHeader={false}
        showViewAll={false}
        enableSearch
        context="account"
        savedListingIds={savedListingIds}
        cartListingIds={cartListingIds}
        itemsPerPage={6}
        className="pb-0 pt-0"
      />
    </div>
  );
}
