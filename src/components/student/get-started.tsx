"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, FileSignature, Plus, Send, UserCheck, X } from "lucide-react";

import { FacultyDirectory } from "@/components/shared/faculty-directory";
import { InvitationCard } from "@/components/student/invitation-card";
import { StudentDetailsCard } from "@/components/student/student-details-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import * as repo from "@/lib/data/repository";
import type { Faculty, GroupInvitation, Student } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "details", label: "Your details" },
  { key: "teacher", label: "Choose supervisor" },
  { key: "form", label: "Signed application" },
  { key: "group", label: "Group & teammates" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/**
 * Shown to a student who is not in a group yet. They check their university
 * details, pick the teacher they agreed with, upload the application that
 * teacher signed, and fill in the group form with their teammates. Teammates
 * are invited and join once they accept; the teacher approves the request.
 */
export function GetStarted({
  student,
  invitations,
  onDone,
}: {
  student: Student;
  invitations: GroupInvitation[];
  onDone: () => Promise<void> | void;
}) {
  const [step, setStep] = useState<StepKey>("details");
  const [teacher, setTeacher] = useState<Faculty | null>(null);
  const [form, setForm] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const index = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-6">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            aria-current={s.key === step ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px]",
              i === index
                ? "border-azure-100 bg-white text-ink-900 shadow-[0_8px_20px_-14px_rgba(13,31,63,0.5)]"
                : i < index
                  ? "border-white/70 bg-white/60 text-stone-600"
                  : "border-white/50 bg-white/30 text-stone-400",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                i < index ? "bg-sage-100 text-sage-500" : i === index ? "bg-azure-600 text-white" : "bg-ivory-200",
              )}
            >
              {i < index ? <Check className="size-3" /> : i + 1}
            </span>
            {s.label}
          </li>
        ))}
      </ol>

      {step === "details" ? (
        <>
          <StudentDetailsCard student={student} />
          {invitations.length > 0 ? (
            <div className="space-y-3">
              <h2 className="font-display text-[1.3rem] text-ink-900">Invitations for you</h2>
              {invitations.map((inv) => (
                <InvitationCard key={inv.id} invitation={inv} onAnswered={() => void onDone()} />
              ))}
              <p className="text-[13px] text-stone-500">Or start your own group instead:</p>
            </div>
          ) : null}
          <Button onClick={() => setStep("teacher")}>
            Start my group — choose a supervisor
            <ArrowRight className="size-3.5" />
          </Button>
        </>
      ) : null}

      {step === "teacher" ? (
        <>
          <Card>
            <CardHeader
              title="Choose your supervisor"
              description="Pick the teacher who agreed to mentor your group and signed your PBL application."
            />
            {teacher ? (
              <CardBody className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200/60">
                <div className="flex items-center gap-3">
                  <Avatar name={teacher.fullName} size="md" />
                  <div>
                    <p className="text-[14px] font-medium text-ink-900">{teacher.fullName}</p>
                    <p className="text-[12px] text-stone-500">{teacher.designation} · {teacher.department}</p>
                  </div>
                </div>
                <Button onClick={() => setStep("form")}>
                  Continue
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardBody>
            ) : null}
          </Card>
          <FacultyDirectory
            action={(f) => (
              <Button size="sm" variant={teacher?.id === f.id ? "primary" : "secondary"} onClick={() => setTeacher(f)}>
                <UserCheck className="size-3.5" />
                {teacher?.id === f.id ? "Chosen" : "Choose"}
              </Button>
            )}
          />
          <Button variant="ghost" onClick={() => setStep("details")}>
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
        </>
      ) : null}

      {step === "form" && teacher ? (
        <Card>
          <CardHeader
            title={`Application signed by ${teacher.fullName}`}
            description="Upload the PBL application your supervisor signed. They see it with your request and approve it from their portal."
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (form) setStep("group");
            }}
          >
            <CardBody className="space-y-4">
              <Field label="Signed application" htmlFor="gs-form" help="PDF, or a clear scan or photo (PNG, JPG) — up to 25 MB.">
                <input
                  id="gs-form"
                  type="file"
                  required
                  accept=".pdf,image/png,image/jpeg"
                  onChange={(e) => setForm(e.target.files?.[0] ?? null)}
                  className="block w-full text-[13px] text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-azure-50 file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-azure-600"
                />
              </Field>
              {form ? (
                <p className="flex items-center gap-1.5 text-[13px] text-ink-800">
                  <FileSignature className="size-4 text-azure-600" />
                  {form.name}
                </p>
              ) : null}
              <Field label="Message to the teacher (optional)" htmlFor="gs-msg" help="A line or two — e.g. when you discussed the project.">
                <Textarea id="gs-msg" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => setStep("teacher")}>
                  <ArrowLeft className="size-3.5" />
                  Back
                </Button>
                <Button type="submit" disabled={!form}>
                  Continue
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardBody>
          </form>
        </Card>
      ) : null}

      {step === "group" && teacher && form ? (
        <GroupForm
          student={student}
          teacher={teacher}
          form={form}
          message={message}
          onBack={() => setStep("form")}
          onDone={onDone}
        />
      ) : null}
    </div>
  );
}

