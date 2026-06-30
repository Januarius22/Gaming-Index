import "server-only";
import {
  getCartListingIds,
  getSavedListingIds
} from "@/lib/buyerStore";
import {
  getDemoOrders,
  getDemoListingDeliveryDetails,
  getDemoKycSubmissions,
  getDemoListings,
  getDemoProfiles,
  getDemoSellerRatings
} from "@/lib/demoStore";
import { normalizeProfile } from "@/lib/profile";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  formatCompactCurrency,
  getListingHistoryTimestamp,
  isListingMarketplaceVisible,
  isOrderPaymentConfirmed
} from "@/lib/utils";
import type {
  ActivityItem,
  DashboardStat,
  Dispute,
  DisputeAttachment,
  DisputeMessage,
  KycSubmission,
  Listing,
  ListingDeliveryDetails,
  Order,
  Notification,
  Profile,
  SellerRating,
  SellerEnforcement,
  SiteFeedback,
  SuspensionAppeal,
  Wallet,
  WalletTransaction,
  WithdrawalRequest
} from "@/types";

const KYC_STORAGE_BUCKET = "kyc-documents";
const LISTING_STORAGE_BUCKET = "listing-media";
const DISPUTE_EVIDENCE_BUCKET = "dispute-evidence";

const seededMarketplaceListings: Listing[] = [
  {
    id: "seed-1",
    seller_id: "seed-seller-1",
    seller_name: "Verified Seller",
    seller_username: "vxmarket",
    game: "CODM",
    title: "CODM Ranked Account with Premium Weapons",
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
    game: "DLS",
    title: "DLS Elite Squad Account",
    description: "Strong Dream League squad with upgraded stadium progress and rare players.",
    price: 190,
    platform: "Mobile",
    account_level: "Level 112",
    login_method: "Email",
    extra_notes: "Includes event progress and stacked coin balance.",
    status: "sold",
    sold_at: "2026-05-08T03:00:00.000Z",
    withdrawn_at: null,
    admin_note: "",
    admin_action_at: null,
    admin_action_by: null,
    created_at: "2026-05-08T00:00:00.000Z"
  },
  {
    id: "seed-4",
    seller_id: "seed-seller-4",
    seller_name: "Prime Arena",
    seller_username: "primearena",
    game: "PUBG Mobile",
    title: "PUBG Ace Account with Premium Skins",
    description: "Late-season account with mythic outfit pieces and premium inventory.",
    price: 275,
    platform: "Mobile",
    account_level: "Level 96",
    login_method: "Google",
    extra_notes: "Season rewards fully unlocked.",
    status: "approved",
    sold_at: null,
    withdrawn_at: null,
    admin_note: "",
    admin_action_at: null,
    admin_action_by: null,
    created_at: "2026-05-11T00:00:00.000Z"
  }
];

const seededSellerMetrics: Record<string, { rating: number; reviews: number }> = {
  "seed-seller-1": { rating: 4.9, reviews: 18 },
  "seed-seller-2": { rating: 4.8, reviews: 11 },
  "seed-seller-3": { rating: 4.2, reviews: 6 },
  "seed-seller-4": { rating: 4.7, reviews: 13 }
};

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

const visibleSeededMarketplaceListings = seededMarketplaceListings.filter((listing) =>
  isListingMarketplaceVisible(normalizeListing(listing))
);

function normalizeListing(listing: Listing): Listing {
  return {
    ...listing,
    status: listing.status === "pending_review" ? "approved" : listing.status,
    sold_at: listing.sold_at ?? null,
    withdrawn_at: listing.withdrawn_at ?? null,
    admin_note: listing.admin_note ?? "",
    admin_action_at: listing.admin_action_at ?? null,
    admin_action_by: listing.admin_action_by ?? null
  };
}

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

  const listings = (data as Listing[] | null) ?? [];
  const sellerIds = Array.from(
    new Set(
      listings
        .map((listing) => listing.seller_id)
        .filter((sellerId): sellerId is string => Boolean(sellerId))
    )
  );
  const { data: profileRows } =
    sellerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, username, is_banned")
          .in("id", sellerIds)
      : { data: [] as Array<{ id: string; full_name: string; username: string; is_banned: boolean }> };
  const profileMap = new Map(
    ((profileRows as Array<{ id: string; full_name: string; username: string; is_banned: boolean }> | null) ?? []).map(
      (profile) => [profile.id, profile]
    )
  );

  return Promise.all(
    listings.map(async (listing) => {
      const normalizedListing = normalizeListing(listing);
      const sellerProfile = profileMap.get(normalizedListing.seller_id);

      return {
        ...normalizedListing,
        seller_name:
          normalizedListing.seller_name ||
          sellerProfile?.full_name ||
          "Seller",
        seller_username:
          normalizedListing.seller_username ||
          sellerProfile?.username ||
          "seller",
        seller_is_banned: sellerProfile?.is_banned ?? false,
        image_urls: await getSignedListingAssetUrls(
          supabase,
          Array.isArray(listing.image_paths) ? listing.image_paths : []
        )
      };
    })
  );
}

async function enrichKycSubmissions(
  submissions: KycSubmission[],
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>
) {
  return Promise.all(
    submissions.map(async (submission) => {
      const [documentFrontUrl, documentBackUrl, selfieFileUrl] = await Promise.all([
        getSignedKycAssetUrl(supabase, submission.document_front_path),
        getSignedKycAssetUrl(supabase, submission.document_back_path),
        getSignedKycAssetUrl(supabase, submission.selfie_file_path)
      ]);

      return {
        ...submission,
        document_front_url: documentFrontUrl,
        document_back_url: documentBackUrl,
        selfie_file_url: selfieFileUrl,
        proof_of_address_url: ""
      };
    })
  );
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

  const submissions = (data as KycSubmission[] | null) ?? [];

  return enrichKycSubmissions(submissions, supabase);
}

