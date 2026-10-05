import { Mail, MapPin, Phone } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { ReadOnlyField } from "@/components/ui/field";
import type { Faculty } from "@/lib/types";

export function MentorCard({ coordinator }: { coordinator: Faculty | null }) {
  if (!coordinator) {
    return (
      <Card>
        <CardHeader title="Faculty mentor" />
        <EmptyState
          title="No coordinator assigned"
          description="A PBL coordinator will be allocated to you shortly."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Faculty mentor"
        description="Your PBL coordinator for this semester."
      />
      <CardBody className="space-y-5">
        <div className="flex items-center gap-3.5">
          <Avatar name={coordinator.fullName} size="lg" />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight text-stone-800">
              {coordinator.fullName}
            </p>
            <p className="text-[12.5px] text-stone-500">
              {coordinator.designation}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ReadOnlyField label="Faculty ID" value={coordinator.facultyId} />
          <ReadOnlyField label="Department" value={coordinator.department} />
        </div>

        <ul className="space-y-2.5 border-t border-sand-200/80 pt-4 text-[13px]">
          <li className="flex items-center gap-2.5 text-stone-600">
            <Mail className="size-4 shrink-0 text-stone-400" />
            <a
              href={`mailto:${coordinator.email}`}
              className="truncate hover:text-azure-600 hover:underline"
            >
              {coordinator.email}
            </a>
          </li>
          <li className="flex items-center gap-2.5 text-stone-600">
            <Phone className="size-4 shrink-0 text-stone-400" />
            <span className="tnum">{coordinator.contactNumber}</span>
          </li>
          <li className="flex items-start gap-2.5 text-stone-600">
            <MapPin className="mt-0.5 size-4 shrink-0 text-stone-400" />
            <span>{coordinator.officeLocation}</span>
          </li>
        </ul>
      </CardBody>
    </Card>
  );
}
