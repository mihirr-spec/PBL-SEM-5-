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
 * Seed data for V1.
 *
 * This file is the ONLY place that knows records are in memory. Every
 * consumer goes through `@/lib/data/repository`, so replacing this with
 * a database or API client is a one-file change.
 */

/** Dates are generated relative to today so deadlines always demo correctly. */
const day = 86_400_000;
const from = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * day).toISOString();

export const users: User[] = [
  {
    id: "u-1001",
    email: "mihir.sanghvi@university.edu.in",
    role: "student",
    displayName: "Mihir Sanghvi",
    profileId: "s-2201",
    avatarUrl: undefined,
  },
  {
    id: "u-2001",
    email: "a.deshpande@university.edu.in",
    role: "faculty",
    displayName: "Dr. Anagha Deshpande",
    profileId: "f-301",
  },
  {
    id: "u-3001",
    email: "r.kulkarni@university.edu.in",
    role: "supervisor",
    displayName: "Dr. Ramesh Kulkarni",
    profileId: "f-302",
  },
  {
    id: "u-9001",
    email: "pbl.admin@university.edu.in",
    role: "admin",
    displayName: "PBL Office",
    profileId: "adm-1",
  },
];

export const faculty: Faculty[] = [
  {
    id: "f-301",
    userId: "u-2001",
    fullName: "Dr. Anagha Deshpande",
    facultyId: "FAC-CSE-0147",
    department: "Computer Science & Engineering",
    designation: "Associate Professor · PBL Coordinator",
    email: "a.deshpande@university.edu.in",
    contactNumber: "+91 98220 41178",
    officeLocation: "Block C, Cabin 214 · Mon–Fri, 2:00–4:00 PM",
  },
  {
    id: "f-302",
    userId: "u-3001",
    fullName: "Dr. Ramesh Kulkarni",
    facultyId: "FAC-CSE-0032",
    department: "Computer Science & Engineering",
    designation: "Professor & Head · PBL Supervisor",
    email: "r.kulkarni@university.edu.in",
    contactNumber: "+91 98220 10094",
    officeLocation: "Block C, Cabin 101",
  },
];

export const students: Student[] = [
  {
    id: "s-2201",
    userId: "u-1001",
    fullName: "Mihir Sanghvi",
    dateOfBirth: "2005-03-14",
    gender: "male",
    contactNumber: "+91 90280 14422",
    personalEmail: "sanghvimihir04@gmail.com",
    address: "14, Shantiniketan Residency, Civil Lines, Nagpur, Maharashtra 440001",
    registrationNumber: "URN-2023-CSE-1184",
    universityEmail: "mihir.sanghvi@university.edu.in",
    programme: "B.Tech",
    branch: "Computer Science & Engineering",
    specialization: "Artificial Intelligence & Machine Learning",
    semester: 5,
    section: "B",
    batch: "2023 – 2027",
    cgpa: 8.64,
    projectId: "p-501",
    coordinatorId: "f-301",
  },
];

export const projects: Project[] = [
  {
    id: "p-501",
    title: "AI-Based Crop Disease Detection",
    description:
      "A field-deployable system that identifies crop leaf diseases from smartphone photographs. A convolutional model trained on the PlantVillage corpus is distilled for on-device inference, wrapped in an offline-first mobile client so that farmers in low-connectivity districts receive a diagnosis and a treatment recommendation within seconds of capture. The project covers dataset curation, model compression, mobile integration and a field validation study with the university's agriculture department.",
    domain: "Artificial Intelligence · Computer Vision",
    status: "active",
    progress: 65,
    startDate: "2026-08-12",
    expectedCompletionDate: "2026-11-20",
    coordinatorId: "f-301",
    supervisorId: "f-302",
    teamId: "t-701",
    repositoryUrl: "https://github.com/pbl-cse-1184/crop-disease-detection",
  },
  // Other Semester 5 projects — listed in the staff dashboards only.
  {
    id: "p-502",
    title: "Smart Campus Energy Monitor",
    description:
      "IoT sensors and a dashboard that track electricity use across campus blocks and flag waste.",
    domain: "Internet of Things",
    status: "active",
    progress: 48,
    startDate: "2026-08-12",
    expectedCompletionDate: "2026-11-20",
    coordinatorId: "f-301",
    supervisorId: "f-302",
    teamId: "t-702",
  },
  {
    id: "p-503",
    title: "Accessible Library Navigator",
    description:
      "An indoor navigation app that guides visually impaired students through the central library.",
    domain: "Mobile · Accessibility",
    status: "under_review",
    progress: 72,
    startDate: "2026-08-12",
    expectedCompletionDate: "2026-11-20",
    coordinatorId: "f-302",
    supervisorId: "f-301",
    teamId: "t-703",
  },
];

