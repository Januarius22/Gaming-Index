"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Store,
  UserPlus2
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const authModes = [
  { href: "/auth/register", label: "Create Account" },
  { href: "/auth/login", label: "Login" }
];

export default function AuthFormShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRegister = pathname === "/auth/register";
  const eyebrow = isRegister ? "BEGIN YOUR jOURNEY WITH US!" : "WELCOME BACK!";
  const heroTitle = isRegister ? "One account, all set." : "Your account is ready.";
  const heroDescription = isRegister
    ? "Browse first. Turn on seller tools later."
    : "Login to open your dashboard fast.";
  const formTitle = isRegister ? "Create your account" : "Login to your account";
  const formDescription = isRegister
    ? "Set up your profile in a minute."
    : "Continue where you left off.";

  const highlights = isRegister
    ? [
        {
          title: "Buyer-ready",
          detail: "Browse, save, and manage activity from one account.",
          icon: Store
        },
        {
          title: "Seller unlock",
          detail: "Turn on selling tools only when you are ready to list.",
          icon: ShieldCheck
        }
      ]
    : [
        {
          title: "One login",
          detail: "Your account and seller tools stay connected.",
          icon: CheckCircle2
        },
        {
          title: "Quick return",
          detail: "Jump back into your dashboard.",
          icon: Sparkles
        }
      ];

  const registerJourney = [
    {
      title: "Create account",
      detail: "Set up your profile in under a minute.",
      icon: UserPlus2
    },
    {
      title: "Welcome screen",
      detail: "Get a quick handoff into the product.",
      icon: Sparkles
    },
    {
      title: "Account dashboard",
      detail: "Start browsing first and unlock seller tools later.",
      icon: LayoutDashboard
    }
  ];

  return (
    <section className="mx-auto flex w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div
        className={cn(
          "grid w-full gap-8 xl:grid-cols-[0.86fr_1.14fr]",
          isRegister ? "items-start xl:items-stretch" : "items-start"
        )}
      >
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className={cn(
            "relative overflow-hidden rounded-[32px] border border-white/10 bg-primary-dark px-6 py-6 text-white shadow-[0_30px_100px_-55px_rgba(6,43,99,0.9)] sm:px-7 sm:py-7",
            isRegister && "xl:h-full"
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_34%)]" />
          <div className="absolute -right-8 top-18 h-36 w-36 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-[#0f4eea]/45 blur-3xl" />

          <div className={cn("relative flex h-full flex-col", isRegister && "xl:h-full")}>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              {eyebrow}
            </div>

            <div className="mt-5 space-y-2">
              <h1 className="max-w-lg font-heading text-3xl font-semibold leading-tight sm:text-[2.75rem]">
                {heroTitle}
              </h1>
              <p className="max-w-sm text-sm leading-6 text-blue-100/88 sm:text-base">
                {heroDescription}
              </p>
            </div>

            {isRegister ? (
              <div className="mt-7 flex flex-1 flex-col gap-4 xl:mt-auto">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08 }}
                  className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/78">
                        What happens next
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        A cleaner account path from day one.
                      </p>
                    </div>
                    {/* <div className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                      Buyer first
                    </div> */}
                  </div>

                  <div className="mt-5 space-y-3">
                    {registerJourney.map((item, index) => {
                      const Icon = item.icon;
                      const isLast = index === registerJourney.length - 1;

                      return (
                        <div key={item.title}>
                          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-blue-100">
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white">{item.title}</p>
                              <p className="mt-1 text-sm leading-5 text-blue-100/80">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                          {!isLast ? (
                            <div className="flex justify-center py-1.5 text-blue-100/60">
                              <ArrowRight className="h-4 w-4 rotate-90" />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {highlights.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.16 + index * 0.06 }}
                        className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-blue-100">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <p className="mt-3 text-base font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-5 text-blue-100/82">{item.detail}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {highlights.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.08 + index * 0.06 }}
                      className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-blue-100">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <p className="mt-3 text-base font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-5 text-blue-100/82">{item.detail}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className={cn(isRegister && "xl:h-full")}
        >
          <Card
            className={cn(
              "overflow-hidden border-border/70",
              isRegister ? "xl:flex xl:h-full xl:flex-col" : "self-start"
            )}
          >
            <CardHeader className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-1">
                {authModes.map((mode) => {
                  const active = pathname === mode.href;

                  return (
                    <Link
                      key={mode.href}
                      href={mode.href}
                      className={cn(
                        "relative rounded-xl px-4 py-3 text-center text-sm font-semibold transition",
                        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="auth-mode-pill"
                          className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-border/80"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      ) : null}
                      <span className="relative z-10">{mode.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1">
                <CardTitle>{formTitle}</CardTitle>
                <CardDescription>{formDescription}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className={cn(isRegister && "xl:flex-1")}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
