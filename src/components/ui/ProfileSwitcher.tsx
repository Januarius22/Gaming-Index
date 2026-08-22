"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  ListOrdered,
  Settings,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  Store
} from "lucide-react";
import LogoutConfirmButton from "@/components/auth/LogoutConfirmButton";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

type Workspace = "account" | "seller" | "admin";

const workspaceLabels: Record<Workspace, string> = {
  account: "Account",
  seller: "Seller",
  admin: "Admin"
};

export default function ProfileSwitcher({
  profile,
  workspace,
  className,
  showName = false
}: {
  profile: Pick<Profile, "full_name" | "avatar_url" | "role" | "seller_enabled">;
  workspace: Workspace;
  className?: string;
  showName?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const sellerHref = profile.seller_enabled ? "/seller/dashboard" : "/account/seller";
  const sellerLabel = profile.seller_enabled ? "Seller dashboard" : "Unlock seller access";

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-white p-1 pr-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary-soft/60 focus:outline-none focus:ring-4 focus:ring-ring"
      >
        <ProfileAvatar profile={profile} className="h-9 w-9" />
        {showName ? (
          <span className="hidden max-w-[10rem] truncate md:inline">{profile.full_name}</span>
        ) : null}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-[24px] border border-border bg-white p-2 text-sm text-foreground shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]"
        >
          <div className="flex items-center gap-3 rounded-[20px] bg-surface p-3">
            <ProfileAvatar profile={profile} className="h-11 w-11" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{workspaceLabels[workspace]} workspace</p>
            </div>
          </div>

          <div className="mt-2 grid gap-1">
            {workspace === "admin" ? (
              <>
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Admin dashboards
                </p>
                <SwitcherLink
                  href="/admin/dashboard"
                  active={pathname === "/admin/dashboard"}
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Operations dashboard"
                  onClick={() => setOpen(false)}
                />
                <SwitcherLink
                  href="/admin/analytics"
                  active={pathname === "/admin/analytics"}
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Analytics"
                  onClick={() => setOpen(false)}
                />
                <SwitcherLink
                  href="/admin/orders"
                  active={pathname === "/admin/orders"}
                  icon={<ListOrdered className="h-4 w-4" />}
                  label="Orders"
                  onClick={() => setOpen(false)}
                />
                <SwitcherLink
                  href="/admin/disputes"
                  active={pathname.startsWith("/admin/disputes")}
                  icon={<ShieldAlert className="h-4 w-4" />}
                  label="Disputes"
                  onClick={() => setOpen(false)}
                />
                <SwitcherLink
                  href="/admin/currencies"
                  active={pathname === "/admin/currencies"}
                  icon={<CircleDollarSign className="h-4 w-4" />}
                  label="Currency rates"
                  onClick={() => setOpen(false)}
                />
                <SwitcherLink
                  href="/admin/business"
                  active={pathname === "/admin/business"}
                  icon={<SlidersHorizontal className="h-4 w-4" />}
                  label="Business settings"
                  onClick={() => setOpen(false)}
                />
                <p className="border-t border-border px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Workspaces
                </p>
              </>
            ) : null}
            <SwitcherLink
              href="/account/dashboard"
              active={workspace === "account"}
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Account dashboard"
              onClick={() => setOpen(false)}
            />
            <SwitcherLink
              href={sellerHref}
              active={workspace === "seller"}
              icon={<Store className="h-4 w-4" />}
              label={sellerLabel}
              onClick={() => setOpen(false)}
            />
            {profile.role === "admin" && workspace !== "admin" ? (
              <SwitcherLink
                href="/admin/dashboard"
                active={false}
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Admin dashboard"
                onClick={() => setOpen(false)}
              />
            ) : null}
            <SwitcherLink
              href={`/${workspace}/settings`}
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              onClick={() => setOpen(false)}
            />
          </div>

          <div className="mt-2 border-t border-border pt-2">
            <LogoutConfirmButton
              variant="ghost"
              size="sm"
              className="h-11 w-full justify-start gap-3 rounded-2xl px-3 text-danger hover:bg-danger/10"
              iconClassName="text-danger"
            >
              Logout
            </LogoutConfirmButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SwitcherLink({
  href,
  icon,
  label,
  active = false,
  onClick
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold transition",
        active
          ? "bg-primary-soft text-primary-dark"
          : "text-muted-foreground hover:bg-primary-soft/70 hover:text-foreground"
      )}
    >
      <span className={cn("text-primary", active && "text-primary-dark")}>{icon}</span>
      <span>{label}</span>
      {active ? (
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-primary">
          Current
        </span>
      ) : null}
    </Link>
  );
}
