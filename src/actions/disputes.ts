"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile, requireAccountProfile } from "@/lib/auth";
import { getBuyerOrderDetail, isOrderDisputeEligible } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { ActionState } from "@/types";

const DISPUTE_EVIDENCE_BUCKET = "dispute-evidence";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const MAX_EVIDENCE_FILES = 5;
const MAX_EVIDENCE_IMAGES = 4;
const MAX_EVIDENCE_VIDEOS = 1;
const MAX_VIDEO_SECONDS = 15;

function safeFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function safeReturnPath(value: string, fallback: string) {
  return value.startsWith("/account/") || value.startsWith("/seller/") || value.startsWith("/admin/")
    ? value
    : fallback;
}

function getReturnPathWithNotice(pathname: string, notice: string, message?: string) {
  const [basePath, existingQuery = ""] = pathname.split("?");
  const searchParams = new URLSearchParams(existingQuery);
  searchParams.set("notice", notice);

  if (message) {
    searchParams.set("message", message);
  }

  return `${basePath}?${searchParams.toString()}`;
}

function revalidateDisputePaths(disputeId: string, orderId?: string) {
  revalidatePath("/account/disputes");
  revalidatePath(`/account/disputes/${disputeId}`);
  revalidatePath("/account/notifications");
  revalidatePath("/seller/disputes");
  revalidatePath(`/seller/disputes/${disputeId}`);
  revalidatePath("/seller/notifications");
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/dashboard");

  if (orderId) {
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/account/orders");
    revalidatePath("/seller/orders");
    revalidatePath("/admin/orders");
  }
}

export async function openDisputeCaseAction(formData: FormData) {
  const profile = await requireAccountProfile();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const disputeReason = String(formData.get("disputeReason") ?? "").trim();
  const disputeDetails = String(formData.get("disputeDetails") ?? "").trim();
  const evidenceFiles = formData
    .getAll("evidenceFiles")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!orderId) {
    redirect("/account/disputes?notice=invalid-order");
  }

  if (!hasSupabaseEnv) {
    redirect("/account/disputes?notice=supabase-required");
  }

  const orderDetail = await getBuyerOrderDetail(profile, orderId);

  if (!orderDetail) {
    redirect("/account/disputes?notice=order-not-found");
  }

  if (!isOrderDisputeEligible(orderDetail.order)) {
    redirect("/account/disputes?notice=order-not-eligible");
  }

  if (!disputeReason || disputeDetails.length < 20) {
    redirect("/account/disputes?notice=case-details-required");
  }

  const imageCount = evidenceFiles.filter((file) => file.type.startsWith("image/")).length;
  const videoCount = evidenceFiles.filter((file) => file.type.startsWith("video/")).length;

  if (evidenceFiles.length === 0 || imageCount === 0) {
    redirect("/account/disputes?notice=screenshot-required");
  }

  if (
    evidenceFiles.length > MAX_EVIDENCE_FILES ||
    imageCount > MAX_EVIDENCE_IMAGES ||
    videoCount > MAX_EVIDENCE_VIDEOS ||
    evidenceFiles.some((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return (
        (!isImage && !isVideo) ||
        (isImage && file.size > MAX_IMAGE_SIZE) ||
        (isVideo && file.size > MAX_VIDEO_SIZE)
      );
    })
  ) {
    redirect("/account/disputes?notice=invalid-evidence");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!.rpc("submit_order_dispute", {
    target_order_id: orderId,
    dispute_reason: disputeReason,
    dispute_details: disputeDetails
  });

  if (error || !data) {
    redirect(`/account/disputes?notice=case-open-failed&error=${encodeURIComponent(error?.message ?? "Case could not be opened.")}`);
  }

  const evidenceFormData = new FormData();
  evidenceFormData.set("disputeId", String(data));
  evidenceFormData.set("orderId", orderId);
  evidenceFormData.set("returnTo", `/account/disputes/${data}`);
  evidenceFormData.set("message", "Evidence submitted for admin review.");
  evidenceFiles.forEach((file) => evidenceFormData.append("evidenceFiles", file));

  const evidenceResult = await submitDisputeMessage(evidenceFormData);

  if (evidenceResult.status === "error") {
    redirect(
      `/account/disputes/${data}?notice=message-error&message=${encodeURIComponent(
        evidenceResult.message ?? "Case opened, but evidence upload failed."
      )}`
    );
  }

  revalidateDisputePaths(String(data), orderId);
  redirect(`/account/disputes/${data}`);
}

export async function sendDisputeMessageAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return submitDisputeMessage(formData);
}

export async function sendDisputeMessageRedirectAction(formData: FormData) {
  const returnTo = safeReturnPath(String(formData.get("returnTo") ?? ""), "/account/disputes");
  const result = await submitDisputeMessage(formData);

  if (result.status === "error") {
    redirect(getReturnPathWithNotice(returnTo, "message-error", result.message ?? "Message could not be sent."));
  }

  redirect(getReturnPathWithNotice(returnTo, "message-sent"));
}