async function getSignedKycAssetUrl(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  path?: string
) {
  if (!path) {
    return "";
  }

  const { data, error } = await supabase.storage
    .from(KYC_STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error) {
    return "";
  }

  return data?.signedUrl ?? "";
}

async function getSignedListingAssetUrls(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  paths: string[]
) {
  const cleanedPaths = paths.filter(Boolean).slice(0, 1);

  if (cleanedPaths.length === 0) {
    return [];
  }

  const uploads = await Promise.all(
    cleanedPaths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(LISTING_STORAGE_BUCKET)
        .createSignedUrl(path, 60 * 60);

      if (error) {
        return "";
      }

      return data?.signedUrl ?? "";
    })
  );

  return uploads.filter(Boolean);
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

function normalizeOrder(order: Order, listingTitle?: string | null): Order {
  return {
    ...order,
    buyer_id: order.buyer_id ?? null,
    buyer_phone: order.buyer_phone ?? "",
    payment_status: order.payment_status ?? "pending",
    payment_provider: order.payment_provider ?? "",
    payment_reference: order.payment_reference ?? "",
    payment_channel: order.payment_channel ?? "",
    payment_last4: order.payment_last4 ?? "",
    paid_at: order.paid_at ?? null,
    escrow_status: order.escrow_status ?? "not_started",
    seller_hold_expires_at: order.seller_hold_expires_at ?? null,
    seller_released_at: order.seller_released_at ?? null,
    seller_released_by: order.seller_released_by ?? null,
    listing_title: order.listing_title || listingTitle || "Listing"
  };
}

async function getSupabaseSellerRatings() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("seller_ratings")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as SellerRating[] | null) ?? [];
}

async function getSupabaseListingDeliveryDetailsForListing(listingId: string) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("listing_delivery_details")
    .select("*")
    .eq("listing_id", listingId)
    .maybeSingle();

  return (data as ListingDeliveryDetails | null) ?? null;
}

function createEmptyWallet(profileId: string): Wallet {
  return {
    profile_id: profileId,
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0,
    total_deposited: 0,
    total_withdrawn: 0,
    created_at: "",
    updated_at: ""
  };
}

function normalizeWallet(wallet: Wallet | null | undefined, profileId: string): Wallet {
  const fallback = createEmptyWallet(profileId);

  if (!wallet) {
    return fallback;
  }

  return {
    profile_id: wallet.profile_id ?? profileId,
    available_balance: Number(wallet.available_balance ?? 0),
    pending_balance: Number(wallet.pending_balance ?? 0),
    total_earned: Number(wallet.total_earned ?? 0),
    total_deposited: Number(wallet.total_deposited ?? 0),
    total_withdrawn: Number(wallet.total_withdrawn ?? 0),
    created_at: wallet.created_at ?? "",
    updated_at: wallet.updated_at ?? ""
  };
}

export async function getProfileWallet(profileId: string) {
  if (!hasSupabaseEnv) {
    return createEmptyWallet(profileId);
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return createEmptyWallet(profileId);
    }

    const { data } = await supabase
      .from("wallets")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();

    return normalizeWallet(data as Wallet | null, profileId);
  } catch {
    return createEmptyWallet(profileId);
  }
}

function normalizeWithdrawalRequest(
  request: WithdrawalRequest,
  profile?: Pick<Profile, "full_name" | "email" | "username"> | null
): WithdrawalRequest {
  return {
    ...request,
    amount: Number(request.amount ?? 0),
    bank_name: request.bank_name ?? "",
    account_number: request.account_number ?? "",
    account_name: request.account_name ?? "",
    status: request.status ?? "pending",
    admin_note: request.admin_note ?? "",
    reviewed_by: request.reviewed_by ?? null,
    reviewed_at: request.reviewed_at ?? null,
    paid_at: request.paid_at ?? null,
    profile_name: profile?.full_name,
    profile_email: profile?.email,
    profile_username: profile?.username
  };
}

export async function getSellerWithdrawalRequests(profileId: string) {
  if (!hasSupabaseEnv) {
    return [] as WithdrawalRequest[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    return ((data as WithdrawalRequest[] | null) ?? []).map((request) =>
      normalizeWithdrawalRequest(request)
    );
  } catch {
    return [] as WithdrawalRequest[];
  }
}

export async function getProfileWithdrawalRequests(profileId: string) {
  return getSellerWithdrawalRequests(profileId);
}

export async function getProfileWalletTransactions(profileId: string, limit = 10) {
  if (!hasSupabaseEnv) {
    return [] as WalletTransaction[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("wallet_transactions")
      .select("id, wallet_profile_id, type, direction, balance_bucket, status, amount, description, created_at")
      .eq("wallet_profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data as WalletTransaction[] | null) ?? []).map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount ?? 0),
      description: transaction.description ?? ""
    }));
  } catch {
    return [] as WalletTransaction[];
  }
}

function normalizeNotification(notification: Notification): Notification {
  return {
    ...notification,
    type: notification.type ?? "general",
    title: notification.title ?? "Notification",
    message: notification.message ?? "",
    link_path: notification.link_path ?? "",
    metadata:
      notification.metadata && typeof notification.metadata === "object"
        ? notification.metadata
        : {},
    read_at: notification.read_at ?? null
  };
}

export async function getProfileNotifications(profileId: string, limit = 50) {
  if (!hasSupabaseEnv) {
    return [] as Notification[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data as Notification[] | null) ?? []).map((notification) =>
      normalizeNotification(notification)
    );
  } catch {
    return [] as Notification[];
  }
}

