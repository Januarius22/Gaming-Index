"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import type { SellerEnforcement } from "@/types";

const titleByAction = {
  warning: "Seller account notice",
  temporary_restriction: "Seller uploads restricted",
  seller_suspension: "Seller access updated"
} as const;

export default function SellerEnforcementNoticeModal({
  enforcement
}: {
  enforcement?: SellerEnforcement | null;
}) {
  const storageKey = useMemo(() => {
    if (!enforcement) {
      return "";
    }

    return `gi-seller-enforcement:${enforcement.id}:${enforcement.created_at}`;
  }, [enforcement]);
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

  if (!enforcement) {
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
      title={titleByAction[enforcement.action]}
      description="Please review the update connected to your seller account."
    >
      <div className="space-y-6">
        <div className="rounded-3xl bg-surface p-5 text-sm leading-7 text-muted-foreground">
          <p className="font-semibold text-foreground">Admin note</p>
          <p className="mt-2">{enforcement.reason}</p>
          {enforcement.restricted_until ? (
            <p className="mt-3 font-medium text-foreground">
              Restriction ends {formatDate(enforcement.restricted_until)}.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={dismiss}>
            Close
          </Button>
          {enforcement.dispute_id ? (
            <Link href={`/seller/disputes/${enforcement.dispute_id}`}>
              <Button onClick={dismiss}>Open case</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
