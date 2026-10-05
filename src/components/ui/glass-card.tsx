import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Frosted panel that floats over the watercolour backdrop.
 * Shared by the landing hero and the sign-in screen so both read as one piece.
 */
export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-white/60 bg-white/55 p-7 shadow-[0_24px_70px_-28px_rgba(61,78,92,0.45)] backdrop-blur-xl sm:p-9",
        className,
      )}
    >
      {children}
    </div>
  );
}
