"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { cn, formatCurrency, statusVariant, titleCase } from "@/lib/utils";
import type { Listing } from "@/types";

export default function MarketplacePreview({
  listings,
  title = "Featured marketplace listings",
  description = "",
  showViewAll = true,
  showHeader = true,
  enableSearch = false,
  className
}: {
  listings: Listing[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  showHeader?: boolean;
  enableSearch?: boolean;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const filteredListings = normalizedQuery
    ? listings.filter((listing) =>
        [
          listing.game,
          listing.title,
          listing.description,
          listing.platform,
          listing.account_level,
          listing.seller_username,
          listing.seller_name
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : listings;

  return (
    <section className={cn("px-4 py-18 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-7xl space-y-8">
        {showHeader ? (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Marketplace preview
              </p>
              <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                {title}
              </h2>
              {description ? (
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            {showViewAll ? (
              <Link href="/marketplace" className={buttonClassName({ variant: "secondary" })}>
                View full marketplace
              </Link>
            ) : null}
          </div>
        ) : null}

        {enableSearch ? (
          <div className="rounded-[28px] border border-border/70 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(6,43,99,0.35)] sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-2xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by game, title, platform, or seller"
                  className="h-13 rounded-2xl border-border/80 pl-11"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"}
              </p>
            </div>
          </div>
        ) : null}

        {filteredListings.length === 0 ? (
          <Card className="border-border/70">
            <CardContent className="p-8 text-center sm:p-10">
              <h3 className="font-heading text-2xl font-semibold text-foreground">
                No listings match your search.
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Try a different game name, platform, seller username, or a shorter keyword.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="h-full"
              >
                <Link href={`/marketplace/${listing.id}`} className="block h-full">
                  <Card className="group flex h-full flex-col overflow-hidden border-border/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-48px_rgba(6,43,99,0.45)]">
                    <div className="p-3 pb-0">
                      <ListingPhotoGrid listing={listing} className="rounded-[28px]" />
                    </div>
                    <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                          {listing.game}
                        </span>
                        <Badge
                          variant={statusVariant(listing.status)}
                          className="shrink-0 capitalize"
                        >
                          {titleCase(listing.status)}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-3">
                        <h3 className="font-heading text-[1.55rem] font-semibold leading-tight text-foreground transition group-hover:text-primary-dark">
                          {listing.title}
                        </h3>
                        <p className="min-h-[4.5rem] text-[15px] leading-7 text-muted-foreground">
                          {listing.description}
                        </p>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/70 pt-5">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            @{listing.seller_username}
                          </p>
                          <p className="font-heading text-[2.15rem] font-semibold leading-none text-foreground">
                            {formatCurrency(listing.price)}
                          </p>
                        </div>

                        <span
                          className={buttonClassName({
                            variant: "secondary",
                            size: "md",
                            className:
                              "pointer-events-none rounded-2xl border-primary/12 bg-primary-soft/70 text-primary"
                          })}
                        >
                          More Info
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
