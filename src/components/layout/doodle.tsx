import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Hand-drawn study doodles lifted from the campus painting, saved as navy
 * line art on transparent ground so they sit on any surface.
 */
export const DOODLES = {
  cluster: { src: "/art/doodles/cluster.png", width: 361, height: 350 },
  books: { src: "/art/doodles/books.png", width: 340, height: 299 },
  globe: { src: "/art/doodles/globe.png", width: 112, height: 128 },
  book: { src: "/art/doodles/book.png", width: 112, height: 112 },
  pencil: { src: "/art/doodles/pencil.png", width: 74, height: 126 },
  bulb: { src: "/art/doodles/bulb.png", width: 62, height: 82 },
  triangle: { src: "/art/doodles/triangle.png", width: 76, height: 86 },
  plane: { src: "/art/doodles/plane.png", width: 52, height: 48 },
} as const;

export type DoodleKey = keyof typeof DOODLES;

export function Doodle({
  name,
  className,
}: {
  name: DoodleKey;
  className?: string;
}) {
  const d = DOODLES[name];
  return (
    <Image
      src={d.src}
      alt=""
      aria-hidden
      width={d.width}
      height={d.height}
      className={cn("pointer-events-none h-auto select-none", className)}
    />
  );
}
