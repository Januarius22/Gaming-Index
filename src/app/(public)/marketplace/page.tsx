import MarketplacePreview from "@/components/public/MarketplacePreview";
import { getCurrentProfile } from "@/lib/auth";
import { getCurrencyRates, getMarketplaceCatalog, getProfileSettings } from "@/lib/data";

export default async function MarketplacePage() {
  const [profile, listings, currencyRates] = await Promise.all([
    getCurrentProfile(),
    getMarketplaceCatalog(),
    getCurrencyRates()
  ]);
  const settings = profile ? await getProfileSettings(profile.id) : null;

  return (
    <MarketplacePreview
      listings={listings}
      displayCurrency={settings?.display_currency ?? "NGN"}
      currencyRates={currencyRates}
      showViewAll={false}
      showHeader={false}
      enableSearch
      itemsPerPage={9}
      className="pb-16 pt-6"
    />
  );
}
