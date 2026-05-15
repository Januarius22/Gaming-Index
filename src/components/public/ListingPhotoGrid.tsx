import { Sparkles, Sword, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types";

const visualThemes: Record<string, { shell: string; accents: string[] }> = {
  COD: {
    shell: "from-[#061733] via-[#0a3f96] to-[#07142d]",
    accents: [
      "from-[#1f6fff] to-[#65b2ff]",
      "from-[#0a2b6c] to-[#2367d1]",
      "from-[#7f5b1d] to-[#e9b949]",
      "from-[#103063] to-[#2a7fff]",
      "from-[#10233d] to-[#1d5fca]",
      "from-[#124f78] to-[#57a5d8]"
    ]
  },
  "Free Fire": {
    shell: "from-[#2d0b56] via-[#5b1f8c] to-[#1c0b35]",
    accents: [
      "from-[#ff7b2c] to-[#ffcc66]",
      "from-[#451a6e] to-[#8642c7]",
      "from-[#8e1f5f] to-[#ff6f91]",
      "from-[#2d1455] to-[#673ab7]",
      "from-[#bc4b1f] to-[#f0a94f]",
      "from-[#2f1959] to-[#7e57c2]"
    ]
  },
  "PUBG Mobile": {
    shell: "from-[#062b63] via-[#0d4c87] to-[#031b3d]",
    accents: [
      "from-[#1d8c9e] to-[#7ae2d7]",
      "from-[#072d52] to-[#2b6cb0]",
      "from-[#76622d] to-[#f4c95d]",
      "from-[#0d3e78] to-[#3190ff]",
      "from-[#0d5963] to-[#50c6d8]",
      "from-[#10223f] to-[#4f8df7]"
    ]
  },
  Fortnite: {
    shell: "from-[#072867] via-[#1448b8] to-[#0a1b44]",
    accents: [
      "from-[#31a2ff] to-[#98d8ff]",
      "from-[#0d3675] to-[#2c67da]",
      "from-[#6541de] to-[#9e8cff]",
      "from-[#0f3a68] to-[#1dc0ff]",
      "from-[#18359e] to-[#647dff]",
      "from-[#0e4f8c] to-[#5db3ff]"
    ]
  },
  eFootball: {
    shell: "from-[#062b63] via-[#0057ff] to-[#02163b]",
    accents: [
      "from-[#0b4ab8] to-[#68a4ff]",
      "from-[#053986] to-[#1570ef]",
      "from-[#0d7b60] to-[#63e0b6]",
      "from-[#0a3388] to-[#4b7df4]",
      "from-[#05659d] to-[#42c1ff]",
      "from-[#0a3c7a] to-[#00a6ff]"
    ]
  }
};

const panelLabels: Record<string, string[]> = {
  COD: ["Lobby", "Ranked", "Weapons", "Skins", "Loadout", "Vault"],
  "Free Fire": ["Lobby", "Bundles", "Emotes", "Loadout", "Vault", "Rank"],
  "PUBG Mobile": ["Lobby", "Stats", "Loadout", "Crates", "Wardrobe", "Rank"],
  Fortnite: ["Locker", "Skins", "Loadout", "Stats", "Pickaxes", "Emotes"],
  eFootball: ["Squad", "Cards", "Tactics", "Bench", "Boosts", "Stats"]
};

function getVisualTheme(game: string) {
  return visualThemes[game] ?? visualThemes.COD;
}

function getPanelLabels(game: string) {
  return panelLabels[game] ?? panelLabels.COD;
}

export default function ListingPhotoGrid({
  listing,
  size = "card",
  className
}: {
  listing: Listing;
  size?: "card" | "detail" | "guide";
  className?: string;
}) {
  const theme = getVisualTheme(listing.game);
  const labels = getPanelLabels(listing.game);
  const Icon =
    listing.game === "eFootball"
      ? Trophy
      : listing.game === "Fortnite"
        ? Sparkles
        : listing.game === "Free Fire"
          ? UserRound
          : Sword;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/10 shadow-[0_28px_80px_-50px_rgba(2,10,24,0.9)]",
        size === "card" && "aspect-[5/4]",
        size === "detail" && "aspect-[16/10]",
        size === "guide" && "aspect-[16/11]",
        className
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", theme.shell)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,24,0.12),rgba(2,10,24,0.5))]" />

      <div className="relative flex h-full flex-col p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full border border-white/16 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/92 backdrop-blur-md sm:text-[11px]">
            {listing.game}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-black/20 px-3 py-1 text-[10px] font-medium text-white/88 backdrop-blur-md sm:text-[11px]">
            <Icon className="h-3.5 w-3.5" />
            Account preview
          </span>
        </div>

        <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-2 sm:gap-3">
          {labels.map((label, index) => (
            <div
              key={`${listing.id}-${label}`}
              className={cn(
                "relative overflow-hidden rounded-[20px] border border-white/10 bg-black/18 p-3 text-white/92",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-95",
                  theme.accents[index]
                )}
              />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),transparent_45%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/88">
                    {label}
                  </span>
                  <span className="rounded-full bg-black/18 px-2 py-0.5 text-[9px] font-medium text-white/82">
                    0{index + 1}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-4/5 rounded-full bg-white/82" />
                  <div className="h-2 w-2/3 rounded-full bg-white/38" />
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <span className="h-5 rounded-xl bg-black/18" />
                    <span className="h-5 rounded-xl bg-white/15" />
                    <span className="h-5 rounded-xl bg-black/18" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
