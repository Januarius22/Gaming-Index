import Link from "next/link";
import SellerListingCard from "@/components/seller/SellerListingCard";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getSellerListings } from "@/lib/data";
import { requireSellerProfile } from "@/lib/auth";

export default async function SellerListingsPage() {
  const profile = await requireSellerProfile();
  const listings = await getSellerListings(profile);

  if (listings.length === 0) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>No listings yet</CardTitle>
          <CardDescription>
            Your listings will appear here with draft, pending_review, approved, rejected, or sold statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/seller/upload">
            <Button>Create your first listing</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {listings.map((listing) => (
        <SellerListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
