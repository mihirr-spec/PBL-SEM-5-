"use client";

import { useEffect, useState } from "react";
import { CalendarClock, FolderKanban, GraduationCap, UsersRound } from "lucide-react";

import { StatTile } from "@/components/dashboard/stat-tile";
import { ProjectList } from "@/components/staff/project-list";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import {
  getOverview,
  listProjects,
  type Overview,
  type ProjectSummary,
} from "@/lib/data/repository";

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    overview: Overview;
    rows: ProjectSummary[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOverview(), listProjects()]).then(([overview, rows]) => {
      if (!cancelled) setData({ overview, rows });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return <PageSkeleton />;
  const { overview, rows } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrator"
        title="PBL at a"
        emphasis="glance."
        description="Every project, student and faculty member taking part in PBL this semester."
        art="avenue"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={GraduationCap}
          label="Students"
          value={overview.students}
          caption="Enrolled in PBL"
          art="capitol"
        />
        <StatTile
          icon={UsersRound}
          label="Faculty"
          value={overview.faculty}
          caption="Coordinators & supervisors"
          tone="sage"
          art="avenue"
        />
        <StatTile
          icon={FolderKanban}
          label="Projects"
          value={overview.projects}
          caption="This semester"
          tone="gold"
          art="boulevard"
        />
        <StatTile
          icon={CalendarClock}
          label="Open deadlines"
          value={overview.openDeadlines}
          caption="Pending or overdue"
          tone="clay"
          art="campus"
        />
      </div>

      <ProjectList
        title="All projects"
        description="Coordinator, supervisor and progress for every team."
        rows={rows}
      />

      <p className="px-1 text-[12px] leading-relaxed text-stone-500">
        Managing timelines, announcements and user accounts arrives in a later
        release of the administrator portal.
      </p>
    </div>
  );
}
