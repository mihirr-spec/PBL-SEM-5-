import { supabase } from "@/lib/supabase/client";
import type {
  Announcement,
  Deadline,
  Faculty,
  Notification,
  Project,
  Role,
  Student,
  Team,
  User,
} from "@/lib/types";

/**
 * Data access boundary.
 *
 * Every page and component reads through these functions and never talks to
 * Supabase directly. Queries run as the signed-in user, so the database's
 * row-level security — not this file — decides what each role may see or
 * change. Rows come back in snake_case and are mapped to the domain types.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- rows are mapped field by field below */

function fail(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

const toStudent = (r: any): Student => ({
  id: r.id,
  userId: r.user_id,
  fullName: r.full_name,
  dateOfBirth: r.date_of_birth ?? "",
  gender: r.gender ?? "prefer_not_to_say",
  contactNumber: r.contact_number,
  personalEmail: r.personal_email,
  address: r.address,
  avatarUrl: r.avatar_url ?? undefined,
  registrationNumber: r.registration_number,
  universityEmail: r.university_email,
  programme: r.programme,
  branch: r.branch,
  specialization: r.specialization,
  semester: r.semester,
  section: r.section,
  batch: r.batch,
  cgpa: Number(r.cgpa),
  projectId: r.project_id,
  coordinatorId: r.coordinator_id,
});

const toFaculty = (r: any): Faculty => ({
  id: r.id,
  userId: r.user_id,
  fullName: r.full_name,
  facultyId: r.faculty_code,
  department: r.department,
  designation: r.designation,
  email: r.email,
  contactNumber: r.contact_number,
  officeLocation: r.office_location,
  avatarUrl: r.avatar_url ?? undefined,
});

const toProject = (r: any): Project => ({
  id: r.id,
  title: r.title,
  description: r.description,
  domain: r.domain,
  status: r.status,
  progress: r.progress,
  startDate: r.start_date,
  expectedCompletionDate: r.expected_completion_date,
  coordinatorId: r.coordinator_id,
  supervisorId: r.supervisor_id,
  teamId: r.team_id,
  repositoryUrl: r.repository_url ?? undefined,
});

const toDeadline = (r: any): Deadline => ({
  id: r.id,
  projectId: r.project_id,
  studentId: r.student_id ?? undefined,
  title: r.title,
  description: r.description,
  kind: r.kind,
  dueDate: r.due_date,
  status: r.status,
  submittedAt: r.submitted_at ?? undefined,
  weightage: r.weightage ?? undefined,
  filePath: r.file_path ?? undefined,
  fileName: r.file_name ?? undefined,
});

const toAnnouncement = (r: any): Announcement => ({
  id: r.id,
  title: r.title,
  body: r.body,
  postedByName: r.posted_by_name,
  postedByRole: r.posted_by_role,
  postedAt: r.posted_at,
  priority: r.priority,
  attachment: r.attachment_name
    ? {
        name: r.attachment_name,
        sizeLabel: r.attachment_size_label ?? "",
        url: r.attachment_url ?? "#",
      }
    : undefined,
  projectId: r.project_id,
});

const toNotification = (r: any): Notification => ({
  id: r.id,
  userId: r.user_id,
  kind: r.kind,
  title: r.title,
  body: r.body,
  createdAt: r.created_at,
  read: r.read,
  href: r.href ?? undefined,
});

/* ----------------------------- auth ----------------------------- */

export interface Credentials {
  email: string;
  password: string;
  /** Roles the chosen sign-in tab accepts; omitted means any role. */
  roles?: Role[];
}

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

const ROLE_LABEL: Record<Role, string> = {
  student: "a student",
  faculty: "a teacher",
  supervisor: "a teacher",
  admin: "an administrator",
};

/** Builds the app's User from the auth account plus its profiles row. */
export async function loadUser(
  authUserId: string,
  lastLoginAt?: string | null,
): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, display_name, profile_id, avatar_url")
    .eq("id", authUserId)
    .maybeSingle();
  fail(error, "Loading profile");
  if (!data) return null;
  return {
    id: data.id,
    email: data.email,
    role: data.role,
    displayName: data.display_name,
    profileId: data.profile_id,
    avatarUrl: data.avatar_url ?? undefined,
    lastLoginAt: lastLoginAt ?? undefined,
  };
}

export async function authenticate({
  email,
  password,
  roles,
}: Credentials): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) {
    return { ok: false, error: "Incorrect email or password. Please try again." };
  }

  const user = await loadUser(data.user.id, data.user.last_sign_in_at);
  if (!user) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "This account has no portal profile yet. Contact your PBL coordinator.",
    };
  }

  if (roles && !roles.includes(user.role)) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: `This is ${ROLE_LABEL[user.role]} account — switch to the matching tab above to sign in.`,
    };
  }

  return { ok: true, user };
}

export async function signOutEverywhere(): Promise<void> {
  await supabase.auth.signOut();
}

/* --------------------------- students --------------------------- */

export async function getStudentByUserId(userId: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  fail(error, "Loading student");
  return data ? toStudent(data) : null;
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

const EDITABLE_COLUMNS: Record<keyof EditableStudentFields, string> = {
  fullName: "full_name",
  dateOfBirth: "date_of_birth",
  gender: "gender",
  contactNumber: "contact_number",
  personalEmail: "personal_email",
  address: "address",
  avatarUrl: "avatar_url",
};

export async function updateStudent(
  studentId: string,
  patch: Partial<EditableStudentFields>,
): Promise<Student> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const column = EDITABLE_COLUMNS[key as keyof EditableStudentFields];
    if (!column) continue;
    // A removed photo or emptied date is stored as null; text fields as "".
    const nullable = key === "avatarUrl" || key === "dateOfBirth" || key === "gender";
    row[column] = nullable && (value === undefined || value === "") ? null : (value ?? "");
  }
  const { data, error } = await supabase
    .from("students")
    .update(row)
    .eq("id", studentId)
    .select("*")
    .single();
  fail(error, "Saving profile");
  return toStudent(data);
}

