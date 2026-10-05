"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-gold-400 text-stone-800 hover:bg-gold-300 active:bg-gold-500 shadow-[0_1px_2px_rgba(78,70,59,0.12)]",
  secondary:
    "bg-white/80 text-stone-700 ring-1 ring-inset ring-white hover:bg-white hover:text-ink-800",
  ghost: "text-stone-600 hover:bg-white/70 hover:text-ink-800",
  danger:
    "bg-clay-100 text-clay-500 ring-1 ring-inset ring-clay-500/20 hover:bg-clay-100/70",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-55";

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: Common & { loading?: boolean } & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, VARIANT[variant], SIZE[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, VARIANT[variant], SIZE[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
