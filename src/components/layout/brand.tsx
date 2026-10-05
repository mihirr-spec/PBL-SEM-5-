import Link from "next/link";

import { cn } from "@/lib/utils";

/** Wordmark used in the sidebar, the auth screens and the landing page. */
export function Brand({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-gold-300 to-gold-500 text-[13px] font-bold text-white shadow-[0_2px_6px_-1px_rgba(184,138,44,0.5)]">
        PB
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block font-display text-[15px] font-semibold tracking-tight text-stone-800">
            PBL Portal
          </span>
          <span className="block text-[11px] tracking-wide text-stone-400">
            Project-Based Learning
          </span>
        </span>
      ) : null}
    </Link>
  );
}
