"use client";

import { motion } from "framer-motion";
import { BadgeCheck, FileCheck2, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Create your account",
    description:
      "Register once with your full name, username, email, and password to start as a buyer.",
    icon: LayoutDashboard
  },
  {
    title: "Unlock seller access when needed",
    description:
      "Open the seller center from your dashboard when you are ready to start listing accounts.",
    icon: FileCheck2
  },
  {
    title: "Complete KYC and manage listings",
    description:
      "Submit verification, publish listings directly, and manage seller tools in a separate workspace.",
    icon: BadgeCheck
  }
];

export default function HowItWorks({
  title = "How Gaming Index works",
  description = "A clear account-first flow that keeps trust, seller activation, and maintainability at the center.",
  className
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("px-4 py-18 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            How it works
          </p>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-soft text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="pt-4">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-3xl bg-surface px-4 py-3 text-sm font-medium text-muted-foreground">
                      Step {index + 1}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
