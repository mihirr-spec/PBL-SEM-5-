"use client";

import { useState, type FormEvent } from "react";
import { Crown, FileSignature, RotateCcw, Send, X } from "lucide-react";

import { MentorCard } from "@/components/profile/mentor-card";
import { FacultyDirectory } from "@/components/shared/faculty-directory";
import { FileLink } from "@/components/shared/file-link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import * as repo from "@/lib/data/repository";
import { usePortal } from "@/lib/data/portal-store";
import type { Faculty, Group, MentorRequest, RequestStatus } from "@/lib/types";
import { useLoad } from "@/lib/use-load";
import { timeAgo } from "@/lib/utils";

const REQUEST_STATUS: Record<RequestStatus, { tone: "gold" | "sage" | "clay" | "neutral"; label: string }> = {
  pending: { tone: "gold", label: "Under review" },
  changes_requested: { tone: "clay", label: "Changes requested" },
  approved: { tone: "sage", label: "Approved" },
  rejected: { tone: "clay", label: "Rejected" },
  closed: { tone: "neutral", label: "Closed" },
};

export default function GroupPage() {
  const { loading, student, group, mentor, refresh } = usePortal();

  if (loading || !student) return <PageSkeleton />;

  const isLeader = group?.leaderStudentId === student.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Group"
        title={group ? `Group ${group.number}:` : "Form your"}
        emphasis={group ? group.name : "group."}
        description={
          group
            ? group.projectTitle
            : "Add your classmates by registration number. Once the group exists, the team lead registers your mentor with the signed PBL form."
        }
        art="avenue"
      />
      {group ? (
        <GroupView group={group} isLeader={isLeader} mentorCard={<MentorCard mentor={mentor} />} onChanged={refresh} />
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
          <Field label="Project idea" htmlFor="g-idea" help="A short brief — your teacher sees it alongside the PBL form." className="sm:col-span-2">
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
  isLeader,
  mentorCard,
  onChanged,
}: {
  group: Group;
  isLeader: boolean;
  mentorCard: React.ReactNode;
  onChanged: () => void;
}) {
  const requests = useLoad(() => repo.listRequestsForGroup(group.id), group.id);
  const [target, setTarget] = useState<Faculty | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Members" description={group.projectIdea ? undefined : "Add a project idea so your teacher knows what you plan."} />
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
              title="Mentor registration"
              description="Agree with your teacher first, then the team lead uploads the signed PBL form here. The teacher reviews it and approves, rejects, or asks for corrections."
            />
            {requests.data && requests.data.length > 0 ? (
              <ul className="divide-y divide-sand-200/70">
                {requests.data.map((r) => (
                  <RequestRow
                    key={r.id}
                    request={r}
                    groupId={group.id}
                    isLeader={isLeader}
                    onResubmitted={() => void requests.reload()}
                  />
                ))}
              </ul>
            ) : (
              <CardBody>
                <p className="text-[13px] text-stone-500">
                  {isLeader
                    ? "No form sent yet — find your teacher below and upload the signed form."
                    : "Your team lead has not sent the signed PBL form yet."}
                </p>
              </CardBody>
            )}
          </Card>

          {target ? (
            <RequestForm
              faculty={target}
              groupId={group.id}
              onCancel={() => setTarget(null)}
              onSent={() => {
                setTarget(null);
                void requests.reload();
                onChanged();
              }}
            />
          ) : null}

          {isLeader ? (
            <div>
              <h2 className="mb-3 font-display text-[1.3rem] text-ink-900">Find your teacher</h2>
              <FacultyDirectory
                action={(f) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setTarget(f)}
                    title={f.onPortal ? undefined : "This teacher sees the form once their portal account is set up"}
                  >
                    <FileSignature className="size-3.5" />
                    Send form
                  </Button>
                )}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/** One request in the group's list; the team lead can fix and resubmit. */
function RequestRow({
  request: r,
  groupId,
  isLeader,
  onResubmitted,
}: {
  request: MentorRequest;
  groupId: string;
  isLeader: boolean;
  onResubmitted: () => void;
}) {
  const [fixing, setFixing] = useState(false);
  const status = REQUEST_STATUS[r.status];

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-medium text-ink-900">{r.facultyName}</p>
          <p className="text-[12px] text-stone-500">
            {r.resubmittedAt ? `Resubmitted ${timeAgo(r.resubmittedAt)}` : `Sent ${timeAgo(r.createdAt)}`}
          </p>
          {r.formPath && r.formName ? (
            <FileLink bucket="submissions" path={r.formPath} name={r.formName} className="mt-1.5" />
          ) : null}
        </div>
        <Badge tone={status.tone} dot>{status.label}</Badge>
      </div>

      {r.reviewNote ? (
        <p className="mt-3 rounded-[12px] bg-azure-50/70 px-3 py-2 text-[13px] whitespace-pre-line text-ink-800">
          <span className="font-semibold">{r.facultyName}:</span> {r.reviewNote}
        </p>
      ) : null}

      {r.status === "changes_requested" && isLeader ? (
        fixing ? (
          <FormUpload
            idPrefix={`fix-${r.id}`}
            submitLabel="Resubmit form"
            messageLabel="Note for the teacher (optional)"
            messageHelp="What did you change?"
            onCancel={() => setFixing(false)}
            onSubmit={async (message, form) => {
              await repo.resubmitMentorRequest({ requestId: r.id, groupId, message, form });
              setFixing(false);
              onResubmitted();
            }}
          />
        ) : (
          <Button size="sm" className="mt-3" onClick={() => setFixing(true)}>
            <RotateCcw className="size-3.5" />
            Upload corrected form
          </Button>
        )
      ) : null}
    </li>
  );
}

function RequestForm({
  faculty,
  groupId,
  onCancel,
  onSent,
}: {
  faculty: Faculty;
  groupId: string;
  onCancel: () => void;
  onSent: () => void;
}) {
  return (
    <Card className="ring-2 ring-azure-100">
      <CardHeader
        title={`Register with ${faculty.fullName}`}
        description={faculty.expertise || faculty.department}
        action={
          <button type="button" onClick={onCancel} className="rounded-md p-1 text-stone-400 hover:text-ink-800" aria-label="Cancel">
            <X className="size-4" />
          </button>
        }
      />
      <CardBody>
        {faculty.onPortal ? null : (
          <p className="text-[12.5px] text-stone-500">
            {faculty.fullName} is not on the portal yet — they will see this once their account is set up.
          </p>
        )}
        <FormUpload
          idPrefix="req"
          submitLabel="Send for approval"
          messageLabel="Message to the teacher (optional)"
          messageHelp="A line or two — e.g. when you discussed the project."
          onSubmit={async (message, form) => {
            await repo.requestMentor({ groupId, facultyId: faculty.id, message, form });
            onSent();
          }}
        />
      </CardBody>
    </Card>
  );
}

/** Signed-form upload plus a short message, used to send and to resubmit. */
function FormUpload({
  idPrefix,
  submitLabel,
  messageLabel,
  messageHelp,
  onSubmit,
  onCancel,
}: {
  idPrefix: string;
  submitLabel: string;
  messageLabel: string;
  messageHelp: string;
  onSubmit: (message: string, form: File) => Promise<void>;
  onCancel?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Attach the signed PBL form.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(message.trim(), file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the form.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <Field label="Signed PBL form" htmlFor={`${idPrefix}-form`} help="PDF, or a clear scan or photo (PNG, JPG) — up to 25 MB.">
        <input
          id={`${idPrefix}-form`}
          type="file"
          required
          accept=".pdf,image/png,image/jpeg"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-[13px] text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-azure-50 file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-azure-600"
        />
      </Field>
      <Field label={messageLabel} htmlFor={`${idPrefix}-msg`} help={messageHelp}>
        <Textarea id={`${idPrefix}-msg`} rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>
      {error ? <p role="alert" className="text-[13px] text-clay-500">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>
          <Send className="size-3.5" />
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        ) : null}
      </div>
    </form>
  );
}
