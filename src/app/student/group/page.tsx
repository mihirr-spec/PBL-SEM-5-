"use client";

import { useState, type FormEvent } from "react";
import { Crown, Send, UserPlus, X } from "lucide-react";

import { MentorCard } from "@/components/profile/mentor-card";
import { FacultyDirectory } from "@/components/shared/faculty-directory";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import * as repo from "@/lib/data/repository";
import { usePortal } from "@/lib/data/portal-store";
import type { Faculty, Group, RequestStatus } from "@/lib/types";
import { useLoad } from "@/lib/use-load";
import { timeAgo } from "@/lib/utils";

const REQUEST_TONE: Record<RequestStatus, "gold" | "sage" | "clay" | "neutral"> = {
  pending: "gold",
  approved: "sage",
  rejected: "clay",
  closed: "neutral",
};

export default function GroupPage() {
  const { loading, student, group, mentor, refresh } = usePortal();

  if (loading || !student) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Group"
        title={group ? `Group ${group.number}:` : "Form your"}
        emphasis={group ? group.name : "group."}
        description={
          group
            ? group.projectTitle
            : "Add your classmates by registration number. You can request a supervisor once the group exists."
        }
        art="avenue"
      />
      {group ? (
        <GroupView group={group} mentorCard={<MentorCard mentor={mentor} />} onChanged={refresh} />
      ) : (
        <CreateGroupForm onCreated={refresh} myRegistration={student.registrationNumber} />
      )}
    </div>
  );
}

/* ----------------------------------------------------------- create group */

function CreateGroupForm({ onCreated, myRegistration }: { onCreated: () => void; myRegistration: string }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [idea, setIdea] = useState("");
  const [members, setMembers] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await repo.createGroup({
        name: name.trim(),
        projectTitle: title.trim(),
        projectIdea: idea.trim(),
        domain: domain.trim(),
        memberRegistrationNumbers: members.split(/[\s,]+/).filter(Boolean),
      });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the group.");
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Create a group" description="You will be the team leader. Up to 5 students in total." />
      <form onSubmit={submit}>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Group name" htmlFor="g-name">
            <Input id="g-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Team Kisan" />
          </Field>
          <Field label="Domain" htmlFor="g-domain">
            <Input id="g-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Machine Learning" />
          </Field>
          <Field label="Project title" htmlFor="g-title" className="sm:col-span-2">
            <Input id="g-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Project idea" htmlFor="g-idea" help="A short brief — teachers read this before accepting you." className="sm:col-span-2">
            <Textarea id="g-idea" rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} />
          </Field>
          <Field
            label="Members' registration numbers"
            htmlFor="g-members"
            help={`Separate with commas. You (${myRegistration}) are added automatically. Each student can be in only one group.`}
            className="sm:col-span-2"
          >
            <Input id="g-members" value={members} onChange={(e) => setMembers(e.target.value)} placeholder="URN-2023-CSE-1302, URN-2023-CSE-1303" />
          </Field>
          {error ? <p role="alert" className="text-[13px] text-clay-500 sm:col-span-2">{error}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" loading={busy}>Create group</Button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------- group view */

function GroupView({
  group,
  mentorCard,
  onChanged,
}: {
  group: Group;
  mentorCard: React.ReactNode;
  onChanged: () => void;
}) {
  const requests = useLoad(() => repo.listRequestsForGroup(group.id), group.id);
  const [target, setTarget] = useState<Faculty | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Members" description={group.projectIdea ? undefined : "Add a project idea so teachers know what you plan."} />
          <ul className="divide-y divide-sand-200/70">
            {group.members.map((m) => (
              <li key={m.studentId} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={m.fullName} src={m.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[14px] font-medium text-ink-900">
                    {m.fullName}
                    {m.studentId === group.leaderStudentId ? <Crown className="size-3.5 text-gold-500" aria-label="Team leader" /> : null}
                  </p>
                  <p className="tnum text-[12px] text-stone-500">{m.registrationNumber} · {m.email}</p>
                </div>
                <span className="hidden text-[12px] text-stone-500 sm:block">{m.teamRole}</span>
              </li>
            ))}
          </ul>
          {group.projectIdea ? (
            <CardBody className="border-t border-sand-200/60">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">Project idea</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-stone-600">{group.projectIdea}</p>
            </CardBody>
          ) : null}
        </Card>
        {mentorCard}
      </div>

      {group.mentorId ? null : (
        <>
          <Card>
            <CardHeader
              title="Supervisor requests"
              description="Up to 3 pending at a time. The first teacher to accept becomes your supervisor; if nobody does, the PBL office allots one."
            />
            {requests.data && requests.data.length > 0 ? (
              <ul className="divide-y divide-sand-200/70">
                {requests.data.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                    <div>
                      <p className="text-[14px] font-medium text-ink-900">{r.facultyName}</p>
                      <p className="text-[12px] text-stone-500">Sent {timeAgo(r.createdAt)}</p>
                    </div>
                    <Badge tone={REQUEST_TONE[r.status]} dot>
                      {r.status === "closed" ? "Closed" : r.status[0].toUpperCase() + r.status.slice(1)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <CardBody>
                <p className="text-[13px] text-stone-500">No requests sent yet — pick a teacher below.</p>
              </CardBody>
            )}
          </Card>

          {target ? (
            <RequestForm
              faculty={target}
              onCancel={() => setTarget(null)}
              onSent={() => {
                setTarget(null);
                void requests.reload();
                onChanged();
              }}
            />
          ) : null}

          <div>
            <h2 className="mb-3 font-display text-[1.3rem] text-ink-900">Choose a supervisor</h2>
            <FacultyDirectory
              action={(f) => (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setTarget(f)}
                  title={f.onPortal ? undefined : "This teacher sees requests once their portal account is set up"}
                >
                  <UserPlus className="size-3.5" />
                  Request
                </Button>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}

function RequestForm({
  faculty,
  onCancel,
  onSent,
}: {
  faculty: Faculty;
  onCancel: () => void;
  onSent: () => void;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await repo.requestMentor(faculty.id, message.trim());
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the request.");
      setBusy(false);
    }
  }

  return (
    <Card className="ring-2 ring-azure-100">
      <CardHeader
        title={`Request ${faculty.fullName}`}
        description={faculty.expertise || faculty.department}
        action={
          <button type="button" onClick={onCancel} className="rounded-md p-1 text-stone-400 hover:text-ink-800" aria-label="Cancel">
            <X className="size-4" />
          </button>
        }
      />
      <form onSubmit={submit}>
        <CardBody className="space-y-3">
          <Field label="Message to the teacher" htmlFor="req-msg" help="Why this teacher? What will you build? They see your project idea too.">
            <Textarea id="req-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          {faculty.onPortal ? null : (
            <p className="text-[12.5px] text-stone-500">
              {faculty.fullName} is not on the portal yet — they will see this once their account is set up.
              Requesting a teacher marked &ldquo;On portal&rdquo; gets a faster answer.
            </p>
          )}
          {error ? <p role="alert" className="text-[13px] text-clay-500">{error}</p> : null}
          <Button type="submit" loading={busy}>
            <Send className="size-3.5" />
            Send request
          </Button>
        </CardBody>
      </form>
    </Card>
  );
}
