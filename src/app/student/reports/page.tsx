"use client";

import { useRef, useState, type FormEvent } from "react";
import { FileText, Upload } from "lucide-react";

import { FileLink } from "@/components/shared/file-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import * as repo from "@/lib/data/repository";
import { usePortal } from "@/lib/data/portal-store";
import { useLoad } from "@/lib/use-load";
import { formatDateTime, timeAgo } from "@/lib/utils";

export default function ReportsPage() {
  const { loading, student, group } = usePortal();
  const reports = useLoad(() => repo.listReports(group!.id), group ? group.id : null);
  // Lives here, not in the form: the form remounts when the next week changes.
  const [submittedWeek, setSubmittedWeek] = useState<number | null>(null);

  if (loading || !student) return <PageSkeleton />;

  if (!group) {
    return (
      <div>
        <PageHeader eyebrow="Weekly Reports" title="Weekly" emphasis="reports." scene="reports" />
        <Card>
          <EmptyState title="Join a group first" description="Weekly reports are submitted per group." scene="reports" />
          <div className="pb-6 text-center">
            <ButtonLink href="/student/group" size="sm">Go to my group</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  const nextWeek = (reports.data?.[0]?.week ?? 0) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Weekly Reports"
        title="Weekly"
        emphasis="reports."
        description="One report per week for your whole group. You can replace a report until your supervisor grades it."
        scene="reports"
      />

      <SubmitReport
        key={nextWeek}
        groupId={group.id}
        studentId={student.id}
        defaultWeek={nextWeek}
        onSubmitted={(week) => {
          setSubmittedWeek(week);
          void reports.reload();
        }}
      />
      {submittedWeek != null ? (
        <p role="status" className="-mt-3 text-[13px] text-sage-500">
          Week {submittedWeek} report submitted — your supervisor has been notified.
        </p>
      ) : null}

      <Card>
        <CardHeader title="Submitted reports" />
        {!reports.data ? (
          <CardBody><p className="text-[13px] text-stone-500">Loading…</p></CardBody>
        ) : reports.data.length === 0 ? (
          <EmptyState icon={<FileText className="size-5" />} title="Nothing submitted yet" />
        ) : (
          <ul className="divide-y divide-sand-200/70">
            {reports.data.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[16px] text-ink-900">Week {r.week}</p>
                  <p className="text-[12px] text-stone-500" title={formatDateTime(r.submittedAt)}>
                    Submitted {timeAgo(r.submittedAt)}
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed whitespace-pre-line text-stone-600">{r.summary}</p>
                  {r.filePath && r.fileName ? (
                    <FileLink bucket="submissions" path={r.filePath} name={r.fileName} className="mt-2" />
                  ) : null}
                  {r.feedback ? (
                    <p className="mt-3 rounded-[12px] bg-azure-50/70 px-3 py-2 text-[13px] text-ink-800">
                      <span className="font-semibold">Supervisor feedback:</span> {r.feedback}
                    </p>
                  ) : null}
                </div>
                <div
                  className={
                    r.grade != null
                      ? "rounded-xl bg-sage-100 px-3 py-2 text-center text-sage-500"
                      : "rounded-xl bg-gold-50 px-3 py-2 text-center text-gold-600"
                  }
                >
                  <p className="tnum font-display text-xl leading-none">{r.grade ?? "—"}</p>
                  <p className="mt-1 text-[10.5px] font-semibold tracking-wide uppercase">
                    {r.grade != null ? "out of 10" : "not graded"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SubmitReport({
  groupId,
  studentId,
  defaultWeek,
  onSubmitted,
}: {
  groupId: string;
  studentId: string;
  defaultWeek: number;
  onSubmitted: (week: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [week, setWeek] = useState(String(defaultWeek));
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await repo.submitReport({
        groupId,
        studentId,
        week: Number(week),
        summary: summary.trim(),
        file: file ?? undefined,
      });
      setSummary("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onSubmitted(Number(week));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Submit a weekly report" description="Your supervisor is notified as soon as you submit." />
      <form onSubmit={submit}>
        <CardBody className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <Field label="Week" htmlFor="r-week">
            <Input id="r-week" type="number" min={1} max={30} required value={week} onChange={(e) => setWeek(e.target.value)} />
          </Field>
          <Field label="Report file (optional)" htmlFor="r-file" help="PDF, Word, PowerPoint, ZIP or images — up to 25 MB.">
            <input
              id="r-file"
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-azure-50 file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-azure-600"
            />
          </Field>
          <Field label="What did the group do this week?" htmlFor="r-summary" className="sm:col-span-2">
            <Textarea id="r-summary" rows={4} required value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Progress, blockers and next week's plan" />
          </Field>
          {error ? <p role="alert" className="text-[13px] text-clay-500 sm:col-span-2">{error}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" loading={busy}>
              <Upload className="size-3.5" />
              Submit report
            </Button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}
