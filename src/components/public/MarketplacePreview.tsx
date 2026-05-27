"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import {
  addToCartAction,
  buyNowAction,
  toggleSavedListingAction
} from "@/actions/account";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { cn, formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types";

interface MarketplaceFilters {
  minPrice: string;
  maxPrice: string;
  vendor: string;
  game: string;
  platform: string;
  status: string;
  sortBy: string;
}

const defaultFilters: MarketplaceFilters = {
  minPrice: "",
  maxPrice: "",
  vendor: "all",
  game: "all",
  platform: "all",
  status: "all",
  sortBy: "latest"
};

export default function MarketplacePreview({
  listings,
  title = "Featured marketplace listings",
  description = "",
  showViewAll = true,
  showHeader = true,
  enableSearch = false,
  context = "public",
  savedListingIds = [],
  cartListingIds = [],
  className
}: {
  listings: Listing[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  showHeader?: boolean;
  enableSearch?: boolean;
  context?: "public" | "account";
  savedListingIds?: string[];
  cartListingIds?: string[];
  className?: string;
}) {
  const pathname = usePathname();
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const vendorOptions = Array.from(
    listings.reduce((map, listing) => {
      map.set(listing.seller_username, listing.seller_name);
      return map;
    }, new Map<string, string>())
  ).sort(([leftUsername], [rightUsername]) => leftUsername.localeCompare(rightUsername));

  const gameOptions = Array.from(new Set(listings.map((listing) => listing.game))).sort((left, right) =>
    left.localeCompare(right)
  );
  const platformOptions = Array.from(
    new Set(listings.map((listing) => listing.platform))
  ).sort((left, right) => left.localeCompare(right));

  const minPrice = draftFilters.minPrice ? Number(draftFilters.minPrice) : null;
  const maxPrice = draftFilters.maxPrice ? Number(draftFilters.maxPrice) : null;
  const minPriceInvalid = draftFilters.minPrice !== "" && (minPrice === null || Number.isNaN(minPrice) || minPrice < 0);
  const maxPriceInvalid =
    draftFilters.maxPrice !== "" &&
    (maxPrice === null ||
      Number.isNaN(maxPrice) ||
      maxPrice < 0 ||
      (minPrice !== null && !Number.isNaN(minPrice) && maxPrice < minPrice));

  const updateDraftFilter = <Key extends keyof MarketplaceFilters>(
    key: Key,
    
    value: MarketplaceFilters[Key]
  ) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const hasActiveFilters = Object.entries(appliedFilters).some(
    ([key, value]) => value !== defaultFilters[key as keyof MarketplaceFilters]
  );

  const filteredListings = listings.filter((listing) => {
    const appliedMinPrice = appliedFilters.minPrice ? Number(appliedFilters.minPrice) : null;
    const appliedMaxPrice = appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : null;

    if (appliedMinPrice !== null && !Number.isNaN(appliedMinPrice) && listing.price < appliedMinPrice) {
      return false;
    }

    if (appliedMaxPrice !== null && !Number.isNaN(appliedMaxPrice) && listing.price > appliedMaxPrice) {
      return false;
    }

    if (appliedFilters.vendor !== "all" && listing.seller_username !== appliedFilters.vendor) {
      return false;
    }

    if (appliedFilters.game !== "all" && listing.game !== appliedFilters.game) {
      return false;
    }

    if (appliedFilters.platform !== "all" && listing.platform !== appliedFilters.platform) {
      return false;
    }

    if (appliedFilters.status === "active" && listing.status !== "approved") {
      return false;
    }

    if (appliedFilters.status === "sold" && listing.status !== "sold") {
      return false;
    }

    return true;
  });
  const sortedListings = [...filteredListings].sort((left, right) => {
    switch (appliedFilters.sortBy) {
      case "lowest_price":
        return left.price - right.price;
      case "highest_price":
        return right.price - left.price;
      case "most_rated":
        return (right.seller_reviews ?? 0) - (left.seller_reviews ?? 0);
      case "top_sellers":
        return (right.seller_rating ?? 0) - (left.seller_rating ?? 0);
      default:
        return right.created_at.localeCompare(left.created_at);
    }
  });

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
          <div className="rounded-[30px] border border-border/70 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(6,43,99,0.35)] sm:p-5">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters();
              }}
              className="space-y-3"
            >
              <div className="grid gap-3 xl:grid-cols-4">
                <Input
                  value={draftFilters.minPrice}
                  onChange={(event) => updateDraftFilter("minPrice", event.target.value)}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Min price"
                  className="h-14 rounded-2xl border-border/80 px-5 text-base shadow-none"
                />

                <Input
                  value={draftFilters.maxPrice}
                  onChange={(event) => updateDraftFilter("maxPrice", event.target.value)}
                  type="number"
                  min={minPrice ?? 0}
                  inputMode="numeric"
                  placeholder="Max price"
                  className="h-14 rounded-2xl border-border/80 px-5 text-base shadow-none"
                />

                <Select
                  value={draftFilters.vendor}
                  onChange={(event) => updateDraftFilter("vendor", event.target.value)}
                  className="h-14 rounded-2xl border-border/80 px-5 text-base shadow-none"
                >
                  <option value="all">Vendors</option>
                  {vendorOptions.map(([username, sellerName]) => (
                    <option key={username} value={username}>
                      {sellerName} (@{username})
                    </option>
                  ))}
                </Select>

                <Select
                  value={draftFilters.game}
                  onChange={(event) => updateDraftFilter("game", event.target.value)}
                  className="h-14 rounded-2xl border-border/80 px-5 text-base shadow-none"
                >
                    <option value="all">All Accounts</option>
                  {gameOptions.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-3 xl:grid-cols-5">
                <Select
                  value={draftFilters.platform}
                  onChange={(event) => updateDraftFilter("platform", event.target.value)}
                  className="h-14 rounded-2xl border-border/80 px-5 text-base shadow-none"
                >
                  <option value="all">All Platforms</option>
                  {platformOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </Select>

                <Select
                  value={draftFilters.status}
                  onChange={(event) => updateDraftFilter("status", event.target.value)}
                  className="h-14 rounded-2xl border-border/80 px-5 text-base shadow-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                </Select>

                <Select
                  value={draftFilters.sortBy}
                  onChange={(event) => updateDraftFilter("sortBy", event.target.value)}
                  className="h-14 rounded-2xl border-border/80 px-5 text-base shadow-none"
                >
                  <option value="latest">Latest</option>
                  <option value="lowest_price">Lowest price</option>
                  <option value="highest_price">Highest price</option>
                  <option value="most_rated">Most rated</option>
                  <option value="top_sellers">Top sellers</option>
                </Select>

                <button
                  type="submit"
                  className={buttonClassName({
                    size: "lg",
                    className: "h-14 w-full rounded-2xl"
                  })}
                  disabled={minPriceInvalid || maxPriceInvalid}
                >
                  Filter
                </button>

                <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm xl:col-span-2">
                  <span className="text-muted-foreground">
                    {sortedListings.length}{" "}
                    {sortedListings.length === 1 ? "listing found" : "listings found"}
                  </span>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="font-semibold text-primary transition hover:text-primary-dark"
                    >
                      Clear all
                    </button>
                  ) : (
                    <span className="font-medium text-muted-foreground">Live marketplace filters</span>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : null}

        {sortedListings.length === 0 ? (
          <Card className="border-border/70">
            <CardContent className="p-8 text-center sm:p-10">
              <h3 className="font-heading text-2xl font-semibold text-foreground">
                No listings match these filters.
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Try a wider price range or switch to a different vendor, game, or platform.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="h-full"
              >
                {(() => {
                  const detailHref =
                    context === "account"
                      ? `/account/marketplace/${listing.id}`
                      : `/marketplace/${listing.id}`;
                  const isSaved = savedListingIds.includes(listing.id);
                  const isInCart = cartListingIds.includes(listing.id);
                  const isSold = listing.status === "sold";
                  const actionButtonBase =
                    "inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition duration-200 disabled:cursor-not-allowed disabled:opacity-60";
                  const cartButtonClassName = cn(
                    actionButtonBase,
                    isInCart
                      ? "border-primary bg-primary text-white shadow-[0_16px_30px_-18px_rgba(0,87,255,0.85)]"
                      : "border-border/80 bg-white text-foreground hover:border-primary/20 hover:bg-primary-soft hover:text-primary"
                  );
                  const saveButtonClassName = cn(
                    actionButtonBase,
                    isSaved
                      ? "border-rose-500 bg-rose-500 text-white shadow-[0_16px_30px_-18px_rgba(244,63,94,0.75)]"
                      : "border-border/80 bg-white text-foreground hover:border-primary/20 hover:bg-primary-soft hover:text-primary"
                  );

                  if (context === "account") {
                    return (
                      <Card className="group flex h-full flex-col overflow-hidden border-border/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-48px_rgba(6,43,99,0.45)]">
                        <Link href={detailHref} className="relative block p-3 pb-0">
                          <ListingPhotoGrid listing={listing} className="rounded-[28px]" />
                          <div className="pointer-events-none absolute inset-x-6 top-6 flex items-start justify-between gap-3">
                            <Badge
                              variant={listing.status === "sold" ? "danger" : "success"}
                              className="border border-white/20 bg-white/95 px-4 py-2 text-sm font-semibold shadow-sm ring-0"
                            >
                              {listing.status === "sold" ? "Sold" : "Active"}
                            </Badge>
                            {listing.seller_tag === "top_seller" ? (
                              <Badge
                                variant="info"
                                className="border border-white/20 bg-white/95 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] shadow-sm ring-0"
                              >
                                Top Seller
                              </Badge>
                            ) : null}
                          </div>
                        </Link>
                        <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
                          <div className="flex items-start justify-between gap-4">
                            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                              {listing.game}
                            </span>
                            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600 ring-1 ring-inset ring-amber-100">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span>{listing.seller_rating?.toFixed(1) ?? "0.0"}</span>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            <Link href={detailHref}>
                              <h3 className="font-heading text-[1.55rem] font-semibold leading-tight text-foreground transition group-hover:text-primary-dark">
                                {listing.title}
                              </h3>
                            </Link>
                            <p className="min-h-[4.5rem] text-[15px] leading-7 text-muted-foreground">
                              {listing.description}
                            </p>
                          </div>

                          <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/70 pt-5">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                @{listing.seller_username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {listing.seller_reviews ?? 0}{" "}
                                {(listing.seller_reviews ?? 0) === 1 ? "buyer rating" : "buyer ratings"}
                              </p>
                              <p className="font-heading text-[2.15rem] font-semibold leading-none text-foreground">
                                {formatCurrency(listing.price)}
                              </p>
                            </div>

                            <div className="w-[10.75rem] shrink-0 space-y-2">
                              <div className="flex items-center gap-2">
                                <form action={addToCartAction}>
                                  <input type="hidden" name="listingId" value={listing.id} />
                                  <input type="hidden" name="returnTo" value={pathname} />
                                  <button
                                    type="submit"
                                    disabled={isSold}
                                    aria-label={isInCart ? "Remove from cart" : "Add to cart"}
                                    title={isInCart ? "Remove from cart" : "Add to cart"}
                                    className={cartButtonClassName}
                                  >
                                    <ShoppingCart
                                      className="h-[18px] w-[18px] shrink-0"
                                      strokeWidth={isInCart ? 2.75 : 2.35}
                                    />
                                  </button>
                                </form>
                                <form action={toggleSavedListingAction}>
                                  <input type="hidden" name="listingId" value={listing.id} />
                                  <input type="hidden" name="returnTo" value={pathname} />
                                  <button
                                    type="submit"
                                    aria-label={isSaved ? "Remove from saved listings" : "Save for later"}
                                    title={isSaved ? "Saved for later" : "Save for later"}
                                    className={saveButtonClassName}
                                  >
                                    <Heart
                                      className={`h-[18px] w-[18px] shrink-0 ${isSaved ? "fill-current" : ""}`}
                                      strokeWidth={isSaved ? 2.75 : 2.35}
                                    />
                                  </button>
                                </form>
                              </div>
                              <form action={buyNowAction}>
                                <input type="hidden" name="listingId" value={listing.id} />
                                <button
                                  type="submit"
                                  disabled={isSold}
                                  className={buttonClassName({
                                    variant: isSold ? "secondary" : "primary",
                                    size: "md",
                                    className:
                                      "w-full justify-center rounded-2xl whitespace-nowrap px-5"
                                  })}
                                >
                                  {isSold ? "Sold Out" : "Buy Now"}
                                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                                </button>
                              </form>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <Link href={detailHref} className="block h-full">
                      <Card className="group flex h-full flex-col overflow-hidden border-border/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-48px_rgba(6,43,99,0.45)]">
                        <div className="relative p-3 pb-0">
                          <ListingPhotoGrid listing={listing} className="rounded-[28px]" />
                          <div className="pointer-events-none absolute inset-x-6 top-6 flex items-start justify-between gap-3">
                            <Badge
                              variant={listing.status === "sold" ? "danger" : "success"}
                              className="border border-white/20 bg-white/95 px-4 py-2 text-sm font-semibold shadow-sm ring-0"
                            >
                              {listing.status === "sold" ? "Sold" : "Active"}
                            </Badge>
                            {listing.seller_tag === "top_seller" ? (
                              <Badge
                                variant="info"
                                className="border border-white/20 bg-white/95 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] shadow-sm ring-0"
                              >
                                Top Seller
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
                          <div className="flex items-start justify-between gap-4">
                            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                              {listing.game}
                            </span>
                            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600 ring-1 ring-inset ring-amber-100">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span>{listing.seller_rating?.toFixed(1) ?? "0.0"}</span>
                            </div>
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
                              <p className="text-sm text-muted-foreground">
                                {listing.seller_reviews ?? 0}{" "}
                                {(listing.seller_reviews ?? 0) === 1 ? "buyer rating" : "buyer ratings"}
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
                  );
                })()}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
