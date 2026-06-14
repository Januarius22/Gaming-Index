import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";
import type { Notification } from "@/types";

function formatMetadataKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "None";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
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
      <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const metadataEntries = Object.entries(notification.metadata ?? {}).filter(
          ([, value]) => value !== null && value !== undefined && value !== ""
        );
        const unread = !notification.read_at;

        return (
          <details
            key={notification.id}
            className={cn(
              "group rounded-[22px] bg-surface p-4",
              unread && "ring-1 ring-primary/20",
              compact ? "space-y-2" : "space-y-4"
            )}
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
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
                  <Badge variant={notificationVariant(notification)}>{notification.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </div>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
            </summary>

            {(metadataEntries.length > 0 || notification.link_path) && !compact ? (
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
