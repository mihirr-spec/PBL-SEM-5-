import {
  Bell,
  CalendarClock,
  FolderKanban,
  LayoutDashboard,
  Megaphone,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Key into the badge-count map supplied by the layout. */
  badge?: "notifications" | "deadlines";
}

export interface NavSection {
  heading?: string;
  items: NavItem[];
}

/**
 * Navigation is declared per role, so adding the Faculty (V2) and
 * Supervisor (V2.5) portals is a matter of filling in their arrays —
 * the sidebar component itself needs no changes.
 */
export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  student: [
    {
      items: [
        { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
        { label: "My Profile", href: "/student/profile", icon: UserRound },
        { label: "My Project", href: "/student/project", icon: FolderKanban },
      ],
    },
    {
      heading: "Activity",
      items: [
        {
          label: "Deadlines",
          href: "/student/deadlines",
          icon: CalendarClock,
          badge: "deadlines",
        },
        { label: "Announcements", href: "/student/announcements", icon: Megaphone },
        {
          label: "Notifications",
          href: "/student/notifications",
          icon: Bell,
          badge: "notifications",
        },
      ],
    },
    {
      heading: "Account",
      items: [{ label: "Settings", href: "/student/settings", icon: Settings }],
    },
  ],

  // Populated in V2.
  faculty: [],

  // Populated in V2.5.
  supervisor: [],
};
