"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { gameOptions, loginMethodOptions, platformOptions } from "@/lib/utils";

export default function SellerUploadForm({
  feedbackMessage = ""
}: {
  feedbackMessage?: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    router.replace(pathname, { scroll: false });
  }, [feedbackMessage, pathname, router]);

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>Publish a gaming account listing</CardTitle>
        <CardDescription>
          Approved sellers can publish mobile gaming account listings here directly.
        </CardDescription>
        <div className="rounded-3xl border border-primary/12 bg-primary-soft/55 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-dark">
            Grid image tip
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Build your collage yourself first, then upload one final image only. Make sure
            the single image clearly shows the lobby, rank, inventory, rare skins, bundles,
            or weapon proof buyers care about most.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form
          action="/seller/upload/submit"
          method="POST"
          encType="multipart/form-data"
          className="space-y-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="game" className="text-sm font-semibold text-foreground">
                Game
              </label>
              <Select id="game" name="game" defaultValue="" required>
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
              <Input id="price" name="price" type="number" min="1" placeholder="200" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Account Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Example: CODM Ranked Account with Premium Loadout"
                required
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
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="platform" className="text-sm font-semibold text-foreground">
                Platform
              </label>
              <Select id="platform" name="platform" defaultValue="" required>
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
              <Input id="accountLevel" name="accountLevel" placeholder="Level 120" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="loginMethod" className="text-sm font-semibold text-foreground">
                Login Method
              </label>
              <Select id="loginMethod" name="loginMethod" defaultValue="" required>
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
              <Input id="extraNotes" name="extraNotes" placeholder="Any extra notes for buyers" />
            </div>
          </div>

          <div className="rounded-[28px] border border-dashed border-border bg-surface p-6">
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="rounded-[28px] border border-white/80 bg-white p-3 shadow-sm">
                {previewUrl ? (
                  <div className="aspect-[16/11] overflow-hidden rounded-[28px] bg-slate-950 p-2">
                    <div className="relative h-full overflow-hidden rounded-[22px] bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Selected listing grid preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Use this as sample</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Create one clean final grid image yourself, then upload that single image
                    for the marketplace card and listing page.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="listingImage" className="text-sm font-semibold text-foreground">
                    Final grid image
                  </label>
                  <input
                    id="listingImage"
                    name="listingImage"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    required
                    onChange={(event) =>
                      setSelectedFile(event.currentTarget.files?.[0] ?? null)
                    }
                    className="block w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary"
                  />
                  <p className="text-xs leading-6 text-muted-foreground">
                    Upload one JPG, PNG, or WEBP image only.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FormMessage message={feedbackMessage} tone="error" />

          <div className="flex justify-end">
            <SubmitButton pendingLabel="Publishing listing...">
              Publish Listing
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
