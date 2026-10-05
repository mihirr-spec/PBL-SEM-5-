"use client";

import { useMemo, useState } from "react";
import { Megaphone, Paperclip } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/lib/data/portal-store";
import type { Priority } from "@/lib/types";
import { cn, formatDateTime, timeAgo, titleCase } from "@/lib/utils";

type Filter = "all" | Priority;

const FILTERS: Filter[] = ["all", "urgent", "important", "normal"];

export default function AnnouncementsPage() {
  const { loading, announcements } = usePortal();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? announcements
        : announcements.filter((a) => a.priority === filter),
    [announcements, filter],
  );

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        eyebrow="Announcements"
        title="Notices from"
        emphasis="your faculty."
        art="avenue"
        description="Notices from your coordinator, supervisor and the department."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              filter === key
                ? "bg-ink-800 text-white shadow-[0_8px_20px_-12px_rgba(13,31,63,0.9)]"
                : "bg-white/65 text-stone-600 ring-1 ring-white/80 ring-inset backdrop-blur-md hover:bg-white/90 hover:text-ink-800",
            )}
          >
            {key === "all" ? "All" : titleCase(key)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Megaphone className="size-5" />}
            title="No announcements"
            description="Notices posted by your faculty will appear here."
            art="avenue"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((a) => (
            <article
              key={a.id}
              className={cn(
                "relative overflow-hidden rounded-[20px] border p-5 shadow-[0_20px_50px_-32px_rgba(61,78,92,0.5)] backdrop-blur-xl",
                a.priority === "urgent"
                  ? "border-clay-500/25 bg-clay-100/45"
                  : a.priority === "important"
                    ? "border-gold-200/80 bg-gold-50/60"
                    : "border-white/70 bg-white/70",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display text-[18px] tracking-tight text-ink-900">
                  {a.title}
                </h2>
                <PriorityBadge priority={a.priority} />
              </div>

              <p className="mt-2.5 text-[13.5px] leading-relaxed text-stone-600">
                {a.body}
              </p>

              {a.attachment ? (
                <a
                  href={a.attachment.url}
                  className="mt-4 inline-flex items-center gap-2.5 rounded-lg border border-white/80 bg-white/70 px-3 py-2 text-[12.5px] text-stone-700 transition-colors hover:border-azure-100 hover:bg-azure-50"
                >
                  <Paperclip className="size-3.5 text-stone-400" />
                  <span className="font-medium">{a.attachment.name}</span>
                  <span className="tnum text-stone-400">
                    {a.attachment.sizeLabel}
                  </span>
                </a>
              ) : null}

              <footer className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-sand-200/80 pt-3.5">
                <Avatar name={a.postedByName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-stone-700">
                    {a.postedByName}
                  </p>
                  <p className="text-[11.5px] text-stone-400 capitalize">
                    {a.postedByRole} · {a.projectId ? "Your project" : "All students"}
                  </p>
                </div>
                <p
                  className="tnum ml-auto text-[11.5px] text-stone-400"
                  title={formatDateTime(a.postedAt)}
                >
                  {timeAgo(a.postedAt)}
                </p>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
