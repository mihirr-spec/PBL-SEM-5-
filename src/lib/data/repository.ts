import { supabase } from "@/lib/supabase/client";
import type {
  Announcement,
  Faculty,
  Group,
  GroupMember,
  MentorRequest,
  Notification,
  Role,
  Student,
  StudentGrade,
  Ticket,
  User,
  WeeklyReport,
} from "@/lib/types";

/**
 * Data access boundary.
 *
 * Every page reads and writes through these functions. Queries run as the
 * signed-in user, so row-level security in the database decides what each
 * role may see; actions with rules attached (forming a group, approving a
 * mentor request, grading) are database functions that check the caller.
 * Errors carry the database's own message so screens can show it as-is.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- rows are mapped field by field below */

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------- mappers */

const toStudent = (r: any): Student => ({
  id: r.id,
  userId: r.user_id,
  fullName: r.full_name,
  dateOfBirth: r.date_of_birth ?? "",
  gender: r.gender ?? "prefer_not_to_say",
  contactNumber: r.contact_number ?? "",
  personalEmail: r.personal_email ?? "",
  address: r.address ?? "",
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
});

const toFaculty = (r: any): Faculty => ({
  id: r.id,
  userId: r.user_id ?? null,
  fullName: r.full_name,
  facultyId: r.faculty_code ?? "",
  department: r.department,
  designation: r.designation,
  email: r.email ?? "",
  contactNumber: r.contact_number ?? "",
  officeLocation: r.office_location ?? "",
  expertise: r.expertise ?? "",
  profileUrl: r.profile_url ?? undefined,
  onPortal: r.user_id != null,
  avatarUrl: r.avatar_url ?? undefined,
});

const GROUP_SELECT =
  "*, group_members(student_id, team_role, students(full_name, registration_number, university_email, avatar_url))";

const toGroup = (r: any): Group => ({
  id: r.id,
  number: r.number,
  name: r.name,
  projectTitle: r.project_title,
  projectIdea: r.project_idea,
  domain: r.domain,
  progress: r.progress,
  leaderStudentId: r.leader_student_id,
  mentorId: r.mentor_id,
  assignedAt: r.assigned_at ?? undefined,
  createdAt: r.created_at,
  members: (r.group_members ?? [])
    .map(
      (m: any): GroupMember => ({
        studentId: m.student_id,
        fullName: m.students?.full_name ?? "Student",
        registrationNumber: m.students?.registration_number ?? "",
        email: m.students?.university_email ?? "",
        teamRole: m.team_role,
        avatarUrl: m.students?.avatar_url ?? undefined,
      }),
    )
    // Leader first, then alphabetical.
    .sort((a: GroupMember, b: GroupMember) =>
      a.studentId === r.leader_student_id
        ? -1
        : b.studentId === r.leader_student_id
          ? 1
          : a.fullName.localeCompare(b.fullName),
    ),
});

const toReport = (r: any): WeeklyReport => ({
  id: r.id,
  groupId: r.group_id,
  week: r.week,
  summary: r.summary,
  filePath: r.file_path ?? undefined,
  fileName: r.file_name ?? undefined,
  submittedBy: r.submitted_by ?? undefined,
  submittedAt: r.submitted_at,
  grade: r.grade == null ? undefined : Number(r.grade),
  feedback: r.feedback ?? undefined,
  gradedAt: r.graded_at ?? undefined,
});

const toGrade = (r: any): StudentGrade => ({
  id: r.id,
  studentId: r.student_id,
  title: r.title,
  score: Number(r.score),
  maxScore: Number(r.max_score),
  improvements: r.improvements,
  createdAt: r.created_at,
});

const toTicket = (r: any): Ticket => ({
  id: r.id,
  groupId: r.group_id,
  groupNumber: r.groups?.number,
  studentId: r.student_id,
  studentName: r.students?.full_name,
  subject: r.subject,
  body: r.body,
  status: r.status,
  reply: r.reply ?? undefined,
  createdAt: r.created_at,
  repliedAt: r.replied_at ?? undefined,
});

