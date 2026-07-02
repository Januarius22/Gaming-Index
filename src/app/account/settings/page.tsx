import { updateAccountSettingsAction } from "@/actions/settings";
import WorkspaceSettingsForm from "@/components/settings/WorkspaceSettingsForm";
import { requireAccountProfile } from "@/lib/auth";
import { getProfileSettings } from "@/lib/data";

export default async function AccountSettingsPage() {
  const profile = await requireAccountProfile();
  const settings = await getProfileSettings(profile.id);

  return (
    <WorkspaceSettingsForm
      action={updateAccountSettingsAction}
      profile={profile}
      settings={settings}
      workspace="account"
    />
  );
}
