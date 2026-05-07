import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full min-h-[80px] rounded-md bg-bg-subtle border border-border px-3 py-2 text-sm text-fg placeholder:text-fg-subtle transition-colors duration-150 ease-smooth focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:opacity-50 resize-vertical",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
