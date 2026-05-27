"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
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
          <div className="lg:hidden">
            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden xl:block">
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
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {profile.full_name}
        </div>
      </div>
    </div>
  );
}
