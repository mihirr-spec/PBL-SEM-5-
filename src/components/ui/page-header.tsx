import type { ReactNode } from "react";

import { Art, type ArtKey } from "@/components/layout/art";
import { cn } from "@/lib/utils";

/**
 * Frosted page banner — the portal's echo of the landing hero card.
 * A watercolour sketch fills the right side and dissolves under the copy.
 */
export function PageHeader({
  eyebrow,
  title,
  emphasis,
  description,
  action,
  art = "capitol",
  className,
}: {
  eyebrow?: string;
  title: string;
  /** Trailing words set in the azure accent, as on the landing page. */
  emphasis?: string;
  description?: string;
  action?: ReactNode;
  art?: ArtKey;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "animate-fade-rise relative isolate mb-6 overflow-hidden rounded-[26px] border border-white/60 bg-white/55 px-6 py-7 shadow-[0_24px_70px_-34px_rgba(61,78,92,0.5)] backdrop-blur-xl sm:px-8 sm:py-8",
        className,
      )}
    >
      <div
        className="absolute inset-y-0 right-0 -z-10 w-[62%] sm:w-[48%]"
        aria-hidden
      >
        <Art
          name={art}
          fade="left"
          priority
          sizes="(max-width: 640px) 62vw, 480px"
          className="animate-art-drift h-full w-full object-[right_center] opacity-60 sm:opacity-90"
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          {eyebrow ? (
            <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-ink-400 uppercase">
              PBL Portal · <span className="text-ink-800">{eyebrow}</span>
            </p>
          ) : null}
          <h1 className="font-display text-[1.9rem] leading-[1.1] tracking-tight text-ink-900 sm:text-[2.3rem]">
            {title}
            {emphasis ? (
              <span className="text-azure-600"> {emphasis}</span>
            ) : null}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-stone-600">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="relative shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

/** Key/value row used throughout detail panels. */
export function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-2 border-b border-sand-200/70 py-2.5 last:border-0",
        className,
      )}
    >
      <dt className="text-[13px] text-stone-500">{label}</dt>
      <dd className="text-[13px] font-medium text-stone-800">{children}</dd>
    </div>
  );
}