export const teams: Team[] = [
  {
    id: "t-701",
    name: "Team Kisan",
    projectId: "p-501",
    leadStudentId: "s-2201",
    members: [
      {
        studentId: "s-2201",
        fullName: "Mihir Sanghvi",
        registrationNumber: "URN-2023-CSE-1184",
        teamRole: "Team Lead · Model Training",
      },
      {
        studentId: "s-2202",
        fullName: "Rahul Verma",
        registrationNumber: "URN-2023-CSE-1192",
        teamRole: "Mobile Application",
      },
      {
        studentId: "s-2203",
        fullName: "Aryan Pillai",
        registrationNumber: "URN-2023-CSE-1207",
        teamRole: "Dataset & Annotation",
      },
      {
        studentId: "s-2204",
        fullName: "Dhruv Mehta",
        registrationNumber: "URN-2023-CSE-1219",
        teamRole: "Backend & Deployment",
      },
    ],
  },
];

export const deadlines: Deadline[] = [
  {
    id: "d-9001",
    projectId: "p-501",
    title: "Weekly Progress Report — Week 8",
    description:
      "Summarise the week's model-compression experiments, note blockers, and attach the updated accuracy/latency table.",
    kind: "weekly_progress",
    dueDate: from(2),
    status: "pending",
    weightage: 5,
  },
  {
    id: "d-9002",
    projectId: "p-501",
    title: "PBL Review II — Mid-Term Presentation",
    description:
      "Fifteen-minute panel presentation covering problem statement, dataset, architecture and a live demonstration of the mobile client.",
    kind: "review",
    dueDate: from(5),
    status: "pending",
    weightage: 25,
  },
  {
    id: "d-9003",
    projectId: "p-501",
    title: "Certificate Submission — NPTEL Deep Learning",
    description:
      "Upload the course completion certificate for coordinator verification. Scanned PDF, under 5 MB.",
    kind: "certificate",
    dueDate: from(12),
    status: "pending",
    weightage: 5,
  },
  {
    id: "d-9004",
    projectId: "p-501",
    title: "Literature Survey Document",
    description:
      "Comparative survey of at least twelve papers on plant-disease classification, in IEEE format.",
    kind: "document",
    dueDate: from(-3),
    status: "under_review",
    submittedAt: from(-4),
    weightage: 10,
  },
  {
    id: "d-9005",
    projectId: "p-501",
    title: "Weekly Progress Report — Week 7",
    description: "Dataset augmentation results and baseline model metrics.",
    kind: "weekly_progress",
    dueDate: from(-5),
    status: "submitted",
    submittedAt: from(-6),
    weightage: 5,
  },
  {
    id: "d-9006",
    projectId: "p-501",
    title: "Synopsis & Problem Statement",
    description:
      "Signed synopsis with the coordinator's approval, defining scope and deliverables.",
    kind: "document",
    dueDate: from(-28),
    status: "submitted",
    submittedAt: from(-30),
    weightage: 10,
  },
  {
    id: "d-9007",
    projectId: "p-501",
    title: "Industry Mentor Consent Form",
    description:
      "Consent form signed by the external mentor, required for the field validation study.",
    kind: "document",
    dueDate: from(-9),
    status: "overdue",
    weightage: 5,
  },
  {
    id: "d-9008",
    projectId: "p-501",
    title: "Final Project Report",
    description:
      "Complete report with results, field-study findings, and future scope. Hard and soft copy.",
    kind: "document",
    dueDate: from(44),
    status: "pending",
    weightage: 30,
  },
];

