import { CalendarCheck2 } from "lucide-react";

import { SubmissionStatusBadge } from "@/components/ui/badge";
import type { Deadline } from "@/lib/types";
import { cn, daysUntil, formatDateShort, relativeDays } from "@/lib/utils";

/** Urgency colour for the countdown text, independent of submission status. */
function countdownTone(deadline: Deadline): string {
  if (deadline.status === "submitted" || deadline.status === "under_review") {
    return "text-stone-400";
  }
  const days = daysUntil(deadline.dueDate);
  if (days < 0) return "text-clay-500 font-semibold";
  if (days <= 2) return "text-gold-600 font-semibold";
  return "text-stone-500";
}

/** Compact one-line deadline, used in the dashboard list. */
export function DeadlineRow({ deadline }: { deadline: Deadline }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/70">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          deadline.status === "overdue"
            ? "bg-clay-100 text-clay-500"
            : "bg-azure-50 text-azure-600",
        )}
        aria-hidden
      >
        <CalendarCheck2 className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-stone-800">
          {deadline.title}
        </p>
        <p className={cn("tnum mt-0.5 text-[12px]", countdownTone(deadline))}>
          {formatDateShort(deadline.dueDate)} · due {relativeDays(deadline.dueDate)}
        </p>
      </div>

      <SubmissionStatusBadge status={deadline.status} />
    </li>
  );
}