function GroupForm({
  student,
  teacher,
  form,
  message,
  onBack,
  onDone,
}: {
  student: Student;
  teacher: Faculty;
  form: File;
  message: string;
  onBack: () => void;
  onDone: () => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [idea, setIdea] = useState("");
  const [mates, setMates] = useState<string[]>([]);
  const [mateInput, setMateInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addMate() {
    const reg = mateInput.trim().toUpperCase();
    if (!reg) return;
    if (reg === student.registrationNumber.toUpperCase()) {
      setError("You are added automatically as the team lead.");
      return;
    }
    if (mates.includes(reg)) {
      setError(`${reg} is already on the list.`);
      return;
    }
    if (mates.length >= 4) {
      setError("A group can have at most 5 students including you.");
      return;
    }
    setMates([...mates, reg]);
    setMateInput("");
    setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    let groupId: string;
    try {
      groupId = await repo.createGroup({
        name: name.trim(),
        projectTitle: title.trim(),
        projectIdea: idea.trim(),
        domain: domain.trim(),
        memberRegistrationNumbers: mates,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the group.");
      setBusy(false);
      return;
    }
    try {
      await repo.requestMentor({ groupId, facultyId: teacher.id, message, form });
    } catch (e) {
      // The group exists; the team lead can send the form again from the group page.
      setError(
        `Your group was created, but the application could not be sent: ${
          e instanceof Error ? e.message : "unknown error"
        }. Send it again from your group page.`,
      );
    }
    await onDone();
  }

  return (
    <Card>
      <CardHeader
        title="Group registration"
        description={`You are the team lead. Your request goes to ${teacher.fullName} with the signed application, and each teammate gets an invitation to accept.`}
      />
      <form onSubmit={submit}>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Group name" htmlFor="gf-name">
            <Input id="gf-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Team Kisan" />
          </Field>
          <Field label="Domain" htmlFor="gf-domain">
            <Input id="gf-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Machine Learning" />
          </Field>
          <Field label="Project title" htmlFor="gf-title" className="sm:col-span-2">
            <Input id="gf-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Project idea" htmlFor="gf-idea" help="A short brief — your supervisor sees it with the application." className="sm:col-span-2">
            <Textarea id="gf-idea" rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} />
          </Field>

          <div className="sm:col-span-2">
            <Field
              label="Teammates"
              htmlFor="gf-mate"
              help={`Add each teammate's registration number (up to 4). You (${student.registrationNumber}) are the team lead.`}
            >
              <div className="flex gap-2">
                <Input
                  id="gf-mate"
                  value={mateInput}
                  inputMode="numeric"
                  onChange={(e) => setMateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMate();
                    }
                  }}
                  placeholder="e.g. 2427010030"
                />
                <Button type="button" variant="secondary" onClick={addMate}>
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>
            </Field>
            {mates.length > 0 ? (
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {mates.map((reg) => (
                  <li
                    key={reg}
                    className="tnum inline-flex items-center gap-1.5 rounded-full bg-azure-50 px-3 py-1 text-[12.5px] text-ink-800"
                  >
                    {reg}
                    <button
                      type="button"
                      onClick={() => setMates(mates.filter((m) => m !== reg))}
                      className="text-stone-400 hover:text-clay-500"
                      aria-label={`Remove ${reg}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="rounded-[12px] bg-ivory-100/80 px-3.5 py-2.5 text-[12.5px] text-stone-600 sm:col-span-2">
            Supervisor: <span className="font-medium text-ink-900">{teacher.fullName}</span> · Application:{" "}
            <span className="font-medium text-ink-900">{form.name}</span>
          </div>

          {error ? <p role="alert" className="text-[13px] text-clay-500 sm:col-span-2">{error}</p> : null}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            <Button type="submit" loading={busy}>
              <Send className="size-3.5" />
              Register group and send request
            </Button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}
