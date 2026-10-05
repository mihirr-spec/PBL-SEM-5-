import { ArrowUpRight } from "lucide-react";

import { Art } from "@/components/layout/art";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import type { Student } from "@/lib/types";

/** "Who am I?" — the first question the dashboard has to answer. */
export function IdentityCard({ student }: { student: Student }) {
  const facts: Array<[string, string]> = [
    ["Programme", student.programme],
    ["Branch", student.branch],
    ["Specialization", student.specialization],
    ["Semester", `Semester ${student.semester}`],
    ["Section", `Section ${student.section}`],
    ["Batch", student.batch],
  ];

  return (
    <section className="relative isolate overflow-hidden rounded-[20px] border border-white/70 bg-white/65 shadow-[0_20px_50px_-30px_rgba(61,78,92,0.45)] backdrop-blur-xl">
      <Art
        name="avenue"
        fade="left"
        sizes="420px"
        className="absolute top-0 right-0 -z-10 h-[7.5rem] w-[55%] object-[right_center] opacity-70 sm:w-[40%]"
      />
      <div className="flex flex-wrap items-center gap-5 px-5 pt-5 pb-4 sm:px-6">
        <Avatar name={student.fullName} src={student.avatarUrl} size="xl" />

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl tracking-tight text-ink-900 sm:text-2xl">
            {student.fullName}
          </h2>
          <p className="tnum mt-0.5 text-[13px] text-stone-500">
            {student.registrationNumber}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11.5px] font-medium text-stone-600 ring-1 ring-white ring-inset">
            CGPA
            <span className="tnum font-bold text-azure-600">
              {student.cgpa.toFixed(2)}
            </span>
          </p>
        </div>

        <ButtonLink href="/student/profile" variant="secondary" size="sm" className="bg-white/80 backdrop-blur-md">
          View profile
          <ArrowUpRight className="size-3.5" />
        </ButtonLink>
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-white/70 bg-white/50 sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="bg-white/55 px-5 py-3 sm:px-6">
            <dt className="text-[10.5px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
              {label}
            </dt>
            <dd className="mt-1 truncate text-[13px] font-medium text-stone-800">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
