"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Notification, SidebarCounts } from "@/types";

type NotificationResponse = {
  notifications?: Notification[];
  unreadCount?: number;
};

export function useLiveNotifications({
  initialNotifications,
  initialSidebarCounts,
  notificationsPath,
  intervalMs = 20000
}: {
  initialNotifications: Notification[];
  initialSidebarCounts: SidebarCounts;
  notificationsPath: string;
  intervalMs?: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(
    initialSidebarCounts[notificationsPath] ??
      initialNotifications.filter((notification) => !notification.read_at).length
  );
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setNotifications(initialNotifications);
    setUnreadCount(
      initialSidebarCounts[notificationsPath] ??
        initialNotifications.filter((notification) => !notification.read_at).length
    );
  }, [initialNotifications, initialSidebarCounts, notificationsPath]);

  const refreshNotifications = useCallback(async () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/notifications?limit=5", {
        cache: "no-store",
        signal: controller.signal
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as NotificationResponse;
      const nextNotifications = Array.isArray(data.notifications)
        ? data.notifications
        : [];
      const nextUnreadCount =
        typeof data.unreadCount === "number"
          ? data.unreadCount
          : nextNotifications.filter((notification) => !notification.read_at).length;

      setNotifications(nextNotifications);
      setUnreadCount(nextUnreadCount);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        // Live notification refresh is progressive enhancement.
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(refreshNotifications, intervalMs);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshNotifications();
      }
    };

    window.addEventListener("focus", refreshNotifications);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshNotifications);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      abortRef.current?.abort();
    };
  }, [intervalMs, refreshNotifications]);

  const sidebarCounts = useMemo(
    () => ({
      ...initialSidebarCounts,
      [notificationsPath]: unreadCount
    }),
    [initialSidebarCounts, notificationsPath, unreadCount]
  );

  return { notifications, sidebarCounts };
}
