"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-black/[0.06] bg-[var(--sl-primary)] text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_24px_rgba(79,111,100,0.22)] hover:bg-[color-mix(in_srgb,var(--sl-primary)_92%,#000)]",
        glass:
          "border sl-silver-border bg-white/10 text-white hover:bg-white/14 shadow-[0_0_0_1px_rgba(232,238,246,0.12),inset_0_1px_0_rgba(255,255,255,0.10),0_0_18px_var(--sl-glow)] hover:shadow-[0_0_0_1px_rgba(232,238,246,0.20),inset_0_1px_0_rgba(255,255,255,0.12),0_0_26px_var(--sl-glow-aqua)]",
        outline:
          "border border-black/12 bg-transparent text-[var(--sl-ink)] hover:bg-black/[0.03]",
        outlineOnDark:
          "border bg-white/4 text-white hover:bg-white/7 sl-silver-border",
        ghost:
          "text-[var(--sl-ink-muted)] hover:text-[var(--sl-ink)] hover:bg-black/[0.04]",
        ghostOnDark:
          "text-white/80 hover:text-white hover:bg-white/5",
        light:
          "bg-white text-sl-text hover:bg-white/95 shadow-[0_0_0_1px_rgba(10,10,15,0.08)]",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