export async function getAdminWithdrawalRequests() {
  if (!hasSupabaseEnv) {
    return [] as WithdrawalRequest[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    const requests = (data as WithdrawalRequest[] | null) ?? [];
    const profileIds = Array.from(new Set(requests.map((request) => request.profile_id)));
    const { data: profiles } =
      profileIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name, email, username")
            .in("id", profileIds)
        : { data: [] as Array<Profile & { id: string }> };
    const profileMap = new Map(
      ((profiles as Array<Profile & { id: string }> | null) ?? []).map((profile) => [
        profile.id,
        profile
      ])
    );

    return requests.map((request) =>
      normalizeWithdrawalRequest(request, profileMap.get(request.profile_id))
    );
  } catch {
    return [] as WithdrawalRequest[];
  }
}

function normalizeSuspensionAppeal(
  appeal: SuspensionAppeal,
  profile?: Pick<Profile, "full_name" | "email" | "username" | "banned_reason" | "banned_at"> | null
): SuspensionAppeal {
  return {
    ...appeal,
    email: appeal.email ?? "",
    phone_number: appeal.phone_number ?? "",
    appeal_reason: appeal.appeal_reason ?? "",
    status: appeal.status ?? "pending",
    admin_note: appeal.admin_note ?? "",
    reviewed_by: appeal.reviewed_by ?? null,
    reviewed_at: appeal.reviewed_at ?? null,
    profile_name: profile?.full_name,
    profile_email: profile?.email,
    profile_username: profile?.username,
    banned_reason: profile?.banned_reason ?? "",
    banned_at: profile?.banned_at ?? null
  };
}

export async function getAdminSuspensionAppeals() {
  if (!hasSupabaseEnv) {
    return [] as SuspensionAppeal[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("suspension_appeals")
      .select("*")
      .order("created_at", { ascending: false });

    const appeals = (data as SuspensionAppeal[] | null) ?? [];
    const profileIds = Array.from(new Set(appeals.map((appeal) => appeal.profile_id)));
    const { data: profiles } =
      profileIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name, email, username, banned_reason, banned_at")
            .in("id", profileIds)
        : { data: [] as Array<Profile & { id: string }> };
    const profileMap = new Map(
      ((profiles as Array<Profile & { id: string }> | null) ?? []).map((profile) => [
        profile.id,
        profile
      ])
    );

    return appeals.map((appeal) =>
      normalizeSuspensionAppeal(appeal, profileMap.get(appeal.profile_id))
    );
  } catch {
    return [] as SuspensionAppeal[];
  }
}

function normalizeSiteFeedback(
  feedback: SiteFeedback,
  profile?: Pick<Profile, "full_name" | "email" | "username"> | null
): SiteFeedback {
  return {
    ...feedback,
    workspace: feedback.workspace ?? "account",
    category: feedback.category ?? "other",
    rating: feedback.rating ?? null,
    message: feedback.message ?? "",
    status: feedback.status ?? "new",
    admin_note: feedback.admin_note ?? "",
    reviewed_by: feedback.reviewed_by ?? null,
    reviewed_at: feedback.reviewed_at ?? null,
    profile_name: profile?.full_name,
    profile_email: profile?.email,
    profile_username: profile?.username
  };
}

export async function getProfileFeedback(profileId: string) {
  if (!hasSupabaseEnv) {
    return [] as SiteFeedback[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("site_feedback")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    return ((data as SiteFeedback[] | null) ?? []).map((feedback) =>
      normalizeSiteFeedback(feedback)
    );
  } catch {
    return [] as SiteFeedback[];
  }
}

export async function getAdminFeedback() {
  if (!hasSupabaseEnv) {
    return [] as SiteFeedback[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("site_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    const feedbackItems = (data as SiteFeedback[] | null) ?? [];
    const profileIds = Array.from(new Set(feedbackItems.map((feedback) => feedback.profile_id)));
    const { data: profiles } =
      profileIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name, email, username")
            .in("id", profileIds)
        : { data: [] as Array<Profile & { id: string }> };
    const profileMap = new Map(
      ((profiles as Array<Profile & { id: string }> | null) ?? []).map((profile) => [
        profile.id,
        profile
      ])
    );

    return feedbackItems.map((feedback) =>
      normalizeSiteFeedback(feedback, profileMap.get(feedback.profile_id))
    );
  } catch {
    return [] as SiteFeedback[];
  }
}

function normalizeDispute(
  dispute: Dispute,
  order?: Order | null,
  buyer?: Pick<Profile, "full_name" | "email"> | null,
  seller?: Pick<Profile, "full_name" | "username"> | null
): Dispute {
  return {
    ...dispute,
    reason: dispute.reason ?? "",
    details: dispute.details ?? "",
    status: dispute.status ?? "open",
    admin_note: dispute.admin_note ?? "",
    resolution: dispute.resolution ?? "",
    opened_by: dispute.opened_by ?? null,
    reviewed_by: dispute.reviewed_by ?? null,
    reviewed_at: dispute.reviewed_at ?? null,
    closed_at: dispute.closed_at ?? null,
    last_message_at: dispute.last_message_at ?? dispute.created_at,
    listing_title: order?.listing_title ?? dispute.listing_title ?? "",
    buyer_name: buyer?.full_name ?? order?.buyer_name ?? dispute.buyer_name ?? "",
    buyer_email: buyer?.email ?? order?.buyer_email ?? dispute.buyer_email ?? "",
    seller_name: seller?.full_name ?? dispute.seller_name ?? "",
    seller_username: seller?.username ?? dispute.seller_username ?? "",
    amount: Number(order?.amount ?? dispute.amount ?? 0)
  };
}

export async function getAdminDisputes() {
  if (!hasSupabaseEnv) {
    return [] as Dispute[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from("disputes")
      .select("*")
      .order("last_message_at", { ascending: false });

    const disputes = (data as Dispute[] | null) ?? [];
    const orderIds = Array.from(new Set(disputes.map((dispute) => dispute.order_id)));
    const profileIds = Array.from(
      new Set(disputes.flatMap((dispute) => [dispute.buyer_id, dispute.seller_id]))
    );
    const { data: orders } =
      orderIds.length > 0
        ? await supabase
            .from("orders")
            .select("*")
            .in("id", orderIds)
        : { data: [] as Order[] };
    const { data: profiles } =
      profileIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name, email, username")
            .in("id", profileIds)
        : { data: [] as Array<Profile & { id: string }> };
    const orderMap = new Map(
      ((orders as Order[] | null) ?? []).map((order) => [
        order.id,
        normalizeOrder(order)
      ])
    );
    const profileMap = new Map(
      ((profiles as Array<Profile & { id: string }> | null) ?? []).map((profile) => [
        profile.id,
        profile
      ])
    );

    return disputes.map((dispute) =>
      normalizeDispute(
        dispute,
        orderMap.get(dispute.order_id),
        profileMap.get(dispute.buyer_id),
        profileMap.get(dispute.seller_id)
      )
    );
  } catch {
    return [] as Dispute[];
  }
}

async function getDisputeOrderMap(disputes: Dispute[]) {
  const orderIds = Array.from(new Set(disputes.map((dispute) => dispute.order_id)));

  if (orderIds.length === 0) {
    return new Map<string, Order>();
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return new Map<string, Order>();
  }

  const { data } = await supabase
    .from("orders")
    .select("*")
    .in("id", orderIds);

  return new Map(
    ((data as Order[] | null) ?? []).map((order) => [
      order.id,
      normalizeOrder(order)
    ])
  );
}

async function getDisputeProfileMap(disputes: Dispute[]) {
  const profileIds = Array.from(
    new Set(disputes.flatMap((dispute) => [dispute.buyer_id, dispute.seller_id]))
  );

  if (profileIds.length === 0) {
    return new Map<string, Pick<Profile, "id" | "full_name" | "email" | "username">>();
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return new Map<string, Pick<Profile, "id" | "full_name" | "email" | "username">>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, username")
    .in("id", profileIds);

  return new Map(
    ((data as Array<Pick<Profile, "id" | "full_name" | "email" | "username">> | null) ?? []).map(
      (profile) => [profile.id, profile]
    )
  );
}

async function enrichDisputes(disputes: Dispute[]) {
  const [orderMap, profileMap] = await Promise.all([
    getDisputeOrderMap(disputes),
    getDisputeProfileMap(disputes)
  ]);

  return disputes.map((dispute) =>
    normalizeDispute(
      dispute,
      orderMap.get(dispute.order_id),
      profileMap.get(dispute.buyer_id),
      profileMap.get(dispute.seller_id)
    )
  );
}

export async function getBuyerDisputeCandidates(profile: Profile) {
  const [orders, disputes] = await Promise.all([
    getBuyerOrders(profile),
    getBuyerDisputes(profile)
  ]);
  const disputeByOrderId = new Map(disputes.map((dispute) => [dispute.order_id, dispute]));

  return orders
    .filter((order) =>
      order.payment_status === "successful" &&
      (order.status === "processing" || order.status === "completed") &&
      order.escrow_status !== "refunded"
    )
    .map((order) => ({
      order,
      dispute: disputeByOrderId.get(order.id) ?? null
    }));
}

export async function getBuyerDisputes(profile: Profile) {
  if (!hasSupabaseEnv) {
    return [] as Dispute[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [] as Dispute[];
    }

    const { data } = await supabase
      .from("disputes")
      .select("*")
      .eq("buyer_id", profile.id)
      .order("last_message_at", { ascending: false });

    return enrichDisputes((data as Dispute[] | null) ?? []);
  } catch {
    return [] as Dispute[];
  }
}

export async function getSellerDisputes(profile: Profile) {
  if (!hasSupabaseEnv) {
    return [] as Dispute[];
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return [] as Dispute[];
    }

    const { data } = await supabase
      .from("disputes")
      .select("*")
      .eq("seller_id", profile.id)
      .order("last_message_at", { ascending: false });

    return enrichDisputes((data as Dispute[] | null) ?? []);
  } catch {
    return [] as Dispute[];
  }
}

export async function getLatestSellerEnforcement(sellerId: string) {
  if (!hasSupabaseEnv) {
    return null as SellerEnforcement | null;
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return null;
    }

    const { data } = await supabase
      .from("seller_enforcements")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as SellerEnforcement | null) ?? null;
  } catch {
    return null;
  }
}

export async function getDisputeCase(
  profile: Profile,
  disputeId: string,
  scope: "buyer" | "seller" | "admin"
) {
  if (!hasSupabaseEnv) {
    return null as {
      dispute: Dispute;
      order: Order | null;
      messages: DisputeMessage[];
      buyerProfile: Pick<Profile, "id" | "full_name" | "email" | "username" | "seller_strikes" | "seller_restricted_until" | "seller_restriction_reason"> | null;
      sellerProfile: Pick<Profile, "id" | "full_name" | "email" | "username" | "seller_strikes" | "seller_restricted_until" | "seller_restriction_reason"> | null;
    } | null;
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return null;
    }

    const { data: disputeData } = await supabase
      .from("disputes")
      .select("*")
      .eq("id", disputeId)
      .maybeSingle();

    const dispute = disputeData as Dispute | null;

    if (!dispute) {
      return null;
    }

    const allowed =
      scope === "admin" ||
      (scope === "buyer" && dispute.buyer_id === profile.id) ||
      (scope === "seller" && dispute.seller_id === profile.id);

    if (!allowed) {
      return null;
    }

    const [{ data: orderData }, { data: profilesData }, { data: messagesData }, { data: attachmentsData }] =
      await Promise.all([
        supabase.from("orders").select("*").eq("id", dispute.order_id).maybeSingle(),
        supabase
          .from("profiles")
          .select("id, full_name, email, username, seller_strikes, seller_restricted_until, seller_restriction_reason")
          .in("id", [dispute.buyer_id, dispute.seller_id]),
        supabase
          .from("dispute_messages")
          .select("*")
          .eq("dispute_id", dispute.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("dispute_attachments")
          .select("*")
          .eq("dispute_id", dispute.id)
          .order("created_at", { ascending: true })
      ]);

    const order = orderData ? normalizeOrder(orderData as Order) : null;
    const profileMap = new Map(
      ((profilesData as Array<Pick<Profile, "id" | "full_name" | "email" | "username" | "seller_strikes" | "seller_restricted_until" | "seller_restriction_reason">> | null) ?? []).map(
        (entry) => [entry.id, entry]
      )
    );
    const attachments = (attachmentsData as DisputeAttachment[] | null) ?? [];
    const signedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        const { data } = await supabase.storage
          .from(DISPUTE_EVIDENCE_BUCKET)
          .createSignedUrl(attachment.file_path, 60 * 15);

        return {
          ...attachment,
          duration_seconds:
            attachment.duration_seconds === null || attachment.duration_seconds === undefined
              ? null
              : Number(attachment.duration_seconds),
          file_url: data?.signedUrl
        };
      })
    );
    const attachmentMap = new Map<string, DisputeAttachment[]>();

    signedAttachments.forEach((attachment) => {
      const key = attachment.message_id ?? "";
      attachmentMap.set(key, [...(attachmentMap.get(key) ?? []), attachment]);
    });

    const messages = ((messagesData as DisputeMessage[] | null) ?? []).map((message) => ({
      ...message,
      sender_name:
        message.sender_role === "admin"
          ? "Gaming Index"
          : profileMap.get(message.sender_id)?.full_name ?? message.sender_role,
      attachments: attachmentMap.get(message.id) ?? []
    }));

    return {
      dispute: normalizeDispute(
        dispute,
        order,
        profileMap.get(dispute.buyer_id),
        profileMap.get(dispute.seller_id)
      ),
      order,
      messages,
      buyerProfile: profileMap.get(dispute.buyer_id) ?? null,
      sellerProfile: profileMap.get(dispute.seller_id) ?? null
    };
  } catch {
    return null;
  }
}

function combineSellerMetrics(
  sellerId: string,
  liveRatings: SellerRating[]
): { average: number; reviews: number; tag: "top_seller" | null } {
  const fallback = seededSellerMetrics[sellerId] ?? { rating: 0, reviews: 0 };
  const liveForSeller = liveRatings.filter((rating) => rating.seller_id === sellerId);
  const liveReviews = liveForSeller.length;
  const liveTotal = liveForSeller.reduce((sum, entry) => sum + entry.rating, 0);
  const seededTotal = fallback.rating * fallback.reviews;
  const combinedReviews = fallback.reviews + liveReviews;
  const combinedAverage = combinedReviews > 0 ? (seededTotal + liveTotal) / combinedReviews : 0;
  const tag = combinedAverage >= 4.7 && combinedReviews >= 5 ? "top_seller" : null;

  return {
    average: combinedAverage,
    reviews: combinedReviews,
    tag
  };
}

function enrichMarketplaceListings(listings: Listing[], ratings: SellerRating[]) {
  return listings.map((listing) => {
    const metrics = combineSellerMetrics(listing.seller_id, ratings);

    return {
      ...listing,
      seller_rating: Number(metrics.average.toFixed(1)),
      seller_reviews: metrics.reviews,
      seller_tag: metrics.tag
    };
  });
}

async function getAllMarketplaceListings() {
  if (!hasSupabaseEnv) {
    const [demoListings, demoRatings, demoProfiles] = await Promise.all([
      getDemoListings(),
      getDemoSellerRatings(),
      getDemoProfiles()
    ]);
    const bannedSellerIds = new Set(
      demoProfiles.filter((profile) => profile.is_banned).map((profile) => profile.id)
    );
    const normalizedDemoListings = demoListings.map((listing) => ({
      ...normalizeListing(listing),
      seller_is_banned: bannedSellerIds.has(listing.seller_id)
    }));
    const visibleListings = normalizedDemoListings.filter((listing) =>
      isListingMarketplaceVisible(listing)
    );
    return enrichMarketplaceListings([...visibleListings, ...visibleSeededMarketplaceListings], demoRatings).sort((left, right) =>
      right.created_at.localeCompare(left.created_at)
    );
  }

  try {
    const [listings, ratings] = await Promise.all([
      getSupabaseListings(),
      getSupabaseSellerRatings()
    ]);
    const visibleListings = listings.filter((listing) =>
      isListingMarketplaceVisible(listing)
    );
    const baseListings = visibleListings.length > 0 ? visibleListings : visibleSeededMarketplaceListings;

    return enrichMarketplaceListings(baseListings, ratings).sort((left, right) =>
      right.created_at.localeCompare(left.created_at)
    );
  } catch {
    return enrichMarketplaceListings(visibleSeededMarketplaceListings, []);
  }
}

export async function getMarketplaceListings(limit = 6) {
  const listings = await getAllMarketplaceListings();
  return listings.slice(0, limit);
}

export async function getMarketplaceCatalog() {
  return getAllMarketplaceListings();
}

function orderListingsByIds(listings: Listing[], listingIds: string[]) {
  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

  return listingIds
    .map((listingId) => listingMap.get(listingId))
    .filter((listing): listing is Listing => Boolean(listing));
}

export async function getMarketplaceListingById(listingId: string) {
  const listings = await getAllMarketplaceListings();
  return listings.find((listing) => listing.id === listingId) ?? null;
}

export async function getSavedMarketplaceListingIds() {
  return getSavedListingIds();
}

export async function getCartMarketplaceListingIds() {
  return getCartListingIds();
}

export async function getSavedMarketplaceListings() {
  const [listingIds, listings] = await Promise.all([
    getSavedListingIds(),
    getAllMarketplaceListings()
  ]);

  return orderListingsByIds(listings, listingIds);
}

export async function getCartMarketplaceListings() {
  const [listingIds, listings] = await Promise.all([
    getCartListingIds(),
    getAllMarketplaceListings()
  ]);

  return orderListingsByIds(listings, listingIds);
}

export async function getSellerRatingState(sellerId: string, buyerId?: string | null) {
  if (!hasSupabaseEnv) {
    const ratings = await getDemoSellerRatings();
    const sellerRatings = ratings.filter((entry) => entry.seller_id === sellerId);
    const metrics = combineSellerMetrics(sellerId, ratings);
    const buyerRating =
      buyerId ? sellerRatings.find((entry) => entry.buyer_id === buyerId) ?? null : null;

    return {
      average: Number(metrics.average.toFixed(1)),
      reviews: metrics.reviews,
      tag: metrics.tag,
      buyerRating
    };
  }

  try {
    const ratings = await getSupabaseSellerRatings();
    const sellerRatings = ratings.filter((entry) => entry.seller_id === sellerId);
    const metrics = combineSellerMetrics(sellerId, ratings);
    const buyerRating =
      buyerId ? sellerRatings.find((entry) => entry.buyer_id === buyerId) ?? null : null;

    return {
      average: Number(metrics.average.toFixed(1)),
      reviews: metrics.reviews,
      tag: metrics.tag,
      buyerRating
    };
  } catch {
    const fallback = seededSellerMetrics[sellerId] ?? { rating: 0, reviews: 0 };
    return {
      average: Number(fallback.rating.toFixed(1)),
      reviews: fallback.reviews,
      tag: fallback.rating >= 4.7 && fallback.reviews >= 5 ? ("top_seller" as const) : null,
      buyerRating: null
    };
  }
}

export async function getSellerDashboardStats(profile: Profile): Promise<DashboardStat[]> {
  if (!hasSupabaseEnv) {
    const [listings, orders] = await Promise.all([
      getDemoListings(),
      getDemoOrders()
    ]);
    const sellerListings = listings
      .map((listing) => normalizeListing(listing))
      .filter((listing) => listing.seller_id === profile.id);
    const pendingOrders = orders.filter(
      (order) => order.seller_id === profile.id && order.status === "pending"
    );
    const wallet = await getProfileWallet(profile.id);

    return [
      {
        label: "Total Listings",
        value: String(sellerListings.length),
        helper: "All account listings",
        href: "/seller/listings"
      },
      {
        label: "Active Listings",
        value: String(
          sellerListings.filter((listing) => listing.status === "approved").length
        ),
        helper: "Approved and live",
        href: "/seller/listings"
      },
      {
        label: "Pending Orders",
        value: String(pendingOrders.length),
        helper: "Orders awaiting action",
        href: "/seller/orders"
      },
      {
        label: "Available Balance",
        value: formatCompactCurrency(wallet.available_balance),
        helper: "Ready for withdrawal",
        href: "/seller/wallet"
      }
    ];
  }

  try {
    const supabase = await getSupabaseServerClient();

    const [
      totalListingsResult,
      activeListingsResult,
      pendingOrdersResult,
      wallet
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
        .eq("status", "pending"),
      getProfileWallet(profile.id)
    ]);

    return [
      {
        label: "Total Listings",
        value: String(totalListingsResult?.count ?? 0),
        helper: "All account listings",
        href: "/seller/listings"
      },
      {
        label: "Active Listings",
        value: String(activeListingsResult?.count ?? 0),
        helper: "Approved and live",
        href: "/seller/listings"
      },
      {
        label: "Pending Orders",
        value: String(pendingOrdersResult?.count ?? 0),
        helper: "Orders awaiting action",
        href: "/seller/orders"
      },
      {
        label: "Available Balance",
        value: formatCompactCurrency(wallet.available_balance),
        helper: wallet.pending_balance > 0
          ? `${formatCompactCurrency(wallet.pending_balance)} pending`
          : "Ready for withdrawal",
        href: "/seller/wallet"
      }
    ];
  } catch {
    return [
      { label: "Total Listings", value: "0", helper: "All account listings", href: "/seller/listings" },
      { label: "Active Listings", value: "0", helper: "Approved and live", href: "/seller/listings" },
      { label: "Pending Orders", value: "0", helper: "Orders awaiting action", href: "/seller/orders" },
      { label: "Available Balance", value: "$0", helper: "Ready for withdrawal", href: "/seller/wallet" }
    ];
  }
}

