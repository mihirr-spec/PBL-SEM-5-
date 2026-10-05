import {
  CalendarClock,
  CheckCircle2,
  Megaphone,
  MessageSquareQuote,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { NotificationKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<NotificationKind, { icon: LucideIcon; className: string }> = {
  deadline: { icon: CalendarClock, className: "bg-gold-50 text-gold-600" },
  announcement: { icon: Megaphone, className: "bg-sky-100 text-sky-500" },
  submission: { icon: CheckCircle2, className: "bg-sage-100 text-sage-500" },
  feedback: { icon: MessageSquareQuote, className: "bg-plum-100 text-plum-500" },
  profile: { icon: UserRound, className: "bg-azure-50 text-azure-600" },
};

export function NotificationIcon({
  kind,
  className,
}: {
  kind: NotificationKind;
  className?: string;
}) {
  const { icon: Icon, className: tone } = STYLES[kind];
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg",
        tone,
        className,
      )}
      aria-hidden
    >
      <Icon className="size-4" />
    </span>
  );
}
