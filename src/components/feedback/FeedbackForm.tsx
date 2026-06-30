"use client";

import { useActionState } from "react";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type { ActionState } from "@/types";

const initialState: ActionState = {
  status: "idle"
};

export default function FeedbackForm({
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
          <Select id="category" name="category" defaultValue="suggestion">
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug</option>
            <option value="payment">Payment</option>
            <option value="buyer_experience">Buyer experience</option>
            <option value="seller_experience">Seller experience</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="rating" className="text-sm font-semibold text-foreground">
            Rating
          </label>
          <Select id="rating" name="rating" defaultValue="">
            <option value="">No rating</option>
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Okay</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Bad</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-semibold text-foreground">
          Feedback
        </label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Share your thoughts or suggestions."
          required
        />
      </div>
      <SubmitButton pendingLabel="Submitting...">Submit feedback</SubmitButton>
    </form>
  );
}
