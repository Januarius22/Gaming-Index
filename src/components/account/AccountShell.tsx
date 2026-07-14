"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AccountShellProvider } from "@/components/account/AccountShellContext";
import AccountSidebar from "@/components/account/AccountSidebar";
import AccountTopbar from "@/components/account/AccountTopbar";
import AnnouncementMarquee from "@/components/announcements/AnnouncementMarquee";
import NotificationToastStack from "@/components/notifications/NotificationToastStack";
import { useLiveNotifications } from "@/components/notifications/useLiveNotifications";
import { usePreferenceClassName } from "@/components/settings/usePreferenceClassName";
import { cn } from "@/lib/utils";
import type { Notification, Profile, ProfileSettings, SidebarCounts, SiteAnnouncement } from "@/types";

export default function AccountShell({
  profile,
  sidebarCounts,
  settings,
  notifications = [],
  announcements = [],
  children
}: {
  profile: Profile;
  sidebarCounts: SidebarCounts;
  settings: ProfileSettings;
  notifications?: Notification[];
  announcements?: SiteAnnouncement[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverPreviewOpen, setHoverPreviewOpen] = useState(false);
  const [supportsHoverPreview, setSupportsHoverPreview] = useState(false);
  const liveNotifications = useLiveNotifications({
    initialNotifications: notifications,
    initialSidebarCounts: sidebarCounts,
    notificationsPath: "/account/notifications"
  });

  useEffect(() => {
    const savedValue = window.localStorage.getItem("gi-account-sidebar-collapsed");
    setCollapsed(savedValue === "true");
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncSupport = () => {
      setSupportsHoverPreview(mediaQuery.matches);
    };

    syncSupport();
    mediaQuery.addEventListener("change", syncSupport);

    return () => {
      mediaQuery.removeEventListener("change", syncSupport);
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("gi-account-sidebar-collapsed", String(next));
      return next;
    });
  };

  const sidebarExpanded = !collapsed || (supportsHoverPreview && hoverPreviewOpen);
  const preferenceClassName = usePreferenceClassName(settings);

  return (
    <AccountShellProvider
      value={{
        sidebarExpanded,
        sidebarCollapsed: !sidebarExpanded
      }}
    >
      <div className={cn("min-h-screen bg-surface", preferenceClassName)}>
        <NotificationToastStack notifications={liveNotifications.notifications} />
        <div className="flex min-h-screen">
          <div
            className={cn(
              "hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block",
              sidebarExpanded ? "w-80" : "w-24"
            )}
            onMouseEnter={() => {
              if (collapsed && supportsHoverPreview) {
                setHoverPreviewOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (collapsed) {
                setHoverPreviewOpen(false);
              }
            }}
            onFocusCapture={() => {
              if (collapsed && supportsHoverPreview) {
                setHoverPreviewOpen(true);
              }
            }}
            onBlurCapture={(event) => {
              if (
                collapsed &&
                !event.currentTarget.contains(event.relatedTarget as Node | null)
              ) {
                setHoverPreviewOpen(false);
              }
            }}
          >
            <div
              className={cn(
                "fixed inset-y-0 overflow-y-auto transition-[width] duration-300 ease-in-out",
                sidebarExpanded ? "w-80" : "w-24"
              )}
            >
              <AccountSidebar profile={profile} sidebarCounts={liveNotifications.sidebarCounts} collapsed={!sidebarExpanded} />
            </div>
          </div>

          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/35 lg:hidden"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.22 }}
                  className="h-full w-[84%] max-w-xs overflow-y-auto"
                  onClick={(event) => event.stopPropagation()}
                >
                  <AccountSidebar profile={profile} sidebarCounts={liveNotifications.sidebarCounts} mobile onNavigate={() => setOpen(false)} />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <AccountTopbar
              profile={profile}
              collapsed={collapsed}
              mobileMenuOpen={open}
              onCollapseToggle={toggleCollapsed}
              onMenuClick={() => setOpen(true)}
            />
            <AnnouncementMarquee announcements={announcements} />
            <div className="flex-1 px-4 py-6 sm:px-6">{children}</div>
          </div>
        </div>
      </div>
    </AccountShellProvider>
  );
}
