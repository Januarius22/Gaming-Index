"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileCheck2,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Settings,
  ShieldAlert,
  Store,
  Users,
  UserSquare2,
  X
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/branding/BrandLogo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sellers", label: "Sellers", icon: UserSquare2 },
  { href: "/admin/listings", label: "Listings", icon: Store },
  { href: "/admin/kyc", label: "KYC Reviews", icon: FileCheck2 },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
  { href: "/admin/disputes", label: "Disputes", icon: ShieldAlert },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminSidebar({
  profile,
  mobile = false,
  onNavigate
}: {
  profile: Profile;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col overflow-y-auto bg-white",
        mobile ? "rounded-r-[32px]" : "border-r border-border/70"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 px-6 py-6">
        <div className="flex items-center gap-3">
          <BrandMark className="h-11 w-11" />
          <div>
            <p className="font-heading text-xl font-semibold text-foreground">Gaming Index</p>
            <p className="text-sm text-muted-foreground">Admin workspace</p>
          </div>
        </div>
        {mobile ? (
          <Button variant="ghost" size="sm" onClick={onNavigate}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="border-b border-border/70 px-6 py-5">
        <p className="text-sm font-semibold text-foreground">{profile.full_name}</p>
        <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>
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
                  ? "bg-primary !text-white visited:!text-white hover:!text-white shadow-[0_18px_30px_-20px_rgba(0,87,255,0.8)]"
                  : "text-muted-foreground hover:bg-primary-soft hover:text-primary-dark"
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
          <Button type="submit" variant="secondary" className="w-full justify-start">
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
