"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Settings,
  ShieldPlus,
  Store,
  X
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/branding/BrandLogo";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export default function AccountSidebar({
  profile,
  mobile = false,
  onNavigate
}: {
  profile: Profile;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navItems = [
    { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/account/marketplace", label: "Marketplace", icon: Store },
    { href: "/account/saved", label: "Saved Listings", icon: Bookmark },
    { href: "/account/orders", label: "Orders", icon: PackageCheck },
    {
      href: "/account/seller",
      label: profile.seller_enabled ? "Seller Center" : "Become a Seller",
      icon: ShieldPlus
    },
    { href: "/account/settings", label: "Settings", icon: Settings }
  ];

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-border/70 bg-white text-foreground",
        mobile ? "rounded-r-[32px]" : ""
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 px-6 py-6">
        <div className="flex items-center gap-3">
          <BrandMark className="h-11 w-11" />
          <div>
            <p className="font-heading text-xl font-semibold">Gaming Index</p>
            <p className="text-sm text-muted-foreground">Account workspace</p>
          </div>
        </div>
        {mobile ? (
          <Button variant="ghost" size="sm" onClick={onNavigate}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="space-y-3 border-b border-border/70 px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-foreground">{profile.full_name}</p>
          <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <Badge variant={profile.seller_enabled ? "info" : "neutral"}>
          {profile.seller_enabled ? "Seller access enabled" : "Buyer account"}
        </Badge>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-primary-dark !text-white visited:!text-white hover:!text-white shadow-sm"
                  : "text-muted-foreground hover:bg-primary-soft hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/70 p-4">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start bg-surface text-foreground hover:bg-primary-soft"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
