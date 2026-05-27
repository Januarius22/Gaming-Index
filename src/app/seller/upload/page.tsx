import KycRequiredCard from "@/components/seller/KycRequiredCard";
import SellerUploadForm from "@/components/seller/SellerUploadForm";
import { canUploadAccounts, requireSellerProfile } from "@/lib/auth";

export default async function SellerUploadPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const profile = await requireSellerProfile();
  const params = (await searchParams) ?? {};

  if (!canUploadAccounts(profile.kyc_status)) {
    return <KycRequiredCard status={profile.kyc_status} />;
  }

  return <SellerUploadForm feedbackMessage={params.error ?? ""} />;
}
