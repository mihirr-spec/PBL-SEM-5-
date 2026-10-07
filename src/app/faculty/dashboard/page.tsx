"use client";

import { FileText, LifeBuoy, UserPlus, UsersRound } from "lucide-react";

import { StatTile } from "@/components/dashboard/stat-tile";
import { GroupTable } from "@/components/staff/group-table";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/session";
import * as repo from "@/lib/data/repository";
import { useLoad } from "@/lib/use-load";

const MAX_GROUPS = 7;

export default function FacultyDashboardPage() {
  const { user } = useSession();
  const { data } = useLoad(async () => {
    const [groups, requests, ungraded, tickets] = await Promise.all([
      repo.listGroups(user!.profileId),
      repo.listRequestsForFaculty(user!.profileId),
      repo.countUngradedReports(),
      repo.listTickets(),
    ]);
    const openTickets: Record<string, number> = {};
    for (const t of tickets) if (t.status === "open") openTickets[t.groupId] = (openTickets[t.groupId] ?? 0) + 1;
    return {
      groups,
      pendingRequests: requests.filter((r) => r.status === "pending").length,
      ungraded,
      openTickets,
    };
  }, user ? user.id : null);

  if (!user || !data) return <PageSkeleton />;

  const ungradedTotal = data.groups.reduce((n, g) => n + (data.ungraded[g.id] ?? 0), 0);
  const ticketTotal = data.groups.reduce((n, g) => n + (data.openTickets[g.id] ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supervisor"
        title="Welcome,"
        emphasis={`${user.displayName}.`}
        description="Your PBL groups this semester. Open a group to see the whole team, grade reports and students, and answer tickets."
        art="capitol"
        action={
          data.pendingRequests > 0 ? (
            <ButtonLink href="/faculty/requests" size="sm">
              <UserPlus className="size-3.5" />
              {data.pendingRequests} mentor request{data.pendingRequests > 1 ? "s" : ""}
            </ButtonLink>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={UsersRound} label="Groups" value={`${data.groups.length}/${MAX_GROUPS}`} caption="Supervising" art="avenue" />
        <StatTile icon={UserPlus} label="Requests" value={data.pendingRequests} caption="Waiting for your decision" tone="sage" art="capitol" />
        <StatTile icon={FileText} label="Reports to grade" value={ungradedTotal} caption="Across your groups" tone="gold" art="boulevard" />
        <StatTile icon={LifeBuoy} label="Open tickets" value={ticketTotal} caption="From your students" tone={ticketTotal > 0 ? "clay" : "neutral"} art="campus" />
      </div>

      <GroupTable
        title="My groups"
        description="Click a group to open the full team view."
        groups={data.groups}
        hrefBase="/faculty/groups"
        pendingReports={data.ungraded}
        openTickets={data.openTickets}
      />
    </div>
  );
}
