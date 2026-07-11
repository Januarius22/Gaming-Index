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
          <Card className={cn("h-full min-w-0 transition", stat.href && "hover:-translate-y-0.5 hover:shadow-lg")}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-lg">{stat.label}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{stat.helper}</p>
              </div>
              <div className="rounded-2xl bg-primary-soft p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex min-w-0 items-end justify-between gap-3">
              <p className="min-w-0 break-words font-heading text-[clamp(2rem,5vw,2.55rem)] font-semibold leading-tight text-foreground">
                {stat.value}
              </p>
              {stat.href ? <ArrowRight className="h-5 w-5 text-muted-foreground" /> : null}
            </CardContent>
          </Card>
        );

        return stat.href ? (
          <Link key={stat.label} href={stat.href} className="block h-full">
            {content}
          </Link>
        ) : (
          <div key={stat.label}>{content}</div>
        );
      })}
    </div>
  );
}
