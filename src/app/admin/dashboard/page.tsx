"use client";

import { useState } from "react";
import { GraduationCap, LifeBuoy, Shuffle, UserX, UsersRound } from "lucide-react";

import { StatTile } from "@/components/dashboard/stat-tile";
import { GroupTable } from "@/components/staff/group-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import * as repo from "@/lib/data/repository";
import { useLoad } from "@/lib/use-load";

export default function AdminDashboardPage() {
  const { data, reload } = useLoad(async () => {
    const [overview, groups, ungrouped] = await Promise.all([
      repo.getOverview(),
      repo.listGroups(),
      repo.listUngroupedStudents(),
    ]);
    return { overview, groups, ungrouped };
  }, "admin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function allocate() {
    setBusy(true);
    setMessage(null);
    try {
      const count = await repo.autoAllocateMentors();
      setMessage(
        count === 0
          ? "Nothing to allot — every group has a supervisor, or no teacher on the portal has room."
          : `Allotted a supervisor to ${count} group${count > 1 ? "s" : ""}. Their students have been notified.`,
      );
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Allocation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <PageSkeleton />;
  const { overview, groups, ungrouped } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrator"
        title="PBL at a"
        emphasis="glance."
        description="All groups and their supervisors. Groups that have not secured a mentor can be allotted one at random."
        art="avenue"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={GraduationCap} label="Students" value={overview.students} caption={`${ungrouped.length} not in a group`} art="capitol" />
        <StatTile icon={UsersRound} label="Groups" value={overview.groups} caption={`${overview.teachersOnPortal} teachers on the portal`} tone="sage" art="avenue" />
        <StatTile icon={UserX} label="Without supervisor" value={overview.unassignedGroups} caption="Waiting for a mentor" tone={overview.unassignedGroups > 0 ? "gold" : "sage"} art="boulevard" />
        <StatTile icon={LifeBuoy} label="Open tickets" value={overview.openTickets} caption="Across all groups" tone={overview.openTickets > 0 ? "clay" : "neutral"} art="campus" />
      </div>

      <Card>
        <CardHeader
          title="Allot supervisors"
          description="Gives every group without a supervisor a random teacher who is on the portal and has fewer than 7 groups. Pending requests for those groups are closed."
          action={
            <Button size="sm" loading={busy} disabled={overview.unassignedGroups === 0} onClick={() => void allocate()}>
              <Shuffle className="size-3.5" />
              Allot at random
            </Button>
          }
        />
        {message ? <p className="px-5 py-3 text-[13px] text-ink-800">{message}</p> : null}
      </Card>

      <GroupTable title="All groups" groups={groups} hrefBase="/admin/groups" showMentor />

      <Card>
        <CardHeader title="Students not in a group" description="They need to form or join a group before a supervisor can be allotted." />
        {ungrouped.length === 0 ? (
          <EmptyState title="Everyone is in a group" />
        ) : (
          <ul className="divide-y divide-sand-200/70">
            {ungrouped.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-[13.5px]">
                <span className="font-medium text-ink-900">{s.fullName}</span>
                <span className="tnum text-stone-500">{s.registrationNumber} · {s.universityEmail}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
