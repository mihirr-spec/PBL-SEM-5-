"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";

import { getFileUrl } from "@/lib/data/repository";
import { cn } from "@/lib/utils";

/** Opens a private storage file through a short-lived signed link. */
export function FileLink({
  bucket,
  path,
  name,
  className,
}: {
  bucket: "submissions" | "announcements";
  path: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  async function open() {
    setFailed(false);
    try {
      window.open(await getFileUrl(bucket, path), "_blank", "noopener");
    } catch {
      setFailed(true);
    }
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-lg border border-white/80 bg-white/75 px-3 py-1.5 text-[12.5px] text-ink-800 transition-colors hover:border-azure-100 hover:bg-azure-50",
        className,
      )}
    >
      <Paperclip className="size-3.5 shrink-0 text-azure-600" />
      <span className="truncate font-medium">{name}</span>
      {failed ? <span className="text-clay-500">· could not open</span> : null}
    </button>
  );
}
