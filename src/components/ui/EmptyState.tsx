import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "gi-empty-state mx-auto flex min-h-[42vh] max-w-4xl flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center",
        className
      )}
    >
      <div className="gi-glow-orbit flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-primary shadow-sm ring-1 ring-border/70">
        {icon}
      </div>
      <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
