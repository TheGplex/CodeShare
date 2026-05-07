import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-bg-muted border-border text-fg-muted",
        accent: "bg-accent-muted border-transparent text-accent",
        outline: "border-border text-fg-muted",
        public: "bg-accent-muted border-transparent text-accent",
        unlisted: "bg-bg-muted border-border text-fg-muted",
        private: "bg-danger-muted border-transparent text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
