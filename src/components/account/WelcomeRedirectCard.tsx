"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";

export default function WelcomeRedirectCard() {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/account/dashboard");
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full rounded-[36px] border border-border/70 bg-white p-8 text-center shadow-[0_28px_90px_-55px_rgba(6,43,99,0.45)] sm:p-10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-soft text-primary">
          <Sparkles className="h-7 w-7" />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Welcome to Gaming Index
          </p>
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Your account is ready.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
            We&apos;re taking you to your dashboard now so you can start browsing and unlock
            seller tools later whenever you&apos;re ready.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>

          <Link
            href="/account/dashboard"
            className={buttonClassName({ size: "lg", className: "rounded-2xl" })}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
