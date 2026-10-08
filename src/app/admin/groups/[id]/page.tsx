"use client";

import { useParams } from "next/navigation";

import { GroupDetail } from "@/components/staff/group-detail";

export default function AdminGroupPage() {
  const { id } = useParams<{ id: string }>();
  return <GroupDetail groupId={id} isAdmin />;
}
