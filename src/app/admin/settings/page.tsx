import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Platform settings</CardTitle>
          <CardDescription>Reserved space for payout rules, review policies, and role controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Marketplace-wide policy controls can be added here in future phases.</p>
          <p>Notification rules, review SLAs, and dispute automation can sit in this area later.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational notes</CardTitle>
          <CardDescription>Keep admin tools organized without mixing them into seller workflows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Seller and admin dashboards use separate layouts and sidebars by design.</p>
          <p>Public navigation is isolated to the public route group and never renders in protected dashboards.</p>
        </CardContent>
      </Card>
    </div>
  );
}
