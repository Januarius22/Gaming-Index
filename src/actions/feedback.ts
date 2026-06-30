"use server";

import { revalidatePath } from "next/cache";
import { requireAccountProfile, requireAdminProfile, requireSellerProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { ActionState, SiteFeedbackCategory, SiteFeedbackStatus } from "@/types";

const feedbackCategories = new Set<SiteFeedbackCategory>([
  "bug",
  "suggestion",
  "payment",
  "buyer_experience",
  "seller_experience",
  "other"
]);

const feedbackStatuses = new Set<SiteFeedbackStatus>([
  "new",
  "reviewed",
  "planned",
  "closed"
]);

function parseRating(value: FormDataEntryValue | null) {
  const rating = Number(String(value ?? "").trim());

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

async function submitFeedback({
  workspace,
  profileId,
  formData
}: {
  workspace: "account" | "seller";
  profileId: string;
  formData: FormData;
}): Promise<ActionState> {
  const rawCategory = String(formData.get("category") ?? "").trim() as SiteFeedbackCategory;
  const category = feedbackCategories.has(rawCategory) ? rawCategory : "other";
  const rating = parseRating(formData.get("rating"));
  const message = String(formData.get("message") ?? "").trim();

  if (message.length < 10) {
    return {
      status: "error",
      message: "Share a little more detail before submitting."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error",
      message: "Connect Supabase to submit feedback."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("site_feedback")
    .insert({
      profile_id: profileId,
      workspace,
      category,
      rating,
      message
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  await supabase!.rpc("notify_admins", {
    notification_type: "site_feedback",
    notification_title: "New feedback",
    notification_message: "A user shared feedback about Gaming Index.",
    notification_link_path: "/admin/feedback",
    notification_metadata: {
      feedback_id: data?.id ?? "",
      workspace,
      category
    }
  });

  revalidatePath(`/${workspace}/feedback`);
  revalidatePath("/admin/feedback");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/dashboard");

  return {
    status: "success",
    message: "Thank you. Your feedback has been submitted."
  };
}

export async function submitAccountFeedbackAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireAccountProfile();

  return submitFeedback({ workspace: "account", profileId: profile.id, formData });
}

export async function submitSellerFeedbackAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireSellerProfile();

  return submitFeedback({ workspace: "seller", profileId: profile.id, formData });
}

export async function updateFeedbackStatusAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const feedbackId = String(formData.get("feedbackId") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "").trim() as SiteFeedbackStatus;
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!feedbackId || !feedbackStatuses.has(rawStatus)) {
    return {
      status: "error" as const,
      message: "Select a valid feedback item."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Connect Supabase to update feedback."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!
    .from("site_feedback")
    .update({
      status: rawStatus,
      admin_note: adminNote,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", feedbackId);

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  revalidatePath("/admin/feedback");

  return {
    status: "success" as const,
    message: "Feedback updated.",
    feedbackId,
    nextStatus: rawStatus,
    adminNote
  };
}
