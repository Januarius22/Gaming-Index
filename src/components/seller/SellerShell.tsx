"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerTopbar from "@/components/seller/SellerTopbar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export default function SellerShell({
  profile,
  children
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem("gi-seller-sidebar-collapsed");
    setCollapsed(savedValue === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("gi-seller-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex min-h-screen">
        <div
          className={cn(
            "hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block",
            collapsed ? "w-24" : "w-80"
          )}
        >
          <div
            className={cn(
              "fixed inset-y-0 overflow-y-auto transition-[width] duration-300 ease-in-out",
              collapsed ? "w-24" : "w-80"
            )}
          >
            <SellerSidebar profile={profile} collapsed={collapsed} />
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/35 lg:hidden"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.22 }}
                className="h-full w-[84%] max-w-xs overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
              >
                <SellerSidebar profile={profile} mobile onNavigate={() => setOpen(false)} />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <SellerTopbar
            profile={profile}
            collapsed={collapsed}
            mobileMenuOpen={open}
            onCollapseToggle={toggleCollapsed}
            onMenuClick={() => setOpen(true)}
          />
          <div className="flex-1 px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
