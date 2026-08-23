"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { markProfileNotificationsRead } from "@/lib/data";

export async function markMyNotificationsReadAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const returnTo = String(formData.get("returnTo") ?? "/account/notifications");

  if (!profile) {
    return;
  }

  await markProfileNotificationsRead(profile.id);
  revalidatePath(returnTo);
}
