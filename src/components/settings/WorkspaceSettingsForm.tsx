"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Camera,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  KeyRound,
  Mail,
  Moon,
  Phone,
  ShieldCheck,
  Smartphone,
  Type,
  UserRound
} from "lucide-react";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Select from "@/components/ui/Select";
import { defaultCurrencyRates } from "@/lib/utils";
import type { ActionState, Profile, ProfileSettings } from "@/types";

type Workspace = "account" | "seller" | "admin";
export type SettingsSection = "profile" | "appearance" | "security" | "notifications" | "payout";

type Preference = {
  key: string;
  title: string;
  detail: string;
  workspaces: Workspace[];
};

const initialState: ActionState = {
  status: "idle"
};

const settingsFormId = "workspace-settings-form";

const preferences: Preference[] = [
  {
    key: "order_updates",
    title: "Order updates",
    detail: "Purchases, delivery access, and order status changes.",
    workspaces: ["account", "seller"]
  },
  {
    key: "wallet_updates",
    title: "Wallet updates",
    detail: "Refunds, releases, withdrawals, and payout movement.",
    workspaces: ["account", "seller", "admin"]
  },
  {
    key: "dispute_updates",
    title: "Dispute updates",
    detail: "Case messages, decisions, and enforcement notices.",
    workspaces: ["account", "seller", "admin"]
  },
  {
    key: "support_updates",
    title: "Support replies",
    detail: "Replies and status changes from customer support.",
    workspaces: ["account", "seller", "admin"]
  },
  {
    key: "marketplace_updates",
    title: "Marketplace activity",
    detail: "Listing publication, takedowns, and marketplace events.",
    workspaces: ["seller", "admin"]
  },
  {
    key: "kyc_updates",
    title: "KYC reviews",
    detail: "Submission, approval, and rejection updates.",
    workspaces: ["seller", "admin"]
  },
  {
    key: "admin_reviews",
    title: "Review queue",
    detail: "KYC, appeals, listings, and feedback waiting for admin action.",
    workspaces: ["admin"]
  },
  {
    key: "admin_operations",
    title: "Operations alerts",
    detail: "Paid orders, disputes, support, and withdrawal requests.",
    workspaces: ["admin"]
  },
  {
    key: "security_updates",
    title: "Security notices",
    detail: "Important account and access notices.",
    workspaces: ["account", "seller", "admin"]
  }
];

function statusVariant(active: boolean) {
  return active ? "success" : "neutral";
}

function getKycVariant(status: Profile["kyc_status"]) {
  if (status === "approved") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "neutral";
}

function getWorkspaceCopy(workspace: Workspace) {
  if (workspace === "admin") {
    return {
      title: "Admin settings",
      description: "Tune your operating profile, access preferences, and notification priorities.",
      identityLabel: "Admin identity"
    };
  }

  if (workspace === "seller") {
    return {
      title: "Seller settings",
      description: "Keep your storefront profile, payout defaults, display, and alerts ready.",
      identityLabel: "Seller identity"
    };
  }

  return {
    title: "Account settings",
    description: "Keep your buyer profile, contact details, display, and alerts current.",
    identityLabel: "Account identity"
  };
}