const toAnnouncement = (r: any): Announcement => ({
  id: r.id,
  title: r.title,
  body: r.body,
  scope: r.scope,
  postedByName: r.posted_by_name,
  postedByRole: r.posted_by_role,
  attachmentPath: r.attachment_path ?? undefined,
  attachmentName: r.attachment_name ?? undefined,
  createdAt: r.created_at,
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

const safeFileName = (name: string) => name.replace(/[^\w.\-]+/g, "_");

/* ---------------------------------------------------------------- auth */

export interface Credentials {
  email: string;
  password: string;
  /** Roles the chosen sign-in tab accepts; omitted means any role. */
  roles?: Role[];
}

export type AuthResult = { ok: true; user: User } | { ok: false; error: string };

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
  fail(error);
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

export async function authenticate({ email, password, roles }: Credentials): Promise<AuthResult> {
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
    return { ok: false, error: "This account has no portal profile yet. Contact your PBL coordinator." };
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

export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  const check = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (check.error) return { ok: false, error: "Your current password is incorrect." };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------ students */

export async function getStudentByUserId(userId: string): Promise<Student | null> {
  const { data, error } = await supabase.from("students").select("*").eq("user_id", userId).maybeSingle();
  fail(error);
  return data ? toStudent(data) : null;
}

export async function getStudent(studentId: string): Promise<Student | null> {
  const { data, error } = await supabase.from("students").select("*").eq("id", studentId).maybeSingle();
  fail(error);
  return data ? toStudent(data) : null;
}

/** Fields a student is permitted to change. Academic data is excluded by design. */
export type EditableStudentFields = Pick<
  Student,
  "fullName" | "dateOfBirth" | "gender" | "contactNumber" | "personalEmail" | "address" | "avatarUrl"
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
  const { data, error } = await supabase.from("students").update(row).eq("id", studentId).select("*").single();
  fail(error);
  return toStudent(data);
}

/** Uploads a profile photo to the public `avatars` bucket and returns its URL. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
  fail(error);
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

/** Students who are not in any group yet (admin view). */
export async function listUngroupedStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*, group_members(group_id)")
    .order("full_name");
  fail(error);
  return (data ?? []).filter((r: any) => (r.group_members ?? []).length === 0).map(toStudent);
}

/* ------------------------------------------------------------- faculty */

export async function getFaculty(facultyId: string | null): Promise<Faculty | null> {
  if (!facultyId) return null;
  const { data, error } = await supabase.from("faculty").select("*").eq("id", facultyId).maybeSingle();
  fail(error);
  return data ? toFaculty(data) : null;
}

/** The whole directory (about 820 teachers) — filtered on the client. */
export async function listFaculty(): Promise<Faculty[]> {
  const { data, error } = await supabase
    .from("faculty")
    .select("*")
    .order("full_name")
    .range(0, 1999);
  fail(error);
  return (data ?? []).map(toFaculty);
}

/* -------------------------------------------------------------- groups */

export async function getGroup(groupId: string): Promise<Group | null> {
  const { data, error } = await supabase.from("groups").select(GROUP_SELECT).eq("id", groupId).maybeSingle();
  fail(error);
  return data ? toGroup(data) : null;
}

export async function getGroupForStudent(studentId: string): Promise<Group | null> {
  const { data: link, error } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("student_id", studentId)
    .maybeSingle();
  fail(error);
  return link ? getGroup(link.group_id) : null;
}

/** All groups, or just one teacher's. Includes members and the mentor's name. */
export async function listGroups(
  mentorId?: string,
): Promise<Array<Group & { mentorName?: string }>> {
  let query = supabase
    .from("groups")
    .select(`${GROUP_SELECT}, mentor:faculty(full_name)`)
    .order("number");
  if (mentorId) query = query.eq("mentor_id", mentorId);
  const { data, error } = await query;
  fail(error);
  return (data ?? []).map((r: any) => ({ ...toGroup(r), mentorName: r.mentor?.full_name ?? undefined }));
}

export async function createGroup(input: {
  name: string;
  projectTitle: string;
  projectIdea: string;
  domain: string;
  memberRegistrationNumbers: string[];
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_group", {
    p_name: input.name,
    p_project_title: input.projectTitle,
    p_project_idea: input.projectIdea,
    p_domain: input.domain,
    p_member_regs: input.memberRegistrationNumbers,
  });
  fail(error);
  return data as string;
}

/* ----------------------------------------------------- mentor requests */

export async function listRequestsForGroup(groupId: string): Promise<MentorRequest[]> {
  const { data, error } = await supabase
    .from("mentor_requests")
    .select("*, faculty(full_name)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  fail(error);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    groupId: r.group_id,
    facultyId: r.faculty_id,
    facultyName: r.faculty?.full_name ?? "",
    ...requestFields(r),
  }));
}

