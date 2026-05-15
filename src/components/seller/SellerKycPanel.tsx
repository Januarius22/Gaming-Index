"use client";

import { useActionState, useEffect, useState } from "react";
import { submitKycAction } from "@/actions/seller";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { documentTypeOptions, titleCase } from "@/lib/utils";
import type { Profile } from "@/types";

const initialState = {
  status: "idle",
  message: ""
} as const;

export default function SellerKycPanel({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(submitKycAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
    }
  }, [state.status]);

  return (
    <>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Complete your KYC verification to unlock selling features.</CardTitle>
          <CardDescription>
            You can skip this step for now, but you must complete and get approved before
            uploading any gaming account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Current status
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {titleCase(profile.kyc_status)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload access is enabled only when your KYC status becomes approved.
            </p>
          </div>

          <FormMessage
            message={state.message}
            tone={state.status === "success" ? "success" : "error"}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setOpen(true)} disabled={profile.kyc_status === "approved"}>
              Start KYC
            </Button>
            <a href="/seller/dashboard">
              <Button variant="secondary">Skip for Now</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Submit KYC details"
        description="Provide your identity information so the admin team can review your seller access."
      >
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
              Full Name
            </label>
            <Input id="fullName" name="fullName" defaultValue={profile.full_name} />
          </div>
          <div className="space-y-2">
            <label htmlFor="documentType" className="text-sm font-semibold text-foreground">
              Document Type
            </label>
            <Select id="documentType" name="documentType" defaultValue="">
              <option value="" disabled>
                Select a document type
              </option>
              {documentTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="documentNumber" className="text-sm font-semibold text-foreground">
              Document Number
            </label>
            <Input id="documentNumber" name="documentNumber" placeholder="Enter document number" />
          </div>
          <FormMessage message={state.message} />
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Submitting...">Submit KYC</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
