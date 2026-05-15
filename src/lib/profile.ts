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
  }
): Profile {
  return {
    id: value.id ?? "",
    full_name: value.full_name ?? "Gaming Index User",
    username: value.username ?? "user",
    email: value.email ?? "",
    role: normalizeRole(value.role),
    seller_enabled: normalizeSellerEnabled(value.seller_enabled, value.role),
    kyc_status: normalizeKycStatus(value.kyc_status),
    created_at: value.created_at ?? new Date().toISOString()
  };
}

export function getPrimaryDashboardRoute(role: AppRole) {
  return role === "admin" ? "/admin/dashboard" : "/account/dashboard";
}