/** Uploads a profile photo to the public `avatars` bucket and returns its URL. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: false });
  fail(error, "Uploading photo");
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  // Re-check the current password before allowing the change.
  const check = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (check.error) {
    return { ok: false, error: "Your current password is incorrect." };
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ---------------------------- faculty --------------------------- */

export async function getFaculty(facultyId: string | null): Promise<Faculty | null> {
  if (!facultyId) return null;
  const { data, error } = await supabase
    .from("faculty")
    .select("*")
    .eq("id", facultyId)
    .maybeSingle();
  fail(error, "Loading faculty");
  return data ? toFaculty(data) : null;
}

/* ---------------------------- projects -------------------------- */

export async function getProject(projectId: string | null): Promise<Project | null> {
  if (!projectId) return null;
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  fail(error, "Loading project");
  return data ? toProject(data) : null;
}

export async function getTeamForProject(projectId: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, project_id, lead_student_id, team_members(*)")
    .eq("project_id", projectId)
    .maybeSingle();
  fail(error, "Loading team");
  if (!data) return null;
  const members = [...((data as any).team_members ?? [])]
    .sort((a: any, b: any) => a.position - b.position)
    .map((m: any) => ({
      studentId: m.student_id,
      fullName: m.full_name,
      registrationNumber: m.registration_number,
      teamRole: m.team_role,
      avatarUrl: m.avatar_url ?? undefined,
    }));
  return {
    id: data.id,
    name: data.name,
    projectId: data.project_id,
    leadStudentId: data.lead_student_id,
    members,
  };
}

/* --------------------------- deadlines -------------------------- */

export async function getDeadlines(projectId: string | null): Promise<Deadline[]> {
  if (!projectId) return [];
  // Row-level security already limits rows to this student's own tasks.
  const { data, error } = await supabase
    .from("deadlines")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true });
  fail(error, "Loading deadlines");
  return (data ?? []).map(toDeadline);
}

/**
 * Uploads the submission file (when one is given) to the private
 * `submissions` bucket, then marks the task submitted.
 */
export async function markDeadlineSubmitted(
  deadline: Pick<Deadline, "id" | "projectId">,
  file?: File,
): Promise<Deadline> {
  let filePath: string | null = null;
  if (file) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    filePath = `${deadline.projectId}/${deadline.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("submissions")
      .upload(filePath, file, { contentType: file.type, upsert: false });
    fail(error, "Uploading submission");
  }

  const { data, error } = await supabase
    .from("deadlines")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      ...(file ? { file_path: filePath, file_name: file.name } : {}),
    })
    .eq("id", deadline.id)
    .select("*")
    .single();
  fail(error, "Recording submission");
  return toDeadline(data);
}

/** Short-lived link to a private submission file. */
export async function getSubmissionUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("submissions")
    .createSignedUrl(filePath, 60 * 10);
  fail(error, "Opening submission");
  return data!.signedUrl;
}

/* ------------------------- announcements ------------------------ */

export async function getAnnouncements(): Promise<Announcement[]> {
  // Row-level security returns general notices plus this team's own.
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("posted_at", { ascending: false });
  fail(error, "Loading announcements");
  return (data ?? []).map(toAnnouncement);
}

/* ------------------------- notifications ------------------------ */

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  fail(error, "Loading notifications");
  return (data ?? []).map(toNotification);
}

export async function setNotificationRead(
  notificationId: string,
  read: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read })
    .eq("id", notificationId);
  fail(error, "Updating notification");
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  fail(error, "Updating notifications");
}

/* ----------------------------- staff ----------------------------- */

/** A project with its coordinator's and supervisor's names, for staff dashboards. */
export interface ProjectSummary {
  project: Project;
  coordinatorName: string;
  supervisorName: string;
}

export async function listProjects(facultyId?: string): Promise<ProjectSummary[]> {
  let query = supabase
    .from("projects")
    .select(
      "*, coordinator:faculty!projects_coordinator_id_fkey(full_name), supervisor:faculty!projects_supervisor_id_fkey(full_name)",
    )
    .order("title");
  if (facultyId) {
    query = query.or(`coordinator_id.eq.${facultyId},supervisor_id.eq.${facultyId}`);
  }
  const { data, error } = await query;
  fail(error, "Loading projects");
  return (data ?? []).map((r: any) => ({
    project: toProject(r),
    coordinatorName: r.coordinator?.full_name ?? "Unassigned",
    supervisorName: r.supervisor?.full_name ?? "Unassigned",
  }));
}

export interface Overview {
  students: number;
  faculty: number;
  projects: number;
  openDeadlines: number;
}

export async function getOverview(): Promise<Overview> {
  const count = async (table: string, filter?: (q: any) => any) => {
    let query: any = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) query = filter(query);
    const { count: n, error } = await query;
    fail(error, `Counting ${table}`);
    return n ?? 0;
  };
  const [students, faculty, projects, openDeadlines] = await Promise.all([
    count("students"),
    count("faculty"),
    count("projects"),
    count("deadlines", (q) => q.in("status", ["pending", "overdue"])),
  ]);
  return { students, faculty, projects, openDeadlines };
}
