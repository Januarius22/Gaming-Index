import "server-only";
import {
  getDemoKycSubmissions,
  getDemoListings,
  getDemoProfiles
} from "@/lib/demoStore";
import { normalizeProfile } from "@/lib/profile";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type {
  ActivityItem,
  DashboardStat,
  KycSubmission,
  Listing,
  Order,
  Profile
} from "@/types";

const seededMarketplaceListings: Listing[] = [
  {
    id: "seed-1",
    seller_id: "seed-seller-1",
    seller_name: "Verified Seller",
    seller_username: "vxmarket",
    game: "COD",
    title: "COD Ranked Account with Premium Weapons",
    description: "Well-maintained account with competitive loadouts and full access.",
    price: 220,
    platform: "Mobile",
    account_level: "Level 180",
    login_method: "Email",
    extra_notes: "Includes battle pass history.",
    status: "approved",
    created_at: "2026-05-10T00:00:00.000Z"
  },
  {
    id: "seed-2",
    seller_id: "seed-seller-2",
    seller_name: "Trusted Trader",
    seller_username: "safeff",
    game: "Free Fire",
    title: "Free Fire Heroic Account",
    description: "High-rank account with rare bundles and active progression.",
    price: 145,
    platform: "Mobile",
    account_level: "Level 74",
    login_method: "Facebook",
    extra_notes: "Original owner verified.",
    status: "approved",
    created_at: "2026-05-09T00:00:00.000Z"
  },
  {
    id: "seed-3",
    seller_id: "seed-seller-3",
    seller_name: "Arena Vault",
    seller_username: "arenavault",
    game: "Fortnite",
    title: "Fortnite Locker Account",
    description: "Clean locker account with legacy cosmetics and linked email access.",
    price: 390,
    platform: "Console",
    account_level: "Level 112",
    login_method: "Email",
    extra_notes: "Full recovery details provided after sale.",
    status: "approved",
    created_at: "2026-05-08T00:00:00.000Z"
  }
];

const seededActivity: ActivityItem[] = [
  {
    id: "activity-1",
    title: "Account-first flow ready",
    detail: "Public browsing, account dashboards, seller tools, and admin reviews now live in separate workspaces.",
    created_at: "2026-05-14T00:00:00.000Z"
  },
  {
    id: "activity-2",
    title: "Auth connected",
    detail: "Email and password flows are prepared for Supabase or demo mode.",
    created_at: "2026-05-14T00:00:00.000Z"
  }
];

async function getSupabaseProfiles() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return ((data as Profile[] | null) ?? []).map((profile) => normalizeProfile(profile));
}

async function getSupabaseListings() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as Listing[] | null) ?? [];
}

async function getSupabaseKycQueue() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("kyc_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as KycSubmission[] | null) ?? [];
}

async function getSupabaseOrders() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as Order[] | null) ?? [];
}

async function getAllApprovedMarketplaceListings() {
  if (!hasSupabaseEnv) {
    const demoListings = (await getDemoListings()).filter(
      (listing) => listing.status === "approved"
    );
    return [...demoListings, ...seededMarketplaceListings].sort((left, right) =>
      right.created_at.localeCompare(left.created_at)
    );
  }

  try {
    const listings = (await getSupabaseListings()).filter(
      (listing) => listing.status === "approved"
    );

    return (listings.length > 0 ? listings : seededMarketplaceListings).sort((left, right) =>
      right.created_at.localeCompare(left.created_at)
    );
  } catch {
    return seededMarketplaceListings;
  }
}

export async function getMarketplaceListings(limit = 6) {
  const listings = await getAllApprovedMarketplaceListings();
  return listings.slice(0, limit);
}

export async function getMarketplaceCatalog() {
  return getAllApprovedMarketplaceListings();
}

export async function getMarketplaceListingById(listingId: string) {
  const listings = await getAllApprovedMarketplaceListings();
  return listings.find((listing) => listing.id === listingId) ?? null;
}

export async function getSellerDashboardStats(profile: Profile): Promise<DashboardStat[]> {
  if (!hasSupabaseEnv) {
    const listings = (await getDemoListings()).filter(
      (listing) => listing.seller_id === profile.id
    );

    return [
      {
        label: "Total Listings",
        value: String(listings.length),
        helper: "All account listings"
      },
      {
        label: "Active Listings",
        value: String(listings.filter((listing) => listing.status === "approved").length),
        helper: "Approved and live"
      },
      {
        label: "Pending Orders",
        value: "0",
        helper: "Orders awaiting action"
      },
      {
        label: "Wallet Balance",
        value: "$0",
        helper: "Dummy wallet balance"
      }
    ];
  }

  try {
    const supabase = await getSupabaseServerClient();

    const [
      totalListingsResult,
      activeListingsResult,
      pendingOrdersResult
    ] = await Promise.all([
      supabase
        ?.from("listings")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", profile.id),
      supabase
        ?.from("listings")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", profile.id)
        .eq("status", "approved"),
      supabase
        ?.from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", profile.id)
        .eq("status", "pending")
    ]);

    return [
      {
        label: "Total Listings",
        value: String(totalListingsResult?.count ?? 0),
        helper: "All account listings"
      },
      {
        label: "Active Listings",
        value: String(activeListingsResult?.count ?? 0),
        helper: "Approved and live"
      },
      {
        label: "Pending Orders",
        value: String(pendingOrdersResult?.count ?? 0),
        helper: "Orders awaiting action"
      },
      {
        label: "Wallet Balance",
        value: "$0",
        helper: "Dummy wallet balance"
      }
    ];
  } catch {
    return [
      { label: "Total Listings", value: "0", helper: "All account listings" },
      { label: "Active Listings", value: "0", helper: "Approved and live" },
      { label: "Pending Orders", value: "0", helper: "Orders awaiting action" },
      { label: "Wallet Balance", value: "$0", helper: "Dummy wallet balance" }
    ];
  }
}

