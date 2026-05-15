"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerTopbar from "@/components/seller/SellerTopbar";
import type { Profile } from "@/types";

export default function SellerShell({
  profile,
  children
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex min-h-screen">
        <div className="hidden w-80 shrink-0 lg:block">
          <div className="fixed inset-y-0 w-80 overflow-y-auto">
            <SellerSidebar profile={profile} />
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
          <SellerTopbar profile={profile} onMenuClick={() => setOpen(true)} />
          <div className="flex-1 px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
