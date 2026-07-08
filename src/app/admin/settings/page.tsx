import { changePasswordAction, updateAdminSettingsAction } from "@/actions/settings";
import WorkspaceSettingsForm from "@/components/settings/WorkspaceSettingsForm";
import { requireAdminProfile } from "@/lib/auth";
import { getProfileSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  const profile = await requireAdminProfile();
  const settings = await getProfileSettings(profile.id);

  return (
    <WorkspaceSettingsForm
      action={updateAdminSettingsAction}
      passwordAction={changePasswordAction}
      profile={profile}
      settings={settings}
      workspace="admin"
    />
  );
}
