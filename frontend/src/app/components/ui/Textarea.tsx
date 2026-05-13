"use client";

import * as React from "react";

import { cn } from "@/app/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[110px] w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-sl-text shadow-[0_0_0_1px_rgba(10,10,15,0.04)] transition-colors placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-primary/40",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

