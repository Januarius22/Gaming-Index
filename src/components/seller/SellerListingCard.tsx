import { withdrawOwnListingAction } from "@/actions/seller";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  formatCompactCurrency,
  formatDate,
  isListingMarketplaceVisible,
  statusVariant,
  titleCase
} from "@/lib/utils";
import type { Listing } from "@/types";

export default function SellerListingCard({
  listing,
  returnTo = "/seller/listings",
  mode = "active"
}: {
  listing: Listing;
  returnTo?: string;
  mode?: "active" | "history";
}) {
  const stillVisibleInMarketplace = isListingMarketplaceVisible(listing);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {listing.game}
            </p>
            <CardTitle className="mt-3 text-xl">{listing.title}</CardTitle>
          </div>
          <Badge variant={statusVariant(listing.status)}>{titleCase(listing.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{listing.description}</p>
        <div className="grid gap-3 rounded-3xl bg-surface p-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Platform</span>
            <span className="font-semibold text-foreground">{listing.platform}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Account Level</span>
            <span className="font-semibold text-foreground">{listing.account_level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Login Method</span>
            <span className="font-semibold text-foreground">{listing.login_method}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-heading text-3xl font-semibold text-foreground">
              {formatCompactCurrency(listing.price)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(listing.created_at)}</p>
        </div>

        {listing.status === "taken_down" && listing.admin_note ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-foreground">Admin note</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{listing.admin_note}</p>
            {listing.admin_action_at ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Taken down on {formatDate(listing.admin_action_at)}
              </p>
            ) : null}
          </div>
        ) : null}

        {listing.status === "sold" ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-foreground">Sold listing</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {stillVisibleInMarketplace
                ? `This listing stays visible in the marketplace for up to 1 week after sale, then it moves fully into history.`
                : "This listing is no longer visible in the marketplace and now lives only in history."}
            </p>
          </div>
        ) : null}

        {listing.status === "withdrawn" ? (
          <div className="rounded-3xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-foreground">Withdrawn by seller</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {listing.withdrawn_at
                ? `You withdrew this listing on ${formatDate(listing.withdrawn_at)}.`
                : "You withdrew this listing from the marketplace."}
            </p>
          </div>
        ) : null}

        {mode === "active" ? (
          <form action={withdrawOwnListingAction}>
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button type="submit" variant="danger" size="sm">
              Withdraw Listing
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
