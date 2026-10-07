/**
 * Domain model for the PBL Management Platform.
 *
 * V1 implements only what the Student Portal needs, but the shapes are
 * designed so the Faculty (V2), Supervisor (V2.5) and Monitoring (V3)
 * modules can be layered on without reshaping existing entities.
 *
 * Forward-looking entities that are deliberately NOT implemented yet:
 *   coordinator_preferences, weekly_progress, certificates,
 *   questions, answers, marks, evaluations
 * Each has a natural foreign key into the entities defined below
 * (studentId / projectId / facultyId).
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
  userId: string;

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

  /** Current PBL assignment. Null before allocation (V2.5 flow). */
  projectId: string | null;
  coordinatorId: string | null;
}

export interface Faculty {
  id: string;
  userId: string;
  fullName: string;
  facultyId: string;
  department: string;
  designation: string;
  email: string;
  contactNumber: string;
  officeLocation: string;
  avatarUrl?: string;
}

export type ProjectStatus =
  | "proposed"
  | "active"
  | "under_review"
  | "completed"
  | "on_hold";

export interface TeamMember {
  studentId: string;
  fullName: string;
  registrationNumber: string;
  /** Role within the team — free text so teams can self-describe. */
  teamRole: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: ProjectStatus;
  /** 0–100. Recomputed from milestones once V1.1 lands. */
  progress: number;
  startDate: string;
  expectedCompletionDate: string;
  coordinatorId: string;
  supervisorId: string;
  teamId: string;
  repositoryUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  projectId: string;
  members: TeamMember[];
  leadStudentId: string;
}

export type SubmissionStatus =
  | "pending"
  | "submitted"
  | "under_review"
  | "overdue";

export type DeadlineKind =
  | "weekly_progress"
  | "review"
  | "document"
  | "certificate"
  | "presentation";

export interface Deadline {
  id: string;
  projectId: string;
  /** Scoped to a student when the task is individual rather than team-wide. */
  studentId?: string;
  title: string;
  description: string;
  kind: DeadlineKind;
  dueDate: string;
  status: SubmissionStatus;
  /** Set once the student submits. Hook for V1.1 file uploads. */
  submittedAt?: string;
  weightage?: number;
}

export type Priority = "normal" | "important" | "urgent";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  postedByName: string;
  postedByRole: Role;
  postedAt: string;
  priority: Priority;
  attachment?: { name: string; sizeLabel: string; url: string };
  /** Null = platform-wide. Set = scoped to one project's team. */
  projectId: string | null;
}

export type NotificationKind =
  | "deadline"
  | "announcement"
  | "submission"
  | "feedback"
  | "profile";

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
