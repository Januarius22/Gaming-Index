import ListingsReviewTable from "@/components/admin/ListingsReviewTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminListingQueue } from "@/lib/data";

export default async function AdminListingsPage() {
  const listings = await getAdminListingQueue();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listings review</CardTitle>
        <CardDescription>Approve or reject seller listings before they appear in the marketplace.</CardDescription>
      </CardHeader>
      <CardContent>
        <ListingsReviewTable listings={listings} />
      </CardContent>
    </Card>
  );
}