export async function getAccountDashboardStats(profile: Profile): Promise<DashboardStat[]> {
  return [
    {
      label: "Marketplace Access",
      value: "Live",
      helper: "Browse public and in-account listings"
    },
    {
      label: "Seller Access",
      value: profile.seller_enabled ? "Enabled" : "Locked",
      helper: profile.seller_enabled
        ? "Seller workspace is ready"
        : "Unlock it to start KYC and list accounts"
    },
    {
      label: "Active Orders",
      value: "0",
      helper: "Purchase history will appear here"
    },
    {
      label: "Saved Listings",
      value: "0",
      helper: "Bookmarks can live here later"
    }
  ];
}

export async function getSellerListings(profile: Profile) {
  if (!hasSupabaseEnv) {
    return (await getDemoListings()).filter((listing) => listing.seller_id === profile.id);
  }

  try {
    const listings = await getSupabaseListings();
    return listings.filter((listing) => listing.seller_id === profile.id);
  } catch {
    return [];
  }
}

export async function getSellerOrders(profile: Profile) {
  if (!hasSupabaseEnv) {
    return [] as Order[];
  }

  try {
    const orders = await getSupabaseOrders();
    const listings = await getSupabaseListings();
    const listingMap = new Map(listings.map((listing) => [listing.id, listing.title]));

    return orders
      .filter((order) => order.seller_id === profile.id)
      .map((order) => ({
        ...order,
        listing_title: listingMap.get(order.listing_id) ?? "Listing"
      }));
  } catch {
    return [] as Order[];
  }
}

export async function getAdminDashboardStats() {
  if (!hasSupabaseEnv) {
    const profiles = await getDemoProfiles();
    const listings = await getDemoListings();
    const kyc = await getDemoKycSubmissions();

    return {
      stats: [
        { label: "Total Users", value: String(profiles.length), helper: "Registered users" },
        {
          label: "Total Sellers",
          value: String(profiles.filter((profile) => profile.seller_enabled).length),
          helper: "Seller-enabled users"
        },
        {
          label: "Pending KYC",
          value: String(kyc.filter((submission) => submission.status === "pending").length),
          helper: "Awaiting review"
        },
        {
          label: "Pending Listings",
          value: String(
            listings.filter((listing) => listing.status === "pending_review").length
          ),
          helper: "Waiting for approval"
        },
        { label: "Total Sales", value: "$0", helper: "Dummy transaction total" }
      ],
      activity: seededActivity
    };
  }

  try {
    const [profiles, listings, kyc, orders] = await Promise.all([
      getSupabaseProfiles(),
      getSupabaseListings(),
      getSupabaseKycQueue(),
      getSupabaseOrders()
    ]);

    const totalSales = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + Number(order.amount), 0);

    return {
      stats: [
        { label: "Total Users", value: String(profiles.length), helper: "Registered users" },
        {
          label: "Total Sellers",
          value: String(profiles.filter((profile) => profile.seller_enabled).length),
          helper: "Seller-enabled users"
        },
        {
          label: "Pending KYC",
          value: String(kyc.filter((submission) => submission.status === "pending").length),
          helper: "Awaiting review"
        },
        {
          label: "Pending Listings",
          value: String(
            listings.filter((listing) => listing.status === "pending_review").length
          ),
          helper: "Waiting for approval"
        },
        {
          label: "Total Sales",
          value: `$${Math.round(totalSales)}`,
          helper: "Completed order value"
        }
      ],
      activity: seededActivity
    };
  } catch {
    return {
      stats: [
        { label: "Total Users", value: "0", helper: "Registered users" },
        { label: "Total Sellers", value: "0", helper: "Seller-enabled users" },
        { label: "Pending KYC", value: "0", helper: "Awaiting review" },
        { label: "Pending Listings", value: "0", helper: "Waiting for approval" },
        { label: "Total Sales", value: "$0", helper: "Completed order value" }
      ],
      activity: seededActivity
    };
  }
}

export async function getAdminUsers() {
  if (!hasSupabaseEnv) {
    return getDemoProfiles();
  }

  try {
    return await getSupabaseProfiles();
  } catch {
    return [];
  }
}

export async function getAdminSellers() {
  const users = await getAdminUsers();
  return users.filter((user) => user.role !== "admin" && user.seller_enabled);
}

export async function getAdminKycQueue() {
  if (!hasSupabaseEnv) {
    return getDemoKycSubmissions();
  }

  try {
    return await getSupabaseKycQueue();
  } catch {
    return [];
  }
}

export async function getAdminListingQueue() {
  if (!hasSupabaseEnv) {
    return getDemoListings();
  }

  try {
    return await getSupabaseListings();
  } catch {
    return [];
  }
}

export async function getAdminOrders() {
  if (!hasSupabaseEnv) {
    return [] as Order[];
  }

  try {
    const orders = await getSupabaseOrders();
    const listings = await getSupabaseListings();
    const listingMap = new Map(listings.map((listing) => [listing.id, listing.title]));

    return orders.map((order) => ({
      ...order,
      listing_title: listingMap.get(order.listing_id) ?? "Listing"
    }));
  } catch {
    return [] as Order[];
  }
}