export async function submitDisputeMessage(formData: FormData): Promise<ActionState> {
  const profile = await getCurrentProfile();
  const disputeId = String(formData.get("disputeId") ?? "").trim();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const returnTo = safeReturnPath(String(formData.get("returnTo") ?? ""), "/account/disputes");
  const durations = formData
    .getAll("durationSeconds")
    .map((value) => Number(String(value)))
    .filter((value) => Number.isFinite(value));
  const uploadedFileNames = formData
    .getAll("uploadedFileNames")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const uploadedFilePaths = formData
    .getAll("uploadedFilePaths")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const uploadedFileTypes = formData
    .getAll("uploadedFileTypes")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const uploadedDurations = formData
    .getAll("uploadedDurationSeconds")
    .map((value) => Number(String(value)))
    .filter((value) => Number.isFinite(value));
  const files = formData
    .getAll("evidenceFiles")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!profile) {
    return {
      status: "error",
      message: "Sign in before sending a case message."
    };
  }

  if (!disputeId) {
    return {
      status: "error",
      message: "Case not found."
    };
  }

  if (!message && files.length === 0 && uploadedFilePaths.length === 0) {
    return {
      status: "error",
      message: "Add a message or evidence."
    };
  }

  if (
    files.length > MAX_EVIDENCE_FILES ||
    uploadedFilePaths.length > MAX_EVIDENCE_FILES ||
    files.length + uploadedFilePaths.length > MAX_EVIDENCE_FILES
  ) {
    return {
      status: "error",
      message: "Upload up to five evidence files at once."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error",
      message: "Connect Supabase to send case messages."
    };
  }

  const supabase = await getSupabaseServerClient();
  const fileNames: string[] = [];
  const filePaths: string[] = [];
  const fileTypes: string[] = [];
  const fileDurations: number[] = [];

  let imageCount = 0;
  let videoCount = 0;

  if (uploadedFilePaths.length > 0) {
    if (
      uploadedFilePaths.length !== uploadedFileNames.length ||
      uploadedFilePaths.length !== uploadedFileTypes.length
    ) {
      return {
        status: "error",
        message: "Evidence details are incomplete."
      };
    }

    for (const [index, filePath] of uploadedFilePaths.entries()) {
      const fileType = uploadedFileTypes[index];
      const duration = uploadedDurations[index] ?? 0;

      if (fileType !== "image" && fileType !== "video") {
        return {
          status: "error",
          message: "Evidence must be an image or video."
        };
      }

      if (!filePath.startsWith(`${profile.id}/${disputeId}/`)) {
        return {
          status: "error",
          message: "Evidence path is invalid."
        };
      }

      if (fileType === "image") {
        imageCount += 1;
      } else {
        videoCount += 1;
      }

      if (imageCount > MAX_EVIDENCE_IMAGES || videoCount > MAX_EVIDENCE_VIDEOS) {
        return {
          status: "error",
          message: "Upload up to four images and one video."
        };
      }

      if (fileType === "video" && duration > MAX_VIDEO_SECONDS) {
        return {
          status: "error",
          message: "Video evidence must be 15 seconds or less."
        };
      }

      fileNames.push(safeFileName(uploadedFileNames[index] || `evidence-${index + 1}`));
      filePaths.push(filePath);
      fileTypes.push(fileType);
      fileDurations.push(fileType === "video" ? duration : 0);
    }
  }

  for (const [index, file] of files.entries()) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const duration = durations[index] ?? 0;

    if (!isImage && !isVideo) {
      return {
        status: "error",
        message: "Evidence must be an image or video."
      };
    }

    if (isImage) {
      imageCount += 1;
    }

    if (isVideo) {
      videoCount += 1;
    }

    if (imageCount > MAX_EVIDENCE_IMAGES || videoCount > MAX_EVIDENCE_VIDEOS) {
      return {
        status: "error",
        message: "Upload up to four images and one video."
      };
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return {
        status: "error",
        message: "Images must be 8MB or less."
      };
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return {
        status: "error",
        message: "Videos must be 25MB or less."
      };
    }

    if (isVideo && duration > MAX_VIDEO_SECONDS) {
      return {
        status: "error",
        message: "Video evidence must be 15 seconds or less."
      };
    }

    const fileName = safeFileName(file.name || `evidence-${index + 1}`);
    const filePath = `${profile.id}/${disputeId}/${crypto.randomUUID()}-${fileName}`;
    const { error } = await supabase!.storage
      .from(DISPUTE_EVIDENCE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    fileNames.push(fileName);
    filePaths.push(filePath);
    fileTypes.push(isVideo ? "video" : "image");
    fileDurations.push(isVideo ? duration : 0);
  }

  const { error } = await supabase!.rpc("send_dispute_message", {
    target_dispute_id: disputeId,
    message_body: message,
    attachment_file_names: fileNames,
    attachment_file_paths: filePaths,
    attachment_file_types: fileTypes,
    attachment_duration_seconds: fileDurations
  });

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  revalidateDisputePaths(disputeId, orderId || undefined);
  revalidatePath(returnTo);

  return {
    status: "success",
    message: "Message sent."
  };
}