export const announcements: Announcement[] = [
  {
    id: "a-8001",
    title: "Week 8 progress report submission window",
    body: "The Week 8 progress report must be submitted before Friday, 11:59 PM. Reports submitted after the window will be marked late and carry a deduction on the continuous-assessment component. Please attach your updated experiment log along with the report — several teams omitted it last week.",
    postedByName: "Dr. Anagha Deshpande",
    postedByRole: "faculty",
    postedAt: from(-1),
    priority: "urgent",
    projectId: "p-501",
  },
  {
    id: "a-8002",
    title: "PBL Review II schedule published",
    body: "The mid-term review panel schedule for all Semester 5 teams is now available. Team Kisan is slotted on 9 October at 11:20 AM in Seminar Hall 2. Each team gets fifteen minutes for presentation and five for questions. Bring a working demonstration — slides alone will not be evaluated.",
    postedByName: "Dr. Ramesh Kulkarni",
    postedByRole: "supervisor",
    postedAt: from(-2),
    priority: "important",
    attachment: {
      name: "PBL-Review-II-Schedule.pdf",
      sizeLabel: "248 KB",
      url: "#",
    },
    projectId: null,
  },
  {
    id: "a-8003",
    title: "Certificate verification drive",
    body: "Students who have completed online certifications relevant to their project domain should upload them before 16 October. Verified certificates contribute to the professional-development component of your PBL evaluation.",
    postedByName: "Dr. Anagha Deshpande",
    postedByRole: "faculty",
    postedAt: from(-4),
    priority: "normal",
    projectId: null,
  },
  {
    id: "a-8004",
    title: "GPU lab extended hours during review week",
    body: "The AI research lab in Block C will remain open until 9:00 PM from 6 to 11 October for teams running training jobs ahead of Review II. Entry requires your library card. Jobs left unattended beyond thirty minutes may be terminated by the lab assistant.",
    postedByName: "Dr. Ramesh Kulkarni",
    postedByRole: "supervisor",
    postedAt: from(-6),
    priority: "normal",
    projectId: null,
  },
  {
    id: "a-8005",
    title: "Plagiarism policy for project documents",
    body: "All submitted documents are checked through the university's similarity software. A similarity index above 15 percent, excluding references, will be returned for revision. Teams are advised to paraphrase surveyed literature rather than quote it.",
    postedByName: "Dr. Ramesh Kulkarni",
    postedByRole: "supervisor",
    postedAt: from(-11),
    priority: "important",
    attachment: {
      name: "Academic-Integrity-Guidelines.pdf",
      sizeLabel: "512 KB",
      url: "#",
    },
    projectId: null,
  },
];

export const notifications: Notification[] = [
  {
    id: "n-7001",
    userId: "u-1001",
    kind: "deadline",
    title: "Weekly Progress Report due in 2 days",
    body: "Week 8 report closes Friday at 11:59 PM.",
    createdAt: from(-0.2),
    read: false,
    href: "/student/deadlines",
  },
  {
    id: "n-7002",
    userId: "u-1001",
    kind: "announcement",
    title: "New announcement from Dr. Anagha Deshpande",
    body: "Week 8 progress report submission window.",
    createdAt: from(-1),
    read: false,
    href: "/student/announcements",
  },
  {
    id: "n-7003",
    userId: "u-1001",
    kind: "submission",
    title: "Literature Survey is under review",
    body: "Your coordinator has picked up the document for review.",
    createdAt: from(-3.5),
    read: false,
    href: "/student/deadlines",
  },
  {
    id: "n-7004",
    userId: "u-1001",
    kind: "feedback",
    title: "Feedback on Week 7 progress report",
    body: "Good augmentation results. Please quantify the latency trade-off before Review II.",
    createdAt: from(-5),
    read: true,
    href: "/student/project",
  },
  {
    id: "n-7005",
    userId: "u-1001",
    kind: "deadline",
    title: "Industry Mentor Consent Form is overdue",
    body: "This submission passed its due date and is now flagged to your coordinator.",
    createdAt: from(-8),
    read: true,
    href: "/student/deadlines",
  },
  {
    id: "n-7006",
    userId: "u-1001",
    kind: "profile",
    title: "Profile updated",
    body: "Your contact number was changed successfully.",
    createdAt: from(-14),
    read: true,
    href: "/student/profile",
  },
];

/** Demo credentials surfaced on the login screen. */
export const demoPassword = "pbl@2026";
