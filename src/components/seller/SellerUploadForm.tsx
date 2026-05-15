"use client";

import { useActionState } from "react";
import { ImagePlus } from "lucide-react";
import { submitListingAction } from "@/actions/seller";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { gameOptions, loginMethodOptions, platformOptions } from "@/lib/utils";

const initialState = {
  status: "idle",
  message: ""
} as const;

export default function SellerUploadForm() {
  const [state, formAction] = useActionState(submitListingAction, initialState);

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>Upload a gaming account for review</CardTitle>
        <CardDescription>
          Approved sellers can submit listings here. New listings are saved with a
          pending_review status for admin approval.
        </CardDescription>
        <div className="rounded-3xl border border-primary/12 bg-primary-soft/55 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-dark">
            Cover image instruction
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            When you prepare account screenshots, make the cover a clean photo grid so
            buyers can quickly see the lobby, inventory, rank, skins, and standout items
            in one frame.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="game" className="text-sm font-semibold text-foreground">
                Game
              </label>
              <Select id="game" name="game" defaultValue="">
                <option value="" disabled>
                  Select a game
                </option>
                {gameOptions.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold text-foreground">
                Price
              </label>
              <Input id="price" name="price" type="number" min="1" placeholder="200" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Account Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Example: COD Ranked Account with Premium Loadout"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-semibold text-foreground">
                Account Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe skins, rank, unlocked items, and account quality."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="platform" className="text-sm font-semibold text-foreground">
                Platform
              </label>
              <Select id="platform" name="platform" defaultValue="">
                <option value="" disabled>
                  Select platform
                </option>
                {platformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="accountLevel" className="text-sm font-semibold text-foreground">
                Account Level
              </label>
              <Input id="accountLevel" name="accountLevel" placeholder="Level 120" />
            </div>
            <div className="space-y-2">
              <label htmlFor="loginMethod" className="text-sm font-semibold text-foreground">
                Login Method
              </label>
              <Select id="loginMethod" name="loginMethod" defaultValue="">
                <option value="" disabled>
                  Select login method
                </option>
                {loginMethodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="extraNotes" className="text-sm font-semibold text-foreground">
                Extra Notes
              </label>
              <Input id="extraNotes" name="extraNotes" placeholder="Any extra notes for review" />
            </div>
          </div>

          <div className="rounded-[28px] border border-dashed border-border bg-surface p-6">
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="rounded-[28px] border border-white/80 bg-white p-3 shadow-sm">
                <ListingPhotoGrid
                  size="guide"
                  listing={{
                    id: "guide-listing",
                    seller_id: "guide-seller",
                    seller_name: "Seller guide",
                    seller_username: "gridready",
                    game: "Free Fire",
                    title: "Example photo grid",
                    description: "Guide only",
                    price: 0,
                    platform: "Mobile",
                    account_level: "Level 70",
                    login_method: "Email",
                    extra_notes: "",
                    status: "draft",
                    created_at: "2026-05-14T00:00:00.000Z"
                  }}
                />
              </div>
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Photo grid guidance</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Image uploads are still a placeholder for now, but your future cover should
                    be a neat photo grid. Keep it sharp, use only in-game screenshots, and show
                    the most important proof points at a glance.
                  </p>
                </div>
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    Show the lobby, rank, and account identity clearly.
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    Include inventory, skins, rare items, or weapon proof.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FormMessage
            message={state.message}
            tone={state.status === "success" ? "success" : "error"}
          />

          <div className="flex justify-end">
            <SubmitButton pendingLabel="Submitting listing...">
              Submit for Review
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
