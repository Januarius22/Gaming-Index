"use client";

import { useActionState } from "react";
import { submitSuspensionAppealAction } from "@/actions/account";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import type { ActionState } from "@/types";

const initialState: ActionState = {
  status: "idle"
};

export default function SuspensionAppealForm({
  defaultEmail
}: {
  defaultEmail: string;
}) {
  const [state, formAction] = useActionState(submitSuspensionAppealAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage
        message={state.message}
        tone={state.status === "success" ? "success" : "error"}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-foreground">
          Email address
          <Input
            name="email"
            type="email"
            defaultValue={defaultEmail}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-semibold text-foreground">
          Phone number
          <Input
            name="phoneNumber"
            type="tel"
            placeholder="+234 800 000 0000"
            required
          />
        </label>
      </div>
      <label className="space-y-2 text-sm font-semibold text-foreground">
        Why should your account be restored?
        <Textarea
          name="appealReason"
          minLength={20}
          placeholder="Explain what happened and why you believe the suspension should be reviewed."
          required
        />
      </label>
      <SubmitButton pendingLabel="Submitting appeal..." className="w-full sm:w-auto">
        Submit appeal
      </SubmitButton>
    </form>
  );
}
