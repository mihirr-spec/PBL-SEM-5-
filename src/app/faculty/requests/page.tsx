"use client";

import { useState } from "react";
import { Check, Crown, UserPlus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/session";
import * as repo from "@/lib/data/repository";
import type { Group, MentorRequest } from "@/lib/types";
import { useLoad } from "@/lib/use-load";
import { timeAgo } from "@/lib/utils";

/** What the database said about a decision, in words. */
const OUTCOME: Record<string, { tone: "sage" | "clay" | "gold"; text: string }> = {
  approved: { tone: "sage", text: "Approved — the group is now yours." },
  rejected: { tone: "clay", text: "Request declined. The group has been told." },
  already_assigned: {
    tone: "gold",
    text: "This group was already assigned to another supervisor, so the request has been closed.",
  },
  full: { tone: "gold", text: "You already supervise the maximum of 7 groups." },
  closed: { tone: "gold", text: "This request was already closed." },
};

export default function RequestsPage() {
  const { user } = useSession();
  const { data, reload } = useLoad(() => repo.listRequestsForFaculty(user!.profileId), user ? user.id : null);

  if (!user || !data) return <PageSkeleton />;

  const pending = data.filter((r) => r.status === "pending");
  const past = data.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mentor Requests"
        title="Groups asking"
        emphasis="for you."
        description="Read each group's brief, then approve or decline. Before approving, the system checks the group has not already been taken by another teacher."
        art="avenue"
      />

      {pending.length === 0 ? (
        <Card>
          <EmptyState icon={<UserPlus className="size-5" />} title="No pending requests" art="capitol" />
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map((r) => (
            <RequestCard key={r.id} request={r} onDecided={reload} />
          ))}
        </div>
      )}

      {past.length > 0 ? (
        <Card>
          <CardHeader title="Earlier requests" />
          <ul className="divide-y divide-sand-200/70">
            {past.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className="text-[14px] font-medium text-ink-900">
                    {r.group ? `Group ${r.group.number} · ${r.group.projectTitle}` : "Group"}
                  </p>
                  <p className="text-[12px] text-stone-500">
                    {r.decidedAt ? `Decided ${timeAgo(r.decidedAt)}` : `Sent ${timeAgo(r.createdAt)}`}
                  </p>
                </div>
                <Badge tone={r.status === "approved" ? "sage" : r.status === "rejected" ? "clay" : "neutral"} dot>
                  {r.status[0].toUpperCase() + r.status.slice(1)}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function RequestCard({
  request,
  onDecided,
}: {
  request: MentorRequest & { group: Group | null };
  onDecided: () => void;
}) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const group = request.group;

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "reject");
    setError(null);
    try {
      const result = await repo.decideMentorRequest(request.id, approve);
      setOutcome(result);
      // Let the outcome message register before the card leaves the list.
      setTimeout(onDecided, result === "full" ? 0 : 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the decision.");
    } finally {
      setBusy(null);
    }
  }

  const result = outcome ? OUTCOME[outcome] : null;

  return (
    <Card>
      <CardHeader
        title={group ? `Group ${group.number} · ${group.projectTitle}` : "Group"}
        description={group ? `${group.name}${group.domain ? ` · ${group.domain}` : ""} · requested ${timeAgo(request.createdAt)}` : undefined}
      />
      <CardBody className="space-y-4">
        {request.message ? (
          <blockquote className="rounded-[12px] border-l-4 border-azure-500 bg-azure-50/60 px-4 py-2.5 text-[13.5px] text-ink-800">
            {request.message}
          </blockquote>
        ) : (
          <p className="text-[13px] text-stone-500">No message was included.</p>
        )}
        {group?.projectIdea ? (
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">Project idea</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-stone-600">{group.projectIdea}</p>
          </div>
        ) : null}
        {group ? (
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">Members</p>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {group.members.map((m) => (
                <li key={m.studentId} className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[12.5px] text-ink-900 ring-1 ring-white">
                  {m.studentId === group.leaderStudentId ? <Crown className="size-3 text-gold-500" /> : null}
                  {m.fullName}
                  <span className="tnum text-stone-400">{m.registrationNumber}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result ? (
          <p className={`rounded-[12px] px-3 py-2 text-[13px] ${result.tone === "sage" ? "bg-sage-100 text-sage-500" : result.tone === "clay" ? "bg-clay-100 text-clay-500" : "bg-gold-50 text-gold-600"}`}>
            {result.text}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" loading={busy === "approve"} disabled={busy !== null} onClick={() => void decide(true)}>
              <Check className="size-3.5" />
              Approve
            </Button>
            <Button size="sm" variant="danger" loading={busy === "reject"} disabled={busy !== null} onClick={() => void decide(false)}>
              <X className="size-3.5" />
              Decline
            </Button>
          </div>
        )}
        {error ? <p role="alert" className="text-[13px] text-clay-500">{error}</p> : null}
      </CardBody>
    </Card>
  );
}
