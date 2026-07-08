"use client";

import Link from "next/link";
import { Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Badge from "@/components/ui/Badge";
import AnimatedMenuButton from "@/components/ui/AnimatedMenuButton";
import Button from "@/components/ui/Button";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import type { Profile } from "@/types";

export default function AccountTopbar({
  profile,
  collapsed,
  mobileMenuOpen = false,
  onCollapseToggle,
  onMenuClick
}: {
  profile: Profile;
  collapsed: boolean;
  mobileMenuOpen?: boolean;
  onCollapseToggle: () => void;
  onMenuClick: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-white/90 backdrop-blur-xl">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 lg:hidden">
            <AnimatedMenuButton
              open={mobileMenuOpen}
              onClick={onMenuClick}
              label={mobileMenuOpen ? "Close account menu" : "Open account menu"}
            />
          </div>
          <div className="hidden lg:block">
            <Button variant="ghost" size="sm" onClick={onCollapseToggle}>
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Account Dashboard</p>
            <h1 className="font-heading text-lg font-semibold leading-tight text-foreground sm:text-xl">
              Welcome back, {profile.full_name.split(" ")[0]}
            </h1>
          </div>
        </div>
        <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-3 self-start sm:self-auto">
          <ProfileAvatar profile={profile} className="hidden sm:inline-flex" />
          <Link
            href="/account/notifications"
            aria-label="Open account notifications"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary-soft/70 hover:text-primary-dark"
          >
            <span className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            </span>
            <span className="hidden md:inline">Notifications</span>
          </Link>
          <div className="hidden sm:block">
            <Badge
              variant={profile.seller_enabled ? "info" : "neutral"}
              className="max-w-[11rem] text-center leading-5"
            >
              {profile.seller_enabled ? "Seller access enabled" : "Buyer account"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
