import FormMessage from "@/components/auth/FormMessage";
import ListingsReviewTable from "@/components/admin/ListingsReviewTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminListingQueue } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminListingsPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; error?: string; page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const listings = await getAdminListingQueue();
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedListings,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(listings, requestedPage, 10);
  const feedbackMessage =
    params.error
      ? params.error
      : params.notice === "listing-taken-down"
      ? "Listing taken down successfully. It now appears in listing history."
      : params.notice === "listing-take-down-failed"
        ? "We could not take down that listing right now. Please try again."
        : "";
  const feedbackTone = params.notice === "listing-take-down-failed" ? "error" : "success";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live listings</CardTitle>
        <CardDescription>
          Monitor only active marketplace listings here. Sold, withdrawn, rejected, and taken-down
          records move into history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormMessage message={feedbackMessage} tone={feedbackTone} />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} listings
          </p>
          <PaginationControls
            pathname="/admin/listings"
            currentPage={currentPage}
            totalPages={totalPages}
            query={{ notice: params.notice, error: params.error }}
          />
        </div>
        <ListingsReviewTable
          listings={paginatedListings}
          returnTo={currentPage > 1 ? `/admin/listings?page=${currentPage}` : "/admin/listings"}
          mode="live"
        />
      </CardContent>
    </Card>
  );
}
