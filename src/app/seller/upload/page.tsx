import KycRequiredCard from "@/components/seller/KycRequiredCard";
import SellerUploadForm from "@/components/seller/SellerUploadForm";
import { canUploadAccounts, requireSellerProfile } from "@/lib/auth";

export default async function SellerUploadPage() {
  const profile = await requireSellerProfile();

  if (!canUploadAccounts(profile.kyc_status)) {
    return <KycRequiredCard status={profile.kyc_status} />;
  }

  return <SellerUploadForm />;
}