export async function getAccountDashboardStats(profile: Profile): Promise<DashboardStat[]> {
  const [savedListingIds, cartListingIds, wallet] = await Promise.all([
    getSavedListingIds(),
    getCartListingIds(),
    getProfileWallet(profile.id)
  ]);

  return [
    {
      label: "Marketplace Access",
      value: "Live",
      helper: "Browse public and in-account listings",
      href: "/account/marketplace"
    },
    {
      label: "Seller Access",
      value: profile.seller_enabled ? "Enabled" : "Locked",
      helper: profile.seller_enabled
        ? "Seller workspace is ready"
        : "Unlock it to start KYC and list accounts",
      href: "/account/seller"
    },
    {
      label: "Cart Items",
      value: String(cartListingIds.length),
      helper: "Accounts staged for checkout",
      href: "/account/cart"
    },
    {
      label: "Saved Listings",
      value: String(savedListingIds.length),
      helper: "Buyer favorites ready for later",
      href: "/account/saved"
    },
    {
      label: "Wallet Credit",
      value: formatCompactCurrency(wallet.available_balance),
      helper: "Available after refunds",
      href: "/account/wallet"
    }
  ];
}

export async function getSellerListings(profile: Profile) {
  if (!hasSupabaseEnv) {
    return (await getDemoListings())
      .map((listing) => normalizeListing(listing))
      .filter(
        (listing) => listing.seller_id === profile.id && listing.status === "approved"
      );
  }

  try {
    const listings = await getSupabaseListings();
    return listings.filter(
      (listing) => listing.seller_id === profile.id && listing.status === "approved"
    );
  } catch {
    return [];
  }
}

