"use client";

import Link from "next/link";
import { Bell, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

export default function NotificationToastStack({
  notifications
}: {
  notifications: Notification[];
}) {
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read_at).slice(0, 3),
    [notifications]
  );
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  useEffect(() => {
    const unseenIds = unreadNotifications
      .map((notification) => notification.id)
      .filter((id) => sessionStorage.getItem(`gi-toast-${id}`) !== "dismissed");

    setVisibleIds(unseenIds);

    const timers = unseenIds.map((id, index) =>
      window.setTimeout(() => {
        sessionStorage.setItem(`gi-toast-${id}`, "dismissed");
        setVisibleIds((current) => current.filter((entry) => entry !== id));
      }, 6800 + index * 600)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [unreadNotifications]);

  const visibleNotifications = unreadNotifications.filter((notification) =>
    visibleIds.includes(notification.id)
  );

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-24 z-[70] w-[calc(100vw-2rem)] max-w-sm space-y-3">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="overflow-hidden rounded-[22px] border border-border bg-white shadow-[0_24px_70px_-38px_rgba(6,43,99,0.48)]"
        >
          <div className="flex gap-3 p-4">
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words font-semibold text-foreground">{notification.title}</p>
              <p className="mt-1 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
                {notification.message}
              </p>
              {notification.link_path ? (
                <Link
                  href={notification.link_path}
                  className="mt-2 inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  Open
                </Link>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface hover:text-foreground"
              onClick={() => {
                sessionStorage.setItem(`gi-toast-${notification.id}`, "dismissed");
                setVisibleIds((current) => current.filter((id) => id !== notification.id));
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-1 bg-primary-soft">
            <div className={cn("h-full bg-primary", "animate-[toast-progress_6.8s_linear_forwards]")} />
          </div>
        </div>
      ))}
    </div>
  );
}
