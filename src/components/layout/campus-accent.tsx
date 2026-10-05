import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Decorative crop of the campus watercolour, bled off a section edge.
 *
 * The marketing sections sit on ivory, so the painting is feathered on the
 * side that faces the content and held at low opacity — it reads as the paper
 * the page is printed on rather than as a picture competing with the type.
 */
export function CampusAccent({
  side,
  className,
}: {
  side: "left" | "right";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 -z-10 hidden w-[22rem] overflow-hidden lg:block xl:w-[26rem]",
        side === "left" ? "left-0" : "right-0",
        className,
      )}
    >
      <Image
        src="/campus.webp"
        alt=""
        width={812}
        height={1024}
        sizes="26rem"
        className={cn(
          "h-full w-full object-cover opacity-45",
          side === "left"
            ? "object-[left_center] -scale-x-100 [mask-image:linear-gradient(to_left,transparent_0%,black_60%)]"
            : "object-[right_center] [mask-image:linear-gradient(to_right,transparent_0%,black_60%)]",
        )}
      />
      {/* Lifts the crop toward the ivory ground so type stays legible over it */}
      <div className="absolute inset-0 bg-ivory-100/55" />
    </div>
  );
}
