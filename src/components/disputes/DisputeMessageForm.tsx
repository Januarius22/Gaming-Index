"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileImage, Paperclip, Send, Video, X } from "lucide-react";
import FormMessage from "@/components/auth/FormMessage";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabaseClient";
const MAX_FILES = 5;
const MAX_IMAGES = 4;
const MAX_VIDEOS = 1;
const MAX_VIDEO_SECONDS = 15;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const DISPUTE_EVIDENCE_BUCKET = "dispute-evidence";

type SelectedEvidence = {
  name: string;
  kind: "image" | "video";
  duration: number;
  file: File;
};

function safeEvidenceFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export default function DisputeMessageForm({
  disputeId,
  orderId,
  returnTo,
  currentUserId,
  senderRole,
  disabled = false
}: {
  disputeId: string;
  orderId?: string;
  returnTo: string;
  currentUserId: string;
  senderRole: "buyer" | "seller" | "admin";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [fileError, setFileError] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [pending, setPending] = useState(false);
  const [durations, setDurations] = useState<number[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<SelectedEvidence[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const checkFiles = async (files: FileList | null) => {
    setFileError("");
    setDurations([]);
    setSelectedEvidence([]);

    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);

    if (fileArray.length > MAX_FILES) {
      setFileError("Upload up to five files.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const nextDurations: number[] = [];
    const nextEvidence: SelectedEvidence[] = [];
    let imageCount = 0;
    let videoCount = 0;

    for (const file of fileArray) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setFileError("Evidence must be images or one short video.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (isImage) {
        imageCount += 1;
      }

      if (isVideo) {
        videoCount += 1;
      }

      if (imageCount > MAX_IMAGES || videoCount > MAX_VIDEOS) {
        setFileError("Upload up to four images and one video.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setFileError("Images must be 8MB or less.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setFileError("Videos must be 25MB or less.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (file.type.startsWith("video/")) {
        const duration = await getVideoDuration(file);

        if (duration > MAX_VIDEO_SECONDS) {
          setFileError("Video evidence must be 15 seconds or less.");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        nextDurations.push(duration);
        nextEvidence.push({ name: file.name || "Video evidence", kind: "video", duration, file });
      } else {
        nextDurations.push(0);
        nextEvidence.push({ name: file.name || "Image evidence", kind: "image", duration: 0, file });
      }
    }

    setDurations(nextDurations);
    setSelectedEvidence(nextEvidence);
  };

  const clearFiles = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFileError("");
    setDurations([]);
    setSelectedEvidence([]);
  }, []);

  if (disabled) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        This case is closed.
      </div>
    );
  }

  const submitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (fileError || pending) {
      return;
    }

    const formData = new FormData();
    const optimisticId = `pending-${crypto.randomUUID()}`;
    const messageBody = String(new FormData(event.currentTarget).get("message") ?? "").trim();
    setPending(true);
    window.dispatchEvent(
      new CustomEvent("dispute-message:pending", {
        detail: {
          id: optimisticId,
          dispute_id: disputeId,
          sender_id: currentUserId,
          sender_role: senderRole,
          sender_name: "You",
          message: messageBody,
          created_at: new Date().toISOString(),
          delivery_status: "sending",
          attachments: selectedEvidence.map((file, index) => ({
            id: `${optimisticId}-file-${index}`,
            dispute_id: disputeId,
            message_id: optimisticId,
            uploader_id: currentUserId,
            file_name: file.name,
            file_path: "",
            file_type: file.kind,
            duration_seconds: file.duration,
            created_at: new Date().toISOString()
          }))
        }
      })
    );

    const uploadedPaths: string[] = [];

    try {
      formData.set("disputeId", disputeId);
      formData.set("orderId", orderId ?? "");
      formData.set("returnTo", returnTo);
      formData.set("message", messageBody);

      if (selectedEvidence.length > 0) {
        if (!hasSupabaseEnv) {
          throw new Error("Connect Supabase to upload evidence.");
        }

        const supabase = getSupabaseBrowserClient();

        for (const evidence of selectedEvidence) {
          const fileName = safeEvidenceFileName(evidence.name || "evidence");
          const filePath = `${currentUserId}/${disputeId}/${crypto.randomUUID()}-${fileName}`;
          const { error } = await supabase!.storage
            .from(DISPUTE_EVIDENCE_BUCKET)
            .upload(filePath, evidence.file, {
              contentType: evidence.file.type || "application/octet-stream",
              upsert: false
            });

          if (error) {
            throw new Error(error.message);
          }

          uploadedPaths.push(filePath);
          formData.append("uploadedFileNames", fileName);
          formData.append("uploadedFilePaths", filePath);
          formData.append("uploadedFileTypes", evidence.kind);
          formData.append("uploadedDurationSeconds", String(evidence.duration));
        }
      }

      const response = await fetch("/api/disputes/messages", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { status: "success" | "error"; message?: string };

      if (!response.ok || result.status === "error") {
        if (uploadedPaths.length > 0) {
          await getSupabaseBrowserClient()?.storage.from(DISPUTE_EVIDENCE_BUCKET).remove(uploadedPaths);
        }

        window.dispatchEvent(
          new CustomEvent("dispute-message:failed", {
            detail: { id: optimisticId }
          })
        );
        setFeedback({
          message: result.message ?? "Message could not be sent.",
          tone: "error"
        });
        return;
      }

      window.dispatchEvent(
        new CustomEvent("dispute-message:sent", {
          detail: { id: optimisticId }
        })
      );
      formRef.current?.reset();
      clearFiles();
      router.refresh();
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await getSupabaseBrowserClient()?.storage.from(DISPUTE_EVIDENCE_BUCKET).remove(uploadedPaths);
      }

      window.dispatchEvent(
        new CustomEvent("dispute-message:failed", {
          detail: { id: optimisticId }
        })
      );
      setFeedback({
        message: error instanceof Error ? error.message : "Message could not be sent. Please try again.",
        tone: "error"
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        void submitMessage(event);
      }}
      className="w-full space-y-3 rounded-none border-y border-border bg-white p-4 shadow-[0_-18px_42px_rgba(15,23,42,0.16)] sm:rounded-3xl sm:border sm:p-4 sm:shadow-lg sm:shadow-slate-200/70"
    >
      <input type="hidden" name="disputeId" value={disputeId} />
      <input type="hidden" name="orderId" value={orderId ?? ""} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {durations.map((duration, index) => (
        <input key={`${duration}-${index}`} type="hidden" name="durationSeconds" value={duration} />
      ))}
      <Textarea
        name="message"
        rows={2}
        placeholder="Message"
        className="min-h-16 w-full resize-none"
      />
      <div className="flex w-full items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-soft">
          <Paperclip className="h-4 w-4" />
          Evidence
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            name="evidenceFiles"
            accept="image/*,video/*"
            multiple
            onChange={(event) => {
              void checkFiles(event.currentTarget.files);
            }}
          />
        </label>
        <Button type="submit" disabled={Boolean(fileError) || pending} className="shrink-0">
          <Send className="mr-2 h-4 w-4" />
          {pending ? "Sending..." : "Send"}
        </Button>
      </div>
      {selectedEvidence.length > 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              {selectedEvidence.length} file{selectedEvidence.length === 1 ? "" : "s"} selected
            </p>
            <button
              type="button"
              onClick={clearFiles}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-white hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            {selectedEvidence.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm">
                {file.kind === "video" ? (
                  <Video className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <FileImage className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span className="min-w-0 flex-1 truncate text-foreground">{file.name}</span>
                {file.kind === "video" ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {Math.ceil(file.duration)}s
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <FormMessage
        message={fileError || feedback?.message}
        tone={fileError ? "error" : feedback?.tone ?? "error"}
      />
    </form>
  );
}

async function getVideoDuration(file: File) {
  if (typeof document === "undefined") {
    return 0;
  }

  return new Promise<number>((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      resolve(0);
    };
    video.src = objectUrl;
  });
}
