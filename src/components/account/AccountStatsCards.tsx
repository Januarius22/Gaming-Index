import { Bookmark, Compass, PackageCheck, ShieldPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardStat } from "@/types";

const icons = [Compass, ShieldPlus, PackageCheck, Bookmark];

export default function AccountStatsCards({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index] ?? Compass;

        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-lg">{stat.label}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{stat.helper}</p>
              </div>
              <div className="rounded-2xl bg-primary-soft p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-semibold text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
