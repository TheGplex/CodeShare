import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md bg-bg-subtle border border-border px-3 py-1 text-sm text-fg transition-colors duration-150 ease-smooth focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:opacity-50 appearance-none bg-no-repeat bg-right pr-8",
      className,
    )}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b8b90' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
      backgroundPosition: "right 8px center",
      backgroundSize: "16px",
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
