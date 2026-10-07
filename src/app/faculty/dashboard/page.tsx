"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, FolderKanban, TrendingUp } from "lucide-react";

import { StatTile } from "@/components/dashboard/stat-tile";
import { ProjectList } from "@/components/staff/project-list";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/session";
import { listProjects, type ProjectSummary } from "@/lib/data/repository";

export default function FacultyDashboardPage() {
  const { user } = useSession();
  const [rows, setRows] = useState<ProjectSummary[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listProjects(user.profileId).then((result) => {
      if (!cancelled) setRows(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !rows) return <PageSkeleton />;

  const average = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.project.progress, 0) / rows.length)
    : 0;
  const inReview = rows.filter((r) => r.project.status === "under_review").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher Portal"
        title="Welcome,"
        emphasis={`${user.displayName}.`}
        description="The PBL teams you coordinate and supervise this semester."
        art="capitol"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={FolderKanban}
          label="Your teams"
          value={rows.length}
          caption="Coordinating or supervising"
          art="avenue"
        />
        <StatTile
          icon={TrendingUp}
          label="Average progress"
          value={`${average}%`}
          caption="Across your teams"
          tone="sage"
          art="capitol"
        />
        <StatTile
          icon={ClipboardCheck}
          label="Under review"
          value={inReview}
          caption="Waiting on your feedback"
          tone="gold"
          art="boulevard"
        />
      </div>

      <ProjectList title="Your project teams" rows={rows} facultyId={user.profileId} />

      <p className="px-1 text-[12px] leading-relaxed text-stone-500">
        Reviewing weekly progress, giving feedback and entering marks arrive in
        the next release of the teacher portal.
      </p>
    </div>
  );
}
