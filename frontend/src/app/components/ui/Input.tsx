"use client";

import * as React from "react";

import { cn } from "@/app/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-sl-text shadow-[0_0_0_1px_rgba(10,10,15,0.04)] transition-colors placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-primary/40",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

