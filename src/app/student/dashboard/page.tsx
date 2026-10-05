"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Megaphone,
  PartyPopper,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { IdentityCard } from "@/components/dashboard/identity-card";
import { Art, type ArtKey } from "@/components/layout/art";
import { ProjectSummaryCard } from "@/components/dashboard/project-summary-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { DeadlineRow } from "@/components/deadlines/deadline-row";
import { PriorityBadge, SubmissionStatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/lib/data/portal-store";
import { daysUntil, formatDateShort, timeAgo } from "@/lib/utils";

const QUICK_ACTIONS: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof FolderKanban;
  art: ArtKey;
}> = [
  { href: "/student/project", label: "View project", icon: FolderKanban, art: "capitol" },
  { href: "/student/deadlines", label: "View deadlines", icon: CalendarClock, art: "boulevard" },
  { href: "/student/profile", label: "View profile", icon: UserRound, art: "avenue" },
  { href: "/student/announcements", label: "Announcements", icon: Megaphone, art: "campus" },
];

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
    announcements,
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
  const pendingSubmissions = deadlines
    .filter((d) => d.status !== "submitted")
    .slice(0, 5);

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

      {/* --------------------------- identity ---------------------------- */}
      <IdentityCard student={student} />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* ------------------------- left column ------------------------- */}
        <div className="space-y-5 lg:col-span-3">
          <ProjectSummaryCard
            project={project}
            team={team}
            coordinator={coordinator}
          />

          <Card>
            <CardHeader
              title="Pending submissions"
              description="Everything not yet marked submitted."
              action={
                <ButtonLink href="/student/deadlines" variant="ghost" size="sm">
                  All submissions
                  <ArrowUpRight className="size-3.5" />
                </ButtonLink>
              }
            />
            {pendingSubmissions.length === 0 ? (
              <EmptyState
                icon={<PartyPopper className="size-5" />}
                title="Everything is submitted"
                description="You have no outstanding submissions for this project."
                art="capitol"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left">
                  <thead>
                    <tr className="border-b border-sand-200/60 bg-white/40 text-[10.5px] tracking-[0.12em] text-ink-400 uppercase">
                      <th className="px-5 py-2.5 font-semibold">Submission</th>
                      <th className="px-5 py-2.5 font-semibold">Due date</th>
                      <th className="px-5 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200/70">
                    {pendingSubmissions.map((d) => (
                      <tr key={d.id} className="transition-colors hover:bg-white/70">
                        <td className="px-5 py-3">
                          <p className="text-[13.5px] font-medium text-stone-800">
                            {d.title}
                          </p>
                          {d.weightage ? (
                            <p className="tnum mt-0.5 text-[11.5px] text-stone-400">
                              Weightage {d.weightage}%
                            </p>
                          ) : null}
                        </td>
                        <td className="tnum px-5 py-3 text-[13px] whitespace-nowrap text-stone-600">
                          {formatDateShort(d.dueDate)}
                        </td>
                        <td className="px-5 py-3">
                          <SubmissionStatusBadge status={d.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* ------------------------ right column ------------------------- */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Quick actions" />
            <CardBody className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map(({ href, label, icon: Icon, art }) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative isolate flex h-28 flex-col justify-end overflow-hidden rounded-[16px] border border-white/80 bg-gradient-to-b from-wash-mid/70 to-white px-3 py-3 shadow-[0_12px_28px_-22px_rgba(13,31,63,0.7)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-20px_rgba(13,31,63,0.7)]"
                >
                  <Art
                    name={art}
                    sizes="200px"
                    className="absolute inset-0 -z-10 h-full w-full opacity-75 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-white via-white/85 to-transparent" />
                  <Icon className="size-[18px] text-azure-600" />
                  <span className="mt-1.5 text-[12.5px] font-semibold text-ink-900">
                    {label}
                  </span>
                </Link>
              ))}
            </CardBody>
          </Card>

          <Card>
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

          <Card>
            <CardHeader
              title="Recent announcements"
              action={
                <ButtonLink href="/student/announcements" variant="ghost" size="sm">
                  View all
                </ButtonLink>
              }
            />
            {announcements.length === 0 ? (
              <EmptyState
                icon={<Megaphone className="size-5" />}
                title="No announcements"
              />
            ) : (
              <ul className="divide-y divide-sand-200/70">
                {announcements.slice(0, 3).map((a) => (
                  <li key={a.id}>
                    <Link
                      href="/student/announcements"
                      className="block px-5 py-3.5 transition-colors hover:bg-white/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13.5px] font-medium text-stone-800">
                          {a.title}
                        </p>
                        <PriorityBadge priority={a.priority} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-stone-500">
                        {a.body}
                      </p>
                      <p className="mt-1.5 text-[11.5px] text-stone-400">
                        {a.postedByName} · {timeAgo(a.postedAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
