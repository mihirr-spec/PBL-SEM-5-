import { FolderKanban } from "lucide-react";

import { ProjectStatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import type { ProjectSummary } from "@/lib/data/repository";

/** Project rows shared by the teacher and administrator dashboards. */
export function ProjectList({
  title,
  description,
  rows,
  facultyId,
}: {
  title: string;
  description?: string;
  rows: ProjectSummary[];
  /** When set, each row says whether this teacher coordinates or supervises it. */
  facultyId?: string;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      {rows.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="size-5" />}
          title="No projects yet"
          description="Projects appear here once teams are allocated."
        />
      ) : (
        <ul className="divide-y divide-sand-200/70">
          {rows.map(({ project, coordinatorName, supervisorName }) => (
            <li
              key={project.id}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_11rem] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ProjectStatusBadge status={project.status} />
                  <span className="text-[11.5px] text-stone-400">{project.domain}</span>
                </div>
                <p className="mt-1.5 font-display text-[16px] tracking-tight text-ink-900">
                  {project.title}
                </p>
                <p className="mt-0.5 text-[12px] text-stone-500">
                  {facultyId
                    ? project.coordinatorId === facultyId
                      ? "You coordinate this team"
                      : "You supervise this team"
                    : `Coordinator ${coordinatorName} · Supervisor ${supervisorName}`}
                </p>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[11.5px] text-stone-500">
                  <span>Progress</span>
                  <span className="tnum font-medium text-ink-800">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} label={`${project.title} progress`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
