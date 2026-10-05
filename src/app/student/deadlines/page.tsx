"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Info } from "lucide-react";

import { DeadlineCard } from "@/components/deadlines/deadline-card";
import { Card, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/lib/data/portal-store";
import type { SubmissionStatus } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";

type Filter = "all" | SubmissionStatus;

const FILTERS: Filter[] = [
  "all",
  "pending",
  "overdue",
  "under_review",
  "submitted",
];

export default function DeadlinesPage() {
  const { loading, deadlines } = usePortal();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: deadlines.length,
      pending: 0,
      submitted: 0,
      under_review: 0,
      overdue: 0,
    };
    for (const d of deadlines) base[d.status] += 1;
    return base;
  }, [deadlines]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? deadlines
        : deadlines.filter((d) => d.status === filter),
    [deadlines, filter],
  );

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        eyebrow="Deadlines"
        title="Deadlines &"
        emphasis="submissions."
        art="avenue"
        description="Every task on your PBL calendar, with its status and the time you have left."
      />

      {/* ----------------------------- filters ---------------------------- */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              filter === key
                ? "bg-ink-800 text-white shadow-[0_8px_20px_-12px_rgba(13,31,63,0.9)]"
                : "bg-white/65 text-stone-600 ring-1 ring-white/80 ring-inset backdrop-blur-md hover:bg-white/90 hover:text-ink-800",
            )}
          >
            {key === "all" ? "All" : titleCase(key)}
            <span
              className={cn(
                "tnum rounded-full px-1.5 text-[10.5px] font-bold",
                filter === key
                  ? "bg-white/15 text-ivory-100"
                  : "bg-azure-50 text-azure-600",
              )}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarClock className="size-5" />}
            title={
              filter === "all"
                ? "No deadlines yet"
                : `Nothing ${titleCase(filter).toLowerCase()}`
            }
            description="Deadlines set by your coordinator will appear here."
            art="avenue"
          />
        </Card>
      ) : (
        <div className="space-y-3.5">
          {visible.map((deadline) => (
            <DeadlineCard key={deadline.id} deadline={deadline} />
          ))}
        </div>
      )}

      <p className="mt-6 flex items-start gap-2 rounded-[16px] border border-white/70 bg-white/60 px-4 py-3 text-[12.5px] backdrop-blur-md leading-relaxed text-stone-600">
        <Info className="mt-px size-4 shrink-0 text-sky-500" />
        <span>
          File uploads are not part of this release. Marking a task as submitted
          records your declaration so your coordinator can follow it up; the
          attachment flow arrives with weekly progress reporting in V1.1.
        </span>
      </p>
    </div>
  );
}
