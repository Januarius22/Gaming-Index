import { updateListingStatusAction } from "@/actions/admin";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate, statusVariant } from "@/lib/utils";
import type { Listing } from "@/types";

export default function ListingsReviewTable({ listings }: { listings: Listing[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="px-4 py-3 font-medium">Listing Title</th>
            <th className="px-4 py-3 font-medium">Seller</th>
            <th className="px-4 py-3 font-medium">Game</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                No listings have been submitted yet.
              </td>
            </tr>
          ) : (
            listings.map((listing) => (
              <tr key={listing.id} className="border-b border-border/60 align-top">
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">{listing.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Submitted {formatDate(listing.created_at)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{listing.seller_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">@{listing.seller_username}</p>
                </td>
                <td className="px-4 py-4">{listing.game}</td>
                <td className="px-4 py-4">{formatCurrency(listing.price)}</td>
                <td className="px-4 py-4">
                  <Badge variant={statusVariant(listing.status)}>{listing.status}</Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={updateListingStatusAction}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <input type="hidden" name="status" value="approved" />
                      <Button size="sm">Approve</Button>
                    </form>
                    <form action={updateListingStatusAction}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <Button size="sm" variant="secondary">
                        Reject
                      </Button>
                    </form>
                    <details>
                      <summary className="cursor-pointer rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground">
                        View
                      </summary>
                      <div className="mt-3 w-72 rounded-2xl border border-border bg-white p-4 text-sm text-muted-foreground shadow-lg">
                        <p className="font-semibold text-foreground">Description</p>
                        <p className="mt-2 leading-6">{listing.description}</p>
                        <p className="mt-3">
                          <span className="font-semibold text-foreground">Platform:</span>{" "}
                          {listing.platform}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold text-foreground">Level:</span>{" "}
                          {listing.account_level}
                        </p>
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
