"use client";

import { Award, Lightbulb } from "lucide-react";

import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import * as repo from "@/lib/data/repository";
import { usePortal } from "@/lib/data/portal-store";
import { useLoad } from "@/lib/use-load";
import { formatDateTime } from "@/lib/utils";

export default function GradesPage() {
  const { loading, student, group } = usePortal();
  const { data } = useLoad(
    async () => {
      const [grades, reports] = await Promise.all([
        repo.listGrades([student!.id]),
        group ? repo.listReports(group.id) : Promise.resolve([]),
      ]);
      return { grades, reports: reports.filter((r) => r.grade != null) };
    },
    student ? `${student.id}:${group?.id ?? ""}` : null,
  );

  if (loading || !student || !data) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Grades & Feedback"
        title="Grades and"
        emphasis="improvements."
        description="Marks from your supervisor, with what to work on next."
        art="capitol"
      />

      <Card>
        <CardHeader title="Your individual grades" />
        {data.grades.length === 0 ? (
          <EmptyState icon={<Award className="size-5" />} title="No grades yet" description="Your supervisor's grades appear here." />
        ) : (
          <ul className="divide-y divide-sand-200/70">
            {data.grades.map((g) => (
              <li key={g.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink-900">{g.title}</p>
                  <p className="text-[12px] text-stone-500">{formatDateTime(g.createdAt)}</p>
                  {g.improvements ? (
                    <p className="mt-2 flex gap-2 rounded-[12px] bg-gold-50/80 px-3 py-2 text-[13px] text-stone-700">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold-500" />
                      <span><span className="font-semibold">To improve:</span> {g.improvements}</span>
                    </p>
                  ) : null}
                </div>
                <p className="tnum font-display text-[1.6rem] leading-none text-ink-900">
                  {g.score}
                  <span className="text-[1rem] text-stone-400">/{g.maxScore}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Group weekly report grades" />
        {data.reports.length === 0 ? (
          <EmptyState title="No graded reports yet" art="boulevard" />
        ) : (
          <ul className="divide-y divide-sand-200/70">
            {data.reports.map((r) => (
              <li key={r.id} className="flex items-start gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink-900">Week {r.week}</p>
                  {r.feedback ? <p className="text-[12.5px] text-stone-500">{r.feedback}</p> : null}
                </div>
                <p className="tnum font-display text-[1.25rem] text-ink-900">{r.grade}/10</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
