import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant = "default" | "pending" | "approved" | "rejected" | "success" | "warning";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-surface text-text-secondary border-border",
  pending: "bg-accent/10 text-accent border-accent/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-error/10 text-error border-error/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
