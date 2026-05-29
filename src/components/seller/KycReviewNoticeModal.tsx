"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function KycReviewNoticeModal({
  submissionId,
  rejectionReason
}: {
  submissionId?: string;
  rejectionReason?: string;
}) {
  const storageKey = useMemo(() => {
    if (!submissionId || !rejectionReason) {
      return "";
    }

    return `gi-kyc-review-note:${submissionId}:${rejectionReason}`;
  }, [rejectionReason, submissionId]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    const dismissed = window.localStorage.getItem(storageKey);
    if (!dismissed) {
      setOpen(true);
    }
  }, [storageKey]);

  if (!submissionId || !rejectionReason) {
    return null;
  }

  const dismiss = () => {
    if (storageKey) {
      window.localStorage.setItem(storageKey, "dismissed");
    }

    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={dismiss}
      title="KYC update from admin"
      description="Your last KYC review needs changes before seller upload access can be approved."
    >
      <div className="space-y-6">
        <div className="rounded-3xl bg-rose-50 p-5 text-sm leading-7 text-rose-900">
          {rejectionReason}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={dismiss}>
            Close
          </Button>
          <Link href="/seller/kyc">
            <Button onClick={dismiss}>Update KYC</Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
