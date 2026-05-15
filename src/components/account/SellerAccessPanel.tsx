"use client";

import Link from "next/link";
import { useActionState } from "react";
import { unlockSellerAccessAction } from "@/actions/account";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Button from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/Card";
import { titleCase } from "@/lib/utils";
import type { Profile } from "@/types";

const initialState = {
  status: "idle",
  message: ""
} as const;

export default function SellerAccessPanel({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(unlockSellerAccessAction, initialState);

  if (profile.seller_enabled) {
    return (
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Seller access is active on your account.</CardTitle>
          <CardDescription>
            Your account can use the seller workspace. Complete KYC to unlock uploads,
            then manage listings, orders, and wallet tools in the dedicated seller area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Current KYC status
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {titleCase(profile.kyc_status)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload access opens only when your KYC review is approved.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/seller/dashboard">
              <Button>Open Seller Workspace</Button>
            </Link>
            <Link href="/seller/kyc">
              <Button variant="secondary">Complete KYC</Button>
            </Link>
            <Link href="/account/dashboard">
              <Button variant="subtle">Back to Account</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Unlock seller tools when you are ready to list.</CardTitle>
        <CardDescription>
          Every new account starts as a buyer. Seller access is a separate workspace,
          and KYC is only required when you want to upload gaming accounts for review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-surface p-5">
            <p className="font-semibold text-foreground">Step 1</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Unlock seller access from your account dashboard.
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="font-semibold text-foreground">Step 2</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Complete KYC when you are ready to start listing accounts.
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5">
            <p className="font-semibold text-foreground">Step 3</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Submit listings for admin review from the seller workspace.
            </p>
          </div>
        </div>

        <FormMessage message={state.message} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <form action={formAction}>
            <SubmitButton pendingLabel="Unlocking seller access...">
              Become a Seller
            </SubmitButton>
          </form>
          <Link href="/account/marketplace">
            <Button variant="secondary">Keep Browsing Marketplace</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
