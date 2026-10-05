"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useSession } from "@/lib/auth/session";
import * as repo from "@/lib/data/repository";
import type {
  Announcement,
  Deadline,
  Faculty,
  Notification,
  Project,
  Student,
  Team,
} from "@/lib/types";

/**
 * Loads everything the signed-in student's portal needs, once, and exposes
 * it plus the mutations that write back through the repository. Pages stay
 * presentational; adding Faculty/Supervisor later means a sibling store with
 * the same shape rather than changes here.
 */

interface PortalData {
  student: Student | null;
  project: Project | null;
  team: Team | null;
  coordinator: Faculty | null;
  supervisor: Faculty | null;
  deadlines: Deadline[];
  announcements: Announcement[];
  notifications: Notification[];
}

interface PortalContextValue extends PortalData {
  loading: boolean;
  unreadCount: number;
  updateProfile: (
    patch: Partial<repo.EditableStudentFields>,
  ) => Promise<void>;
  submitDeadline: (deadlineId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const empty: PortalData = {
  student: null,
  project: null,
  team: null,
  coordinator: null,
  supervisor: null,
  deadlines: [],
  announcements: [],
  notifications: [],
};

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();

  /**
   * Holds the loaded payload together with the user it belongs to, so the
   * data for a signed-out (or newly switched) user is derived away rather
   * than cleared in an effect.
   */
  const [loaded, setLoaded] = useState<{ userId: string; data: PortalData } | null>(
    null,
  );

  const fresh = user != null && loaded?.userId === user.id;
  const data = fresh ? loaded.data : empty;
  const loading = user != null && !fresh;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      const student = await repo.getStudentByUserId(user.id);
      if (!student) {
        if (!cancelled) setLoaded({ userId: user.id, data: empty });
        return;
      }

      const project = await repo.getProject(student.projectId);
      const [team, coordinator, supervisor, deadlines, announcements, notifications] =
        await Promise.all([
          project ? repo.getTeamForProject(project.id) : Promise.resolve(null),
          repo.getFaculty(student.coordinatorId),
          repo.getFaculty(project?.supervisorId ?? null),
          repo.getDeadlines(student.projectId, student.id),
          repo.getAnnouncements(student.projectId),
          repo.getNotifications(user.id),
        ]);

      if (cancelled) return;
      setLoaded({
        userId: user.id,
        data: {
          student,
          project,
          team,
          coordinator,
          supervisor,
          deadlines,
          announcements,
          notifications,
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /** Applies an optimistic patch to the currently loaded payload. */
  const patchData = useCallback(
    (patch: (previous: PortalData) => PortalData) => {
      setLoaded((previous) =>
        previous ? { ...previous, data: patch(previous.data) } : previous,
      );
    },
    [],
  );

  const updateProfile = useCallback<PortalContextValue["updateProfile"]>(
    async (patch) => {
      if (!data.student) return;
      const updated = await repo.updateStudent(data.student.id, patch);
      patchData((previous) => ({ ...previous, student: updated }));
    },
    [data.student, patchData],
  );

  const submitDeadline = useCallback<PortalContextValue["submitDeadline"]>(
    async (deadlineId) => {
      const updated = await repo.markDeadlineSubmitted(deadlineId);
      patchData((previous) => ({
        ...previous,
        deadlines: previous.deadlines.map((d) =>
          d.id === updated.id ? updated : d,
        ),
      }));
    },
    [patchData],
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      await repo.setNotificationRead(id, true);
      patchData((previous) => ({
        ...previous,
        notifications: previous.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      }));
    },
    [patchData],
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await repo.markAllNotificationsRead(user.id);
    patchData((previous) => ({
      ...previous,
      notifications: previous.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, [user, patchData]);

  const unreadCount = useMemo(
    () => data.notifications.filter((n) => !n.read).length,
    [data.notifications],
  );

  const value = useMemo<PortalContextValue>(
    () => ({
      ...data,
      loading,
      unreadCount,
      updateProfile,
      submitDeadline,
      markNotificationRead,
      markAllRead,
    }),
    [
      data,
      loading,
      unreadCount,
      updateProfile,
      submitDeadline,
      markNotificationRead,
      markAllRead,
    ],
  );

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

export function usePortal(): PortalContextValue {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used inside a <PortalProvider>.");
  }
  return context;
}
