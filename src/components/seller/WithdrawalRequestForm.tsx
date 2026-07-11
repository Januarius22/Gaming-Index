"use client";

import { useActionState, useState } from "react";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Input from "@/components/ui/Input";
import { requestWithdrawalAction, type WithdrawalActionState } from "@/actions/seller";
import { formatCurrency } from "@/lib/utils";
import type { CurrencyRate, ProfileSettings } from "@/types";

const initialState: WithdrawalActionState = {
  status: "idle"
};

export default function WithdrawalRequestForm({
  availableBalance,
  settings,
  currencyRates
}: {
  availableBalance: number;
  settings?: Pick<
    ProfileSettings,
    "default_bank_name" | "default_account_number" | "default_account_name" | "display_currency"
  >;
  currencyRates?: CurrencyRate[];
}) {
  const [state, formAction] = useActionState(requestWithdrawalAction, initialState);
  const displayCurrency = settings?.display_currency ?? "NGN";
  const [amountInput, setAmountInput] = useState("");
  const rawAmount = amountInput.replace(/,/g, "");

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage
        message={state.message}
        tone={state.status === "success" ? "success" : "error"}
      />
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-semibold text-foreground">
          Amount
        </label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          value={amountInput}
          onChange={(event) => {
            const cleaned = event.target.value.replace(/[^\d.]/g, "");
            const [whole = "", decimal = ""] = cleaned.split(".");
            const formattedWhole = whole
              ? new Intl.NumberFormat("en-NG").format(Number(whole))
              : "";
            setAmountInput(
              cleaned.includes(".") ? `${formattedWhole}.${decimal.slice(0, 2)}` : formattedWhole
            );
          }}
          placeholder="0.00"
          required
        />
        <input type="hidden" name="amount" value={rawAmount} />
        <p className="text-xs font-medium text-muted-foreground">
          Available balance: {formatCurrency(availableBalance, displayCurrency, currencyRates)}
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="bankName" className="text-sm font-semibold text-foreground">
          Bank name
        </label>
        <Input
          id="bankName"
          name="bankName"
          defaultValue={settings?.default_bank_name}
          placeholder="Bank name"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="accountNumber" className="text-sm font-semibold text-foreground">
          Account number
        </label>
        <Input
          id="accountNumber"
          name="accountNumber"
          defaultValue={settings?.default_account_number}
          inputMode="numeric"
          placeholder="Account number"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="accountName" className="text-sm font-semibold text-foreground">
          Account name
        </label>
        <Input
          id="accountName"
          name="accountName"
          defaultValue={settings?.default_account_name}
          placeholder="Account name"
          required
        />
      </div>
      <SubmitButton
        disabled={availableBalance <= 0}
        pendingLabel="Submitting..."
        className="w-full"
      >
        Request withdrawal
      </SubmitButton>
    </form>
  );
}
