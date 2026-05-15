import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminDisputesPage() {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-soft text-primary">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <CardTitle className="pt-4">No disputes yet.</CardTitle>
        <CardDescription>
          Dispute management can be layered in later without changing the admin layout boundary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          This placeholder keeps the route ready while the marketplace grows into real order handling.
        </p>
      </CardContent>
    </Card>
  );
}
