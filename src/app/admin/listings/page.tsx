import FormMessage from "@/components/auth/FormMessage";
import ListingsReviewTable from "@/components/admin/ListingsReviewTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminListingQueue } from "@/lib/data";

export default async function AdminListingsPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const listings = await getAdminListingQueue();
  const feedbackMessage =
    params.error
      ? params.error
      : params.notice === "listing-removed"
      ? "Listing removed successfully."
      : params.notice === "listing-remove-failed"
        ? "We could not remove that listing right now. Please try again."
        : "";
  const feedbackTone = params.notice === "listing-remove-failed" ? "error" : "success";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listings overview</CardTitle>
        <CardDescription>Monitor published marketplace listings and inspect seller-provided account details.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormMessage message={feedbackMessage} tone={feedbackTone} />
        <ListingsReviewTable listings={listings} />
      </CardContent>
    </Card>
  );
}
