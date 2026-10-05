"use client";

import {
  CalendarDays,
  CalendarRange,
  CircleDot,
  Crown,
  ExternalLink,
  FolderKanban,
  Mail,
  Users,
} from "lucide-react";

import { ProjectStatusBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { DetailRow, PageHeader } from "@/components/ui/page-header";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/lib/data/portal-store";
import { daysUntil, formatDate } from "@/lib/utils";

export default function ProjectPage() {
  const { loading, project, team, coordinator, supervisor, deadlines } =
    usePortal();

  if (loading) return <PageSkeleton />;

  if (!project) {
    return (
      <div>
        <PageHeader eyebrow="My Project" title="Your" emphasis="project." art="avenue" />
        <Card>
          <EmptyState
            icon={<FolderKanban className="size-5" />}
            title="No project allocated yet"
            description="Once your coordinator assigns you to a PBL team, the project record will appear here."
            art="capitol"
          />
        </Card>
      </div>
    );
  }

  const daysRemaining = daysUntil(project.expectedCompletionDate);
  const totalDuration =
    (new Date(project.expectedCompletionDate).getTime() -
      new Date(project.startDate).getTime()) /
    86_400_000;
  const elapsed = Math.max(0, totalDuration - Math.max(0, daysRemaining));
  const timeElapsedPercent =
    totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;

  const completed = deadlines.filter(
    (d) => d.status === "submitted" || d.status === "under_review",
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="My Project"
        title={project.title}
        description={project.domain}
        art="avenue"
        action={
          project.repositoryUrl ? (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink-800 px-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-700"
            >
              <ExternalLink className="size-3.5" />
              Repository
            </a>
          ) : null
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* -------------------------- overview -------------------------- */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Overview"
              action={<ProjectStatusBadge status={project.status} />}
            />
            <CardBody className="space-y-5">
              <p className="text-[14px] leading-relaxed text-stone-600">
                {project.description}
              </p>

              <div className="grid gap-4 rounded-[16px] border border-white/80 bg-gradient-to-br from-azure-50/80 to-white/60 p-4 sm:grid-cols-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.1em] text-stone-400 uppercase">
                    <CalendarDays className="size-3" />
                    Start date
                  </p>
                  <p className="tnum mt-1 text-[13px] font-medium text-stone-800">
                    {formatDate(project.startDate)}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.1em] text-stone-400 uppercase">
                    <CalendarRange className="size-3" />
                    Expected completion
                  </p>
                  <p className="tnum mt-1 text-[13px] font-medium text-stone-800">
                    {formatDate(project.expectedCompletionDate)}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.1em] text-stone-400 uppercase">
                    <CircleDot className="size-3" />
                    Time remaining
                  </p>
                  <p className="tnum mt-1 text-[13px] font-medium text-stone-800">
                    {daysRemaining > 0 ? `${daysRemaining} days` : "Past due date"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Team"
              description={team ? team.name : undefined}
              action={
                <span className="flex items-center gap-1.5 text-[12px] text-stone-500">
                  <Users className="size-3.5" />
                  {team?.members.length ?? 0} members
                </span>
              }
            />
            {!team || team.members.length === 0 ? (
              <EmptyState title="No team members listed" />
            ) : (
              <ul className="divide-y divide-sand-200/70">
                {team.members.map((member) => (
                  <li
                    key={member.studentId}
                    className="flex items-center gap-3.5 px-5 py-3.5"
                  >
                    <Avatar
                      name={member.fullName}
                      src={member.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-stone-800">
                        <span className="truncate">{member.fullName}</span>
                        {member.studentId === team.leadStudentId ? (
                          <Crown
                            className="size-3.5 shrink-0 text-gold-500"
                            aria-label="Team lead"
                          />
                        ) : null}
                      </p>
                      <p className="tnum truncate text-[11.5px] text-stone-400">
                        {member.registrationNumber}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-azure-50 px-2.5 py-1 text-[11.5px] text-azure-600 sm:inline">
                      {member.teamRole}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* -------------------------- side panel ------------------------ */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Progress" />
            <CardBody className="space-y-5">
              <div className="flex justify-center">
                <ProgressRing value={project.progress} size={128} />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] text-stone-500">
                    Semester elapsed
                  </span>
                  <span className="tnum text-[12px] font-medium text-stone-700">
                    {Math.round(timeElapsedPercent)}%
                  </span>
                </div>
                <ProgressBar
                  value={timeElapsedPercent}
                  label="Time elapsed"
                  barClassName="from-sand-300 to-stone-400"
                />
                <p className="mt-2 text-[11.5px] leading-relaxed text-stone-400">
                  {project.progress >= timeElapsedPercent
                    ? "Work is tracking ahead of the calendar."
                    : "Work is behind the calendar — consider raising this at the next review."}
                </p>
              </div>

              <dl className="border-t border-sand-200/80 pt-1">
                <DetailRow label="Submissions cleared">
                  <span className="tnum">
                    {completed} of {deadlines.length}
                  </span>
                </DetailRow>
                <DetailRow label="Domain">{project.domain}</DetailRow>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Faculty" />
            <CardBody className="space-y-4">
              {[
                { role: "Coordinator", person: coordinator },
                { role: "Supervisor", person: supervisor },
              ].map(({ role, person }) => (
                <div key={role}>
                  <p className="text-[10.5px] font-semibold tracking-[0.1em] text-stone-400 uppercase">
                    {role}
                  </p>
                  {person ? (
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar name={person.fullName} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-stone-800">
                          {person.fullName}
                        </p>
                        <a
                          href={`mailto:${person.email}`}
                          className="flex items-center gap-1 truncate text-[11.5px] text-stone-400 hover:text-azure-600"
                        >
                          <Mail className="size-3 shrink-0" />
                          {person.email}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-[13px] text-stone-400">Not assigned</p>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          <p className="px-1 text-[12px] leading-relaxed text-stone-400">
            Weekly progress submission, evidence uploads and coordinator
            feedback arrive in the next release and will appear on this page.
          </p>
        </div>
      </div>
    </div>
  );
}
