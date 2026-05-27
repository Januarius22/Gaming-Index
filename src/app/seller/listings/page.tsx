import Link from "next/link";
import FormMessage from "@/components/auth/FormMessage";
import SellerListingCard from "@/components/seller/SellerListingCard";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getSellerListings } from "@/lib/data";
import { requireSellerProfile } from "@/lib/auth";

export default async function SellerListingsPage({
  searchParams
}: {
  searchParams?: Promise<{ listing?: string; notice?: string; error?: string }>;
}) {
  const profile = await requireSellerProfile();
  const listings = await getSellerListings(profile);
  const params = (await searchParams) ?? {};
  const feedbackMessage =
    params.error
      ? params.error
      : params.notice === "listing-removed"
      ? "Listing removed successfully from your seller workspace and the marketplace."
      : params.notice === "listing-remove-failed"
        ? "We could not remove that listing right now. Please try again."
        : params.listing === "published"
          ? "Listing published successfully and is now live in the marketplace."
          : "";
  const feedbackTone = params.notice === "listing-remove-failed" ? "error" : "success";

  if (listings.length === 0) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>No listings yet</CardTitle>
          <CardDescription>
            Your listings will appear here once you publish them, with live and sold states visible as activity grows.
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
    <div className="space-y-5">
      <FormMessage message={feedbackMessage} tone={feedbackTone} />
      <div className="grid gap-5 xl:grid-cols-2">
        {listings.map((listing) => (
          <SellerListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
