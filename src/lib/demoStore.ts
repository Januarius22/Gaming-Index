import "server-only";
import { cookies } from "next/headers";
import { normalizeProfile } from "@/lib/profile";
import { getNigeriaTimestamp } from "@/lib/utils";
import type {
  KycSubmission,
  KycStatus,
  Listing,
  ListingStatus,
  Profile
} from "@/types";

const SESSION_COOKIE = "gi_demo_session";
const PROFILES_COOKIE = "gi_demo_profiles";
const KYC_COOKIE = "gi_demo_kyc";
const LISTINGS_COOKIE = "gi_demo_listings";

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
  documentType,
  documentNumber
}: {
  seller: Profile;
  fullName: string;
  documentType: string;
  documentNumber: string;
}) {
  const submissions = await getDemoKycSubmissions();
  const nextSubmission: KycSubmission = {
    id: crypto.randomUUID(),
    seller_id: seller.id,
    full_name: fullName,
    document_type: documentType,
    document_number: documentNumber,
    email: seller.email,
    username: seller.username,
    status: "pending",
    created_at: getNigeriaTimestamp()
  };

  await saveDemoKycSubmissions([nextSubmission, ...submissions]);
  await updateDemoProfile(seller.id, { kyc_status: "pending" });
  return nextSubmission;
}

export async function updateDemoKycSubmissionStatus(
  submissionId: string,
  status: Extract<KycStatus, "approved" | "rejected">
) {
  const submissions = await getDemoKycSubmissions();
  const target = submissions.find((submission) => submission.id === submissionId);

  if (!target) {
    return null;
  }

  const nextSubmissions = submissions.map((submission) =>
    submission.id === submissionId ? { ...submission, status } : submission
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
  extraNotes
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
    status: "pending_review",
    created_at: getNigeriaTimestamp()
  };

  await saveDemoListings([nextListing, ...listings]);
  return nextListing;
}

export async function updateDemoListingStatus(
  listingId: string,
  status: Extract<ListingStatus, "approved" | "rejected">
) {
  const listings = await getDemoListings();
  const nextListings = listings.map((listing) =>
    listing.id === listingId ? { ...listing, status } : listing
  );
  await saveDemoListings(nextListings);
  return nextListings.find((listing) => listing.id === listingId) ?? null;
}
