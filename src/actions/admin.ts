"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/auth";
import {
  getDemoListings,
  getDemoProfileById,
  updateDemoKycSubmissionStatus,
  updateDemoListingStatus,
  updateDemoProfile
} from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getNigeriaTimestamp } from "@/lib/utils";

function getSafeAdminReturnPath(value: string) {
  return value.startsWith("/admin/") ? value : "/admin/listings";
}

function getSafeAdminUsersReturnPath(value: string) {
  return value.startsWith("/admin/users") ? value : "/admin/users";
}

function getAdminUsersRedirectPath(
  basePath: string,
  notice: "user-banned" | "user-unbanned" | "user-ban-failed",
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

export async function banUserAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const userId = String(formData.get("userId") ?? "").trim();
  const banReason = String(formData.get("banReason") ?? "").trim();
  const returnTo = getSafeAdminUsersReturnPath(String(formData.get("returnTo") ?? "").trim());
  const bannedAt = getNigeriaTimestamp();

  if (!userId || !banReason) {
    redirect(
      getAdminUsersRedirectPath(
        returnTo,
        "user-ban-failed",
        !banReason ? "Add a reason before banning this user." : undefined
      )
    );
  }

  if (userId === admin.id) {
    redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", "You cannot ban yourself."));
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { data: targetUser, error: targetError } = await supabase!
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (targetError || !targetUser) {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", "User not found."));
    }

    if (targetUser.role === "admin") {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", "Admin users cannot be banned."));
    }

    const { error } = await supabase!
      .from("profiles")
      .update({
        is_banned: true,
        banned_at: bannedAt,
        banned_reason: banReason,
        banned_by: admin.id
      })
      .eq("id", userId)
      .neq("role", "admin");

    if (error) {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", error.message));
    }
  } else {
    const targetUser = await getDemoProfileById(userId);

    if (!targetUser) {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", "User not found."));
    }

    if (targetUser.role === "admin") {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", "Admin users cannot be banned."));
    }

    await updateDemoProfile(userId, {
      is_banned: true,
      banned_at: bannedAt,
      banned_reason: banReason,
      banned_by: admin.id
    });
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/sellers");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");
  revalidatePath("/account/saved");
  revalidatePath("/account/cart");

  redirect(getAdminUsersRedirectPath(returnTo, "user-banned"));
}

export async function unbanUserAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const userId = String(formData.get("userId") ?? "").trim();
  const returnTo = getSafeAdminUsersReturnPath(String(formData.get("returnTo") ?? "").trim());

  if (!userId || userId === admin.id) {
    redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed"));
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!
      .from("profiles")
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: "",
        banned_by: null
      })
      .eq("id", userId)
      .neq("role", "admin");

    if (error) {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", error.message));
    }
  } else {
    const targetUser = await getDemoProfileById(userId);

    if (!targetUser) {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", "User not found."));
    }

    if (targetUser.role === "admin") {
      redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", "Admin users cannot be banned."));
    }

    await updateDemoProfile(userId, {
      is_banned: false,
      banned_at: null,
      banned_reason: "",
      banned_by: null
    });
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/sellers");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");
  revalidatePath("/account/saved");
  revalidatePath("/account/cart");

  redirect(getAdminUsersRedirectPath(returnTo, "user-unbanned"));
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
