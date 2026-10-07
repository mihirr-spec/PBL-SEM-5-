"use client";

import { FacultyDirectory } from "@/components/shared/faculty-directory";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminDirectoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Directory" title="MUJ" emphasis="faculty." description="Every faculty member, by department, with email and expertise." art="avenue" />
      <FacultyDirectory />
    </div>
  );
}
