import type { LucideIcon } from "lucide-react";

import { Art, type ArtKey } from "@/components/layout/art";
import { cn } from "@/lib/utils";

/** Single headline figure. Four of these form the dashboard's top row. */
export function StatTile({
  icon: Icon,
  label,
  value,
  caption,
  tone = "neutral",
  art = "capitol",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  caption?: string;
  tone?: "neutral" | "gold" | "clay" | "sage";
  art?: ArtKey;
}) {
  const tones = {
    neutral: "bg-azure-50 text-azure-600",
    gold: "bg-gold-50 text-gold-600",
    clay: "bg-clay-100 text-clay-500",
    sage: "bg-sage-100 text-sage-500",
  } as const;

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/70 bg-white/65 px-4 py-3.5 shadow-[0_18px_40px_-30px_rgba(61,78,92,0.5)] backdrop-blur-xl transition-transform hover:-translate-y-0.5">
      {/* Faint sketch tucked into the corner of every tile */}
      <Art
        name={art}
        fade="left"
        sizes="160px"
        className="absolute -right-3 -bottom-3 h-20 w-auto opacity-25"
      />
      <div className="relative flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            tones[tone],
          )}
          aria-hidden
        >
          <Icon className="size-3.5" />
        </span>
        <p className="text-[11.5px] font-medium text-ink-400">{label}</p>
      </div>
      <p className="tnum relative mt-2.5 font-display text-[1.75rem] leading-none tracking-tight text-ink-900">
        {value}
      </p>
      {caption ? (
        <p className="relative mt-1.5 truncate text-[11.5px] text-stone-500">{caption}</p>
      ) : null}
    </div>
  );
}
