"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccountProfile } from "@/lib/auth";
import { updateDemoProfile } from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { ActionState } from "@/types";

export async function unlockSellerAccessAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState;
  void formData;
  const profile = await requireAccountProfile();

  if (profile.seller_enabled) {
    redirect("/seller/dashboard");
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!
      .from("profiles")
      .update({ seller_enabled: true })
      .eq("id", profile.id);

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    revalidatePath("/account/dashboard");
    revalidatePath("/account/seller");
    revalidatePath("/admin/users");
    revalidatePath("/admin/sellers");
    redirect("/seller/kyc");
  }

  await updateDemoProfile(profile.id, { seller_enabled: true });

  revalidatePath("/account/dashboard");
  revalidatePath("/account/seller");
  revalidatePath("/admin/users");
  revalidatePath("/admin/sellers");
  redirect("/seller/kyc");
}
