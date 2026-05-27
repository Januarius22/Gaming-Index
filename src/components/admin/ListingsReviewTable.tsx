"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { deleteListingAction } from "@/actions/admin";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate, statusVariant } from "@/lib/utils";
import type { Listing } from "@/types";

export default function ListingsReviewTable({ listings }: { listings: Listing[] }) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

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
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No listings have been published yet.
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
                      <Badge variant={statusVariant(listing.status)}>{listing.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                          onClick={() => setSelectedListing(listing)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <form action={deleteListingAction}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <Button size="sm" type="submit" variant="danger">
                            Take Down
                          </Button>
                        </form>
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
                <p>Status: {selectedListing.status}</p>
              </div>
            </section>

            <section className="md:col-span-2">
              <form action={deleteListingAction}>
                <input type="hidden" name="listingId" value={selectedListing.id} />
                <Button type="submit" variant="danger">
                  Take Down Listing
                </Button>
              </form>
            </section>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
