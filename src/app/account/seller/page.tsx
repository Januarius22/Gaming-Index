import SellerAccessPanel from "@/components/account/SellerAccessPanel";
import { requireAccountProfile } from "@/lib/auth";
import { getLatestSellerKycSubmission } from "@/lib/data";

export default async function AccountSellerPage() {
  const profile = await requireAccountProfile();
  const latestKycSubmission = profile.seller_enabled
    ? await getLatestSellerKycSubmission(profile.id)
    : null;

  return <SellerAccessPanel profile={profile} latestKycSubmission={latestKycSubmission} />;
}
