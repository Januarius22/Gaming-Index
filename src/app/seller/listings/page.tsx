import Link from "next/link";
import FormMessage from "@/components/auth/FormMessage";
import SellerListingCard from "@/components/seller/SellerListingCard";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getSellerListings } from "@/lib/data";
import { requireSellerProfile } from "@/lib/auth";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function SellerListingsPage({
  searchParams
}: {
  searchParams?: Promise<{ listing?: string; notice?: string; error?: string; page?: string }>;
}) {
  const profile = await requireSellerProfile();
  const listings = await getSellerListings(profile);
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedListings,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(listings, requestedPage, 6);
  const feedbackMessage =
    params.error
      ? params.error
      : params.notice === "listing-withdrawn"
      ? "Listing withdrawn successfully. It now lives in your history."
      : params.notice === "listing-withdraw-failed"
        ? "We could not withdraw that listing right now. Please try again."
        : params.listing === "published"
          ? "Listing published successfully and is now live in the marketplace."
          : "";
  const feedbackTone = params.notice === "listing-withdraw-failed" ? "error" : "success";

  if (listings.length === 0) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>No active listings right now</CardTitle>
          <CardDescription>
            Only live unsold listings stay here. Sold, withdrawn, rejected, or taken-down items
            move into your history page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/seller/upload">
              <Button>Create your first listing</Button>
            </Link>
            <Link href="/seller/history">
              <Button variant="secondary">Open listing history</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <FormMessage message={feedbackMessage} tone={feedbackTone} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pageStart}-{pageEnd} of {totalCount} listings
        </p>
        <PaginationControls
          pathname="/seller/listings"
          currentPage={currentPage}
          totalPages={totalPages}
          query={{ listing: params.listing, notice: params.notice, error: params.error }}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {paginatedListings.map((listing) => (
          <SellerListingCard
            key={listing.id}
            listing={listing}
            returnTo={currentPage > 1 ? `/seller/listings?page=${currentPage}` : "/seller/listings"}
            mode="active"
          />
        ))}
      </div>
    </div>
  );
}
