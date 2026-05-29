import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  clearDemoSession,
  getDemoAdminProfile,
  getDemoProfileById,
  getDemoSessionProfile,
  setDemoSession,
  upsertDemoProfile
} from "@/lib/demoStore";
import { getPrimaryDashboardRoute, normalizeProfile } from "@/lib/profile";
import { isInvalidRefreshTokenError } from "@/lib/supabaseAuth";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { AppRole, KycStatus, Profile } from "@/types";

function fallbackProfileFromUser(user: User): Profile {
  return normalizeProfile({
    id: user.id,
    full_name:
      (user.user_metadata.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Gaming Index User",
    username:
      (user.user_metadata.username as string | undefined) ??
      `user-${user.id.slice(0, 6)}`,
    email: user.email ?? "",
    role: user.user_metadata.role,
    seller_enabled: user.user_metadata.seller_enabled,
    kyc_status: user.user_metadata.kyc_status,
    created_at: user.created_at ?? new Date().toISOString()
  });
}

export async function getCurrentProfile() {
  if (!hasSupabaseEnv) {
    return getDemoSessionProfile();
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        return null;
      }

      throw error;
    }

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return profile ? normalizeProfile(profile as Profile) : fallbackProfileFromUser(user);
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      return null;
    }

    throw error;
  }
}

export function getDashboardRoute(role: AppRole) {
  return getPrimaryDashboardRoute(role);
}

export async function redirectIfAuthenticated() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(getDashboardRoute(profile.role));
  }
}

export async function requireAccountProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  return profile;
}

export async function requireSellerProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (!profile.seller_enabled) {
    redirect("/account/seller");
  }

  return profile;
}

export async function requireAdminProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role !== "admin") {
    redirect(getDashboardRoute(profile.role));
  }

  return profile;
}

export function canUploadAccounts(kycStatus: KycStatus) {
  return kycStatus === "approved";
}

export async function signOutServerSession() {
  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    try {
      await supabase?.auth.signOut();
    } catch (error) {
      if (!isInvalidRefreshTokenError(error)) {
        throw error;
      }
    }
  }

  await clearDemoSession();
}

export async function ensureDemoAdminSession() {
  const adminProfile = getDemoAdminProfile();
  const existingAdmin = await getDemoProfileById(adminProfile.id);

  if (!existingAdmin) {
    await upsertDemoProfile(adminProfile);
  }

  await setDemoSession(adminProfile.id);
  return adminProfile;
}
