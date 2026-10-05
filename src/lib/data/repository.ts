import {
  announcements,
  deadlines,
  demoPassword,
  faculty,
  notifications,
  projects,
  students,
  teams,
  users,
} from "@/lib/data/seed";
import type {
  Announcement,
  Deadline,
  Faculty,
  Notification,
  Project,
  Student,
  Team,
  User,
} from "@/lib/types";

/**
 * Data access boundary.
 *
 * Every page and component reads through these functions and never touches
 * the seed arrays directly. Each one is async, so swapping the body for a
 * `fetch` / Prisma / Supabase call later requires no change to any caller.
 */

const clone = <T>(value: T): T => structuredClone(value);

/** Simulated latency, so loading states are exercised during development. */
const settle = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(clone(value)), 120));

/* ----------------------------- auth ----------------------------- */

export interface Credentials {
  email: string;
  password: string;
}

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

export async function authenticate({
  email,
  password,
}: Credentials): Promise<AuthResult> {
  await new Promise((r) => setTimeout(r, 450));

  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user || password !== demoPassword) {
    return { ok: false, error: "Incorrect email or password. Please try again." };
  }

  if (user.role !== "student") {
    return {
      ok: false,
      error:
        "The Faculty and Supervisor portals are not available in this release.",
    };
  }

  return { ok: true, user: clone({ ...user, lastLoginAt: new Date().toISOString() }) };
}

export async function getUser(userId: string): Promise<User | null> {
  return settle(users.find((u) => u.id === userId) ?? null);
}

/* --------------------------- students --------------------------- */

export async function getStudentByUserId(userId: string): Promise<Student | null> {
  return settle(students.find((s) => s.userId === userId) ?? null);
}

export async function getStudent(studentId: string): Promise<Student | null> {
  return settle(students.find((s) => s.id === studentId) ?? null);
}

/** Fields a student is permitted to change. Academic data is excluded by design. */
export type EditableStudentFields = Pick<
  Student,
  | "fullName"
  | "dateOfBirth"
  | "gender"
  | "contactNumber"
  | "personalEmail"
  | "address"
  | "avatarUrl"
>;

export async function updateStudent(
  studentId: string,
  patch: Partial<EditableStudentFields>,
): Promise<Student> {
  await new Promise((r) => setTimeout(r, 400));
  const index = students.findIndex((s) => s.id === studentId);
  if (index === -1) throw new Error(`Unknown student: ${studentId}`);
  students[index] = { ...students[index], ...patch };
  return clone(students[index]);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await new Promise((r) => setTimeout(r, 450));
  if (!users.some((u) => u.id === userId)) {
    return { ok: false, error: "Account not found." };
  }
  if (currentPassword !== demoPassword) {
    return { ok: false, error: "Your current password is incorrect." };
  }
  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  return { ok: true };
}

/* ---------------------------- faculty --------------------------- */

export async function getFaculty(facultyId: string | null): Promise<Faculty | null> {
  if (!facultyId) return null;
  return settle(faculty.find((f) => f.id === facultyId) ?? null);
}

/* ---------------------------- projects -------------------------- */

export async function getProject(projectId: string | null): Promise<Project | null> {
  if (!projectId) return null;
  return settle(projects.find((p) => p.id === projectId) ?? null);
}

export async function getTeamForProject(projectId: string): Promise<Team | null> {
  return settle(teams.find((t) => t.projectId === projectId) ?? null);
}

/* --------------------------- deadlines -------------------------- */

export async function getDeadlines(
  projectId: string | null,
  studentId?: string,
): Promise<Deadline[]> {
  if (!projectId) return [];
  const rows = deadlines
    .filter(
      (d) =>
        d.projectId === projectId &&
        (d.studentId === undefined || d.studentId === studentId),
    )
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  return settle(rows);
}

/** Placeholder for the V1.1 upload flow — records intent, no file handling yet. */
export async function markDeadlineSubmitted(
  deadlineId: string,
): Promise<Deadline> {
  await new Promise((r) => setTimeout(r, 400));
  const index = deadlines.findIndex((d) => d.id === deadlineId);
  if (index === -1) throw new Error(`Unknown deadline: ${deadlineId}`);
  deadlines[index] = {
    ...deadlines[index],
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };
  return clone(deadlines[index]);
}

/* ------------------------- announcements ------------------------ */

export async function getAnnouncements(
  projectId: string | null,
): Promise<Announcement[]> {
  const rows = announcements
    .filter((a) => a.projectId === null || a.projectId === projectId)
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
  return settle(rows);
}

/* ------------------------- notifications ------------------------ */

export async function getNotifications(userId: string): Promise<Notification[]> {
  const rows = notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return settle(rows);
}

export async function setNotificationRead(
  notificationId: string,
  read: boolean,
): Promise<void> {
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) notifications[index] = { ...notifications[index], read };
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  notifications.forEach((n, i) => {
    if (n.userId === userId) notifications[i] = { ...n, read: true };
  });
}
