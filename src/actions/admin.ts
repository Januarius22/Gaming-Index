"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile } from "@/lib/auth";
import {
  updateDemoKycSubmissionStatus,
  updateDemoListingStatus
} from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function updateKycStatusAction(formData: FormData) {
  await requireAdminProfile();
  const submissionId = String(formData.get("submissionId") ?? "");
  const sellerId = String(formData.get("sellerId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!submissionId || !sellerId || (status !== "approved" && status !== "rejected")) {
    return;
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("kyc_submissions").update({ status }).eq("id", submissionId);
    await supabase!.from("profiles").update({ kyc_status: status }).eq("id", sellerId);
  } else {
    await updateDemoKycSubmissionStatus(submissionId, status);
  }

  revalidatePath("/admin/kyc");
  revalidatePath("/seller/kyc");
  revalidatePath("/seller/upload");
  revalidatePath("/seller/dashboard");
}

export async function updateListingStatusAction(formData: FormData) {
  await requireAdminProfile();
  const listingId = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!listingId || (status !== "approved" && status !== "rejected")) {
    return;
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("listings").update({ status }).eq("id", listingId);
  } else {
    await updateDemoListingStatus(listingId, status);
  }

  revalidatePath("/admin/listings");
  revalidatePath("/seller/listings");
  revalidatePath("/marketplace");
}
