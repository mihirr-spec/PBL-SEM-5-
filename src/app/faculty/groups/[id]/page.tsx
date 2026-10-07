"use client";

import { useParams } from "next/navigation";

import { GroupDetail } from "@/components/staff/group-detail";

export default function FacultyGroupPage() {
  const { id } = useParams<{ id: string }>();
  return <GroupDetail groupId={id} />;
}