function requestFields(r: any) {
  return {
    message: r.message,
    status: r.status,
    formPath: r.form_path ?? undefined,
    formName: r.form_name ?? undefined,
    reviewNote: r.review_note ?? "",
    createdAt: r.created_at,
    resubmittedAt: r.resubmitted_at ?? undefined,
    decidedAt: r.decided_at ?? undefined,
  };
}

/** Requests sent to one teacher, each with the requesting group's details. */
export async function listRequestsForFaculty(
  facultyId: string,
): Promise<Array<MentorRequest & { group: Group | null }>> {
  const { data, error } = await supabase
    .from("mentor_requests")
    .select(`*, groups(${GROUP_SELECT})`)
    .eq("faculty_id", facultyId)
    .order("created_at", { ascending: false });
  fail(error);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    groupId: r.group_id,
    facultyId: r.faculty_id,
    facultyName: "",
    ...requestFields(r),
    group: r.groups ? toGroup(r.groups) : null,
  }));
}

async function uploadMentorForm(groupId: string, file: File) {
  const path = `${groupId}/mentor-form/${Date.now()}-${safeFileName(file.name)}`;
  const upload = await supabase.storage.from("submissions").upload(path, file, { contentType: file.type });
  fail(upload.error);
  return { p_form_path: path, p_form_name: file.name };
}

/** Team lead only: sends the signed PBL form to the agreed teacher. */
export async function requestMentor(input: {
  groupId: string;
  facultyId: string;
  message: string;
  form: File;
}): Promise<void> {
  const form = await uploadMentorForm(input.groupId, input.form);
  const { error } = await supabase.rpc("request_mentor", {
    p_faculty_id: input.facultyId,
    p_message: input.message,
    ...form,
  });
  fail(error);
}

/** Team lead only: sends a corrected form after the teacher asked for changes. */
export async function resubmitMentorRequest(input: {
  requestId: string;
  groupId: string;
  message: string;
  form: File;
}): Promise<void> {
  const form = await uploadMentorForm(input.groupId, input.form);
  const { error } = await supabase.rpc("resubmit_mentor_request", {
    p_request: input.requestId,
    p_message: input.message,
    ...form,
  });
  fail(error);
}

export type MentorDecision = "approve" | "reject" | "changes";

/** Returns "approved", "rejected", "changes_requested", "already_assigned" or "full". */
export async function reviewMentorRequest(requestId: string, decision: MentorDecision, note: string): Promise<string> {
  const { data, error } = await supabase.rpc("review_mentor_request", {
    p_request: requestId,
    p_decision: decision,
    p_note: note,
  });
  fail(error);
  return data as string;
}

export async function autoAllocateMentors(): Promise<number> {
  const { data, error } = await supabase.rpc("auto_allocate_mentors");
  fail(error);
  return data as number;
}

/* ------------------------------------------------------ weekly reports */

export async function listReports(groupId: string): Promise<WeeklyReport[]> {
  const { data, error } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("group_id", groupId)
    .order("week", { ascending: false });
  fail(error);
  return (data ?? []).map(toReport);
}

/** Submits (or, until graded, replaces) a group's report for one week. */
export async function submitReport(input: {
  groupId: string;
  studentId: string;
  week: number;
  summary: string;
  file?: File;
}): Promise<void> {
  let file: { file_path: string; file_name: string } | Record<string, never> = {};
  if (input.file) {
    const path = `${input.groupId}/week-${input.week}/${Date.now()}-${safeFileName(input.file.name)}`;
    const upload = await supabase.storage
      .from("submissions")
      .upload(path, input.file, { contentType: input.file.type });
    fail(upload.error);
    file = { file_path: path, file_name: input.file.name };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("weekly_reports")
    .select("id, grade")
    .eq("group_id", input.groupId)
    .eq("week", input.week)
    .maybeSingle();
  fail(lookupError);
  if (existing?.grade != null) {
    throw new Error(`Week ${input.week} has already been graded and can no longer be changed.`);
  }

  const { error } = existing
    ? await supabase
        .from("weekly_reports")
        .update({
          summary: input.summary,
          submitted_by: input.studentId,
          submitted_at: new Date().toISOString(),
          ...file,
        })
        .eq("id", existing.id)
    : await supabase.from("weekly_reports").insert({
        group_id: input.groupId,
        week: input.week,
        summary: input.summary,
        submitted_by: input.studentId,
        ...file,
      });
  fail(error);
}

/** group id → number of reports still awaiting a grade (within what the caller can see). */
export async function countUngradedReports(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("weekly_reports").select("group_id").is("grade", null);
  fail(error);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.group_id] = (counts[row.group_id] ?? 0) + 1;
  return counts;
}

