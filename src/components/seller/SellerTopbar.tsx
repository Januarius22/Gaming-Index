"use client";

import { Menu } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { statusVariant, titleCase } from "@/lib/utils";
import type { Profile } from "@/types";

export default function SellerTopbar({
  profile,
  onMenuClick
}: {
  profile: Profile;
  onMenuClick: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Seller Dashboard</p>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              Welcome back, {profile.full_name.split(" ")[0]}
            </h1>
          </div>
        </div>
        <Badge variant={statusVariant(profile.kyc_status)}>
          KYC {titleCase(profile.kyc_status)}
        </Badge>
      </div>
    </div>
  );
}
