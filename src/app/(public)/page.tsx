import HeroSection from "@/components/public/HeroSection";
import HowItWorks from "@/components/public/HowItWorks";
import MarketplacePreview from "@/components/public/MarketplacePreview";
import { getMarketplaceCatalog } from "@/lib/data";

export default async function HomePage() {
  const listings = await getMarketplaceCatalog();

  return (
    <>
      <HeroSection />
      <MarketplacePreview listings={listings} itemsPerPage={3} className="pt-16 lg:pt-20" />
      <HowItWorks />
    </>
  );
}
