import { deleteOwnListingAction } from "@/actions/seller";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDate, statusVariant } from "@/lib/utils";
import type { Listing } from "@/types";

export default function SellerListingCard({ listing }: { listing: Listing }) {
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
          <Badge variant={statusVariant(listing.status)}>{listing.status}</Badge>
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
              {formatCurrency(listing.price)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(listing.created_at)}</p>
        </div>
        <form action={deleteOwnListingAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <Button type="submit" variant="danger" size="sm">
            Take Down Listing
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
