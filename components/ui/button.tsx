import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 ease-smooth disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-bg hover:bg-accent-hover font-semibold",
        secondary:
          "bg-bg-muted text-fg border border-border hover:border-border-strong hover:bg-bg-subtle",
        ghost: "text-fg hover:bg-bg-muted",
        outline:
          "border border-border text-fg hover:border-border-strong hover:bg-bg-subtle",
        danger:
          "bg-danger-muted text-danger border border-transparent hover:bg-danger hover:text-bg",
        link: "text-accent hover:text-accent-hover underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
