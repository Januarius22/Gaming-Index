"use client";

import { Star } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { submitSellerRatingAction } from "@/actions/marketplace";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { SellerRating } from "@/types";

const initialState = {
  status: "idle",
  message: ""
} as const;

export default function SellerRatingPanel({
  listingId,
  sellerId,
  sellerName,
  average,
  reviews,
  tag,
  canRate,
  currentRating
}: {
  listingId: string;
  sellerId: string;
  sellerName: string;
  average: number;
  reviews: number;
  tag: "top_seller" | null;
  canRate: boolean;
  currentRating?: SellerRating | null;
}) {
  const [state, formAction] = useActionState(submitSellerRatingAction, initialState);
  const [rating, setRating] = useState(currentRating?.rating ?? 5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [review, setReview] = useState(currentRating?.review ?? "");
  const activeStars = hovered ?? rating;
  const summaryText = useMemo(() => {
    if (reviews === 0) {
      return "No buyer ratings yet";
    }

    return `${average.toFixed(1)} average from ${reviews} ${reviews === 1 ? "buyer" : "buyers"}`;
  }, [average, reviews]);

  return (
    <div className="w-full rounded-3xl border border-border/70 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Seller rating
        </p>
        {tag === "top_seller" ? (
          <Badge variant="info" className="uppercase tracking-[0.14em]">
            Top Seller
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-wrap items-center gap-1 text-amber-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn("h-5 w-5", average >= star ? "fill-current" : "fill-transparent")}
            />
          ))}
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground">{sellerName}</p>
          <p className="text-sm leading-6 text-muted-foreground">{summaryText}</p>
        </div>
      </div>

      {canRate ? (
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="sellerId" value={sellerId} />
          <input type="hidden" name="rating" value={rating} />

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Rate this seller</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setRating(star)}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition sm:h-12 sm:w-12",
                    activeStars >= star
                      ? "border-amber-200 bg-amber-50 text-amber-500"
                      : "border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-primary"
                  )}
                  aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                >
                  <Star className={cn("h-5 w-5", activeStars >= star ? "fill-current" : "")} />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              You can update your seller rating later if your experience changes.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-semibold text-foreground">
              Short review
            </label>
            <Textarea
              id="review"
              name="review"
              value={review}
              onChange={(event) => setReview(event.target.value)}
              className="min-h-28 rounded-2xl"
              placeholder="Share a quick note about how reliable this seller feels."
            />
          </div>

          <FormMessage
            message={state.message}
            tone={state.status === "success" ? "success" : "error"}
          />

          <SubmitButton pendingLabel="Saving rating..." className="rounded-2xl">
            Save rating
          </SubmitButton>
        </form>
      ) : (
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Sign in with a buyer account to leave a seller rating and help surface top sellers in
          the marketplace.
        </p>
      )}
    </div>
  );
}
