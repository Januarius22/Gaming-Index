"use client";

import { useActionState } from "react";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type { ActionState } from "@/types";

const initialState: ActionState = {
  status: "idle"
};

export default function SupportTicketForm({
  action
}: {
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage
        message={state.message}
        tone={state.status === "success" ? "success" : "error"}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-semibold text-foreground">
            Category
          </label>
          <Select id="category" name="category" defaultValue="account">
            <option value="account">Account</option>
            <option value="payment">Payment</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="listing">Listing</option>
            <option value="kyc">KYC</option>
            <option value="technical">Technical issue</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-semibold text-foreground">
            Subject
          </label>
          <Input id="subject" name="subject" placeholder="Briefly describe the issue" required />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-semibold text-foreground">
          Message
        </label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell support what happened."
          required
        />
      </div>
      <SubmitButton pendingLabel="Submitting...">Submit request</SubmitButton>
    </form>
  );
}
