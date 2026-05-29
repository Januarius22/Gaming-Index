import type { KycStatus, ListingStatus, OrderStatus } from "@/types";

export const APP_TIME_ZONE = "Africa/Lagos";
export const APP_TIME_LABEL = "WAT";
export const SOLD_LISTING_PUBLIC_VISIBILITY_HOURS = 5;

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: APP_TIME_ZONE
  }).format(new Date(value));
}

export function getNigeriaTimestamp(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+01:00`;
}

export function parsePageParam(value?: string) {
  const parsedValue = Number(value ?? "1");

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return Math.floor(parsedValue);
}

export function paginateItems<T>(items: T[], page: number, perPage: number) {
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? Math.floor(perPage) : 10;
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePerPage));
  const currentPage = Math.min(Math.max(1, Math.floor(page || 1)), totalPages);
  const startIndex = (currentPage - 1) * safePerPage;
  const endIndex = startIndex + safePerPage;

  return {
    items: items.slice(startIndex, endIndex),
    totalCount,
    totalPages,
    currentPage,
    pageStart: totalCount === 0 ? 0 : startIndex + 1,
    pageEnd: totalCount === 0 ? 0 : Math.min(endIndex, totalCount)
  };
}

export function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isValidPhoneNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (!/^\+?[0-9\s()-]+$/.test(trimmed)) {
    return false;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

export interface PasswordStrengthResult {
  score: number;
  label: "Very Weak" | "Weak" | "Fair" | "Strong";
  colorClassName: string;
  valid: boolean;
  checks: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export function evaluatePasswordStrength(value: string): PasswordStrengthResult {
  const checks = {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const valid = Object.values(checks).every(Boolean);

  if (score <= 1) {
    return {
      score,
      valid,
      checks,
      label: "Very Weak",
      colorClassName: "text-rose-600"
    };
  }

  if (score <= 3) {
    return {
      score,
      valid,
      checks,
      label: "Weak",
      colorClassName: "text-amber-600"
    };
  }

  if (score === 4) {
    return {
      score,
      valid,
      checks,
      label: "Fair",
      colorClassName: "text-sky-600"
    };
  }

  return {
    score,
    valid,
    checks,
    label: "Strong",
    colorClassName: "text-emerald-600"
  };
}

export function statusVariant(
  status: KycStatus | ListingStatus | OrderStatus
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "approved":
    case "completed":
    case "sold":
      return "success";
    case "pending":
    case "pending_review":
    case "processing":
      return "warning";
    case "taken_down":
    case "rejected":
    case "cancelled":
      return "danger";
    case "withdrawn":
    case "draft":
    case "not_started":
      return "neutral";
    default:
      return "info";
  }
}

export function isOrderPaymentConfirmed(status: OrderStatus) {
  return status === "processing" || status === "completed";
}

export function getListingMarketplaceVisibilityEndsAt(listing: {
  status: ListingStatus;
  sold_at?: string | null;
  created_at: string;
}) {
  if (listing.status !== "sold") {
    return null;
  }

  const baseTimestamp = listing.sold_at || listing.created_at;
  const soldAt = new Date(baseTimestamp);

  if (Number.isNaN(soldAt.getTime())) {
    return null;
  }

  return new Date(
    soldAt.getTime() + SOLD_LISTING_PUBLIC_VISIBILITY_HOURS * 60 * 60 * 1000
  );
}

export function isListingMarketplaceVisible(listing: {
  status: ListingStatus;
  sold_at?: string | null;
  created_at: string;
}) {
  if (listing.status === "approved") {
    return true;
  }

  if (listing.status !== "sold") {
    return false;
  }

  const visibleUntil = getListingMarketplaceVisibilityEndsAt(listing);

  if (!visibleUntil) {
    return false;
  }

  return visibleUntil.getTime() > Date.now();
}

export function getListingHistoryTimestamp(listing: {
  sold_at?: string | null;
  withdrawn_at?: string | null;
  admin_action_at?: string | null;
  created_at: string;
}) {
  return (
    listing.admin_action_at ||
    listing.withdrawn_at ||
    listing.sold_at ||
    listing.created_at
  );
}

export const gameOptions = [
  "CODM",
  "Free Fire",
  "PUBG Mobile",
  "Fortnite",
  "eFootball",
  "DLS"
];

export const platformOptions = ["Mobile"];

export const loginMethodOptions = ["Email", "Facebook", "Google", "Apple", "Other"];

export const documentTypeOptions = [
  "National ID",
  "Passport",
  "Driver's License",
  "Voter's Card",
  "Residence Permit"
];

export const proofOfAddressOptions = [
  "Utility Bill",
  "Bank Statement",
  "Government Letter",
  "Rental Agreement"
];
