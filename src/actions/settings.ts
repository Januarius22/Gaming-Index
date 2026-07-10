"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentProfile,
  requireAccountProfile,
  requireAdminProfile,
  requireSellerProfile
} from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isValidPhoneNumber } from "@/lib/utils";
import type { ActionState, Profile } from "@/types";

const PROFILE_AVATARS_BUCKET = "profile-avatars";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

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

function getSafeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function isFormFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "size" in value &&
      "type" in value &&
      typeof value.size === "number"
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
  const themePreference = String(formData.get("themePreference") ?? "system");
  const fontSizePreference = String(formData.get("fontSizePreference") ?? "comfortable");
  const twoFactorMethod = String(formData.get("twoFactorMethod") ?? "authenticator");
  const twoFactorPreferenceEnabled = formData.get("twoFactorPreferenceEnabled") === "on";
  const notificationPreferences = getPreferences(formData);
  const avatarFile = formData.get("avatarFile");

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

  if (!["light", "dark", "system"].includes(themePreference)) {
    return {
      status: "error",
      message: "Choose a valid theme preference."
    };
  }

  if (!["compact", "comfortable", "large"].includes(fontSizePreference)) {
    return {
      status: "error",
      message: "Choose a valid font size."
    };
  }

  if (!["authenticator", "email"].includes(twoFactorMethod)) {
    return {
      status: "error",
      message: "Choose a valid two-factor method."
    };
  }

  if (isFormFile(avatarFile) && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      return {
        status: "error",
        message: "Profile picture must be an image."
      };
    }

    if (avatarFile.size > MAX_AVATAR_SIZE) {
      return {
        status: "error",
        message: "Profile picture must be 2MB or smaller."
      };
    }
  }

  if (!hasSupabaseEnv) {
    return {
      status: "success",
      message: "Settings saved for this session."
    };
  }

  let avatarUpdate: Pick<Profile, "avatar_name" | "avatar_path" | "avatar_url"> | null = null;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Settings could not be saved right now."
    };
  }

  if (isFormFile(avatarFile) && avatarFile.size > 0) {
    const safeName = getSafeFileName(avatarFile.name || "profile-avatar.png");
    const avatarPath = `${profile.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_AVATARS_BUCKET)
      .upload(avatarPath, avatarFile, {
        cacheControl: "3600",
        contentType: avatarFile.type,
        upsert: false
      });

    if (uploadError) {
      return {
        status: "error",
        message: uploadError.message
      };
    }

    if (profile.avatar_path) {
      await supabase.storage.from(PROFILE_AVATARS_BUCKET).remove([profile.avatar_path]);
    }

    const { data: avatarPublicUrl } = supabase.storage
      .from(PROFILE_AVATARS_BUCKET)
      .getPublicUrl(avatarPath);

    avatarUpdate = {
      avatar_name: avatarFile.name || safeName,
      avatar_path: avatarPath,
      avatar_url: avatarPublicUrl.publicUrl
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      username,
      ...(avatarUpdate ?? {})
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
    theme_preference: themePreference,
    font_size_preference: fontSizePreference,
    two_factor_preference_enabled: twoFactorPreferenceEnabled,
    two_factor_method: twoFactorMethod,
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
  revalidatePath(`${getSettingsPath(workspace)}/profile`);
  revalidatePath(`${getSettingsPath(workspace)}/appearance`);
  revalidatePath(`${getSettingsPath(workspace)}/security`);
  revalidatePath(`${getSettingsPath(workspace)}/notifications`);
  revalidatePath(`${getSettingsPath(workspace)}/payout`);
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

export async function changePasswordAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getCurrentProfile();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!profile) {
    return {
      status: "error",
      message: "Sign in again to change your password."
    };
  }

  if (newPassword.length < 8) {
    return {
      status: "error",
      message: "New password must be at least 8 characters."
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      status: "error",
      message: "Passwords do not match."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "success",
      message: "Password updated for this session."
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Password could not be updated right now."
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword
  });

  if (signInError) {
    return {
      status: "error",
      message: "Current password is incorrect."
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    return {
      status: "error",
      message: updateError.message
    };
  }

  revalidatePath("/account/settings");
  revalidatePath("/seller/settings");
  revalidatePath("/admin/settings");

  return {
    status: "success",
    message: "Password changed."
  };
}
