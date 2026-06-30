import KycRequiredCard from "@/components/seller/KycRequiredCard";
import SellerRestrictedCard from "@/components/seller/SellerRestrictedCard";
import SellerUploadForm from "@/components/seller/SellerUploadForm";
import { canUploadAccounts, isSellerRestrictionActive, requireSellerProfile } from "@/lib/auth";

export default async function SellerUploadPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const profile = await requireSellerProfile();
  const params = (await searchParams) ?? {};

  if (isSellerRestrictionActive(profile)) {
    return (
      <SellerRestrictedCard
        restrictedUntil={profile.seller_restricted_until}
        reason={profile.seller_restriction_reason}
      />
    );
  }

  if (!canUploadAccounts(profile.kyc_status, profile)) {
    return <KycRequiredCard status={profile.kyc_status} />;
  }

  return <SellerUploadForm feedbackMessage={params.error ?? ""} />;
}
