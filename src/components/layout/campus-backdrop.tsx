import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Full-bleed watercolour backdrop used by the landing and auth screens.
 *
 * The illustration is a portrait crop, so rather than stretching it across a
 * wide viewport it is anchored to the bottom-left at its natural aspect and
 * feathered into a wash sampled from the artwork's own sky. The result reads
 * as one continuous painting at every width.
 */
export function CampusBackdrop({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      {/* Wash — the sky and snow the illustration fades into */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-wash-sky)_0%,var(--color-wash-mid)_38%,var(--color-wash-low)_72%,var(--color-wash-snow)_100%)]" />

      {/* Soft paper grain, so the flat wash matches the painted areas */}
      <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.9),transparent_45%),radial-gradient(circle_at_72%_8%,rgba(255,255,255,0.75),transparent_40%)]" />

      {/*
        The painting itself.

        Above lg the image is sized by height (`h-full w-auto`) so the element
        box matches the artwork exactly — that is what lets the right-edge mask
        feather the painting into the wash instead of cutting a hard line part
        way across an oversized container.
      */}
      <Image
        src="/campus.webp"
        alt=""
        width={812}
        height={1024}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="absolute inset-y-0 left-0 h-full w-full max-w-none object-cover object-[center_bottom] lg:w-auto lg:object-[left_bottom] lg:[mask-image:linear-gradient(to_right,black_0%,black_58%,transparent_97%)]"
      />

      {/* Veil — below lg the card sits over the artwork, so lift the contrast */}
      <div className="absolute inset-0 bg-wash-snow/55 lg:hidden" />
    </div>
  );
}
