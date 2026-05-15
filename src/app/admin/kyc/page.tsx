import KycReviewTable from "@/components/admin/KycReviewTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminKycQueue } from "@/lib/data";

export default async function AdminKycPage() {
  const submissions = await getAdminKycQueue();

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC reviews</CardTitle>
        <CardDescription>Review seller identity submissions and update approval status.</CardDescription>
      </CardHeader>
      <CardContent>
        <KycReviewTable submissions={submissions} />
      </CardContent>
    </Card>
  );
}
