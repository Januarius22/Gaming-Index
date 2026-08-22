"use client";

import Link from "next/link";
import { Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import AnimatedMenuButton from "@/components/ui/AnimatedMenuButton";
import Button from "@/components/ui/Button";
import ProfileSwitcher from "@/components/ui/ProfileSwitcher";
import type { Profile } from "@/types";

export default function AdminTopbar({
  profile,
  collapsed,
  onCollapseToggle,
  onMenuClick
}: {
  profile: Profile;
  collapsed: boolean;
  onCollapseToggle: () => void;
  onMenuClick: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="min-[700px]:hidden">
            <AnimatedMenuButton onClick={onMenuClick} label="Open admin menu" />
          </div>
          <div className="hidden min-[700px]:block">
            <Button variant="ghost" size="sm" onClick={onCollapseToggle}>
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              Operations control center
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/admin/notifications"
            aria-label="Open admin notifications"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary-soft/70 hover:text-primary-dark"
          >
            <span className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            </span>
            <span>Notifications</span>
          </Link>
          <ProfileSwitcher profile={profile} workspace="admin" showName />
        </div>
      </div>
    </div>
  );
}
