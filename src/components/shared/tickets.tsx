"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, CornerDownRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { replyTicket } from "@/lib/data/repository";
import type { Ticket } from "@/lib/types";
import { formatDateTime, timeAgo } from "@/lib/utils";

/** Ticket threads. Staff (`canReply`) can answer and resolve. */
export function TicketList({
  tickets,
  canReply = false,
  onChanged,
}: {
  tickets: Ticket[];
  canReply?: boolean;
  onChanged?: () => void;
}) {
  return (
    <ul className="divide-y divide-sand-200/70">
      {tickets.map((t) => (
        <TicketRow key={t.id} ticket={t} canReply={canReply} onChanged={onChanged} />
      ))}
    </ul>
  );
}

function TicketRow({
  ticket,
  canReply,
  onChanged,
}: {
  ticket: Ticket;
  canReply: boolean;
  onChanged?: () => void;
}) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(resolve: boolean) {
    if (!reply.trim() && !resolve) return;
    setBusy(true);
    setError(null);
    try {
      await replyTicket(ticket.id, reply.trim() || ticket.reply || "Resolved.", resolve);
      setReply("");
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the reply.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-ink-900">{ticket.subject}</p>
          <p className="text-[12px] text-stone-500" title={formatDateTime(ticket.createdAt)}>
            {ticket.studentName ?? "Student"}
            {ticket.groupNumber != null ? ` · Group ${ticket.groupNumber}` : ""} · {timeAgo(ticket.createdAt)}
          </p>
        </div>
        <Badge tone={ticket.status === "open" ? "gold" : "sage"} dot>
          {ticket.status === "open" ? "Open" : "Resolved"}
        </Badge>
      </div>
      {ticket.body ? (
        <p className="mt-2 text-[13.5px] leading-relaxed whitespace-pre-line text-stone-600">{ticket.body}</p>
      ) : null}

      {ticket.reply ? (
        <div className="mt-3 flex gap-2 rounded-[12px] bg-azure-50/70 px-3 py-2.5 text-[13px] text-ink-800">
          <CornerDownRight className="mt-0.5 size-4 shrink-0 text-azure-600" />
          <div>
            <p className="whitespace-pre-line">{ticket.reply}</p>
            {ticket.repliedAt ? (
              <p className="mt-1 text-[11.5px] text-stone-500">Supervisor · {timeAgo(ticket.repliedAt)}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {canReply && ticket.status === "open" ? (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            void send(false);
          }}
          className="mt-3 space-y-2"
        >
          <Textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" aria-label="Reply" />
          {error ? <p role="alert" className="text-[12.5px] text-clay-500">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" loading={busy} disabled={!reply.trim()}>
              Send reply
            </Button>
            <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void send(true)}>
              <CheckCircle2 className="size-3.5" />
              {reply.trim() ? "Reply & resolve" : "Mark resolved"}
            </Button>
          </div>
        </form>
      ) : null}
    </li>
  );
}
