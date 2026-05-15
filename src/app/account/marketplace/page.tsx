import MarketplacePreview from "@/components/public/MarketplacePreview";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getMarketplaceCatalog } from "@/lib/data";

export default async function AccountMarketplacePage() {
  const listings = await getMarketplaceCatalog();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketplace</CardTitle>
          <CardDescription>
            Browse live listings from inside your account workspace without jumping back to
            the public landing flow.
          </CardDescription>
        </CardHeader>
      </Card>

      <MarketplacePreview
        listings={listings}
        showHeader={false}
        showViewAll={false}
        enableSearch
        className="pb-0 pt-0"
      />
    </div>
  );
}
