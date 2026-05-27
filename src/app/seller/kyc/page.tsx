import SellerKycPanel from "@/components/seller/SellerKycPanel";
import { requireSellerProfile } from "@/lib/auth";
import { getLatestSellerKycSubmission } from "@/lib/data";

export default async function SellerKycPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; open?: string }>;
}) {
  const profile = await requireSellerProfile();
  const latestKycSubmission = await getLatestSellerKycSubmission(profile.id);
  const params = (await searchParams) ?? {};
  const feedbackMessage = params.error ?? "";
  const initialOpen = params.open === "1";

  return (
    <SellerKycPanel
      profile={profile}
      latestKycSubmission={latestKycSubmission}
      feedbackMessage={feedbackMessage}
      feedbackTone="error"
      initialOpen={initialOpen}
    />
  );
}
