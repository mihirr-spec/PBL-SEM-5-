"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

import { Art } from "@/components/layout/art";
import { ProjectSummaryCard } from "@/components/dashboard/project-summary-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { DeadlineRow } from "@/components/deadlines/deadline-row";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/lib/data/portal-store";
import { daysUntil } from "@/lib/utils";

/** Splits "Good morning, Mihir" so the name can take the azure accent. */
function greeting(fullName: string): { part: string; name: string } {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return { part, name: fullName.split(" ")[0] };
}

export default function DashboardPage() {
  const {
    loading,
    student,
    project,
    team,
    coordinator,
    deadlines,
  } = usePortal();

  if (loading || !student) return <PageSkeleton />;

  const open = deadlines.filter(
    (d) => d.status === "pending" || d.status === "overdue",
  );
  const upcoming = open
    .filter((d) => daysUntil(d.dueDate) >= 0)
    .slice(0, 4);
  const overdue = deadlines.filter((d) => d.status === "overdue");
  const submitted = deadlines.filter(
    (d) => d.status === "submitted" || d.status === "under_review",
  );

  const hello = greeting(student.fullName);

  return (
    <div className="space-y-6">
      {/* ----------------------------- hero ------------------------------ */}
      <header className="animate-fade-rise relative isolate overflow-hidden rounded-[28px] border border-white/60 bg-white/50 shadow-[0_30px_80px_-36px_rgba(61,78,92,0.55)] backdrop-blur-xl">
        {/* The full campus painting, feathered into the frosted panel */}
        <div className="absolute inset-y-0 right-0 -z-10 w-full sm:w-[58%]" aria-hidden>
          <Art
            name="campus"
            blend={false}
            priority
            sizes="(max-width: 640px) 100vw, 560px"
            className="h-full w-full object-cover object-[center_30%] opacity-20 sm:opacity-100 sm:[mask-image:linear-gradient(to_right,transparent_0%,black_38%)]"
          />
        </div>

        <div className="px-6 py-8 sm:max-w-[60%] sm:px-9 sm:py-11">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-ink-400 uppercase">
            Student Portal · <span className="text-ink-800">Dashboard</span>
          </p>
          <h1 className="mt-3 font-display text-[2.1rem] leading-[1.08] tracking-tight text-ink-900 sm:text-[2.7rem]">
            {hello.part},
            <span className="block text-azure-600">{hello.name}.</span>
          </h1>
          <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-stone-600">
            {open.length === 0
              ? "Nothing is pending right now — you're fully up to date."
              : `You have ${open.length} open ${
                  open.length === 1 ? "submission" : "submissions"
                }${overdue.length > 0 ? `, ${overdue.length} of them overdue` : ""}.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <ButtonLink
              href="/student/deadlines"
              className="bg-ink-800 text-white shadow-[0_10px_24px_-14px_rgba(13,31,63,0.9)] hover:bg-ink-700 active:bg-ink-900"
            >
              Review deadlines
              <ArrowUpRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/student/project"
              variant="secondary"
              className="bg-white/70 backdrop-blur"
            >
              Open my project
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* ------------------------- headline stats ------------------------ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={TrendingUp}
          label="Project progress"
          value={project ? `${project.progress}%` : "—"}
          caption={project ? "On the current milestone plan" : "No project yet"}
          tone="neutral"
          art="capitol"
        />
        <StatTile
          icon={ClipboardList}
          label="Open submissions"
          value={open.length}
          caption={`${submitted.length} already submitted`}
          art="avenue"
        />
        <StatTile
          icon={AlertTriangle}
          label="Overdue"
          value={overdue.length}
          caption={overdue.length === 0 ? "Nothing overdue" : "Needs attention"}
          tone={overdue.length > 0 ? "clay" : "sage"}
          art="campus"
        />
        <StatTile
          icon={CheckCircle2}
          label="Next due"
          value={upcoming[0] ? `${daysUntil(upcoming[0].dueDate)}d` : "—"}
          caption={upcoming[0]?.title ?? "No upcoming deadlines"}
          tone="sage"
          art="boulevard"
        />
      </div>

      {/* --------------- project and what is due next ---------------- */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProjectSummaryCard
            project={project}
            team={team}
            coordinator={coordinator}
          />
        </div>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming deadlines"
            action={
              <ButtonLink href="/student/deadlines" variant="ghost" size="sm">
                View all
              </ButtonLink>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="size-5" />}
              title="No upcoming deadlines"
              description="Nothing is scheduled in the near term."
              art="boulevard"
            />
          ) : (
            <ul className="divide-y divide-sand-200/70">
              {upcoming.map((d) => (
                <DeadlineRow key={d.id} deadline={d} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
