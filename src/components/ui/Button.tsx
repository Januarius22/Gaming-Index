import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-primary !text-white visited:!text-white hover:!text-white shadow-[0_12px_30px_-14px_rgba(0,87,255,0.7)] hover:bg-primary-dark",
  secondary:
    "bg-white text-primary border border-border hover:bg-primary-soft",
  ghost: "bg-transparent text-foreground hover:bg-primary-soft/70",
  subtle: "bg-primary-soft text-primary-dark hover:bg-primary-soft/80",
  danger: "bg-danger !text-white visited:!text-white hover:!text-white hover:bg-danger/90"
} as const;

const buttonSizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export const buttonClassName = ({
  variant = "primary",
  size = "md",
  className
}: {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
}) =>
  cn(
    "inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
    buttonVariants[variant],
    buttonSizes[size],
    className
  );

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  )
);

Button.displayName = "Button";

export default Button;
