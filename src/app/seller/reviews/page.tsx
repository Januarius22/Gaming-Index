import { Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { requireSellerProfile } from "@/lib/auth";
import { getSellerReceivedReviews } from "@/lib/data";
import { formatDate, paginateItems, parsePageParam } from "@/lib/utils";

export default async function SellerReviewsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const profile = await requireSellerProfile();
  const params = (await searchParams) ?? {};
  const reviews = await getSellerReceivedReviews(profile.id);
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedReviews,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(reviews, requestedPage, 6);
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller reviews</CardTitle>
          <CardDescription>
            Verified buyer ratings connected to completed purchases.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">Average rating</p>
            <p className="mt-2 font-heading text-4xl font-semibold text-foreground">
              {reviews.length > 0 ? average.toFixed(1) : "New"}
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">Buyer reviews</p>
            <p className="mt-2 font-heading text-4xl font-semibold text-foreground">
              {reviews.length}
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">Visibility</p>
            <p className="mt-2 font-heading text-3xl font-semibold text-foreground">Verified</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Review history</CardTitle>
            <CardDescription>
              Showing {totalCount === 0 ? 0 : pageStart}-{pageEnd} of {totalCount} reviews
            </CardDescription>
          </div>
          <PaginationControls
            pathname="/seller/reviews"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {paginatedReviews.length === 0 ? (
            <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
              No buyer reviews yet.
            </p>
          ) : (
            paginatedReviews.map((review) => (
              <div key={review.id} className="rounded-[24px] border border-border bg-surface p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="warning">
                        <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                        {review.rating}/5
                      </Badge>
                      <Badge variant="neutral">{formatDate(review.created_at)}</Badge>
                    </div>
                    <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
                      {review.review || "No written review was added."}
                    </p>
                  </div>
                  <div className="min-w-0 text-sm sm:text-right">
                    <p className="font-semibold text-foreground">
                      {review.buyer_name ?? "Buyer"}
                    </p>
                    <p className="break-words text-muted-foreground">
                      {review.listing_title ?? "Purchased listing"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
