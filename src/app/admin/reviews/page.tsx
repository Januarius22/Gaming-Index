import { updateSellerReviewVisibilityAction } from "@/actions/admin";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getAdminSellerReviews } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminSellerReviewsPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const [{ notice, error }, reviews] = await Promise.all([
    searchParams ?? Promise.resolve({} as { notice?: string; error?: string }),
    getAdminSellerReviews()
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller Reviews</CardTitle>
          <CardDescription>
            Moderate verified buyer reviews that affect seller reputation across the marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notice ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                ["review-hidden", "review-restored", "demo-review"].includes(notice)
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {notice === "review-hidden"
                ? "Review hidden from public rating metrics."
                : notice === "review-restored"
                  ? "Review restored."
                  : notice === "demo-review"
                    ? "Demo reviews cannot be moderated permanently."
                    : error || "Review could not be updated."}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Seller</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No seller reviews yet.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="max-w-md px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="warning">{review.rating}/5</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 leading-6 text-foreground">
                          {review.review || "No written review."}
                        </p>
                        {review.is_hidden && review.hidden_reason ? (
                          <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            {review.hidden_reason}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{review.buyer_name ?? "Buyer"}</p>
                        <p className="text-xs text-muted-foreground">{review.buyer_email ?? "No email"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{review.seller_name ?? "Seller"}</p>
                        <p className="text-xs text-muted-foreground">
                          @{review.seller_username ?? "seller"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">
                          {review.listing_title ?? "Listing"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.order_reference ? review.order_reference.slice(0, 8) : "Legacy review"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={review.is_hidden ? "danger" : "success"}>
                          {review.is_hidden ? "Hidden" : "Public"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <form action={updateSellerReviewVisibilityAction} className="space-y-2">
                          <input type="hidden" name="reviewId" value={review.id} />
                          <input
                            type="hidden"
                            name="nextVisibility"
                            value={review.is_hidden ? "visible" : "hidden"}
                          />
                          {!review.is_hidden ? (
                            <Input
                              name="hiddenReason"
                              placeholder="Reason for hiding"
                              required
                            />
                          ) : null}
                          <Button
                            type="submit"
                            size="sm"
                            variant={review.is_hidden ? "secondary" : "danger"}
                          >
                            {review.is_hidden ? "Restore" : "Hide review"}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
