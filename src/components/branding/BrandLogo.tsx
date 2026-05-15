import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      aria-hidden="true"
      className={cn("h-11 w-11 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="4"
        width="64"
        height="64"
        rx="20"
        fill="#062B63"
        stroke="#D9E6FF"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <rect x="10" y="10" width="52" height="52" rx="16" fill="#0057FF" />
      <circle cx="54" cy="18" r="6" fill="#EAF2FF" fillOpacity="0.22" />
      <path
        d="M24 18H45C48.3137 18 51 20.6863 51 24V29H42.5V26H31V46H42.5V40.5H36V33H51V48C51 51.3137 48.3137 54 45 54H24C20.6863 54 18 51.3137 18 48V24C18 20.6863 20.6863 18 24 18Z"
        fill="white"
      />
      <rect x="42" y="22" width="4.5" height="28" rx="2.25" fill="#9CC2FF" />
    </svg>
  );
}

export default function BrandLogo({
  className,
  theme = "light",
  tagline = "Verified account marketplace",
  showTagline = true,
  markClassName
}: {
  className?: string;
  theme?: "light" | "dark";
  tagline?: string;
  showTagline?: boolean;
  markClassName?: string;
}) {
  const titleClassName =
    theme === "dark"
      ? "font-heading text-lg font-semibold text-white"
      : "font-heading text-lg font-semibold text-foreground";

  const taglineClassName =
    theme === "dark" ? "text-sm text-blue-100/80" : "text-sm text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark className={markClassName} />
      <div className="min-w-0">
        <p className={titleClassName}>Gaming Index</p>
        {showTagline ? <p className={taglineClassName}>{tagline}</p> : null}
      </div>
    </div>
  );
}
