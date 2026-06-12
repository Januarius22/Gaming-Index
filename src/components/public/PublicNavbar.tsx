"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Home, Info, LogIn, Menu, Store, UserPlus, X } from "lucide-react";
import { useState } from "react";
import BrandLogo from "@/components/branding/BrandLogo";
import Button, { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", helper: "Back to the main page", icon: Home },
  { href: "/marketplace", label: "Marketplace", helper: "Browse verified accounts", icon: Store },
  { href: "/how-it-works", label: "How It Works", helper: "See how safe trades work", icon: Info },
  { href: "/auth/login", label: "Login", helper: "Return to your account", icon: LogIn }
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHomePage = pathname === "/";

  return (
    <header
      className={cn(
        "z-40 px-4 pt-4 sm:px-6 lg:px-8",
        isHomePage ? "absolute inset-x-0 top-0 px-0 pt-0 sm:px-0 lg:px-0" : "sticky top-0"
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8",
          isHomePage
            ? "rounded-[28px] border border-white/18 bg-slate-950/28 shadow-[0_18px_50px_-35px_rgba(2,10,24,0.75)]"
            : "max-w-7xl rounded-[28px] border border-white/35 bg-white/58 shadow-[0_18px_50px_-35px_rgba(6,43,99,0.45)]"
        )}
        style={isHomePage ? { width: "calc(100vw - clamp(1.5rem, 4vw, 4rem))" } : undefined}
      >
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo theme={isHomePage ? "dark" : "light"} markClassName="h-10 w-10" />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary-soft text-primary"
                    : isHomePage
                      ? "!text-white visited:!text-white hover:!text-white"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/auth/register" className={buttonClassName({ className: "ml-2" })}>
            Get Started
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="sm"
          className={cn("md:hidden", isHomePage && "text-white hover:bg-white/10 hover:text-white")}
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="ml-auto flex h-full w-[min(92vw,26rem)] flex-col overflow-hidden border-l border-white/60 bg-white shadow-[0_30px_90px_-45px_rgba(2,10,24,0.65)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative border-b border-border/70 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_58%,#eaf2ff_100%)] p-5">
                <div className="absolute right-[-4rem] top-[-5rem] h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <BrandLogo
                    theme="light"
                    tagline="Verified account trades"
                    markClassName="h-12 w-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-2xl p-0 hover:bg-white/70"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative mt-5 rounded-3xl border border-white/80 bg-white/70 p-4 shadow-[0_18px_45px_-35px_rgba(6,43,99,0.45)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Gaming Index
                  </p>
                  <p className="mt-2 font-heading text-xl font-semibold leading-tight text-foreground">
                    Trade verified gaming accounts with confidence.
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-3xl border p-3 transition",
                          active
                            ? "border-primary/20 bg-primary-soft text-primary-dark shadow-[0_18px_45px_-38px_rgba(0,87,255,0.65)]"
                            : "border-border/70 bg-white text-foreground hover:border-primary/20 hover:bg-primary-soft/55"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition",
                            active
                              ? "bg-primary text-white"
                              : "bg-surface text-primary group-hover:bg-white"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{item.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                            {item.helper}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto rounded-[28px] border border-primary/12 bg-primary-soft/55 p-4">
                  <p className="font-heading text-lg font-semibold text-foreground">
                    Ready to trade?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Join the marketplace and unlock your buyer workspace.
                  </p>
                  <Link
                    href="/auth/register"
                    className={buttonClassName({
                      size: "lg",
                      className: "mt-4 w-full rounded-2xl"
                    })}
                    onClick={() => setOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
