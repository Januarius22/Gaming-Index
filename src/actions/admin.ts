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

function getSafeAdminOrdersReturnPath(value: string) {
  return value.startsWith("/admin/orders") ? value : "/admin/orders";
}

function getAdminOrdersRedirectPath(
  basePath: string,
  notice: "seller-funds-released" | "seller-funds-release-failed",
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

type AdminActionResult = {
  status: "success" | "error";
  message: string;
};

async function releaseSellerFunds(formData: FormData): Promise<AdminActionResult & { orderId?: string }> {
  await requireAdminProfile();
  const orderId = String(formData.get("orderId") ?? "").trim();

  if (!orderId) {
    return {
      status: "error",
      message: "Order not found."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!.rpc("release_seller_earning", {
      target_order_id: orderId
    });

    if (error) {
      console.error("Admin seller fund release failed", {
        orderId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      return {
        status: "error",
        message: error.message
      };
    }
  } else {
    return {
      status: "error",
      message: "Connect Supabase to release seller funds."
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  revalidatePath("/seller/dashboard");
  revalidatePath("/seller/wallet");
  revalidatePath("/seller/orders");
  revalidatePath("/seller/notifications");

  return {
    status: "success",
    message: "Seller funds were released successfully.",
    orderId
  };
}

export async function releaseSellerFundsInlineAction(formData: FormData) {
  return releaseSellerFunds(formData);
}

export async function releaseSellerFundsAction(formData: FormData) {
  const returnTo = getSafeAdminOrdersReturnPath(String(formData.get("returnTo") ?? "").trim());
  const result = await releaseSellerFunds(formData);

  if (result.status === "error") {
    redirect(getAdminOrdersRedirectPath(returnTo, "seller-funds-release-failed", result.message));
  }

  redirect(getAdminOrdersRedirectPath(returnTo, "seller-funds-released"));
}

export async function markWithdrawalPaidAction(formData: FormData) {
  await requireAdminProfile();
  const withdrawalId = String(formData.get("withdrawalId") ?? "").trim();

  if (!withdrawalId) {
    return {
      status: "error" as const,
      message: "Withdrawal request not found."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to manage withdrawals."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.rpc("mark_withdrawal_paid", {
    target_withdrawal_id: withdrawalId
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin/dashboard");
  revalidatePath("/seller/wallet");
  revalidatePath("/seller/withdrawals");
  revalidatePath("/seller/transactions");
  revalidatePath("/seller/notifications");
  revalidatePath("/seller/dashboard");
  revalidatePath("/account/wallet");
  revalidatePath("/account/withdrawals");
  revalidatePath("/account/transactions");
  revalidatePath("/account/notifications");
  revalidatePath("/account/dashboard");

  return {
    status: "success" as const,
    message: "Withdrawal marked paid.",
    withdrawalId
  };
}

export async function rejectWithdrawalAction(formData: FormData) {
  await requireAdminProfile();
  const withdrawalId = String(formData.get("withdrawalId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!withdrawalId) {
    return {
      status: "error" as const,
      message: "Withdrawal request not found."
    };
  }

  if (!adminNote) {
    return {
      status: "error" as const,
      message: "Add a rejection reason before rejecting this withdrawal."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to manage withdrawals."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.rpc("reject_withdrawal_request", {
    target_withdrawal_id: withdrawalId,
    rejection_note: adminNote
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin/dashboard");
  revalidatePath("/seller/wallet");
  revalidatePath("/seller/withdrawals");
  revalidatePath("/seller/transactions");
  revalidatePath("/seller/notifications");
  revalidatePath("/seller/dashboard");
  revalidatePath("/account/wallet");
  revalidatePath("/account/withdrawals");
  revalidatePath("/account/transactions");
  revalidatePath("/account/notifications");
  revalidatePath("/account/dashboard");

  return {
    status: "success" as const,
    message: "Withdrawal rejected and funds returned.",
    withdrawalId,
    adminNote
  };
}

export async function approveSuspensionAppealAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const appealId = String(formData.get("appealId") ?? "").trim();
  const profileId = String(formData.get("profileId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const reviewedAt = getNigeriaTimestamp();

  if (!appealId || !profileId) {
    return {
      status: "error" as const,
      message: "Appeal not found."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to manage appeals."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data: appeal, error: appealError } = await supabase!
    .from("suspension_appeals")
    .select("id, status")
    .eq("id", appealId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (appealError || !appeal) {
    return {
      status: "error" as const,
      message: "Appeal not found."
    };
  }

  if (appeal.status !== "pending") {
    return {
      status: "error" as const,
      message: "Only pending appeals can be approved."
    };
  }

  const { error: profileError } = await supabase!
    .from("profiles")
    .update({
      is_banned: false,
      banned_at: null,
      banned_reason: "",
      banned_by: null
    })
    .eq("id", profileId)
    .neq("role", "admin");

  if (profileError) {
    return {
      status: "error" as const,
      message: profileError.message
    };
  }

  const { error: updateError } = await supabase!
    .from("suspension_appeals")
    .update({
      status: "approved",
      admin_note: adminNote || "Appeal approved. Suspension lifted.",
      reviewed_by: admin.id,
      reviewed_at: reviewedAt
    })
    .eq("id", appealId);

  if (updateError) {
    return {
      status: "error" as const,
      message: updateError.message
    };
  }

  await supabase!.from("notifications").insert({
    profile_id: profileId,
    type: "suspension_appeal_approved",
    title: "Appeal approved",
    message: "Your suspension appeal was approved. Your account has been restored.",
    link_path: "/account/dashboard",
    metadata: {
      appeal_id: appealId,
      note: adminNote || "Appeal approved. Suspension lifted."
    }
  });

  revalidatePath("/admin/appeals");
  revalidatePath("/admin/users");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/account-suspended");

  return {
    status: "success" as const,
    message: "Appeal approved and account restored.",
    appealId,
    adminNote: adminNote || "Appeal approved. Suspension lifted."
  };
}

export async function rejectSuspensionAppealAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const appealId = String(formData.get("appealId") ?? "").trim();
  const profileId = String(formData.get("profileId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const reviewedAt = getNigeriaTimestamp();

  if (!appealId || !profileId) {
    return {
      status: "error" as const,
      message: "Appeal not found."
    };
  }

  if (!adminNote) {
    return {
      status: "error" as const,
      message: "Add a reason before rejecting this appeal."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to manage appeals."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data: appeal, error: appealError } = await supabase!
    .from("suspension_appeals")
    .select("id, status")
    .eq("id", appealId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (appealError || !appeal) {
    return {
      status: "error" as const,
      message: "Appeal not found."
    };
  }

  if (appeal.status !== "pending") {
    return {
      status: "error" as const,
      message: "Only pending appeals can be rejected."
    };
  }

  const { error: updateError } = await supabase!
    .from("suspension_appeals")
    .update({
      status: "rejected",
      admin_note: adminNote,
      reviewed_by: admin.id,
      reviewed_at: reviewedAt
    })
    .eq("id", appealId);

  if (updateError) {
    return {
      status: "error" as const,
      message: updateError.message
    };
  }

  await supabase!.from("notifications").insert({
    profile_id: profileId,
    type: "suspension_appeal_rejected",
    title: "Appeal rejected",
    message: `Your suspension appeal was rejected: ${adminNote}`,
    link_path: "/account-suspended",
    metadata: {
      appeal_id: appealId,
      reason: adminNote
    }
  });

  revalidatePath("/admin/appeals");
  revalidatePath("/admin/users");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/account-suspended");

  return {
    status: "success" as const,
    message: "Appeal rejected.",
    appealId,
    adminNote
  };
}

export async function updateOrderDisputeAction(formData: FormData) {
  await requireAdminProfile();
  const disputeId = String(formData.get("disputeId") ?? "").trim();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (
    !disputeId ||
    !orderId ||
    (nextStatus !== "reviewing" && nextStatus !== "resolved" && nextStatus !== "rejected")
  ) {
    return {
      status: "error" as const,
      message: "Dispute update is invalid."
    };
  }

  if ((nextStatus === "resolved" || nextStatus === "rejected") && !adminNote) {
    return {
      status: "error" as const,
      message: "Add a note before closing this dispute."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to manage disputes."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.rpc("review_order_dispute", {
    target_dispute_id: disputeId,
    next_status: nextStatus,
    review_note: adminNote
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/disputes");
  revalidatePath(`/account/disputes/${disputeId}`);
  revalidatePath("/account/orders");
  revalidatePath("/account/notifications");
  revalidatePath("/seller/disputes");
  revalidatePath(`/seller/disputes/${disputeId}`);
  revalidatePath("/seller/orders");
  revalidatePath("/seller/notifications");
  revalidatePath("/admin/notifications");

  return {
    status: "success" as const,
    message:
      nextStatus === "reviewing"
        ? "Dispute marked as reviewing."
        : nextStatus === "resolved"
          ? "Dispute resolved."
          : "Dispute rejected.",
    disputeId,
    nextStatus,
    adminNote
  };
}

export async function refundOrderDisputeAction(formData: FormData) {
  await requireAdminProfile();
  const disputeId = String(formData.get("disputeId") ?? "").trim();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const takeListingDown = formData.get("takeListingDown") === "on";

  if (!disputeId || !orderId) {
    return {
      status: "error" as const,
      message: "Refund request is invalid."
    };
  }

  if (!adminNote) {
    return {
      status: "error" as const,
      message: "Add a refund note."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to refund disputes."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.rpc("refund_order_dispute", {
    target_dispute_id: disputeId,
    refund_note: adminNote,
    take_listing_down: takeListingDown
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/disputes");
  revalidatePath(`/account/disputes/${disputeId}`);
  revalidatePath("/account/orders");
  revalidatePath("/account/wallet");
  revalidatePath("/account/transactions");
  revalidatePath("/account/notifications");
  revalidatePath("/seller/disputes");
  revalidatePath(`/seller/disputes/${disputeId}`);
  revalidatePath("/seller/orders");
  revalidatePath("/seller/wallet");
  revalidatePath("/seller/transactions");
  revalidatePath("/seller/notifications");
  revalidatePath("/seller/listings");
  revalidatePath("/seller/history");
  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listing-history");

  return {
    status: "success" as const,
    message: takeListingDown ? "Refund issued and listing taken down." : "Refund issued.",
    disputeId,
    nextStatus: "refunded" as const,
    adminNote,
    takeListingDown
  };
}

export async function enforceSellerFromDisputeAction(formData: FormData) {
  await requireAdminProfile();
  const disputeId = String(formData.get("disputeId") ?? "").trim();
  const sellerId = String(formData.get("sellerId") ?? "").trim();
  const action = String(formData.get("enforcementAction") ?? "").trim();
  const reason = String(formData.get("enforcementReason") ?? "").trim();
  const restrictionDays = Number(String(formData.get("restrictionDays") ?? "0").trim());

  if (
    !disputeId ||
    !sellerId ||
    !reason ||
    !["warning", "temporary_restriction", "seller_suspension"].includes(action)
  ) {
    return {
      status: "error" as const,
      message: "Seller enforcement is invalid."
    };
  }

  if (action === "temporary_restriction" && (!Number.isFinite(restrictionDays) || restrictionDays <= 0)) {
    return {
      status: "error" as const,
      message: "Add a valid restriction duration."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to enforce seller actions."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.rpc("enforce_seller_for_dispute", {
    target_dispute_id: disputeId,
    enforcement_action: action,
    enforcement_reason: reason,
    restriction_days: action === "temporary_restriction" ? restrictionDays : 0
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  revalidatePath(`/admin/disputes/${disputeId}`);
  revalidatePath("/admin/disputes");
  revalidatePath("/admin/sellers");
  revalidatePath("/seller/dashboard");
  revalidatePath("/seller/upload");
  revalidatePath("/seller/notifications");
  revalidatePath(`/seller/disputes/${disputeId}`);

  return {
    status: "success" as const,
    message: "Seller enforcement saved.",
    disputeId,
    sellerId
  };
}

export async function clearSellerRestrictionAction(formData: FormData) {
  await requireAdminProfile();
  const disputeId = String(formData.get("disputeId") ?? "").trim();
  const sellerId = String(formData.get("sellerId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!sellerId) {
    return {
      status: "error" as const,
      message: "Seller not found."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to clear restrictions."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.rpc("clear_seller_restriction", {
    target_seller_id: sellerId,
    admin_note: note
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  if (disputeId) {
    revalidatePath(`/admin/disputes/${disputeId}`);
    revalidatePath(`/seller/disputes/${disputeId}`);
  }
  revalidatePath("/admin/sellers");
  revalidatePath("/seller/dashboard");
  revalidatePath("/seller/upload");
  revalidatePath("/seller/notifications");

  return {
    status: "success" as const,
    message: "Seller restriction cleared.",
    sellerId
  };
}

async function banUser(formData: FormData): Promise<AdminActionResult & { userId?: string; banReason?: string }> {
  const admin = await requireAdminProfile();
  const userId = String(formData.get("userId") ?? "").trim();
  const banReason = String(formData.get("banReason") ?? "").trim();
  const bannedAt = getNigeriaTimestamp();

  if (!userId || !banReason) {
    return {
      status: "error",
      message: !banReason ? "Add a reason before banning this user." : "User not found."
    };
  }

  if (userId === admin.id) {
    return {
      status: "error",
      message: "You cannot ban yourself."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { data: targetUser, error: targetError } = await supabase!
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (targetError || !targetUser) {
      return {
        status: "error",
        message: "User not found."
      };
    }

    if (targetUser.role === "admin") {
      return {
        status: "error",
        message: "Admin users cannot be banned."
      };
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
      return {
        status: "error",
        message: error.message
      };
    }
  } else {
    const targetUser = await getDemoProfileById(userId);

    if (!targetUser) {
      return {
        status: "error",
        message: "User not found."
      };
    }

    if (targetUser.role === "admin") {
      return {
        status: "error",
        message: "Admin users cannot be banned."
      };
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

  return {
    status: "success",
    message: "User banned successfully.",
    userId,
    banReason
  };
}

async function unbanUser(formData: FormData): Promise<AdminActionResult & { userId?: string }> {
  const admin = await requireAdminProfile();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId || userId === admin.id) {
    return {
      status: "error",
      message: "This user cannot be unbanned."
    };
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
      return {
        status: "error",
        message: error.message
      };
    }
  } else {
    const targetUser = await getDemoProfileById(userId);

    if (!targetUser) {
      return {
        status: "error",
        message: "User not found."
      };
    }

    if (targetUser.role === "admin") {
      return {
        status: "error",
        message: "Admin users cannot be banned."
      };
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

  return {
    status: "success",
    message: "User unbanned successfully.",
    userId
  };
}

export async function banUserInlineAction(formData: FormData) {
  return banUser(formData);
}

export async function unbanUserInlineAction(formData: FormData) {
  return unbanUser(formData);
}

export async function banUserAction(formData: FormData) {
  const returnTo = getSafeAdminUsersReturnPath(String(formData.get("returnTo") ?? "").trim());
  const result = await banUser(formData);

  if (result.status === "error") {
    redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", result.message));
  }

  redirect(getAdminUsersRedirectPath(returnTo, "user-banned"));
}

export async function unbanUserAction(formData: FormData) {
  const returnTo = getSafeAdminUsersReturnPath(String(formData.get("returnTo") ?? "").trim());
  const result = await unbanUser(formData);

  if (result.status === "error") {
    redirect(getAdminUsersRedirectPath(returnTo, "user-ban-failed", result.message));
  }

  redirect(getAdminUsersRedirectPath(returnTo, "user-unbanned"));
}

type KycReviewActionResult = {
  status: "success" | "error";
  message: string;
  submissionId?: string;
  reviewedStatus?: "approved" | "rejected";
  rejectionReason?: string;
};

async function updateKycStatus(formData: FormData): Promise<KycReviewActionResult> {
  await requireAdminProfile();
  const submissionId = String(formData.get("submissionId") ?? "");
  const sellerId = String(formData.get("sellerId") ?? "");
  const status = String(formData.get("status") ?? "");
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();

  if (!submissionId || !sellerId || (status !== "approved" && status !== "rejected")) {
    return {
      status: "error",
      message: "This KYC submission could not be reviewed. Refresh and try again."
    };
  }

  if (status === "rejected" && !rejectionReason) {
    return {
      status: "error",
      message: "Add a rejection reason before rejecting KYC."
    };
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
      return {
        status: "error",
        message: submissionError.message
      };
    }

    const { error: profileError } = await supabase!
      .from("profiles")
      .update({ kyc_status: status })
      .eq("id", sellerId);

    if (profileError) {
      return {
        status: "error",
        message: "KYC review changed, but the seller profile did not sync."
      };
    }

    await supabase!.from("notifications").insert({
      profile_id: sellerId,
      type: status === "approved" ? "kyc_approved" : "kyc_rejected",
      title: status === "approved" ? "KYC approved" : "KYC rejected",
      message:
        status === "approved"
          ? "Your KYC has been approved. Seller upload access is now enabled."
          : `Your KYC was rejected: ${rejectionReason}`,
      link_path: "/seller/kyc",
      metadata: {
        kyc_submission_id: submissionId,
        status,
        reason: status === "rejected" ? rejectionReason : ""
      }
    });
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
  revalidatePath("/seller/notifications");

  return {
    status: "success",
    message: status === "approved" ? "KYC approved successfully." : "KYC rejected successfully.",
    submissionId,
    reviewedStatus: status,
    rejectionReason: status === "rejected" ? rejectionReason : ""
  };
}

export async function reviewKycStatusAction(formData: FormData) {
  return updateKycStatus(formData);
}

export async function updateKycStatusAction(formData: FormData) {
  const redirectPage = Math.max(1, Number(formData.get("redirectPage") ?? "1") || 1);
  const result = await updateKycStatus(formData);

  if (result.status === "error") {
    redirect(`/admin/kyc?page=${redirectPage}&notice=kyc-update-failed`);
  }

  redirect(
    `/admin/kyc?page=${redirectPage}&notice=${
      result.reviewedStatus === "approved" ? "kyc-approved" : "kyc-rejected"
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

async function takeDownListing(
  formData: FormData
): Promise<AdminActionResult & { listingId?: string; adminNote?: string }> {
  const admin = await requireAdminProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const adminActionAt = getNigeriaTimestamp();

  if (!listingId || !adminNote) {
    return {
      status: "error",
      message: !adminNote ? "Add a note before taking down a listing." : "Listing not found."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { data: listing, error: listingError } = await supabase!
      .from("listings")
      .select("id, status, seller_id, title")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return {
        status: "error",
        message: "Listing not found."
      };
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
      return {
        status: "error",
        message: updateError.message
      };
    }

    if (!updatedListing) {
      return {
        status: "error",
        message: "Only active unsold listings can be taken down."
      };
    }

    await supabase!.from("notifications").insert({
      profile_id: listing.seller_id,
      type: "listing_taken_down",
      title: "Listing taken down",
      message: `Your listing was taken down: ${adminNote}`,
      link_path: "/seller/history",
      metadata: {
        listing_id: listing.id,
        title: listing.title,
        reason: adminNote
      }
    });
  } else {
    const existingListing = (await getDemoListings()).find((listing) => listing.id === listingId);

    if (!existingListing || existingListing.status !== "approved") {
      return {
        status: "error",
        message: "Only active unsold listings can be taken down."
      };
    }

    const takenDownListing = await updateDemoListingStatus(listingId, "taken_down", {
      admin_note: adminNote,
      admin_action_at: adminActionAt,
      admin_action_by: admin.id
    });

    if (!takenDownListing) {
      return {
        status: "error",
        message: "Listing could not be taken down."
      };
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
  revalidatePath("/seller/notifications");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listing-history");
  revalidatePath("/admin/dashboard");

  return {
    status: "success",
    message: "Listing taken down successfully.",
    listingId,
    adminNote
  };
}

export async function takeDownListingInlineAction(formData: FormData) {
  return takeDownListing(formData);
}

export async function takeDownListingAction(formData: FormData) {
  const returnTo = getSafeAdminReturnPath(String(formData.get("returnTo") ?? "").trim());
  const result = await takeDownListing(formData);

  if (result.status === "error") {
    redirect(getAdminListingRedirectPath(returnTo, "listing-take-down-failed", result.message));
  }

  redirect(getAdminListingRedirectPath(returnTo, "listing-taken-down"));
}