export async function getSellerListingHistory(profile: Profile) {
  const sortListings = (listings: Listing[]) =>
    [...listings].sort((left, right) =>
      getListingHistoryTimestamp(right).localeCompare(getListingHistoryTimestamp(left))
    );

  if (!hasSupabaseEnv) {
    return sortListings(
      (await getDemoListings())
        .map((listing) => normalizeListing(listing))
        .filter(
          (listing) => listing.seller_id === profile.id && listing.status !== "approved"
        )
    );
  }

  try {
    const listings = await getSupabaseListings();
    return sortListings(
      listings.filter(
        (listing) => listing.seller_id === profile.id && listing.status !== "approved"
      )
    );
  } catch {
    return [];
  }
}

export async function getSellerOrders(profile: Profile) {
  if (!hasSupabaseEnv) {
    const [orders, listings] = await Promise.all([
      getDemoOrders(),
      getDemoListings()
    ]);
    const listingMap = new Map(
      listings.map((listing) => [listing.id, listing.title])
    );

    return orders
      .filter((order) => order.seller_id === profile.id)
      .map((order) => normalizeOrder(order, listingMap.get(order.listing_id)));
  }

  try {
    const orders = await getSupabaseOrders();
    const listings = await getSupabaseListings();
    const listingMap = new Map(listings.map((listing) => [listing.id, listing.title]));

    return orders
      .filter((order) => order.seller_id === profile.id)
      .map((order) => normalizeOrder(order, listingMap.get(order.listing_id)));
  } catch {
    return [] as Order[];
  }
}

