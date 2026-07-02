"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccountProfile, requireAdminProfile, requireSellerProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { ActionState, Profile, SupportTicketCategory, SupportTicketStatus } from "@/types";

const supportCategories = new Set<SupportTicketCategory>([
  "account",
  "payment",
  "withdrawal",
  "listing",
  "kyc",
  "technical",
  "other"
]);

const supportStatuses = new Set<SupportTicketStatus>([
  "open",
  "in_review",
  "resolved",
  "closed"
]);

function supportPath(workspace: "account" | "seller", ticketId?: string) {
  const basePath = `/${workspace}/support`;
  return ticketId ? `${basePath}/${ticketId}` : basePath;
}

function revalidateSupportPaths(workspace: "account" | "seller", ticketId?: string) {
  revalidatePath(supportPath(workspace));
  if (ticketId) {
    revalidatePath(supportPath(workspace, ticketId));
  }
  revalidatePath("/admin/support");
  if (ticketId) {
    revalidatePath(`/admin/support/${ticketId}`);
  }
  revalidatePath("/admin/notifications");
}

async function createSupportTicket({
  profile,
  workspace,
  formData
}: {
  profile: Profile;
  workspace: "account" | "seller";
  formData: FormData;
}): Promise<ActionState> {
  const rawCategory = String(formData.get("category") ?? "").trim() as SupportTicketCategory;
  const category = supportCategories.has(rawCategory) ? rawCategory : "other";
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (subject.length < 4) {
    return {
      status: "error",
      message: "Add a clear subject."
    };
  }

  if (message.length < 10) {
    return {
      status: "error",
      message: "Share a little more detail before submitting."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error",
      message: "Connect Supabase to contact support."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("support_tickets")
    .insert({
      profile_id: profile.id,
      workspace,
      category,
      subject
    })
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    return {
      status: "error",
      message: error?.message ?? "Support request could not be created."
    };
  }

  const ticketId = String(data.id);
  const { error: messageError } = await supabase!.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: profile.id,
    sender_role: "user",
    message
  });

  if (messageError) {
    return {
      status: "error",
      message: messageError.message
    };
  }

  await supabase!.rpc("notify_admins", {
    notification_type: "support_ticket",
    notification_title: "New support request",
    notification_message: `${profile.full_name} submitted a support request.`,
    notification_link_path: `/admin/support/${ticketId}`,
    notification_metadata: {
      ticket_id: ticketId,
      workspace,
      category,
      subject
    }
  });

  revalidateSupportPaths(workspace, ticketId);

  return {
    status: "success",
    message: "Support request submitted."
  };
}

export async function submitAccountSupportTicketAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireAccountProfile();

  return createSupportTicket({ profile, workspace: "account", formData });
}

export async function submitSellerSupportTicketAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireSellerProfile();

  return createSupportTicket({ profile, workspace: "seller", formData });
}

async function replyAsUser({
  profile,
  workspace,
  formData
}: {
  profile: Profile;
  workspace: "account" | "seller";
  formData: FormData;
}) {
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!ticketId || message.length < 2 || !hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Add a message before sending."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: profile.id,
    sender_role: "user",
    message
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  await supabase!
    .from("support_tickets")
    .update({
      status: "open",
      last_message_at: new Date().toISOString()
    })
    .eq("id", ticketId)
    .eq("profile_id", profile.id);

  await supabase!.rpc("notify_admins", {
    notification_type: "support_reply",
    notification_title: "Support reply received",
    notification_message: `${profile.full_name} replied to a support request.`,
    notification_link_path: `/admin/support/${ticketId}`,
    notification_metadata: {
      ticket_id: ticketId,
      workspace
    }
  });

  revalidateSupportPaths(workspace, ticketId);

  return {
    status: "success" as const,
    message: "Reply sent."
  };
}

export async function replyToAccountSupportTicketAction(formData: FormData) {
  const profile = await requireAccountProfile();

  return replyAsUser({ profile, workspace: "account", formData });
}

export async function replyToSellerSupportTicketAction(formData: FormData) {
  const profile = await requireSellerProfile();

  return replyAsUser({ profile, workspace: "seller", formData });
}

export async function replyToSupportTicketAction(formData: FormData) {
  const profile = await requireAdminProfile();
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const workspace = String(formData.get("workspace") ?? "account") === "seller" ? "seller" : "account";
  const requesterId = String(formData.get("requesterId") ?? "").trim();

  if (!ticketId || message.length < 2 || !hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Add a reply before sending."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: profile.id,
    sender_role: "admin",
    message
  });

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  await supabase!
    .from("support_tickets")
    .update({
      status: "in_review",
      last_message_at: new Date().toISOString()
    })
    .eq("id", ticketId);

  if (requesterId) {
    await supabase!.from("notifications").insert({
      profile_id: requesterId,
      type: "support_reply",
      title: "Support replied",
      message: "A support reply is available for your request.",
      link_path: supportPath(workspace, ticketId),
      metadata: {
        ticket_id: ticketId
      }
    });
  }

  revalidateSupportPaths(workspace, ticketId);
  revalidatePath(`/${workspace}/notifications`);

  return {
    status: "success" as const,
    message: "Reply sent."
  };
}

export async function updateSupportTicketStatusAction(formData: FormData) {
  await requireAdminProfile();
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "").trim() as SupportTicketStatus;
  const workspace = String(formData.get("workspace") ?? "account") === "seller" ? "seller" : "account";
  const requesterId = String(formData.get("requesterId") ?? "").trim();

  if (!ticketId || !supportStatuses.has(rawStatus) || !hasSupabaseEnv) {
    return {
      status: "error" as const,
      message: "Select a valid support status."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!
    .from("support_tickets")
    .update({
      status: rawStatus,
      closed_at: rawStatus === "closed" || rawStatus === "resolved" ? new Date().toISOString() : null,
      last_message_at: new Date().toISOString()
    })
    .eq("id", ticketId);

  if (error) {
    return {
      status: "error" as const,
      message: error.message
    };
  }

  if (requesterId) {
    await supabase!.from("notifications").insert({
      profile_id: requesterId,
      type: "support_status",
      title: "Support request updated",
      message: `Your support request is now ${rawStatus.replace(/_/g, " ")}.`,
      link_path: supportPath(workspace, ticketId),
      metadata: {
        ticket_id: ticketId,
        status: rawStatus
      }
    });
  }

  revalidateSupportPaths(workspace, ticketId);
  revalidatePath(`/${workspace}/notifications`);

  return {
    status: "success" as const,
    message: "Support request updated.",
    nextStatus: rawStatus
  };
}

export async function redirectToSupportTicket(workspace: "account" | "seller", ticketId: string) {
  redirect(supportPath(workspace, ticketId));
}
