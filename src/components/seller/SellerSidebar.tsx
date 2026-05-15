"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  ListChecks,
  LogOut,
  PackageCheck,
  Settings,
  Upload,
  X
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/branding/BrandLogo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const navItems = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/kyc", label: "KYC Verification", icon: FileCheck2 },
  { href: "/seller/upload", label: "Upload Account", icon: Upload },
  { href: "/seller/listings", label: "My Listings", icon: ListChecks },
  { href: "/seller/orders", label: "Orders", icon: PackageCheck },
  { href: "/seller/wallet", label: "Wallet", icon: CreditCard },
  { href: "/seller/settings", label: "Settings", icon: Settings }
];

export default function SellerSidebar({
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
        "flex h-full min-h-0 w-full flex-col overflow-y-auto bg-primary-dark text-white",
        mobile ? "rounded-r-[32px]" : "border-r border-white/10"
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <BrandMark className="h-11 w-11" />
          <div>
            <p className="font-heading text-xl font-semibold">Gaming Index</p>
            <p className="text-sm text-blue-100/80">Seller workspace</p>
          </div>
        </div>
        {mobile ? (
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onNavigate}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-sm font-semibold text-white">{profile.full_name}</p>
        <p className="mt-1 text-sm text-blue-100/80">@{profile.username}</p>
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
                  ? "bg-white text-primary-dark shadow-sm"
                  : "text-blue-100/85 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start bg-white/5 text-white hover:bg-white/10"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
