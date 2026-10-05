import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/portal-shell";

/**
 * Student route group. The Faculty (V2) and Supervisor (V2.5) portals will
 * add sibling `/faculty` and `/supervisor` groups with the same two lines,
 * passing their own role.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  return <PortalShell role="student">{children}</PortalShell>;
}
