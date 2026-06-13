"use client";

import { motion } from "framer-motion";
import { BadgeCheck, CreditCard, FileCheck2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Browse accounts",
    description:
      "Check account details, price, seller rating, and status before deciding what to save, cart, or buy.",
    icon: BadgeCheck
  },
  {
    title: "Pay through checkout",
    description:
      "Start checkout from a listing or cart item. Payment confirmation creates an order record for the buyer.",
    icon: CreditCard
  },
  {
    title: "Receive delivery details",
    description:
      "After payment, the order page unlocks the seller’s delivery details so the buyer can secure the account.",
    icon: ShieldCheck
  },
  {
    title: "Sell with verification",
    description:
      "Sellers enable seller access, complete KYC, publish accounts, and keep private login details locked until payment.",
    icon: FileCheck2
  }
];

export default function HowItWorks({
  title = "How Gaming Index works",
  description = "Buyers get a clear checkout path, sellers get a controlled listing flow, and account delivery stays protected until payment is confirmed.",
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
