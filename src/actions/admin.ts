"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/auth";
import {
  getDemoListings,
  updateDemoKycSubmissionStatus,
  updateDemoListingStatus
} from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getNigeriaTimestamp } from "@/lib/utils";

function getSafeAdminReturnPath(value: string) {
  return value.startsWith("/admin/") ? value : "/admin/listings";
}

function getAdminListingRedirectPath(
  basePath: string,
  notice: "listing-taken-down" | "listing-take-down-failed",
  errorMessage?: string
) {
  const [pathname, existingQuery = ""] = basePath.split("?");
  const searchParams = new URLSearchParams(existingQuery);
  searchParams.set("notice", notice);

  if (errorMessage) {
    searchParams.set("error", errorMessage);
  }

  return `${pathname}?${searchParams.toString()}`;
}

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

  if (
    !listingId ||
    (status !== "approved" && status !== "rejected" && status !== "taken_down")
  ) {
    return;
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("listings").update({ status }).eq("id", listingId);
  } else {
    await updateDemoListingStatus(listingId, status as "approved" | "rejected" | "taken_down");
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin/listing-history");
  revalidatePath("/seller/listings");
  revalidatePath("/seller/history");
  revalidatePath("/marketplace");
}

export async function takeDownListingAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const returnTo = getSafeAdminReturnPath(String(formData.get("returnTo") ?? "").trim());
  const adminActionAt = getNigeriaTimestamp();

  if (!listingId || !adminNote) {
    redirect(
      getAdminListingRedirectPath(
        returnTo,
        "listing-take-down-failed",
        !adminNote ? "Add a note before taking down a listing." : undefined
      )
    );
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { data: listing, error: listingError } = await supabase!
      .from("listings")
      .select("id, status")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listing) {
      redirect(getAdminListingRedirectPath(returnTo, "listing-take-down-failed"));
    }

    const { data: updatedListing, error: updateError } = await supabase!
      .from("listings")
      .update({
        status: "taken_down",
        admin_note: adminNote,
        admin_action_at: adminActionAt,
        admin_action_by: admin.id
      })
      .eq("id", listingId)
      .eq("status", "approved")
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Admin listing takedown failed", {
        listingId,
        error: updateError.message
      });
      redirect(
        getAdminListingRedirectPath(
          returnTo,
          "listing-take-down-failed",
          updateError.message
        )
      );
    }

    if (!updatedListing) {
      redirect(
        getAdminListingRedirectPath(
          returnTo,
          "listing-take-down-failed",
          "Only active unsold listings can be taken down."
        )
      );
    }
  } else {
    const existingListing = (await getDemoListings()).find((listing) => listing.id === listingId);

    if (!existingListing || existingListing.status !== "approved") {
      redirect(
        getAdminListingRedirectPath(
          returnTo,
          "listing-take-down-failed",
          "Only active unsold listings can be taken down."
        )
      );
    }

    const takenDownListing = await updateDemoListingStatus(listingId, "taken_down", {
      admin_note: adminNote,
      admin_action_at: adminActionAt,
      admin_action_by: admin.id
    });

    if (!takenDownListing) {
      redirect(getAdminListingRedirectPath(returnTo, "listing-take-down-failed"));
    }
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");
  revalidatePath("/account/saved");
  revalidatePath("/account/cart");
  revalidatePath("/seller/listings");
  revalidatePath("/seller/history");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listing-history");
  revalidatePath("/admin/dashboard");

  redirect(getAdminListingRedirectPath(returnTo, "listing-taken-down"));
}
