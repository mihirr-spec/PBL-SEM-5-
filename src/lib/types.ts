/**
 * Domain model for the PBL Management Platform.
 *
 * Three levels: students form groups and submit work, a supervisor (teacher)
 * mentors up to seven groups and grades them, and administrators oversee
 * everything and allocate mentors to groups that have none.
 */

export type Role = "student" | "faculty" | "supervisor" | "admin";

/** Account record. Role drives both routing and navigation. */
export interface User {
  id: string;
  email: string;
  role: Role;
  displayName: string;
  avatarUrl?: string;
  /** Links to the role-specific profile record (Student.id, Faculty.id, ...). */
  profileId: string;
  lastLoginAt?: string;
}

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export interface Student {
  id: string;
  userId: string | null;

  // Personal — student-editable
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  contactNumber: string;
  personalEmail: string;
  address: string;
  avatarUrl?: string;

  // Academic — university-controlled, read-only in the portal
  registrationNumber: string;
  universityEmail: string;
  programme: string;
  branch: string;
  specialization: string;
  semester: number;
  section: string;
  batch: string;
  cgpa: number;
}

export interface Faculty {
  id: string;
  userId: string | null;
  fullName: string;
  facultyId: string;
  department: string;
  designation: string;
  email: string;
  contactNumber: string;
  officeLocation: string;
  expertise: string;
  profileUrl?: string;
  /** True when this teacher has a portal login (can approve requests, grade). */
  onPortal: boolean;
  avatarUrl?: string;
}

export interface GroupMember {
  studentId: string;
  fullName: string;
  registrationNumber: string;
  email: string;
  teamRole: string;
  avatarUrl?: string;
}

export interface Group {
  id: string;
  /** Human-facing group number — "Group 4". */
  number: number;
  name: string;
  projectTitle: string;
  projectIdea: string;
  domain: string;
  progress: number;
  leaderStudentId: string;
  mentorId: string | null;
  assignedAt?: string;
  createdAt: string;
  members: GroupMember[];
}

export type RequestStatus = "pending" | "changes_requested" | "approved" | "rejected" | "closed";

export interface MentorRequest {
  id: string;
  groupId: string;
  facultyId: string;
  facultyName: string;
  message: string;
  status: RequestStatus;
  /** The signed PBL form, in the submissions bucket. */
  formPath?: string;
  formName?: string;
  /** The teacher's note: what to change, or why it was rejected. */
  reviewNote: string;
  createdAt: string;
  resubmittedAt?: string;
  decidedAt?: string;
}

export interface WeeklyReport {
  id: string;
  groupId: string;
  week: number;
  summary: string;
  filePath?: string;
  fileName?: string;
  submittedBy?: string;
  submittedAt: string;
  /** Out of 10, set by the mentor. */
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

export interface StudentGrade {
  id: string;
  studentId: string;
  title: string;
  score: number;
  maxScore: number;
  /** What the student should improve, written by the mentor. */
  improvements: string;
  createdAt: string;
}

export type TicketStatus = "open" | "resolved";

export interface Ticket {
  id: string;
  groupId: string;
  groupNumber?: number;
  studentId: string;
  studentName?: string;
  subject: string;
  body: string;
  status: TicketStatus;
  reply?: string;
  createdAt: string;
  repliedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** "all" — every student (admin); "mentor_groups" — the poster's own groups. */
  scope: "all" | "mentor_groups";
  postedByName: string;
  postedByRole: Role;
  attachmentPath?: string;
  attachmentName?: string;
  createdAt: string;
}

export type NotificationKind =
  | "announcement"
  | "report"
  | "grade"
  | "ticket"
  | "request"
  | "group"
  | "profile"
  | "deadline"
  | "submission"
  | "feedback";

export interface Notification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** In-app destination for the notification's primary action. */
  href?: string;
}