export async function gradeReport(reportId: string, grade: number, feedback: string): Promise<void> {
  const { error } = await supabase.rpc("grade_report", {
    p_report: reportId,
    p_grade: grade,
    p_feedback: feedback,
  });
  fail(error);
}

/** Short-lived link to a private file (report or announcement attachment). */
export async function getFileUrl(bucket: "submissions" | "announcements", path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
  fail(error);
  return data!.signedUrl;
}

/* -------------------------------------------------------------- grades */

export async function listGrades(studentIds: string[]): Promise<StudentGrade[]> {
  if (studentIds.length === 0) return [];
  const { data, error } = await supabase
    .from("student_grades")
    .select("*")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false });
  fail(error);
  return (data ?? []).map(toGrade);
}

export async function gradeStudent(input: {
  studentId: string;
  title: string;
  score: number;
  maxScore: number;
  improvements: string;
}): Promise<void> {
  const { error } = await supabase.rpc("grade_student", {
    p_student: input.studentId,
    p_title: input.title,
    p_score: input.score,
    p_max: input.maxScore,
    p_improvements: input.improvements,
  });
  fail(error);
}

/* ------------------------------------------------------------- tickets */

/** Tickets the caller may see — their group's, their mentored groups', or all (admin). */
export async function listTickets(groupId?: string): Promise<Ticket[]> {
  let query = supabase
    .from("tickets")
    .select("*, groups(number), students(full_name)")
    .order("created_at", { ascending: false });
  if (groupId) query = query.eq("group_id", groupId);
  const { data, error } = await query;
  fail(error);
  return (data ?? []).map(toTicket);
}

export async function raiseTicket(input: {
  groupId: string;
  studentId: string;
  subject: string;
  body: string;
}): Promise<void> {
  const { error } = await supabase.from("tickets").insert({
    group_id: input.groupId,
    student_id: input.studentId,
    subject: input.subject,
    body: input.body,
  });
  fail(error);
}

export async function replyTicket(ticketId: string, reply: string, resolve: boolean): Promise<void> {
  const { error } = await supabase.rpc("reply_ticket", {
    p_ticket: ticketId,
    p_reply: reply,
    p_resolve: resolve,
  });
  fail(error);
}

/* ------------------------------------------------------- announcements */

export async function listAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  fail(error);
  return (data ?? []).map(toAnnouncement);
}

export async function postAnnouncement(input: {
  user: User;
  title: string;
  body: string;
  file?: File;
}): Promise<void> {
  let attachment: { attachment_path: string; attachment_name: string } | Record<string, never> = {};
  if (input.file) {
    const path = `${input.user.id}/${Date.now()}-${safeFileName(input.file.name)}`;
    const upload = await supabase.storage
      .from("announcements")
      .upload(path, input.file, { contentType: input.file.type });
    fail(upload.error);
    attachment = { attachment_path: path, attachment_name: input.file.name };
  }
  const isAdmin = input.user.role === "admin";
  const { error } = await supabase.from("announcements").insert({
    title: input.title,
    body: input.body,
    scope: isAdmin ? "all" : "mentor_groups",
    faculty_id: isAdmin ? null : input.user.profileId,
    posted_by: input.user.id,
    posted_by_name: input.user.displayName,
    posted_by_role: input.user.role,
    ...attachment,
  });
  fail(error);
}

/* ------------------------------------------------------- notifications */

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  fail(error);
  return (data ?? []).map(toNotification);
}

export async function setNotificationRead(notificationId: string, read: boolean): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read }).eq("id", notificationId);
  fail(error);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  fail(error);
}

/* --------------------------------------------------------------- admin */

export interface Overview {
  students: number;
  groups: number;
  unassignedGroups: number;
  teachersOnPortal: number;
  openTickets: number;
}

export async function getOverview(): Promise<Overview> {
  const count = async (table: string, filter?: (q: any) => any) => {
    let query: any = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) query = filter(query);
    const { count: n, error } = await query;
    fail(error);
    return n ?? 0;
  };
  const [students, groups, unassignedGroups, teachersOnPortal, openTickets] = await Promise.all([
    count("students"),
    count("groups"),
    count("groups", (q) => q.is("mentor_id", null)),
    count("faculty", (q) => q.not("user_id", "is", null)),
    count("tickets", (q) => q.eq("status", "open")),
  ]);
  return { students, groups, unassignedGroups, teachersOnPortal, openTickets };
}
