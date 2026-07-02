import { updateSellerSettingsAction } from "@/actions/settings";
import WorkspaceSettingsForm from "@/components/settings/WorkspaceSettingsForm";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileSettings } from "@/lib/data";

export default async function SellerSettingsPage() {
  const profile = await requireSellerProfile();
  const settings = await getProfileSettings(profile.id);

  return (
    <WorkspaceSettingsForm
      action={updateSellerSettingsAction}
      profile={profile}
      settings={settings}
      workspace="seller"
    />
  );
}
