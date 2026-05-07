import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md bg-bg-subtle border border-border px-3 py-1 text-sm text-fg placeholder:text-fg-subtle transition-colors duration-150 ease-smooth focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
