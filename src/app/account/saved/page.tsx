import { Bookmark } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AccountSavedPage() {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Saved listings</CardTitle>
        <CardDescription>
          Your bookmarked gaming accounts will show up here once saved-listing tools are
          connected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
            <Bookmark className="h-6 w-6" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
            No saved listings yet
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Once buyer tools are connected, this space can store your favorite accounts for
            later review and comparison.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
