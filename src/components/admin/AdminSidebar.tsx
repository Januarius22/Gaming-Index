"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  CircleDollarSign,
  FileCheck2,
  Headset,
  History,
  LifeBuoy,
  LayoutDashboard,
  ListOrdered,
  Landmark,
  MessageSquareText,
  Star,
  Settings,
  ShieldAlert,
  Store,
  Users,
  UserSquare2,
  X
} from "lucide-react";
import LogoutConfirmButton from "@/components/auth/LogoutConfirmButton";
import { BrandMark } from "@/components/branding/BrandLogo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Profile, SidebarCounts } from "@/types";

const dashboardItem = { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard };
const navGroups = [
  {
    label: "Insights",
    items: [{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 }]
  },
  {
    label: "Members",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/sellers", label: "Sellers", icon: UserSquare2 }
    ]
  },
  {
    label: "Marketplace",
    items: [
      { href: "/admin/listings", label: "Listings", icon: Store },
      { href: "/admin/listing-history", label: "Listing History", icon: History }
    ]
  },
  {
      label: "Reviews",
      items: [
        { href: "/admin/kyc", label: "KYC Reviews", icon: FileCheck2 },
        { href: "/admin/appeals", label: "Appeals", icon: LifeBuoy },
        { href: "/admin/disputes", label: "Disputes", icon: ShieldAlert },
        { href: "/admin/reviews", label: "Seller Reviews", icon: Star },
        { href: "/admin/support", label: "Support", icon: Headset },
        { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText }
      ]
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ListOrdered },
      { href: "/admin/withdrawals", label: "Withdrawals", icon: Landmark },
      { href: "/admin/currencies", label: "Currency Rates", icon: CircleDollarSign }
    ]
  },
  {
    label: "Account",
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
      { href: "/admin/settings", label: "Settings", icon: Settings }
    ]
  }
];

export default function AdminSidebar({
  profile,
  sidebarCounts,
  collapsed = false,
  mobile = false,
  onNavigate
}: {
  profile: Profile;
  sidebarCounts: SidebarCounts;
  collapsed?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const collapsedDesktop = collapsed && !mobile;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col overflow-y-auto bg-white transition-[width,padding] duration-300 ease-in-out",
        mobile ? "rounded-r-[32px]" : "border-r border-border/70"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-border/70 py-6 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "px-4" : "px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <BrandMark className="h-11 w-11" />
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              collapsedDesktop ? "max-w-0 opacity-0" : "max-w-[12rem] opacity-100"
            )}
          >
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

      <div
        className={cn(
          "border-b border-border/70 py-5 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "px-4" : "px-6"
        )}
      >
        <p
          className={cn(
            "overflow-hidden text-sm font-semibold text-foreground transition-all duration-300 ease-in-out",
            collapsedDesktop ? "max-h-0 max-w-0 opacity-0" : "max-h-10 max-w-[12rem] opacity-100"
          )}
        >
          {profile.full_name}
        </p>
        <p
          className={cn(
            "mt-1 overflow-hidden text-sm text-muted-foreground transition-all duration-300 ease-in-out",
            collapsedDesktop ? "max-h-0 max-w-0 opacity-0" : "max-h-10 max-w-[12rem] opacity-100"
          )}
        >
          @{profile.username}
        </p>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto py-6 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "px-3" : "px-4"
        )}
      >
        {[dashboardItem].map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsedDesktop ? item.label : undefined}
              className={cn(
                "relative flex items-center rounded-2xl py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                collapsedDesktop ? "justify-center px-3" : "gap-3 px-4",
                active
                  ? "bg-primary !text-white visited:!text-white hover:!text-white shadow-[0_18px_30px_-20px_rgba(0,87,255,0.8)]"
                  : "text-muted-foreground hover:bg-primary-soft hover:text-primary-dark"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300 ease-in-out", collapsedDesktop && "scale-105")} />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  collapsedDesktop ? "max-w-0 opacity-0" : "max-w-[10rem] opacity-100"
                )}
              >
                {item.label}
              </span>
              <SidebarCountBadge count={sidebarCounts[item.href]} collapsed={collapsedDesktop} />
            </Link>
          );
        })}
        {navGroups.map((group) => (
          <div key={group.label} className="pt-4 first:pt-0">
            <p
              className={cn(
                "px-4 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-all duration-300 ease-in-out",
                collapsedDesktop ? "max-h-0 overflow-hidden p-0 opacity-0" : "max-h-8 opacity-100"
              )}
            >
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsedDesktop ? item.label : undefined}
                    className={cn(
                      "relative flex items-center rounded-2xl py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                      collapsedDesktop ? "justify-center px-3" : "gap-3 px-4",
                      active
                        ? "bg-primary !text-white visited:!text-white hover:!text-white shadow-[0_18px_30px_-20px_rgba(0,87,255,0.8)]"
                        : "text-muted-foreground hover:bg-primary-soft hover:text-primary-dark"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300 ease-in-out", collapsedDesktop && "scale-105")} />
                    <span
                      className={cn(
                        "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                        collapsedDesktop ? "max-w-0 opacity-0" : "max-w-[10rem] opacity-100"
                      )}
                    >
                      {item.label}
                    </span>
                    <SidebarCountBadge count={sidebarCounts[item.href]} collapsed={collapsedDesktop} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "border-t border-border/70 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "p-3" : "p-4"
        )}
      >
        <LogoutConfirmButton
          variant="secondary"
          title={collapsedDesktop ? "Logout" : undefined}
          className={cn(
            "w-full transition-all duration-300 ease-in-out",
            collapsedDesktop ? "justify-center px-0" : "justify-start"
          )}
          iconClassName={cn(
            "transition-transform duration-300 ease-in-out",
            collapsedDesktop ? "" : "mr-3"
          )}
          labelClassName={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
            collapsedDesktop ? "max-w-0 opacity-0" : "max-w-[8rem] opacity-100"
          )}
        >
          Logout
        </LogoutConfirmButton>
      </div>
    </aside>
  );
}

function SidebarCountBadge({
  count,
  collapsed
}: {
  count?: number;
  collapsed: boolean;
}) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm",
        collapsed ? "absolute right-1 top-1" : "ml-auto"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
