"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import BrandLogo from "@/components/branding/BrandLogo";
import Button, { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/auth/login", label: "Login" }
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
            className="fixed inset-0 z-50 bg-slate-950/30 md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22 }}
              className="ml-auto flex h-full w-72 flex-col border-l border-white/30 bg-white/85 p-6 backdrop-blur-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-semibold">Menu</span>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary-soft"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/auth/register"
                  className={buttonClassName({ className: "mt-3 w-full" })}
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
