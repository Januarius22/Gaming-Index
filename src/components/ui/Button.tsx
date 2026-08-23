import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-primary !text-white visited:!text-white hover:!text-white shadow-[0_14px_34px_-14px_rgba(0,87,255,0.82)] hover:bg-primary-dark hover:shadow-[0_18px_42px_-16px_rgba(0,87,255,0.92)]",
  secondary:
    "bg-white text-primary border border-border hover:border-primary/30 hover:bg-primary-soft hover:shadow-[0_14px_34px_-22px_rgba(0,87,255,0.45)]",
  ghost: "bg-transparent text-foreground hover:bg-primary-soft/70",
  subtle: "bg-primary-soft text-primary-dark hover:bg-primary-soft/80 hover:shadow-[0_14px_34px_-24px_rgba(0,87,255,0.38)]",
  danger: "bg-danger !text-white visited:!text-white hover:!text-white hover:bg-danger/90 hover:shadow-[0_18px_42px_-18px_rgba(220,38,38,0.78)]"
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
    "gi-game-button inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
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
