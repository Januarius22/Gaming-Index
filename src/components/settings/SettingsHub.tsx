import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  LockKeyhole,
  Moon,
  ShieldAlert,
  UserRound
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProfileSettings } from "@/types";

type Workspace = "account" | "seller" | "admin";

const sections = [
  {
    key: "profile",
    title: "Profile",
    detail: "Name, username, photo, and contact details.",
    icon: UserRound,
    workspaces: ["account", "seller", "admin"] as Workspace[]
  },
  {
    key: "currency",
    title: "Currency",
    detail: "Choose how prices are displayed in your workspace.",
    icon: CircleDollarSign,
    workspaces: ["account", "seller", "admin"] as Workspace[]
  },
  {
    key: "appearance",
    title: "Appearance",
    detail: "Theme and font size for your dashboard.",
    icon: Moon,
    workspaces: ["account", "seller", "admin"] as Workspace[]
  },
  {
    key: "security",
    title: "Security",
    detail: "Password and two-factor preference.",
    icon: LockKeyhole,
    workspaces: ["account", "seller", "admin"] as Workspace[]
  },
  {
    key: "notifications",
    title: "Notifications",
    detail: "Choose which updates should alert you.",
    icon: Bell,
    workspaces: ["account", "seller", "admin"] as Workspace[]
  },
  {
    key: "payout",
    title: "Payout Details",
    detail: "Saved bank details for withdrawals.",
    icon: CreditCard,
    workspaces: ["account", "seller"] as Workspace[]
  },
  {
    key: "account-control",
    title: "Account Control",
    detail: "Deactivate your account or request permanent deletion.",
    icon: ShieldAlert,
    workspaces: ["account", "seller"] as Workspace[]
  }
];

function formatTheme(value: ProfileSettings["theme_preference"]) {
  return value === "system" ? "System" : value === "dark" ? "Dark" : "Light";
}

function formatFontSize(value: ProfileSettings["font_size_preference"]) {
  return value === "compact" ? "Compact" : value === "large" ? "Large" : "Comfortable";
}

export default function SettingsHub({
  workspace,
  settings
}: {
  workspace: Workspace;
  settings: ProfileSettings;
}) {
  const availableSections = sections.filter((section) => section.workspaces.includes(workspace));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your profile, display, security, and workspace preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {availableSections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.key}
                href={`/${workspace}/settings/${section.key}`}
                className="group flex min-h-36 items-start justify-between gap-4 rounded-[24px] border border-border bg-surface p-5 transition hover:border-primary/40 hover:bg-primary-soft/70"
              >
                <span className="flex min-w-0 gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-lg font-semibold text-foreground">
                      {section.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                      {section.detail}
                    </span>
                    {section.key === "appearance" ? (
                      <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {formatTheme(settings.theme_preference)} / {formatFontSize(settings.font_size_preference)}
                      </span>
                    ) : null}
                    {section.key === "currency" ? (
                      <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {settings.display_currency}
                      </span>
                    ) : null}
                  </span>
                </span>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
