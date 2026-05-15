import { cn } from "@/lib/utils";

const badgeVariants = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  danger: "bg-rose-50 text-rose-700 ring-rose-100",
  info: "bg-primary-soft text-primary-dark ring-blue-100",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200"
} as const;

export default function Badge({
  children,
  variant = "neutral",
  className
}: {
  children: React.ReactNode;
  variant?: keyof typeof badgeVariants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
