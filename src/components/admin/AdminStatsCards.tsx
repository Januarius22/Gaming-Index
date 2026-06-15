import Link from "next/link";
import { ArrowRight, BadgeDollarSign, FileCheck2, Store, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types";

const icons = [Users, Users, FileCheck2, Store, BadgeDollarSign];

export default function AdminStatsCards({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat, index) => {
        const Icon = icons[index] ?? Users;

        const content = (
          <Card className={cn("h-full transition", stat.href && "hover:-translate-y-0.5 hover:shadow-lg")}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <div className="min-w-0">
                <CardTitle className="text-lg">{stat.label}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{stat.helper}</p>
              </div>
              <div className="shrink-0 rounded-2xl bg-primary-soft p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-3">
              <p className="break-words font-heading text-[clamp(2rem,3vw,2.5rem)] font-semibold leading-tight text-foreground">
                {stat.value}
              </p>
              {stat.href ? <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" /> : null}
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
