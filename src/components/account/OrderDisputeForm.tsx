"use client";

import { useActionState } from "react";
import { submitOrderDisputeAction } from "@/actions/account";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type { ActionState } from "@/types";

const initialState: ActionState = {
  status: "idle"
};

const disputeReasons = [
  "Login details do not work",
  "Account was recovered",
  "Account details are incomplete",
  "Listing was misleading",
  "Other"
];

export default function OrderDisputeForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState(submitOrderDisputeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <FormMessage
        message={state.message}
        tone={state.status === "success" ? "success" : "error"}
      />
      <label className="space-y-2 text-sm font-semibold text-foreground">
        Reason
        <Select name="reason" required defaultValue="">
          <option value="" disabled>
            Select a reason
          </option>
          {disputeReasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </Select>
      </label>
      <label className="space-y-2 text-sm font-semibold text-foreground">
        Details
        <Textarea
          name="details"
          minLength={20}
          placeholder="Explain the issue clearly."
          required
        />
      </label>
      <SubmitButton variant="danger" pendingLabel="Opening dispute..." className="w-full">
        Open dispute
      </SubmitButton>
    </form>
  );
}
