import { cn, titleCase } from "@/lib/utils";
import type { Priority, ProjectStatus, SubmissionStatus } from "@/lib/types";

type Tone = "neutral" | "gold" | "sage" | "sky" | "clay" | "plum";

const TONE: Record<Tone, string> = {
  neutral: "bg-ivory-200 text-stone-600 ring-sand-200",
  gold: "bg-gold-50 text-gold-600 ring-gold-200",
  sage: "bg-sage-100 text-sage-500 ring-sage-500/20",
  sky: "bg-sky-100 text-sky-500 ring-sky-500/20",
  clay: "bg-clay-100 text-clay-500 ring-clay-500/20",
  plum: "bg-plum-100 text-plum-500 ring-plum-500/20",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap ring-1 ring-inset",
        TONE[tone],
        className,
      )}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current opacity-70" />
      ) : null}
      {children}
    </span>
  );
}

const SUBMISSION_TONE: Record<SubmissionStatus, Tone> = {
  pending: "gold",
  submitted: "sage",
  under_review: "sky",
  overdue: "clay",
};

export function SubmissionStatusBadge({
  status,
  className,
}: {
  status: SubmissionStatus;
  className?: string;
}) {
  return (
    <Badge tone={SUBMISSION_TONE[status]} dot className={className}>
      {titleCase(status)}
    </Badge>
  );
}

const PROJECT_TONE: Record<ProjectStatus, Tone> = {
  proposed: "neutral",
  active: "sage",
  under_review: "sky",
  completed: "plum",
  on_hold: "clay",
};

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <Badge tone={PROJECT_TONE[status]} dot className={className}>
      {titleCase(status)}
    </Badge>
  );
}

const PRIORITY_TONE: Record<Priority, Tone> = {
  normal: "neutral",
  important: "gold",
  urgent: "clay",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  if (priority === "normal") {
    return (
      <Badge tone="neutral" className={className}>
        Notice
      </Badge>
    );
  }
  return (
    <Badge tone={PRIORITY_TONE[priority]} dot className={cn("uppercase", className)}>
      {priority}
    </Badge>
  );
}