export default function WorkspaceSettingsForm({
  profile,
  settings,
  workspace,
  section,
  action,
  passwordAction
}: {
  profile: Profile;
  settings: ProfileSettings;
  workspace: Workspace;
  section?: SettingsSection;
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
  passwordAction: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [passwordState, passwordFormAction] = useActionState(passwordAction, initialState);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const copy = getWorkspaceCopy(workspace);
  const shownPreferences = preferences.filter((preference) =>
    preference.workspaces.includes(workspace)
  );
  const hasRestriction = Boolean(
    profile.seller_restricted_until &&
      new Date(profile.seller_restricted_until).getTime() > Date.now()
  );
  const avatarPreviewUrl = useMemo(
    () => (selectedAvatar ? URL.createObjectURL(selectedAvatar) : ""),
    [selectedAvatar]
  );
  const profileInitial = profile.full_name.trim().charAt(0).toUpperCase() || "G";
  const activeSection = section ?? "profile";
  const showProfile = activeSection === "profile";
  const showAppearance = activeSection === "appearance";
  const showSecurity = activeSection === "security";
  const showNotifications = activeSection === "notifications";
  const showPayout = activeSection === "payout" && workspace !== "admin";
  const showStatusPanel = activeSection === "profile";

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-6">
        <form id={settingsFormId} action={formAction} className="space-y-6">
          {!showProfile ? (
            <>
              <input type="hidden" name="fullName" value={profile.full_name} />
              <input type="hidden" name="username" value={profile.username} />
              <input type="hidden" name="phoneNumber" value={settings.phone_number} />
            </>
          ) : null}
          {!showAppearance ? (
            <>
              <input type="hidden" name="displayCurrency" value={settings.display_currency} />
              <input type="hidden" name="themePreference" value={settings.theme_preference} />
              <input type="hidden" name="fontSizePreference" value={settings.font_size_preference} />
            </>
          ) : null}
          {!showSecurity ? (
            <>
              {settings.two_factor_preference_enabled ? (
                <input type="hidden" name="twoFactorPreferenceEnabled" value="on" />
              ) : null}
              <input type="hidden" name="twoFactorMethod" value={settings.two_factor_method} />
            </>
          ) : null}
          {!showPayout && workspace !== "admin" ? (
            <>
              <input type="hidden" name="defaultBankName" value={settings.default_bank_name} />
              <input
                type="hidden"
                name="defaultAccountNumber"
                value={settings.default_account_number}
              />
              <input type="hidden" name="defaultAccountName" value={settings.default_account_name} />
            </>
          ) : null}
          {!showNotifications
            ? shownPreferences.map((preference) =>
                settings.notification_preferences[preference.key] ?? true ? (
                  <input key={preference.key} type="hidden" name={preference.key} value="on" />
                ) : null
              )
            : null}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeSection === "profile"
                  ? copy.title
                  : activeSection === "appearance"
                    ? "Appearance"
                    : activeSection === "security"
                      ? "Security"
                      : activeSection === "notifications"
                        ? "Notifications"
                        : "Payout details"}
              </CardTitle>
              <CardDescription>
                {activeSection === "profile"
                  ? copy.description
                  : activeSection === "appearance"
                    ? "Theme and reading preferences for this workspace."
                    : activeSection === "security"
                      ? "Password and account protection preferences."
                      : activeSection === "notifications"
                        ? "Choose the alerts that deserve your attention."
                        : "Saved bank details for withdrawal requests."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormMessage
                message={state.message}
                tone={state.status === "success" ? "success" : "error"}
              />

              {showProfile ? (
              <>
              <section className="rounded-[24px] border border-border bg-surface p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      {copy.identityLabel}
                    </h2>
                    <p className="text-sm text-muted-foreground">Visible across your workspace.</p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:items-start">
                  <div className="space-y-3">
                    <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[26px] border border-border bg-white text-primary shadow-sm lg:mx-0">
                      {avatarPreviewUrl || profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarPreviewUrl || profile.avatar_url}
                          alt={`${profile.full_name} profile`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-heading text-5xl font-semibold">{profileInitial}</span>
                      )}
                    </div>
                    <label className="mx-auto flex h-11 w-full max-w-36 cursor-pointer items-center justify-center rounded-2xl border border-border bg-white px-3 text-center text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary-soft hover:text-primary lg:mx-0">
                      <Camera className="mr-2 inline h-4 w-4" />
                      Change photo
                      <input
                        name="avatarFile"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) =>
                          setSelectedAvatar(event.currentTarget.files?.[0] ?? null)
                        }
                      />
                    </label>
                    <p className="mx-auto max-w-36 text-center text-xs leading-5 text-muted-foreground lg:mx-0 lg:text-left">
                      JPG, PNG, WEBP. Max 2MB.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-foreground">Full name</span>
                      <Input name="fullName" defaultValue={profile.full_name} required />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-foreground">Username</span>
                      <Input name="username" defaultValue={profile.username} required />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-semibold text-foreground">Email</span>
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="min-w-0 truncate">{profile.email}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </section>
              </>
              ) : null}

              {showProfile ? (
              <section className="rounded-[24px] border border-border bg-surface p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      Contact details
                    </h2>
                    <p className="text-sm text-muted-foreground">Used for checkout and support context.</p>
                  </div>
                </div>
                <Input
                  name="phoneNumber"
                  defaultValue={settings.phone_number}
                  placeholder="+234 801 234 5678"
                />
              </section>
              ) : null}

              {showAppearance ? (
              <section className="rounded-[24px] border border-border bg-surface p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <Moon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      Appearance
                    </h2>
                    <p className="text-sm text-muted-foreground">Display preferences for your workspace.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Display currency
                    </span>
                    <Select name="displayCurrency" defaultValue={settings.display_currency}>
                      {defaultCurrencyRates.map((rate) => (
                        <option key={rate.code} value={rate.code}>
                          {rate.code} - {rate.name}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="space-y-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Moon className="h-4 w-4 text-primary" />
                      Theme
                    </span>
                    <Select name="themePreference" defaultValue={settings.theme_preference}>
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Select>
                  </label>
                  <label className="space-y-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Type className="h-4 w-4 text-primary" />
                      Font size
                    </span>
                    <Select name="fontSizePreference" defaultValue={settings.font_size_preference}>
                      <option value="compact">Compact</option>
                      <option value="comfortable">Comfortable</option>
                      <option value="large">Large</option>
                    </Select>
                  </label>
                </div>
              </section>
              ) : null}

              {showPayout ? (
                <section className="rounded-[24px] border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-heading text-lg font-semibold text-foreground">
                        Payout defaults
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Saved for withdrawal forms and wallet workflows.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      name="defaultBankName"
                      defaultValue={settings.default_bank_name}
                      placeholder="Bank name"
                    />
                    <Input
                      name="defaultAccountNumber"
                      defaultValue={settings.default_account_number}
                      inputMode="numeric"
                      placeholder="Account number"
                    />
                    <Input
                      name="defaultAccountName"
                      defaultValue={settings.default_account_name}
                      placeholder="Account name"
                    />
                  </div>
                </section>
              ) : null}

              {showSecurity ? (
                <section className="space-y-3 rounded-[24px] border border-border bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <Smartphone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">Two-factor authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Preference only until verification setup is enabled.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-foreground">
                    Request 2FA protection
                    <input
                      name="twoFactorPreferenceEnabled"
                      type="checkbox"
                      defaultChecked={settings.two_factor_preference_enabled}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                    />
                  </label>
                  <Select name="twoFactorMethod" defaultValue={settings.two_factor_method}>
                    <option value="authenticator">Authenticator app</option>
                    <option value="email">Email code</option>
                  </Select>
                  <Badge variant={settings.two_factor_preference_enabled ? "warning" : "neutral"}>
                    {settings.two_factor_preference_enabled ? "Setup requested" : "Not requested"}
                  </Badge>
                </section>
              ) : null}

              {showNotifications ? (
                <section className="grid gap-3">
                  {shownPreferences.map((preference) => (
                    <label
                      key={preference.key}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-4"
                    >
                      <span className="flex gap-3">
                        <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                          <Bell className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block font-semibold text-foreground">
                            {preference.title}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                            {preference.detail}
                          </span>
                        </span>
                      </span>
                      <input
                        className="mt-2 h-5 w-5 rounded border-border text-primary focus:ring-primary"
                        name={preference.key}
                        type="checkbox"
                        defaultChecked={settings.notification_preferences[preference.key] ?? true}
                      />
                    </label>
                  ))}
                </section>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Save changes</CardTitle>
              <CardDescription>Appearance changes apply after the save completes.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubmitButton pendingLabel="Saving changes..." className="w-full">
                Save settings
              </SubmitButton>
            </CardContent>
          </Card>
        </form>
      </div>

      <aside className="space-y-6">
        {showStatusPanel ? (
        <Card>
          <CardHeader>
            <CardTitle>Workspace status</CardTitle>
            <CardDescription>Current access and review state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Account
              </span>
              <Badge variant={statusVariant(!profile.is_banned)}>
                {profile.is_banned ? "Suspended" : "Active"}
              </Badge>
            </div>
            {workspace === "seller" ? (
              <>
                <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    KYC
                  </span>
                  <Badge variant={getKycVariant(profile.kyc_status)}>
                    {profile.kyc_status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Seller access
                  </span>
                  <Badge variant={statusVariant(profile.seller_enabled && !hasRestriction)}>
                    {hasRestriction
                      ? "Restricted"
                      : profile.seller_enabled
                        ? "Enabled"
                        : "Locked"}
                  </Badge>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
        ) : null}

        {showSecurity ? (
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Password and two-factor preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form action={passwordFormAction} className="space-y-3 rounded-[24px] border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Change password</p>
                  <p className="text-sm text-muted-foreground">Use your current password to confirm the change.</p>
                </div>
              </div>
              <FormMessage
                message={passwordState.message}
                tone={passwordState.status === "success" ? "success" : "error"}
              />
              <PasswordInput name="currentPassword" placeholder="Current password" required />
              <PasswordInput name="newPassword" placeholder="New password" required />
              <PasswordInput name="confirmPassword" placeholder="Confirm new password" required />
              <SubmitButton pendingLabel="Changing password..." className="w-full">
                Change password
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
        ) : null}
      </aside>
    </div>
  );
}
