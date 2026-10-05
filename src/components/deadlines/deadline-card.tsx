"use client";

import { useState } from "react";
import { CalendarCheck2, CheckCircle2, Clock, Hourglass, Upload } from "lucide-react";

import { Badge, SubmissionStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortal } from "@/lib/data/portal-store";
import type { Deadline } from "@/lib/types";
import {
  cn,
  daysUntil,
  formatDate,
  formatDateTime,
  relativeDays,
  titleCase,
} from "@/lib/utils";

/** Full deadline card used on the Deadlines page. */
export function DeadlineCard({ deadline }: { deadline: Deadline }) {
  const { submitDeadline } = usePortal();
  const [submitting, setSubmitting] = useState(false);

  const days = daysUntil(deadline.dueDate);
  const open = deadline.status === "pending" || deadline.status === "overdue";
  const urgent = open && days <= 2;

  async function handleSubmit() {
    setSubmitting(true);
    await submitDeadline(deadline.id);
    setSubmitting(false);
  }

  return (
    <article
      className={cn(
        "rounded-[20px] border p-5 shadow-[0_18px_44px_-32px_rgba(61,78,92,0.5)] backdrop-blur-xl transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(61,78,92,0.55)]",
        deadline.status === "overdue"
          ? "border-clay-500/25 bg-clay-100/45"
          : urgent
            ? "border-gold-200/80 bg-gold-50/65"
            : "border-white/70 bg-white/70",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SubmissionStatusBadge status={deadline.status} />
            <Badge tone="neutral">{titleCase(deadline.kind)}</Badge>
            {deadline.weightage ? (
              <span className="tnum text-[11.5px] text-stone-400">
                Weightage {deadline.weightage}%
              </span>
            ) : null}
          </div>

          <h3 className="mt-2.5 font-display text-[17px] tracking-tight text-ink-900">
            {deadline.title}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">
            {deadline.description}
          </p>
        </div>

        {/* Countdown block — a closed task shows its outcome, not a countdown. */}
        <div
          className={cn(
            "flex min-w-[6.5rem] flex-col items-center justify-center rounded-xl px-3 py-2.5 text-center",
            deadline.status === "overdue"
              ? "bg-clay-100 text-clay-500"
              : deadline.status === "submitted"
                ? "bg-sage-100 text-sage-500"
                : deadline.status === "under_review"
                  ? "bg-sky-100 text-sky-500"
                  : urgent
                    ? "bg-gold-50 text-gold-600"
                    : "bg-ivory-200 text-stone-600",
          )}
        >
          {open ? (
            <>
              <span className="tnum text-xl leading-none font-semibold">
                {Math.abs(days)}
              </span>
              <span className="mt-1 text-[10.5px] font-medium tracking-wide uppercase">
                {days < 0 ? "days late" : days === 0 ? "due today" : "days left"}
              </span>
            </>
          ) : (
            <>
              {deadline.status === "submitted" ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Hourglass className="size-5" />
              )}
              <span className="mt-1 text-[10.5px] font-medium tracking-wide uppercase">
                {deadline.status === "submitted" ? "Submitted" : "In review"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200/80 pt-3.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-stone-500">
          <span className="tnum flex items-center gap-1.5">
            <CalendarCheck2 className="size-3.5 text-stone-400" />
            Due {formatDate(deadline.dueDate)} · {relativeDays(deadline.dueDate)}
          </span>
          {deadline.submittedAt ? (
            <span className="tnum flex items-center gap-1.5 text-sage-500">
              <Clock className="size-3.5" />
              Submitted {formatDateTime(deadline.submittedAt)}
            </span>
          ) : null}
        </div>

        {open ? (
          <Button size="sm" loading={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting" : "Mark as submitted"}
            {!submitting ? <Upload className="size-3.5" /> : null}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
