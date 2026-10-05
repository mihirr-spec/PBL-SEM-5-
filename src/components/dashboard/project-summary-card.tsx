import { ArrowUpRight, UserRound } from "lucide-react";

import { ProjectStatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import type { Faculty, Project, Team } from "@/lib/types";
import { formatDateShort } from "@/lib/utils";

/** "What is my current PBL project, and how is it progressing?" */
export function ProjectSummaryCard({
  project,
  team,
  coordinator,
}: {
  project: Project | null;
  team: Team | null;
  coordinator: Faculty | null;
}) {
  if (!project) {
    return (
      <Card>
        <CardHeader title="Current PBL project" />
        <EmptyState
          icon={<UserRound className="size-5" />}
          title="No project allocated yet"
          description="Your coordinator will assign you to a project team. You'll be notified when that happens."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Current PBL project"
        action={
          <ButtonLink href="/student/project" variant="secondary" size="sm">
            View project
            <ArrowUpRight className="size-3.5" />
          </ButtonLink>
        }
      />
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              <span className="text-[11.5px] text-stone-400">
                {project.domain}
              </span>
            </div>
            <h3 className="mt-2 font-display text-[1.3rem] leading-snug tracking-tight text-ink-900">
              {project.title}
            </h3>
            <p className="tnum mt-2 text-[12.5px] text-stone-500">
              {formatDateShort(project.startDate)} →{" "}
              {formatDateShort(project.expectedCompletionDate)}
            </p>
          </div>
          <ProgressRing value={project.progress} size={100} />
        </div>

        <div className="grid gap-4 border-t border-sand-200/80 pt-4 sm:grid-cols-2">
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.1em] text-stone-400 uppercase">
              Coordinator
            </p>
            {coordinator ? (
              <div className="mt-2 flex items-center gap-2.5">
                <Avatar name={coordinator.fullName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-stone-800">
                    {coordinator.fullName}
                  </p>
                  <p className="truncate text-[11.5px] text-stone-400">
                    {coordinator.department}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-stone-400">Not assigned</p>
            )}
          </div>

          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.1em] text-stone-400 uppercase">
              Team {team ? `· ${team.name}` : ""}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex -space-x-2">
                {team?.members.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.studentId}
                    name={member.fullName}
                    src={member.avatarUrl}
                    size="sm"
                  />
                ))}
              </div>
              <span className="text-[12.5px] text-stone-500">
                {team?.members.length ?? 0} members
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
