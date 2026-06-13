"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Badge from "@/components/ui/Badge";
import AnimatedMenuButton from "@/components/ui/AnimatedMenuButton";
import Button from "@/components/ui/Button";
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
  );
}
