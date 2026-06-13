"use client";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function AnimatedMenuButton({
  open = false,
  onClick,
  className,
  lineClassName,
  label = "Open menu"
}: {
  open?: boolean;
  onClick: () => void;
  className?: string;
  lineClassName?: string;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("group h-11 w-11 rounded-2xl p-0", className)}
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
    >
      <span className="relative block h-5 w-5">
        <span
          className={cn(
            "absolute left-0 top-[3px] h-0.5 w-5 rounded-full bg-current transition duration-300 ease-out group-hover:translate-x-0.5",
            open && "top-1/2 -translate-y-1/2 rotate-45 group-hover:translate-x-0",
            lineClassName
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition duration-300 ease-out group-hover:w-3",
            open && "opacity-0 group-hover:w-5",
            lineClassName
          )}
        />
        <span
          className={cn(
            "absolute bottom-[3px] left-0 h-0.5 w-5 rounded-full bg-current transition duration-300 ease-out group-hover:-translate-x-0.5",
            open && "bottom-1/2 translate-y-1/2 -rotate-45 group-hover:translate-x-0",
            lineClassName
          )}
        />
      </span>
    </Button>
  );
}
