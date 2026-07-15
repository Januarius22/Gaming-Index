import type { AppRole, KycStatus, Profile } from "@/types";

export function normalizeRole(value: unknown): AppRole {
  return value === "admin" ? "admin" : "user";
}

export function normalizeKycStatus(value: unknown): KycStatus {
  switch (value) {
    case "pending":
    case "approved":
    case "rejected":
      return value;
    default:
      return "not_started";
  }
}

export function normalizeSellerEnabled(value: unknown, legacyRole?: unknown) {
  return value === true || value === "true" || legacyRole === "seller";
}

export function normalizeProfile(
  value: Partial<Profile> & {
    role?: unknown;
    seller_enabled?: unknown;
    kyc_status?: unknown;
    seller_strikes?: unknown;
    is_banned?: unknown;
    is_deleted?: unknown;
    is_deactivated?: unknown;
  }
): Profile {
  const rawIsBanned = value.is_banned as unknown;
  const rawIsDeleted = value.is_deleted as unknown;
  const rawIsDeactivated = value.is_deactivated as unknown;
  const rawSellerStrikes = Number(value.seller_strikes ?? 0);

  return {
    id: value.id ?? "",
    full_name: value.full_name ?? "Gaming Index User",
    username: value.username ?? "user",
    email: value.email ?? "",
    avatar_name: value.avatar_name ?? "",
    avatar_path: value.avatar_path ?? "",
    avatar_url: value.avatar_url ?? "",
    role: normalizeRole(value.role),
    seller_enabled: normalizeSellerEnabled(value.seller_enabled, value.role),
    kyc_status: normalizeKycStatus(value.kyc_status),
    seller_strikes: Number.isFinite(rawSellerStrikes) ? rawSellerStrikes : 0,
    seller_restricted_until: value.seller_restricted_until ?? null,
    seller_restriction_reason: value.seller_restriction_reason ?? "",
    is_banned: rawIsBanned === true || rawIsBanned === "true",
    banned_at: value.banned_at ?? null,
    banned_reason: value.banned_reason ?? "",
    banned_by: value.banned_by ?? null,
    is_deleted: rawIsDeleted === true || rawIsDeleted === "true",
    deleted_at: value.deleted_at ?? null,
    deleted_reason: value.deleted_reason ?? "",
    deleted_by: value.deleted_by ?? null,
    is_deactivated: rawIsDeactivated === true || rawIsDeactivated === "true",
    deactivated_at: value.deactivated_at ?? null,
    deactivation_reason: value.deactivation_reason ?? "",
    created_at: value.created_at ?? new Date().toISOString()
  };
}

export function getPrimaryDashboardRoute(role: AppRole) {
  return role === "admin" ? "/admin/dashboard" : "/account/dashboard";
}
