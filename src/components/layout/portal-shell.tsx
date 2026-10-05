"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { PortalBackdrop } from "@/components/layout/portal-backdrop";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { HOME_BY_ROLE, useSession } from "@/lib/auth/session";
import { PortalProvider } from "@/lib/data/portal-store";
import type { Role } from "@/lib/types";

function FullPageSpinner() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center">
      <PortalBackdrop />
      <Loader2 className="size-6 animate-spin text-ink-700" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

/**
 * Role-gated application shell. Each role's route group wraps its pages in
 * this with its own `role`, so Faculty and Supervisor portals reuse the whole
 * layout, guard and chrome without duplication.
 */
export function PortalShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user, loading } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== role) {
      router.replace(HOME_BY_ROLE[user.role]);
    }
  }, [loading, user, role, router]);

  if (loading || !user || user.role !== role) return <FullPageSpinner />;

  return (
    <PortalProvider>
      <div className="relative isolate min-h-screen">
        <PortalBackdrop />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-[264px]">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </PortalProvider>
  );
}
