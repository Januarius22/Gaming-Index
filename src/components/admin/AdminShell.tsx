"use client";

import Link from "next/link";
import { ArrowLeft, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import LogoutConfirmButton from "@/components/auth/LogoutConfirmButton";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Profile, ProfileSettings, SidebarCounts } from "@/types";

export default function AdminShell({
  profile,
  sidebarCounts,
  settings,
  children
}: {
  profile: Profile;
  sidebarCounts: SidebarCounts;
  settings: ProfileSettings;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const preferenceClassName = cn(
    settings.theme_preference === "dark" && "gi-theme-dark",
    settings.theme_preference === "system" && "gi-theme-system",
    `gi-font-${settings.font_size_preference}`
  );

  useEffect(() => {
    const savedValue = window.localStorage.getItem("gi-admin-sidebar-collapsed");
    setCollapsed(savedValue === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("gi-admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className={cn("min-h-screen bg-surface", preferenceClassName)}>
      <div className="flex min-h-screen items-center justify-center px-6 py-12 xl:hidden">
        <div className="w-full max-w-xl rounded-[32px] border border-border/70 bg-white p-8 text-center shadow-[0_24px_80px_-48px_rgba(6,43,99,0.3)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <Monitor className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Desktop only
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground">
            Open the admin panel on a wider screen
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Admin reviews, approvals, and moderation tables are locked to larger displays so
            everything stays readable and easier to manage.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className={buttonClassName({ variant: "primary", size: "lg" })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to homepage
            </Link>
            <LogoutConfirmButton variant="secondary" size="lg" className="w-full gap-2 sm:w-auto" />
          </div>
        </div>
      </div>

      <div className="hidden min-h-screen xl:flex">
        <div
          className={cn(
            "shrink-0 transition-[width] duration-300 ease-in-out",
            collapsed ? "w-24" : "w-80"
          )}
        >
          <div
            className={cn(
              "fixed inset-y-0 overflow-y-auto transition-[width] duration-300 ease-in-out",
              collapsed ? "w-24" : "w-80"
            )}
          >
            <AdminSidebar profile={profile} sidebarCounts={sidebarCounts} collapsed={collapsed} />
          </div>
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminTopbar
            profile={profile}
            collapsed={collapsed}
            onCollapseToggle={toggleCollapsed}
            onMenuClick={() => undefined}
          />
          <div className="flex-1 px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
