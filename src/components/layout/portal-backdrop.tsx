import { Art } from "@/components/layout/art";

/**
 * Fixed watercolour ground behind every portal page.
 *
 * Same sky-to-snow wash as the landing and sign-in screens, so stepping from
 * the login card into the dashboard feels like staying in the same painting.
 * The campus artwork is held faint in the lower corner — the frosted cards
 * above it pick up its colour without it ever competing with the content.
 */
export function PortalBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-wash-sky)_0%,var(--color-wash-mid)_28%,var(--color-wash-low)_62%,var(--color-wash-snow)_100%)]" />
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_30%_6%,rgba(255,255,255,0.95),transparent_42%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.7),transparent_38%)]" />

      <Art
        name="campus"
        blend={false}
        sizes="40vw"
        className="absolute right-0 bottom-0 h-[78vh] w-auto max-w-none opacity-15 lg:opacity-30 [mask-image:radial-gradient(ellipse_at_bottom_right,black_20%,transparent_70%)]"
      />
      <Art
        name="terrace"
        sizes="30vw"
        className="absolute bottom-0 left-[264px] hidden h-44 w-auto max-w-none object-left opacity-40 [mask-image:linear-gradient(to_right,black_50%,transparent_85%)] lg:block"
      />
    </div>
  );
}