export async function getBuyerOrders(profile: Profile) {
  if (!hasSupabaseEnv) {
    const [orders, listings] = await Promise.all([
      getDemoOrders(),
      getDemoListings()
    ]);
    const listingMap = new Map(
      listings.map((listing) => [listing.id, listing.title])
    );

    return orders
      .filter(
        (order) =>
          order.buyer_id === profile.id ||
          order.buyer_email.toLowerCase() === profile.email.toLowerCase()
      )
      .map((order) => normalizeOrder(order, listingMap.get(order.listing_id)));
  }

  try {
    const orders = await getSupabaseOrders();
    const listings = await getSupabaseListings();
    const listingMap = new Map(listings.map((listing) => [listing.id, listing.title]));

    return orders
      .filter(
        (order) =>
          order.buyer_id === profile.id ||
          order.buyer_email.toLowerCase() === profile.email.toLowerCase()
      )
      .map((order) => normalizeOrder(order, listingMap.get(order.listing_id)));
  } catch {
    return [] as Order[];
  }
}

export async function getBuyerOrderDetail(
  profile: Profile,
  orderId: string,
  options?: { includeDeliveryDetails?: boolean }
) {
  const includeDeliveryDetails = options?.includeDeliveryDetails ?? false;

  if (!hasSupabaseEnv) {
    const demoOrders = await getDemoOrders();
    const order = demoOrders.find(
      (entry) =>
        entry.id === orderId &&
        (entry.buyer_id === profile.id ||
          entry.buyer_email.toLowerCase() === profile.email.toLowerCase())
    );

    if (!order) {
      return null as {
        order: Order;
        listing: Listing | null;
        paymentConfirmed: boolean;
        deliveryAvailable: boolean;
        deliveryDetails: ListingDeliveryDetails | null;
      } | null;
    }

    const listings = (await getDemoListings()).map((listing) => normalizeListing(listing));
    const listing = listings.find((entry) => entry.id === order.listing_id) ?? null;
    const paymentConfirmed = isOrderPaymentConfirmed(order.status);
    const demoDeliveryDetails = paymentConfirmed
      ? (await getDemoListingDeliveryDetails()).find((entry) => entry.listing_id === order.listing_id) ?? null
      : null;

    return {
      order: normalizeOrder(order, listing?.title),
      listing,
      paymentConfirmed,
      deliveryAvailable: Boolean(demoDeliveryDetails),
      deliveryDetails: includeDeliveryDetails ? demoDeliveryDetails : null
    };
  }

  try {
    const orders = await getSupabaseOrders();
    const order = orders.find(
      (entry) =>
        entry.id === orderId &&
        (entry.buyer_id === profile.id ||
          entry.buyer_email.toLowerCase() === profile.email.toLowerCase())
    );

    if (!order) {
      return null;
    }

    const listings = await getSupabaseListings();
    const listing = listings.find((entry) => entry.id === order.listing_id) ?? null;
    const paymentConfirmed = isOrderPaymentConfirmed(order.status);
    const deliveryDetails = paymentConfirmed
      ? await getSupabaseListingDeliveryDetailsForListing(order.listing_id)
      : null;

    return {
      order: normalizeOrder(order, listing?.title),
      listing,
      paymentConfirmed,
      deliveryAvailable: Boolean(deliveryDetails),
      deliveryDetails: includeDeliveryDetails ? deliveryDetails : null
    };
  } catch {
    return null;
  }
}

