"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/auth";
import {
  removeDemoListing,
  updateDemoKycSubmissionStatus,
  updateDemoListingStatus
} from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const LISTING_STORAGE_BUCKET = "listing-media";

export async function updateKycStatusAction(formData: FormData) {
  await requireAdminProfile();
  const submissionId = String(formData.get("submissionId") ?? "");
  const sellerId = String(formData.get("sellerId") ?? "");
  const status = String(formData.get("status") ?? "");
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();
  const redirectPage = Math.max(1, Number(formData.get("redirectPage") ?? "1") || 1);

  if (!submissionId || !sellerId || (status !== "approved" && status !== "rejected")) {
    return;
  }

  if (status === "rejected" && !rejectionReason) {
    return;
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error: submissionError } = await supabase!
      .from("kyc_submissions")
      .update({
        status,
        rejection_reason: status === "rejected" ? rejectionReason : ""
      })
      .eq("id", submissionId);

    if (submissionError) {
      redirect(`/admin/kyc?page=${redirectPage}&notice=kyc-update-failed`);
    }

    const { error: profileError } = await supabase!
      .from("profiles")
      .update({ kyc_status: status })
      .eq("id", sellerId);

    if (profileError) {
      redirect(`/admin/kyc?page=${redirectPage}&notice=kyc-profile-sync-failed`);
    }
  } else {
    await updateDemoKycSubmissionStatus(submissionId, status, rejectionReason);
  }

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/admin/sellers");
  revalidatePath("/account/dashboard");
  revalidatePath("/account/seller");
  revalidatePath("/seller/kyc");
  revalidatePath("/seller/upload");
  revalidatePath("/seller/dashboard");

  redirect(
    `/admin/kyc?page=${redirectPage}&notice=${
      status === "approved" ? "kyc-approved" : "kyc-rejected"
    }`
  );
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

export async function deleteListingAction(formData: FormData) {
  await requireAdminProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();

  if (!listingId) {
    redirect("/admin/listings?notice=listing-remove-failed");
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { data: listing, error: listingError } = await supabase!
      .from("listings")
      .select("id, image_paths")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listing) {
      redirect("/admin/listings?notice=listing-remove-failed");
    }

    const imagePaths = Array.isArray(listing.image_paths)
      ? listing.image_paths.filter(
          (path): path is string => typeof path === "string" && path.length > 0
        )
      : [];

    const {
      data: deletedListing,
      error: deleteError
    } = await supabase!
      .from("listings")
      .delete()
      .eq("id", listingId)
      .select("id")
      .maybeSingle();

    if (deleteError) {
      console.error("Admin listing delete failed", {
        listingId,
        error: deleteError.message
      });
      redirect(
        `/admin/listings?notice=listing-remove-failed&error=${encodeURIComponent(deleteError.message)}`
      );
    }

    if (!deletedListing) {
      redirect(
        "/admin/listings?notice=listing-remove-failed&error=" +
          encodeURIComponent(
            "Supabase blocked the delete. Apply the latest listing delete policies from supabase/schema.sql."
          )
      );
    }

    if (imagePaths.length > 0) {
      await supabase!.storage.from(LISTING_STORAGE_BUCKET).remove(imagePaths);
    }
  } else {
    const removedListing = await removeDemoListing(listingId);

    if (!removedListing) {
      redirect("/admin/listings?notice=listing-remove-failed");
    }
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");
  revalidatePath("/seller/listings");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/dashboard");

  redirect("/admin/listings?notice=listing-removed");
}
