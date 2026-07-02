"use client";

import { useActionState } from "react";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  Mail,
  Phone,
  ShieldCheck,
  UserRound
} from "lucide-react";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import type { ActionState, Profile, ProfileSettings } from "@/types";

type Workspace = "account" | "seller" | "admin";

type Preference = {
  key: string;
  title: string;
  detail: string;
  workspaces: Workspace[];
};

const initialState: ActionState = {
  status: "idle"
};

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
      description: "Tune your operating profile and notification priorities.",
      identityLabel: "Admin identity"
    };
  }

  if (workspace === "seller") {
    return {
      title: "Seller settings",
      description: "Keep your storefront profile, payout defaults, and alerts ready.",
      identityLabel: "Seller identity"
    };
  }

  return {
    title: "Account settings",
    description: "Keep your buyer profile, contact details, and alerts current.",
    identityLabel: "Account identity"
  };
}

export default function WorkspaceSettingsForm({
  profile,
  settings,
  workspace,
  action
}: {
  profile: Profile;
  settings: ProfileSettings;
  workspace: Workspace;
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const copy = getWorkspaceCopy(workspace);
  const shownPreferences = preferences.filter((preference) =>
    preference.workspaces.includes(workspace)
  );
  const hasRestriction = Boolean(
    profile.seller_restricted_until &&
      new Date(profile.seller_restricted_until).getTime() > Date.now()
  );

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormMessage
              message={state.message}
              tone={state.status === "success" ? "success" : "error"}
            />

            <section className="rounded-[24px] border border-border bg-surface p-4">
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
            </section>

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

            {workspace !== "admin" ? (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
            <CardDescription>Choose the alerts that deserve your attention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
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
                    <span className="block font-semibold text-foreground">{preference.title}</span>
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
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Save changes</CardTitle>
            <CardDescription>Changes apply to this workspace immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" type="submit">
              Save settings
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
