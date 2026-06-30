"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileImage, Paperclip, Send, Video, X } from "lucide-react";
import FormMessage from "@/components/auth/FormMessage";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
const MAX_FILES = 5;
const MAX_IMAGES = 4;
const MAX_VIDEOS = 1;
const MAX_VIDEO_SECONDS = 15;

type SelectedEvidence = {
  name: string;
  kind: "image" | "video";
  duration: number;
};

export default function DisputeMessageForm({
  disputeId,
  orderId,
  returnTo,
  disabled = false
}: {
  disputeId: string;
  orderId?: string;
  returnTo: string;
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
        nextEvidence.push({ name: file.name || "Video evidence", kind: "video", duration });
      } else {
        nextDurations.push(0);
        nextEvidence.push({ name: file.name || "Image evidence", kind: "image", duration: 0 });
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

    const formData = new FormData(event.currentTarget);
    setPending(true);

    try {
      const response = await fetch("/api/disputes/messages", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { status: "success" | "error"; message?: string };

      if (!response.ok || result.status === "error") {
        setFeedback({
          message: result.message ?? "Message could not be sent.",
          tone: "error"
        });
        return;
      }

      formRef.current?.reset();
      clearFiles();
      setFeedback({ message: "Message sent.", tone: "success" });
      router.refresh();
    } catch {
      setFeedback({
        message: "Message could not be sent. Please try again.",
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
      className="space-y-4 rounded-3xl border border-border bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="disputeId" value={disputeId} />
      <input type="hidden" name="orderId" value={orderId ?? ""} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {durations.map((duration, index) => (
        <input key={`${duration}-${index}`} type="hidden" name="durationSeconds" value={duration} />
      ))}
      <Textarea
        name="message"
        rows={4}
        placeholder="Add a clear update for this case."
        className="min-h-28"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-soft">
          <Paperclip className="h-4 w-4" />
          Add evidence
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
        <Button type="submit" disabled={Boolean(fileError) || pending}>
          <Send className="mr-2 h-4 w-4" />
          {pending ? "Sending..." : "Send message"}
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
