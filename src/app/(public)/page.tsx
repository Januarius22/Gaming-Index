import HeroSection from "@/components/public/HeroSection";
import HowItWorks from "@/components/public/HowItWorks";
import MarketplacePreview from "@/components/public/MarketplacePreview";
import { getCurrentProfile } from "@/lib/auth";
import { getCurrencyRates, getMarketplaceCatalog, getProfileSettings } from "@/lib/data";

export default async function HomePage() {
  const [profile, listings, currencyRates] = await Promise.all([
    getCurrentProfile(),
    getMarketplaceCatalog(),
    getCurrencyRates()
  ]);
  const settings = profile ? await getProfileSettings(profile.id) : null;

  return (
    <>
      <HeroSection />
      <MarketplacePreview
        listings={listings}
        displayCurrency={settings?.display_currency ?? "NGN"}
        currencyRates={currencyRates}
        itemsPerPage={3}
        showPagination={false}
        className="pt-16 lg:pt-20"
      />
      <HowItWorks />
    </>
  );
}
