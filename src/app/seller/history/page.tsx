import FormMessage from "@/components/auth/FormMessage";
import SellerListingCard from "@/components/seller/SellerListingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { requireSellerProfile } from "@/lib/auth";
import { getSellerListingHistory } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function SellerHistoryPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; error?: string; page?: string }>;
}) {
  const profile = await requireSellerProfile();
  const history = await getSellerListingHistory(profile);
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedHistory,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(history, requestedPage, 6);
  const feedbackMessage =
    params.error
      ? params.error
      : params.notice === "listing-withdrawn"
        ? "Listing withdrawn successfully and moved into your history."
        : "";
  const feedbackTone = params.error ? "error" : "success";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Listing history</CardTitle>
          <CardDescription>
            Sold, taken-down, rejected, and withdrawn listings stay here for your records.
          </CardDescription>
        </CardHeader>
      </Card>

      <FormMessage message={feedbackMessage} tone={feedbackTone} />

      {history.length === 0 ? (
        <Card className="mx-auto max-w-3xl">
          <CardContent>
            <div className="flex min-h-[36vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                No history yet
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Once your listings are sold, withdrawn, rejected, or taken down, they will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {pageStart}-{pageEnd} of {totalCount} history records
            </p>
            <PaginationControls
              pathname="/seller/history"
              currentPage={currentPage}
              totalPages={totalPages}
              query={{ notice: params.notice, error: params.error }}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {paginatedHistory.map((listing) => (
              <SellerListingCard
                key={listing.id}
                listing={listing}
                returnTo={currentPage > 1 ? `/seller/history?page=${currentPage}` : "/seller/history"}
                mode="history"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
