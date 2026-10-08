import { Avatar } from "@/components/ui/avatar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ReadOnlyField } from "@/components/ui/field";
import type { Student } from "@/lib/types";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** "Odd Semester 2026–27": odd semesters run July–December. */
export function academicTerm(semester: number, today = new Date()): string {
  const year = today.getFullYear();
  const startYear = today.getMonth() >= 6 ? year : year - 1;
  return `${semester % 2 === 1 ? "Odd" : "Even"} Semester ${startYear}–${String(startYear + 1).slice(2)}`;
}

/** The student's university record, as the PBL office holds it. */
export function StudentDetailsCard({ student }: { student: Student }) {
  return (
    <Card>
      <CardHeader
        title="Your details"
        description="From the university record. If something is wrong, tell the PBL office before you register your group."
      />
      <CardBody className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={student.fullName} src={student.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="font-display text-[1.35rem] tracking-tight text-ink-900">{student.fullName}</p>
            <p className="tnum text-[13px] text-stone-500">
              {student.registrationNumber} · {student.universityEmail}
            </p>
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          <ReadOnlyField
            label="Semester"
            value={`Semester ${ROMAN[student.semester] ?? student.semester} (${student.semester})`}
            locked
          />
          <ReadOnlyField label="Term" value={academicTerm(student.semester)} locked />
          <ReadOnlyField label="Section" value={student.section} locked />
          <ReadOnlyField label="Programme" value={student.programme} locked />
          <ReadOnlyField label="Branch" value={student.branch} locked />
          <ReadOnlyField label="Specialization" value={student.specialization} locked />
          <ReadOnlyField label="Batch" value={student.batch} locked />
          <ReadOnlyField label="Registration no." value={student.registrationNumber} locked />
          <ReadOnlyField label="University email" value={student.universityEmail} locked />
        </div>
      </CardBody>
    </Card>
  );
}
