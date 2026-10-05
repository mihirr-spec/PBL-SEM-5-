"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BellOff, CheckCheck, ChevronRight } from "lucide-react";

import { NotificationIcon } from "@/components/notifications/notification-icon";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/lib/data/portal-store";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const { loading, notifications, unreadCount, markNotificationRead, markAllRead } =
    usePortal();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const visible = useMemo(
    () => (showUnreadOnly ? notifications.filter((n) => !n.read) : notifications),
    [notifications, showUnreadOnly],
  );

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        eyebrow="Notifications"
        title="What's"
        emphasis="new for you."
        art="campus"
        description={
          unreadCount > 0
            ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}.`
            : "You're all caught up."
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUnreadOnly((v) => !v)}
              aria-pressed={showUnreadOnly}
              className={cn(
                "bg-white/70 backdrop-blur-md",
                showUnreadOnly && "bg-ink-800 text-white ring-ink-800 hover:bg-ink-700",
              )}
            >
              {showUnreadOnly ? "Showing unread" : "Show unread only"}
            </Button>
            {unreadCount > 0 ? (
              <Button size="sm" onClick={markAllRead}>
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        {visible.length === 0 ? (
          <EmptyState
            icon={<BellOff className="size-5" />}
            title={showUnreadOnly ? "No unread notifications" : "No notifications"}
            description="Deadline reminders, announcements and faculty feedback will appear here."
            art="campus"
          />
        ) : (
          <ul className="divide-y divide-sand-200/70">
            {visible.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "/student/dashboard"}
                  onClick={() => void markNotificationRead(n.id)}
                  className={cn(
                    "group flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-white/70",
                    !n.read && "bg-azure-50/60",
                  )}
                >
                  <NotificationIcon kind={n.kind} className="mt-0.5" />

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[13.5px] text-stone-800",
                        !n.read ? "font-semibold" : "font-medium",
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-500">
                      {n.body}
                    </p>
                    <p
                      className="tnum mt-1.5 text-[11.5px] text-stone-400"
                      title={formatDateTime(n.createdAt)}
                    >
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {!n.read ? (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-azure-600"
                      aria-label="Unread"
                    />
                  ) : null}
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-sand-300 transition-colors group-hover:text-stone-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
