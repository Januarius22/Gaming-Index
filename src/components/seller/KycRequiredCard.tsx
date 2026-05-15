import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { titleCase } from "@/lib/utils";
import type { KycStatus } from "@/types";

export default function KycRequiredCard({ status }: { status: KycStatus }) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-soft text-primary">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <CardTitle className="pt-4">KYC approval is required before upload.</CardTitle>
        <CardDescription>
          Your current KYC status is <span className="font-semibold text-foreground">{titleCase(status)}</span>.
          Complete verification and wait for approval before submitting gaming accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Link href="/seller/kyc">
          <Button>Go to KYC Verification</Button>
        </Link>
        <Link href="/seller/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
