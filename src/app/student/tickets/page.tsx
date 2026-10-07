"use client";

import { useState, type FormEvent } from "react";
import { LifeBuoy, Send } from "lucide-react";

import { TicketList } from "@/components/shared/tickets";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import * as repo from "@/lib/data/repository";
import { usePortal } from "@/lib/data/portal-store";
import { useLoad } from "@/lib/use-load";

export default function TicketsPage() {
  const { loading, student, group, mentor } = usePortal();
  const tickets = useLoad(() => repo.listTickets(group!.id), group ? group.id : null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !student) return <PageSkeleton />;

  if (!group) {
    return (
      <div>
        <PageHeader eyebrow="Tickets" title="Raise a" emphasis="ticket." art="capitol" />
        <Card>
          <EmptyState title="Join a group first" description="Tickets go to your group's supervisor." art="avenue" />
          <div className="pb-6 text-center">
            <ButtonLink href="/student/group" size="sm">Go to my group</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await repo.raiseTicket({ groupId: group!.id, studentId: student!.id, subject: subject.trim(), body: body.trim() });
      setSubject("");
      setBody("");
      void tickets.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not raise the ticket.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tickets"
        title="Raise a"
        emphasis="ticket."
        description={
          mentor
            ? `Questions, blockers or requests go straight to ${mentor.fullName}.`
            : "Your group has no supervisor yet — the PBL office will see your ticket."
        }
        art="capitol"
      />

      <Card>
        <CardHeader title="New ticket" />
        <form onSubmit={submit}>
          <CardBody className="space-y-4">
            <Field label="Subject" htmlFor="t-subject">
              <Input id="t-subject" required maxLength={140} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Details" htmlFor="t-body">
              <Textarea id="t-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            {error ? <p role="alert" className="text-[13px] text-clay-500">{error}</p> : null}
            <Button type="submit" loading={busy}>
              <Send className="size-3.5" />
              Raise ticket
            </Button>
          </CardBody>
        </form>
      </Card>

      <Card>
        <CardHeader title="Your group's tickets" />
        {tickets.data && tickets.data.length > 0 ? (
          <TicketList tickets={tickets.data} />
        ) : (
          <EmptyState icon={<LifeBuoy className="size-5" />} title={tickets.data ? "No tickets yet" : "Loading…"} />
        )}
      </Card>
    </div>
  );
}
