import HeroSection from "@/components/public/HeroSection";
import HowItWorks from "@/components/public/HowItWorks";
import MarketplacePreview from "@/components/public/MarketplacePreview";
import { getMarketplaceListings } from "@/lib/data";

export default async function HomePage() {
  const listings = await getMarketplaceListings();

  return (
    <>
      <HeroSection />
      <MarketplacePreview listings={listings} className="pt-16 lg:pt-20" />
      <HowItWorks />
    </>
  );
}