export async function getAdminDashboardStats() {
  if (!hasSupabaseEnv) {
    const profiles = await getDemoProfiles();
    const listings = (await getDemoListings()).map((listing) => normalizeListing(listing));
    const kyc = await getDemoKycSubmissions();

    return {
      stats: [
        { label: "Total Users", value: String(profiles.length), helper: "Registered users", href: "/admin/users" },
        {
          label: "Total Sellers",
          value: String(profiles.filter((profile) => profile.seller_enabled).length),
          helper: "Seller-enabled users",
          href: "/admin/sellers"
        },
        {
          label: "Pending KYC",
          value: String(kyc.filter((submission) => submission.status === "pending").length),
          helper: "Awaiting review",
          href: "/admin/kyc"
        },
        {
          label: "Live Listings",
          value: String(
            listings.filter((listing) => listing.status === "approved").length
          ),
          helper: "Published in marketplace",
          href: "/admin/listings"
        },
        { label: "Total Sales", value: "$0", helper: "Dummy transaction total", href: "/admin/orders" }
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
        { label: "Total Users", value: String(profiles.length), helper: "Registered users", href: "/admin/users" },
        {
          label: "Total Sellers",
          value: String(profiles.filter((profile) => profile.seller_enabled).length),
          helper: "Seller-enabled users",
          href: "/admin/sellers"
        },
        {
          label: "Pending KYC",
          value: String(kyc.filter((submission) => submission.status === "pending").length),
          helper: "Awaiting review",
          href: "/admin/kyc"
        },
        {
          label: "Live Listings",
          value: String(
            listings.filter((listing) => listing.status === "approved").length
          ),
          helper: "Published in marketplace",
          href: "/admin/listings"
        },
        {
          label: "Total Sales",
          value: formatCompactCurrency(totalSales),
          helper: "Completed order value",
          href: "/admin/orders"
        }
      ],
      activity: seededActivity
    };
  } catch {
    return {
      stats: [
        { label: "Total Users", value: "0", helper: "Registered users", href: "/admin/users" },
        { label: "Total Sellers", value: "0", helper: "Seller-enabled users", href: "/admin/sellers" },
        { label: "Pending KYC", value: "0", helper: "Awaiting review", href: "/admin/kyc" },
        { label: "Live Listings", value: "0", helper: "Published in marketplace", href: "/admin/listings" },
        { label: "Total Sales", value: "$0", helper: "Completed order value", href: "/admin/orders" }
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

export async function getAdminKycQueuePage(page = 1, perPage = 10) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? Math.floor(perPage) : 10;

  if (!hasSupabaseEnv) {
    const submissions = (await getDemoKycSubmissions()).sort((left, right) =>
      right.created_at.localeCompare(left.created_at)
    );
    const totalCount = submissions.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / safePerPage));
    const currentPage = Math.min(safePage, totalPages);
    const startIndex = (currentPage - 1) * safePerPage;

    return {
      submissions: submissions.slice(startIndex, startIndex + safePerPage),
      totalCount,
      totalPages,
      currentPage
    };
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return {
        submissions: [] as KycSubmission[],
        totalCount: 0,
        totalPages: 1,
        currentPage: 1
      };
    }

    const from = (safePage - 1) * safePerPage;
    const to = from + safePerPage - 1;

    const { data, count } = await supabase
      .from("kyc_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / safePerPage));
    const currentPage = Math.min(safePage, totalPages);
    const submissions = (data as KycSubmission[] | null) ?? [];

    return {
      submissions: await enrichKycSubmissions(submissions, supabase),
      totalCount,
      totalPages,
      currentPage
    };
  } catch {
    return {
      submissions: [] as KycSubmission[],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1
    };
  }
}

export async function getLatestSellerKycSubmission(sellerId: string) {
  if (!hasSupabaseEnv) {
    const submissions = await getDemoKycSubmissions();
    return (
      submissions
        .filter((submission) => submission.seller_id === sellerId)
        .sort((left, right) => right.created_at.localeCompare(left.created_at))[0] ?? null
    );
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return null;
    }

    const { data } = await supabase
      .from("kyc_submissions")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as KycSubmission | null) ?? null;
  } catch {
    return null;
  }
}

