"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  FileCheck2,
  History,
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
import Button, { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const navItems = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/kyc", label: "KYC Verification", icon: FileCheck2 },
  { href: "/seller/upload", label: "Upload Account", icon: Upload },
  { href: "/seller/listings", label: "My Listings", icon: ListChecks },
  { href: "/seller/history", label: "Listing History", icon: History },
  { href: "/seller/orders", label: "Orders", icon: PackageCheck },
  { href: "/seller/wallet", label: "Wallet", icon: CreditCard },
  { href: "/seller/settings", label: "Settings", icon: Settings }
];

export default function SellerSidebar({
  profile,
  collapsed = false,
  mobile = false,
  onNavigate
}: {
  profile: Profile;
  collapsed?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const collapsedDesktop = collapsed && !mobile;
  const uploadLocked = profile.kyc_status !== "approved";

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-y-auto bg-primary-dark text-white transition-[width,padding] duration-300 ease-in-out",
        mobile ? "rounded-r-[32px]" : "border-r border-white/10"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-white/10 py-6 transition-[padding] duration-300 ease-in-out",
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
            <p className="text-sm text-blue-100/80">Seller workspace</p>
          </div>
        </div>
        {mobile ? (
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onNavigate}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "border-b border-white/10 py-5 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "px-4" : "px-6"
        )}
      >
        <p
          className={cn(
            "overflow-hidden text-sm font-semibold text-white transition-all duration-300 ease-in-out",
            collapsedDesktop ? "max-h-0 max-w-0 opacity-0" : "max-h-10 max-w-[12rem] opacity-100"
          )}
        >
          {profile.full_name}
        </p>
        <p
          className={cn(
            "mt-1 overflow-hidden text-sm text-blue-100/80 transition-all duration-300 ease-in-out",
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
        {navItems.map((item) => {
          const Icon = item.icon;
          const locked = item.href === "/seller/upload" && uploadLocked;
          const active = !locked && pathname === item.href;
          const label = locked ? "Upload Account (KYC pending approval)" : item.label;

          if (locked) {
            return (
              <div
                key={item.href}
                title={collapsedDesktop ? label : undefined}
                className={cn(
                  "flex cursor-not-allowed items-center rounded-2xl py-3 text-sm font-medium text-blue-100/45 transition-all duration-300 ease-in-out",
                  collapsedDesktop ? "justify-center px-3" : "gap-3 px-4",
                  "bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-300 ease-in-out",
                    collapsedDesktop && "scale-105"
                  )}
                />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                    collapsedDesktop ? "max-w-0 opacity-0" : "max-w-[14rem] opacity-100"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsedDesktop ? item.label : undefined}
              className={cn(
                "flex items-center rounded-2xl py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                collapsedDesktop ? "justify-center px-3" : "gap-3 px-4",
                active
                  ? "bg-white !text-primary-dark visited:!text-primary-dark hover:!text-primary-dark shadow-sm"
                  : "text-blue-100/85 hover:bg-white/10 hover:text-white"
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
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "space-y-3 border-t border-white/10 transition-[padding] duration-300 ease-in-out",
          collapsedDesktop ? "p-3" : "p-4"
        )}
      >
        <Link
          href="/account/dashboard"
          onClick={onNavigate}
          title={collapsedDesktop ? "Buyer Dashboard" : undefined}
          className={buttonClassName({
            variant: "secondary",
            className: cn(
              "w-full !text-foreground visited:!text-foreground hover:!text-foreground transition-all duration-300 ease-in-out",
              collapsedDesktop ? "justify-center px-0" : "justify-start"
            )
          })}
        >
          <ArrowLeft
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out",
              collapsedDesktop ? "" : "mr-3"
            )}
          />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
              collapsedDesktop ? "max-w-0 opacity-0" : "max-w-[10rem] opacity-100"
            )}
          >
            Buyer Dashboard
          </span>
        </Link>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            title={collapsedDesktop ? "Logout" : undefined}
            className={cn(
              "w-full bg-white/5 text-white transition-all duration-300 ease-in-out hover:bg-white/10",
              collapsedDesktop ? "justify-center px-0" : "justify-start"
            )}
          >
            <LogOut className={cn("h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out", collapsedDesktop ? "" : "mr-3")} />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                collapsedDesktop ? "max-w-0 opacity-0" : "max-w-[8rem] opacity-100"
              )}
            >
              Logout
            </span>
          </Button>
        </form>
      </div>
    </aside>
  );
}
