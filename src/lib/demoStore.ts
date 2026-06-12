import "server-only";
import { cookies } from "next/headers";
import { normalizeProfile } from "@/lib/profile";
import { getNigeriaTimestamp } from "@/lib/utils";
import type {
  KycSubmission,
  KycStatus,
  Listing,
  ListingDeliveryDetails,
  ListingStatus,
  Order,
  Profile,
  SellerRating
} from "@/types";

const SESSION_COOKIE = "gi_demo_session";
const PROFILES_COOKIE = "gi_demo_profiles";
const KYC_COOKIE = "gi_demo_kyc";
const LISTINGS_COOKIE = "gi_demo_listings";
const LISTING_DELIVERY_COOKIE = "gi_demo_listing_delivery";
const ORDERS_COOKIE = "gi_demo_orders";
const SELLER_RATINGS_COOKIE = "gi_demo_seller_ratings";

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decode<T>(value: string | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return fallback;
  }
}

async function readCookieArray<T>(name: string) {
  const cookieStore = await cookies();
  return decode<T[]>(cookieStore.get(name)?.value, []);
}

async function writeCookieValue(name: string, value: unknown) {
  const cookieStore = await cookies();
  cookieStore.set(name, encode(value), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export function getDemoAdminProfile(): Profile {
  return normalizeProfile({
    id: "demo-admin",
    full_name: "Platform Admin",
    username: "admin",
    email: "admin@gamingindex.dev",
    role: "admin",
    seller_enabled: false,
    kyc_status: "approved",
    is_banned: false,
    banned_at: null,
    banned_reason: "",
    banned_by: null,
    created_at: "2026-05-14T00:00:00.000Z"
  });
}

export async function getDemoProfiles() {
  const profiles = await readCookieArray<Profile>(PROFILES_COOKIE);
  return profiles.map((profile) => normalizeProfile(profile));
}

export async function getDemoProfileByEmail(email: string) {
  const profiles = await getDemoProfiles();
  return profiles.find(
    (profile) => profile.email.toLowerCase() === email.trim().toLowerCase()
  );
}

export async function getDemoProfileByUsername(username: string) {
  const profiles = await getDemoProfiles();
  return profiles.find(
    (profile) => profile.username.toLowerCase() === username.trim().toLowerCase()
  );
}

export async function getDemoProfileById(profileId: string) {
  const profiles = await getDemoProfiles();
  return profiles.find((profile) => profile.id === profileId) ?? null;
}

export async function saveDemoProfiles(profiles: Profile[]) {
  await writeCookieValue(
    PROFILES_COOKIE,
    profiles.map((profile) => normalizeProfile(profile))
  );
}

export async function upsertDemoProfile(profile: Profile) {
  const profiles = await getDemoProfiles();
  const normalizedProfile = normalizeProfile(profile);
  const nextProfiles = profiles.filter((entry) => entry.id !== normalizedProfile.id);
  nextProfiles.push(normalizedProfile);
  await saveDemoProfiles(nextProfiles);
  return normalizedProfile;
}

export async function updateDemoProfile(
  profileId: string,
  updates: Partial<Profile>
) {
  const profiles = await getDemoProfiles();
  const current = profiles.find((profile) => profile.id === profileId);

  if (!current) {
    return null;
  }

  const nextProfile = normalizeProfile({ ...current, ...updates });
  await saveDemoProfiles(
    profiles.map((profile) => (profile.id === profileId ? nextProfile : profile))
  );
  return nextProfile;
}

export async function setDemoSession(profileId: string) {
  await writeCookieValue(SESSION_COOKIE, profileId);
}

export async function clearDemoSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function getDemoSessionProfile() {
  const cookieStore = await cookies();
  const profileId = decode<string | null>(cookieStore.get(SESSION_COOKIE)?.value, null);

  if (!profileId) {
    return null;
  }

  return getDemoProfileById(profileId);
}

export async function getDemoKycSubmissions() {
  return readCookieArray<KycSubmission>(KYC_COOKIE);
}

export async function saveDemoKycSubmissions(submissions: KycSubmission[]) {
  await writeCookieValue(KYC_COOKIE, submissions);
}

export async function addDemoKycSubmission({
  seller,
  fullName,
  email,
  phoneNumber,
  dateOfBirth,
  country,
  state,
  city,
  stateCity,
  residentialAddress,
  documentType,
  documentNumber,
  documentFrontName,
  documentBackName,
  selfieFileName
}: {
  seller: Profile;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  stateCity: string;
  residentialAddress: string;
  documentType: string;
  documentNumber: string;
  documentFrontName: string;
  documentBackName: string;
  selfieFileName: string;
}) {
  const submissions = await getDemoKycSubmissions();
  const nextSubmission: KycSubmission = {
    id: crypto.randomUUID(),
    seller_id: seller.id,
    full_name: fullName,
    email,
    username: seller.username,
    phone_number: phoneNumber,
    date_of_birth: dateOfBirth,
    country,
    state,
    city,
    state_city: stateCity,
    residential_address: residentialAddress,
    document_type: documentType,
    document_number: documentNumber,
    document_front_name: documentFrontName,
    document_front_path: "",
    document_back_name: documentBackName,
    document_back_path: "",
    proof_of_address_type: "",
    proof_of_address_name: "",
    proof_of_address_path: "",
    selfie_file_name: selfieFileName,
    selfie_file_path: "",
    rejection_reason: "",
    status: "pending",
    created_at: getNigeriaTimestamp()
  };

  await saveDemoKycSubmissions([nextSubmission, ...submissions]);
  await updateDemoProfile(seller.id, { kyc_status: "pending" });
  return nextSubmission;
}

export async function updateDemoKycSubmissionStatus(
  submissionId: string,
  status: Extract<KycStatus, "approved" | "rejected">,
  rejectionReason = ""
) {
  const submissions = await getDemoKycSubmissions();
  const target = submissions.find((submission) => submission.id === submissionId);

  if (!target) {
    return null;
  }

  const nextSubmissions = submissions.map((submission) =>
    submission.id === submissionId
      ? {
          ...submission,
          status,
          rejection_reason: status === "rejected" ? rejectionReason : ""
        }
      : submission
  );

  await saveDemoKycSubmissions(nextSubmissions);
  await updateDemoProfile(target.seller_id, { kyc_status: status });
  return nextSubmissions.find((submission) => submission.id === submissionId) ?? null;
}

export async function getDemoListings() {
  return readCookieArray<Listing>(LISTINGS_COOKIE);
}

export async function saveDemoListings(listings: Listing[]) {
  await writeCookieValue(LISTINGS_COOKIE, listings);
}

export async function addDemoListing({
  seller,
  game,
  title,
  description,
  price,
  platform,
  accountLevel,
  loginMethod,
  extraNotes,
  imageNames = []
}: {
  seller: Profile;
  game: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  accountLevel: string;
  loginMethod: string;
  extraNotes: string;
  imageNames?: string[];
}) {
  const listings = await getDemoListings();
  const nextListing: Listing = {
    id: crypto.randomUUID(),
    seller_id: seller.id,
    seller_name: seller.full_name,
    seller_username: seller.username,
    game,
    title,
    description,
    price,
    platform,
    account_level: accountLevel,
    login_method: loginMethod,
    extra_notes: extraNotes,
    image_names: imageNames,
    image_paths: [],
    image_urls: [],
    status: "approved",
    sold_at: null,
    withdrawn_at: null,
    admin_note: "",
    admin_action_at: null,
    admin_action_by: null,
    created_at: getNigeriaTimestamp()
  };

  await saveDemoListings([nextListing, ...listings]);
  return nextListing;
}

export async function updateDemoListingStatus(
  listingId: string,
  status: Extract<
    ListingStatus,
    "approved" | "rejected" | "sold" | "taken_down" | "withdrawn"
  >,
  updates: Partial<Listing> = {}
) {
  const listings = await getDemoListings();
  const nextListings = listings.map((listing) =>
    listing.id === listingId ? { ...listing, ...updates, status } : listing
  );
  await saveDemoListings(nextListings);
  return nextListings.find((listing) => listing.id === listingId) ?? null;
}

export async function getDemoListingDeliveryDetails() {
  return readCookieArray<ListingDeliveryDetails>(LISTING_DELIVERY_COOKIE);
}

export async function saveDemoListingDeliveryDetails(
  deliveryDetails: ListingDeliveryDetails[]
) {
  await writeCookieValue(LISTING_DELIVERY_COOKIE, deliveryDetails);
}

export async function addDemoListingDeliveryDetails({
  listingId,
  sellerId,
  accountLoginId,
  accountPassword,
  recoveryDetails,
  transferNote,
  readyForReleaseConfirmed,
  notPersonalConfirmed
}: {
  listingId: string;
  sellerId: string;
  accountLoginId: string;
  accountPassword: string;
  recoveryDetails: string;
  transferNote: string;
  readyForReleaseConfirmed: boolean;
  notPersonalConfirmed: boolean;
}) {
  const deliveryDetails = await getDemoListingDeliveryDetails();
  const nextDetails: ListingDeliveryDetails = {
    id: crypto.randomUUID(),
    listing_id: listingId,
    seller_id: sellerId,
    account_login_id: accountLoginId,
    account_password: accountPassword,
    recovery_details: recoveryDetails,
    transfer_note: transferNote,
    ready_for_release_confirmed: readyForReleaseConfirmed,
    not_personal_confirmed: notPersonalConfirmed,
    created_at: getNigeriaTimestamp()
  };

  await saveDemoListingDeliveryDetails([nextDetails, ...deliveryDetails]);
  return nextDetails;
}

export async function getDemoOrders() {
  return readCookieArray<Order>(ORDERS_COOKIE);
}

export async function saveDemoOrders(orders: Order[]) {
  await writeCookieValue(ORDERS_COOKIE, orders);
}

export async function addDemoOrder(
  order: Omit<Order, "id" | "created_at"> & Partial<Pick<Order, "id" | "created_at">>
) {
  const orders = await getDemoOrders();
  const nextOrder: Order = {
    id: order.id ?? crypto.randomUUID(),
    created_at: order.created_at ?? getNigeriaTimestamp(),
    buyer_id: order.buyer_id ?? null,
    buyer_name: order.buyer_name,
    buyer_email: order.buyer_email,
    buyer_phone: order.buyer_phone ?? "",
    seller_id: order.seller_id,
    listing_id: order.listing_id,
    listing_title: order.listing_title,
    amount: order.amount,
    status: order.status,
    payment_status: order.payment_status ?? "pending",
    payment_provider: order.payment_provider ?? "",
    payment_reference: order.payment_reference ?? "",
    payment_channel: order.payment_channel ?? "",
    payment_last4: order.payment_last4 ?? "",
    paid_at: order.paid_at ?? null
  };

  await saveDemoOrders([nextOrder, ...orders]);
  return nextOrder;
}

export async function updateDemoOrder(orderId: string, updates: Partial<Order>) {
  const orders = await getDemoOrders();
  const current = orders.find((order) => order.id === orderId) ?? null;

  if (!current) {
    return null;
  }

  const nextOrder: Order = {
    ...current,
    ...updates
  };

  await saveDemoOrders(
    orders.map((order) => (order.id === orderId ? nextOrder : order))
  );

  return nextOrder;
}

export async function removeDemoListing(listingId: string) {
  const listings = await getDemoListings();
  const target = listings.find((listing) => listing.id === listingId) ?? null;

  if (!target) {
    return null;
  }

  await saveDemoListings(listings.filter((listing) => listing.id !== listingId));

  const deliveryDetails = await getDemoListingDeliveryDetails();
  await saveDemoListingDeliveryDetails(
    deliveryDetails.filter((detail) => detail.listing_id !== listingId)
  );

  const ratings = await getDemoSellerRatings();
  await saveDemoSellerRatings(
    ratings.map((rating) =>
      rating.listing_id === listingId ? { ...rating, listing_id: null } : rating
    )
  );

  return target;
}

export async function getDemoSellerRatings() {
  return readCookieArray<SellerRating>(SELLER_RATINGS_COOKIE);
}

export async function saveDemoSellerRatings(ratings: SellerRating[]) {
  await writeCookieValue(SELLER_RATINGS_COOKIE, ratings);
}

export async function upsertDemoSellerRating({
  sellerId,
  buyerId,
  listingId,
  rating,
  review
}: {
  sellerId: string;
  buyerId: string;
  listingId?: string | null;
  rating: number;
  review: string;
}) {
  const ratings = await getDemoSellerRatings();
  const existing = ratings.find(
    (entry) => entry.seller_id === sellerId && entry.buyer_id === buyerId
  );

  const nextEntry: SellerRating = {
    id: existing?.id ?? crypto.randomUUID(),
    seller_id: sellerId,
    buyer_id: buyerId,
    listing_id: listingId,
    rating,
    review,
    created_at: getNigeriaTimestamp()
  };

  const nextRatings = existing
    ? ratings.map((entry) => (entry.id === existing.id ? nextEntry : entry))
    : [nextEntry, ...ratings];

  await saveDemoSellerRatings(nextRatings);
  return nextEntry;
}
