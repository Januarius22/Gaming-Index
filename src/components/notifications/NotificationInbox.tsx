import Link from "next/link";
import { Bell, CheckCheck, Inbox, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { markMyNotificationsReadAction } from "@/actions/notifications";
import NotificationList, { getNotificationCategory } from "@/components/notifications/NotificationList";
import SubmitButton from "@/components/auth/SubmitButton";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { cn, paginateItems, parsePageParam } from "@/lib/utils";
import type { Notification } from "@/types";

const categories = [
  { label: "All", value: "all" },
  { label: "Orders", value: "orders" },
  { label: "Wallet", value: "wallet" },
  { label: "Disputes", value: "disputes" },
  { label: "Account", value: "account" },
  { label: "System", value: "system" }
] as const;

type NotificationCategory = (typeof categories)[number]["value"];

function safeCategory(value?: string): NotificationCategory {
  return categories.some((category) => category.value === value)
    ? (value as NotificationCategory)
    : "all";
}

function buildQuery({
  category,
  unread,
  page
}: {
  category: NotificationCategory;
  unread: boolean;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (category !== "all") {
    params.set("category", category);
  }

  if (unread) {
    params.set("filter", "unread");
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export default function NotificationInbox({
  notifications,
  title,
  description,
  pathname,
  emptyMessage,
  searchParams = {}
}: {
  notifications: Notification[];
  title: string;
  description: string;
  pathname: string;
  emptyMessage: string;
  searchParams?: { page?: string; category?: string; filter?: string };
}) {
  const activeCategory = safeCategory(searchParams.category);
  const unreadOnly = searchParams.filter === "unread";
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;
  const filteredNotifications = notifications.filter((notification) => {
    if (unreadOnly && notification.read_at) {
      return false;
    }

    if (activeCategory === "all") {
      return true;
    }

    return getNotificationCategory(notification) === activeCategory;
  });
  const requestedPage = parsePageParam(searchParams.page);
  const {
    items: paginatedNotifications,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(filteredNotifications, requestedPage, 5);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <form action={markMyNotificationsReadAction}>
          <input type="hidden" name="returnTo" value={pathname} />
          <SubmitButton
            variant="secondary"
            size="sm"
            className="gap-2 rounded-2xl"
            disabled={unreadCount === 0}
            pendingLabel="Marking..."
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </SubmitButton>
        </form>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={<Inbox className="h-5 w-5" />} label="Total" value={notifications.length} />
          <SummaryCard icon={<Bell className="h-5 w-5" />} label="Unread" value={unreadCount} />
          <SummaryCard icon={<ShieldAlert className="h-5 w-5" />} label="Visible" value={filteredNotifications.length} />
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-surface p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Link
                key={category.value}
                href={`${pathname}${buildQuery({ category: category.value, unread: unreadOnly })}`}
                className={cn(
                  "shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                  activeCategory === category.value
                    ? "bg-primary text-white shadow-[0_14px_30px_-18px_rgba(0,87,255,0.8)]"
                    : "bg-white text-muted-foreground hover:bg-primary-soft hover:text-primary"
                )}
              >
                {category.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${pathname}${buildQuery({ category: activeCategory, unread: false })}`}
              className={buttonClassName({
                variant: unreadOnly ? "secondary" : "primary",
                size: "sm",
                className: "rounded-2xl"
              })}
            >
              All messages
            </Link>
            <Link
              href={`${pathname}${buildQuery({ category: activeCategory, unread: true })}`}
              className={buttonClassName({
                variant: unreadOnly ? "primary" : "secondary",
                size: "sm",
                className: "rounded-2xl"
              })}
            >
              Unread only
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} notifications
          </p>
          <PaginationControls
            pathname={pathname}
            currentPage={currentPage}
            totalPages={totalPages}
            query={{
              category: activeCategory === "all" ? undefined : activeCategory,
              filter: unreadOnly ? "unread" : undefined
            }}
          />
        </div>

        <NotificationList notifications={paginatedNotifications} emptyMessage={emptyMessage} />
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
          {icon}
        </span>
      </div>
      <p className="mt-2 font-heading text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
