import MarketplacePreview from "@/components/public/MarketplacePreview";
import { getMarketplaceCatalog } from "@/lib/data";

export default async function MarketplacePage() {
  const listings = await getMarketplaceCatalog();

  return (
    <MarketplacePreview
      listings={listings}
      showViewAll={false}
      showHeader={false}
      enableSearch
      className="pb-16 pt-6"
    />
  );
}
