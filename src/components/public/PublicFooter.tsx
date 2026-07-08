import Link from "next/link";
import BrandLogo from "@/components/branding/BrandLogo";

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/70 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-4">
          <BrandLogo
            tagline="Buy and sell verified gaming accounts safely."
            markClassName="h-10 w-10"
          />
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Marketplace workflows, seller verification, and buyer account tools built for account
            trading teams that want clearer trust signals.
          </p>
          <p className="max-w-md text-xs leading-6 text-muted-foreground">
            Gaming Index is independent and is not affiliated with the game publishers or platforms
            referenced in marketplace listings.
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            © 2026 Gaming Index
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Explore</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/marketplace">Marketplace</Link>
              <Link href="/how-it-works">How It Works</Link>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Account</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Focus</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Seller onboarding</p>
              <p>Admin reviews</p>
              <p>Verified listings</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Legal</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms &amp; Conditions</Link>
              <Link href="/disclaimer">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
