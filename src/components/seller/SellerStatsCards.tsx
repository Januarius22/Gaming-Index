import Link from "next/link";
import { ArrowRight, BarChart3, CreditCard, PackageCheck, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types";

const icons = [Store, BarChart3, PackageCheck, CreditCard];

export default function SellerStatsCards({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index] ?? Store;

        const content = (
          <Card
            className={cn(
              "gi-game-card gi-stat-card h-full min-w-0 transition duration-300",
              stat.href &&
                "hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_28px_70px_-42px_rgba(0,87,255,0.55)]"
            )}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-lg">{stat.label}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{stat.helper}</p>
              </div>
              <div className="gi-glow-orbit shrink-0 rounded-2xl bg-primary-soft p-3 text-primary ring-1 ring-primary/10">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex min-w-0 items-end justify-between gap-3">
              <p className="min-w-0 break-words font-heading text-[clamp(2rem,5vw,2.55rem)] font-semibold leading-tight text-foreground">
                {stat.value}
              </p>
              {stat.href ? (
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              ) : null}
            </CardContent>
          </Card>
        );

        return stat.href ? (
          <Link key={stat.label} href={stat.href} className="group block h-full">
            {content}
          </Link>
        ) : (
          <div key={stat.label}>{content}</div>
        );
      })}
    </div>
  );
}
