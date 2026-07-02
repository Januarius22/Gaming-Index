"use server";

import { revalidatePath } from "next/cache";
import { requireAccountProfile, requireAdminProfile, requireSellerProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isValidPhoneNumber } from "@/lib/utils";
import type { ActionState, Profile } from "@/types";

const preferenceKeys = [
  "order_updates",
  "wallet_updates",
  "dispute_updates",
  "support_updates",
  "marketplace_updates",
  "kyc_updates",
  "admin_reviews",
  "admin_operations",
  "security_updates"
] as const;

type SettingsWorkspace = "account" | "seller" | "admin";

function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function getPreferences(formData: FormData) {
  return Object.fromEntries(
    preferenceKeys.map((key) => [key, formData.get(key) === "on"])
  );
}

function getSettingsPath(workspace: SettingsWorkspace) {
  return `/${workspace}/settings`;
}

function getNotificationsPath(workspace: SettingsWorkspace) {
  return `/${workspace}/notifications`;
}

async function saveWorkspaceSettings({
  profile,
  workspace,
  formData
}: {
  profile: Profile;
  workspace: SettingsWorkspace;
  formData: FormData;
}): Promise<ActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const defaultBankName = String(formData.get("defaultBankName") ?? "").trim();
  const defaultAccountNumber = String(formData.get("defaultAccountNumber") ?? "").trim();
  const defaultAccountName = String(formData.get("defaultAccountName") ?? "").trim();
  const notificationPreferences = getPreferences(formData);

  if (fullName.length < 2) {
    return {
      status: "error",
      message: "Enter your full name."
    };
  }

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return {
      status: "error",
      message: "Username must be 3-24 characters using letters, numbers, or underscores."
    };
  }

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return {
      status: "error",
      message: "Phone number can include numbers, spaces, +, hyphens, and parentheses."
    };
  }

  if (defaultAccountNumber && !/^\d{6,20}$/.test(defaultAccountNumber)) {
    return {
      status: "error",
      message: "Account number must contain 6-20 digits."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "success",
      message: "Settings saved for this session."
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Settings could not be saved right now."
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      username
    })
    .eq("id", profile.id);

  if (profileError) {
    return {
      status: "error",
      message: profileError.message
    };
  }

  const { error: settingsError } = await supabase.from("profile_settings").upsert({
    profile_id: profile.id,
    phone_number: phoneNumber,
    default_bank_name: defaultBankName,
    default_account_number: defaultAccountNumber,
    default_account_name: defaultAccountName,
    notification_preferences: notificationPreferences,
    updated_at: new Date().toISOString()
  });

  if (settingsError) {
    return {
      status: "error",
      message: settingsError.message
    };
  }

  revalidatePath(getSettingsPath(workspace));
  revalidatePath(getNotificationsPath(workspace));
  revalidatePath(`/${workspace}/dashboard`);

  if (workspace === "seller") {
    revalidatePath("/seller/listings");
    revalidatePath("/seller/withdrawals");
  }

  if (workspace === "account") {
    revalidatePath("/account/checkout");
    revalidatePath("/account/withdrawals");
  }

  if (workspace === "admin") {
    revalidatePath("/admin/users");
    revalidatePath("/admin/sellers");
  }

  return {
    status: "success",
    message: "Settings saved."
  };
}

export async function updateAccountSettingsAction(
  _previousState: ActionState,
  formData: FormData
) {
  const profile = await requireAccountProfile();
  return saveWorkspaceSettings({ profile, workspace: "account", formData });
}

export async function updateSellerSettingsAction(
  _previousState: ActionState,
  formData: FormData
) {
  const profile = await requireSellerProfile();
  return saveWorkspaceSettings({ profile, workspace: "seller", formData });
}

export async function updateAdminSettingsAction(
  _previousState: ActionState,
  formData: FormData
) {
  const profile = await requireAdminProfile();
  return saveWorkspaceSettings({ profile, workspace: "admin", formData });
}
