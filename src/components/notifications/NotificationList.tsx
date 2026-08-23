import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  CreditCard,
  Megaphone,
  MessageSquareWarning,
  PackageCheck,
  ShieldAlert,
  UserRound
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Notification } from "@/types";

export type NotificationCategory = "orders" | "wallet" | "disputes" | "account" | "system";

function formatMetadataKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatNotificationType(type: string) {
  return type
    .replace(/^admin_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getNotificationCategory(notification: Notification): NotificationCategory {
  const text = `${notification.type} ${notification.title} ${notification.message}`.toLowerCase();

  if (text.includes("dispute") || text.includes("case")) {
    return "disputes";
  }

  if (
    text.includes("wallet") ||
    text.includes("withdraw") ||
    text.includes("payout") ||
    text.includes("fund") ||
    text.includes("refund")
  ) {
    return "wallet";
  }

  if (
    text.includes("order") ||
    text.includes("checkout") ||
    text.includes("purchase") ||
    text.includes("sale") ||
    text.includes("listing")
  ) {
    return "orders";
  }

  if (
    text.includes("account") ||
    text.includes("kyc") ||
    text.includes("seller") ||
    text.includes("suspend") ||
    text.includes("appeal") ||
    text.includes("deactivation") ||
    text.includes("deletion")
  ) {
    return "account";
  }

  return "system";
}

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "None";
  }

  if (typeof value === "number") {
    return formatCurrency(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function notificationVariant(notification: Notification) {
  if (notification.type.includes("rejected") || notification.type.includes("failed")) {
    return "danger";
  }

  if (notification.type.includes("paid") || notification.type.includes("release")) {
    return "success";
  }

  if (notification.type.includes("request") || notification.type.includes("pending")) {
    return "warning";
  }

  return "info";
}

function notificationIcon(notification: Notification) {
  const category = getNotificationCategory(notification);

  if (notification.type.includes("alert") || notification.type.includes("news")) {
    return Megaphone;
  }

  if (category === "orders") {
    return PackageCheck;
  }

  if (category === "wallet") {
    return CreditCard;
  }

  if (category === "disputes") {
    return MessageSquareWarning;
  }

  if (category === "account") {
    return UserRound;
  }

  return Bell;
}

export default function NotificationList({
  notifications,
  emptyMessage = "No notifications yet.",
  compact = false
}: {
  notifications: Notification[];
  emptyMessage?: string;
  compact?: boolean;
}) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-7 w-7" />}
        title="Nothing new here"
        description={emptyMessage}
        className={cn(compact && "min-h-0 rounded-[22px] px-4 py-8")}
      />
    );
  }

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-3")}>
      {notifications.map((notification) => {
        const metadataEntries = Object.entries(notification.metadata ?? {}).filter(
          ([, value]) => value !== null && value !== undefined && value !== ""
        );
        const unread = !notification.read_at;
        const Icon = notificationIcon(notification);
        const category = getNotificationCategory(notification);

        if (compact) {
          return (
            <div
              key={notification.id}
              className={cn(
                "rounded-[18px] border border-border/60 bg-surface p-3",
                unread && "ring-1 ring-primary/20"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-border/70">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words text-sm font-semibold text-foreground">
                      {notification.title}
                    </p>
                    {unread ? <Badge variant="info">Unread</Badge> : null}
                  </div>
                  <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={notificationVariant(notification)}>
                      {formatNotificationType(notification.type)}
                    </Badge>
                    <Badge variant="neutral">{formatNotificationType(category)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <details
            key={notification.id}
            className={cn(
              "group rounded-[22px] border border-border/60 bg-surface p-4 transition hover:border-primary/25 hover:shadow-[0_18px_50px_-42px_rgba(0,87,255,0.75)]",
              unread && "ring-1 ring-primary/20",
              "space-y-4"
            )}
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-border/70">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words font-semibold text-foreground">
                      {notification.title}
                    </p>
                    {unread ? <Badge variant="info">Unread</Badge> : null}
                  </div>
                  <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={notificationVariant(notification)}>
                      {formatNotificationType(notification.type)}
                    </Badge>
                    <Badge variant="neutral">{formatNotificationType(category)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
            </summary>

            {metadataEntries.length > 0 || notification.link_path ? (
              <div className="border-t border-border/70 pt-4">
                {metadataEntries.length > 0 ? (
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {metadataEntries.map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-white p-3">
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">
                          {formatMetadataKey(key)}
                        </dt>
                        <dd className="mt-1 break-words text-sm text-foreground">
                          {formatMetadataValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {notification.link_path ? (
                  <Link
                    href={notification.link_path}
                    className={buttonClassName({
                      variant: "secondary",
                      size: "sm",
                      className: "mt-4 gap-2"
                    })}
                  >
                    Open related page
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </details>
        );
      })}
    </div>
  );
}
