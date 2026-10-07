"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";

import { TicketList } from "@/components/shared/tickets";
import { Card, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { listTickets } from "@/lib/data/repository";
import { useLoad } from "@/lib/use-load";
import { cn } from "@/lib/utils";

export default function FacultyTicketsPage() {
  const { data, reload } = useLoad(() => listTickets(), "tickets");
  const [showResolved, setShowResolved] = useState(false);

  if (!data) return <PageSkeleton />;
  const visible = data.filter((t) => showResolved || t.status === "open");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tickets"
        title="Student"
        emphasis="tickets."
        description="Questions and problems raised by students in your groups. Replies notify the student."
        scene="tickets"
      />
      <div className="inline-flex gap-1 rounded-xl bg-white/60 p-1 ring-1 ring-white">
        {[false, true].map((resolved) => (
          <button
            key={String(resolved)}
            onClick={() => setShowResolved(resolved)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[13px] font-medium",
              showResolved === resolved ? "bg-ink-800 text-white" : "text-stone-600 hover:text-ink-800",
            )}
          >
            {resolved ? "All tickets" : `Open (${data.filter((t) => t.status === "open").length})`}
          </button>
        ))}
      </div>
      <Card>
        {visible.length === 0 ? (
          <EmptyState icon={<LifeBuoy className="size-5" />} title="No tickets to show" scene="tickets" />
        ) : (
          <TicketList tickets={visible} canReply onChanged={reload} />
        )}
      </Card>
    </div>
  );
}
