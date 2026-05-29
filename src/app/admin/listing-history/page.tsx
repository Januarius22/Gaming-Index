import ListingsReviewTable from "@/components/admin/ListingsReviewTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminListingHistory } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminListingHistoryPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const listings = await getAdminListingHistory();
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedListings,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(listings, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing history</CardTitle>
        <CardDescription>
          Review sold, rejected, withdrawn, and taken-down listings without mixing them into the live queue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} history records
          </p>
          <PaginationControls
            pathname="/admin/listing-history"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <ListingsReviewTable
          listings={paginatedListings}
          returnTo={
            currentPage > 1
              ? `/admin/listing-history?page=${currentPage}`
              : "/admin/listing-history"
          }
          mode="history"
        />
      </CardContent>
    </Card>
  );
}
