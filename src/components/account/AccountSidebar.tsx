"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Bell,
  BookOpen,
  CircleHelp,
  CreditCard,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareText,
  PackageCheck,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShieldPlus,
  ShoppingCart,
  Store,
  X
} from "lucide-react";
import LogoutConfirmButton from "@/components/auth/LogoutConfirmButton";
import { BrandMark } from "@/components/branding/BrandLogo";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Profile, SidebarCounts } from "@/types";

export default function AccountSidebar({
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
  const dashboardItem = { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard };
  const navGroups = [
    {
      label: "Explore",
      items: [
        { href: "/account/marketplace", label: "Marketplace", icon: Store },
        {
          href: "/account/seller",
          label: profile.seller_enabled ? "Seller Center" : "Become a Seller",
          icon: ShieldPlus
        },
        { href: "/account/saved", label: "Saved Listings", icon: Bookmark }
      ]
    },
    {
      label: "Purchases",
      items: [
        { href: "/account/cart", label: "Cart", icon: ShoppingCart },
        { href: "/account/orders", label: "Order History", icon: PackageCheck },
        { href: "/account/disputes", label: "Disputes", icon: ShieldAlert }
      ]
    },
    {
      label: "Wallet",
      items: [
        { href: "/account/wallet", label: "Wallet", icon: CreditCard },
        { href: "/account/withdrawals", label: "Withdrawals", icon: Landmark },
        { href: "/account/transactions", label: "Transactions", icon: ReceiptText }
      ]
    },
    {
      label: "Account",
      items: [
        { href: "/account/notifications", label: "Notifications", icon: Bell },
        { href: "/account/support", label: "Support", icon: LifeBuoy },
        { href: "/account/help", label: "Help", icon: BookOpen },
        { href: "/account/faq", label: "FAQs", icon: CircleHelp },
        { href: "/account/feedback", label: "Feedback", icon: MessageSquareText },
        { href: "/account/settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-border/70 bg-white text-foreground transition-[width,padding] duration-300 ease-in-out",
        mobile ? "rounded-r-[32px]" : ""
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

      <div
        className={cn(
          "space-y-3 border-b border-border/70 py-5 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "px-4" : "px-6"
        )}
      >
        <div>
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
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            collapsedDesktop ? "max-h-0 max-w-0 opacity-0" : "max-h-12 max-w-[14rem] opacity-100"
          )}
        >
          <Badge variant={profile.seller_enabled ? "info" : "neutral"}>
            {profile.seller_enabled ? "Seller access enabled" : "Buyer account"}
          </Badge>
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto py-6 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "px-3" : "px-4"
        )}
      >
        {[dashboardItem].map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                  ? "bg-primary-dark !text-white visited:!text-white hover:!text-white shadow-sm"
                  : "text-muted-foreground hover:bg-primary-soft hover:text-foreground"
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
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                        ? "bg-primary-dark !text-white visited:!text-white hover:!text-white shadow-sm"
                        : "text-muted-foreground hover:bg-primary-soft hover:text-foreground"
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
          variant="ghost"
          title={collapsedDesktop ? "Logout" : undefined}
          className={cn(
            "w-full bg-surface text-foreground transition-all duration-300 ease-in-out hover:bg-primary-soft",
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