export async function getAdminListingQueue() {
  if (!hasSupabaseEnv) {
    return (await getDemoListings())
      .map((listing) => normalizeListing(listing))
      .filter((listing) => listing.status === "approved");
  }

  try {
    const listings = await getSupabaseListings();
    return listings.filter((listing) => listing.status === "approved");
  } catch {
    return [];
  }
}

export async function getAdminListingHistory() {
  const sortListings = (listings: Listing[]) =>
    [...listings].sort((left, right) =>
      getListingHistoryTimestamp(right).localeCompare(getListingHistoryTimestamp(left))
    );

  if (!hasSupabaseEnv) {
    return sortListings(
      (await getDemoListings())
        .map((listing) => normalizeListing(listing))
        .filter((listing) => listing.status !== "approved")
    );
  }

  try {
    const listings = await getSupabaseListings();
    return sortListings(listings.filter((listing) => listing.status !== "approved"));
  } catch {
    return [];
  }
}

export async function getAdminOrders() {
  if (!hasSupabaseEnv) {
    const [orders, listings] = await Promise.all([
      getDemoOrders(),
      getDemoListings()
    ]);
    const listingMap = new Map(listings.map((listing) => [listing.id, listing.title]));

    return orders.map((order) => normalizeOrder(order, listingMap.get(order.listing_id)));
  }

  try {
    const orders = await getSupabaseOrders();
    const listings = await getSupabaseListings();
    const listingMap = new Map(listings.map((listing) => [listing.id, listing.title]));

    return orders.map((order) => normalizeOrder(order, listingMap.get(order.listing_id)));
  } catch {
    return [] as Order[];
  }
}
