"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { takeDownListingAction } from "@/actions/admin";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate, statusVariant, titleCase } from "@/lib/utils";
import type { Listing } from "@/types";

export default function ListingsReviewTable({
  listings,
  returnTo = "/admin/listings",
  mode = "live"
}: {
  listings: Listing[];
  returnTo?: string;
  mode?: "live" | "history";
}) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const openListing = (listing: Listing) => {
    setSelectedListing(listing);
    setAdminNote("");
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 font-medium">Listing Title</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Game</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {mode === "history" ? (
                <th className="px-4 py-3 font-medium">Notes</th>
              ) : null}
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td
                  colSpan={mode === "history" ? 7 : 6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {mode === "history"
                    ? "No listing history records yet."
                    : "No active listings have been published yet."}
                </td>
              </tr>
            ) : (
              listings.map((listing) => {
                return (
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
                      <Badge variant={statusVariant(listing.status)}>
                        {titleCase(listing.status)}
                      </Badge>
                    </td>
                    {mode === "history" ? (
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {listing.admin_note
                          ? listing.admin_note
                          : listing.status === "withdrawn"
                            ? "Withdrawn by seller"
                            : listing.status === "sold"
                              ? "Sold listing"
                              : "No admin note"}
                      </td>
                    ) : null}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                          onClick={() => openListing(listing)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        {mode === "live" ? (
                          <Button
                            size="sm"
                            type="button"
                            variant="danger"
                            onClick={() => openListing(listing)}
                          >
                            Take Down
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        title={selectedListing ? selectedListing.title : "Listing details"}
        description="Inspect the listing details, screenshots, and seller information."
      >
        {selectedListing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-3xl bg-surface p-5 md:col-span-2">
              <ListingPhotoGrid listing={selectedListing} size="detail" />
            </section>

            <section className="rounded-3xl bg-surface p-5 md:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Description
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {selectedListing.description}
              </p>
            </section>

            <section className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Listing info
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Game: {selectedListing.game}</p>
                <p>Platform: {selectedListing.platform}</p>
                <p>Level: {selectedListing.account_level}</p>
                <p>Price: {formatCurrency(selectedListing.price)}</p>
                {selectedListing.sold_at ? <p>Sold on: {formatDate(selectedListing.sold_at)}</p> : null}
                {selectedListing.withdrawn_at ? (
                  <p>Withdrawn on: {formatDate(selectedListing.withdrawn_at)}</p>
                ) : null}
                {selectedListing.admin_action_at ? (
                  <p>Admin action: {formatDate(selectedListing.admin_action_at)}</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Seller info
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Name: {selectedListing.seller_name}</p>
                <p>Username: @{selectedListing.seller_username}</p>
                <p>Login Method: {selectedListing.login_method}</p>
                <p>Status: {titleCase(selectedListing.status)}</p>
              </div>
            </section>

            {selectedListing.admin_note ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 md:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">
                  Admin note
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {selectedListing.admin_note}
                </p>
              </section>
            ) : null}

            {mode === "live" && selectedListing.status === "approved" ? (
              <section className="md:col-span-2">
                <form action={takeDownListingAction} className="space-y-4">
                  <input type="hidden" name="listingId" value={selectedListing.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <div>
                    <label
                      htmlFor={`admin-note-${selectedListing.id}`}
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Note for seller
                    </label>
                    <textarea
                      id={`admin-note-${selectedListing.id}`}
                      name="adminNote"
                      value={adminNote}
                      onChange={(event) => setAdminNote(event.target.value)}
                      placeholder="Explain why this listing is being taken down."
                      required
                      className="min-h-28 w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" variant="danger">
                    Take Down Listing
                  </Button>
                </form>
              </section>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
