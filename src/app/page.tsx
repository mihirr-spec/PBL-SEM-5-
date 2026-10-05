import {
  ArrowRight,
  Award,
  Building2,
  ClipboardList,
  Flag,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  LineChart,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { CampusAccent } from "@/components/layout/campus-accent";
import { CampusBackdrop } from "@/components/layout/campus-backdrop";
import { ButtonLink } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

/** Numbered core features — rows alternate side, as in a printed spread. */
const FEATURES = [
  {
    number: "01",
    icon: LineChart,
    tint: "text-numeral-blue",
    title: "Track Your Progress",
    body: "Monitor project progress, milestones, deadlines and submissions from one place.",
  },
  {
    number: "02",
    icon: FolderKanban,
    tint: "text-numeral-peach",
    title: "Manage Your Project",
    body: "Keep project information, team members, documents and project links organized.",
  },
  {
    number: "03",
    icon: UsersRound,
    tint: "text-numeral-sage",
    title: "Collaborate",
    body: "Stay connected with coordinators, mentors and teammates throughout the project.",
  },
  {
    number: "04",
    icon: Award,
    tint: "text-numeral-lilac",
    title: "Evaluate & Improve",
    body: "Access feedback, evaluations, marks and project performance.",
  },
] as const;

const STEPS = [
  {
    icon: Lightbulb,
    title: "Form / Join Project",
    body: "Create or join a project and form your team.",
  },
  {
    icon: ClipboardList,
    title: "Plan & Track",
    body: "Set milestones, track progress and manage deadlines.",
  },
  {
    icon: UsersRound,
    title: "Collaborate",
    body: "Work with your team, mentors and faculty.",
  },
  {
    icon: Flag,
    title: "Submit & Get Evaluated",
    body: "Submit your work, receive feedback and complete your PBL.",
  },
] as const;

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Students",
    body: "Manage your projects, track progress, meet deadlines and collaborate with your team.",
  },
  {
    icon: UsersRound,
    title: "Faculty / Coordinators",
    body: "Guide students, monitor progress, provide feedback and manage evaluations.",
  },
  {
    icon: Building2,
    title: "Administrators",
    body: "Oversee PBL activities, manage timelines, announcements and system-wide operations.",
  },
] as const;

const ROADMAP = [
  { tag: "V1", label: "Student portal", note: "Shipping now", live: true },
  { tag: "V1.1", label: "Weekly progress, evidence & feedback", live: false },
  { tag: "V2", label: "Faculty portal — review, verification, marks", live: false },
  { tag: "V2.5", label: "Supervisor — allocation, monitoring, reports", live: false },
  { tag: "V3", label: "Project health & early-warning analytics", live: false },
] as const;

/** Two-tone uppercase label that opens each marketing section. */
function Eyebrow({ lead, emphasis }: { lead: string; emphasis: string }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.22em] text-ink-400 uppercase">
      {lead} <span className="text-ink-800">{emphasis}</span>
    </p>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-ivory-100">
      {/* ------------------------------ hero ----------------------------- */}
      <section className="relative isolate flex min-h-screen flex-col overflow-x-clip">
        <CampusBackdrop priority />

        <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Brand href="/" />
          <ButtonLink
            href="/login"
            size="sm"
            variant="secondary"
            className="border-white/60 bg-white/60 backdrop-blur-md hover:bg-white/80"
          >
            Sign in
            <ArrowRight className="size-3.5" />
          </ButtonLink>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pb-16 sm:px-8">
          <div className="mx-auto w-full min-w-0 max-w-[30rem] lg:mx-0 lg:ml-auto lg:mr-6">
            <GlassCard className="animate-fade-rise">
              <Eyebrow lead="Version 1 ·" emphasis="Student Portal" />

              <h1 className="mt-3 font-display text-[2.1rem] leading-[1.1] tracking-tight text-ink-900 sm:text-[2.6rem]">
                The complete PBL lifecycle,
                <span className="block text-azure-600">in one place.</span>
              </h1>

              <p className="mt-4 text-[14.5px] leading-relaxed text-stone-600">
                Project-Based Learning runs on scattered documents, forwarded
                messages and last-minute reminders. This platform gives
                students, coordinators and supervisors a single, shared record
                of every project.
              </p>

              <div className="mt-7 space-y-2.5">
                <ButtonLink
                  href="/login"
                  size="lg"
                  className="w-full bg-ink-800 text-white shadow-[0_10px_24px_-14px_rgba(13,31,63,0.9)] hover:bg-ink-700 active:bg-ink-900"
                >
                  Enter the student portal
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink
                  href="#features"
                  variant="secondary"
                  size="lg"
                  className="w-full border-white/70 bg-white/55 backdrop-blur hover:bg-white/80"
                >
                  What it does
                </ButtonLink>
              </div>

              <p className="mt-6 border-t border-white/60 pt-4 text-center text-[12px] text-stone-500">
                A university Project-Based Learning initiative
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ---------------------- core features (01–04) -------------------- */}
      <section
        id="features"
        className="relative isolate overflow-hidden px-5 pt-20 pb-16 sm:px-8 sm:pt-24"
      >
        <CampusAccent side="right" />

        <div className="mx-auto max-w-5xl">
          <Eyebrow lead="Core" emphasis="Features" />
          <h2 className="mt-4 max-w-xl font-display text-[2.4rem] leading-[1.08] tracking-tight text-ink-900 sm:text-[3.1rem]">
            Built for a Better PBL{" "}
            <span className="text-azure-600">Experience.</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-stone-600">
            Everything you need to plan, collaborate, track and complete your
            project — without the chaos.
          </p>

          <ol className="mt-14">
            {FEATURES.map(({ number, icon: Icon, tint, title, body }, index) => (
              <li
                key={number}
                className="border-t border-sand-200 py-8 first:border-t-0 first:pt-0 sm:py-10"
              >
                <div
                  className={cn(
                    "flex items-center gap-6 sm:gap-10",
                    // Even rows lead with the numeral, odd rows close with it.
                    index % 2 === 1 && "sm:flex-row-reverse",
                  )}
                >
                  <span
                    className={cn(
                      "tnum font-display text-[4rem] leading-none font-semibold sm:text-[6rem]",
                      tint,
                    )}
                    aria-hidden
                  >
                    {number}
                  </span>

                  <div className="flex max-w-md flex-1 items-start gap-5">
                    <Icon
                      className="mt-1 size-7 shrink-0 text-azure-600"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <div>
                      <h3 className="font-display text-[1.45rem] tracking-tight text-ink-900">
                        {title}
                      </h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-stone-600">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------- how it works ----------------------- */}
      <section className="relative isolate overflow-hidden px-5 py-20 text-center sm:px-8">
        <CampusAccent side="left" />

        <div className="mx-auto max-w-5xl">
          <Eyebrow lead="How it" emphasis="Works" />
          <h2 className="mt-4 font-display text-[2.2rem] leading-[1.1] tracking-tight text-ink-900 sm:text-[2.9rem]">
            From Idea to Impact — In{" "}
            <span className="text-azure-600">Simple Steps.</span>
          </h2>
          <p className="mt-4 text-[15px] text-stone-600">
            A smooth and structured PBL journey for every student.
          </p>

          <ol className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="flex flex-col items-center">
                <span className="tnum text-[13px] font-semibold tracking-[0.1em] text-ink-800">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Rail — one dot per step, joined except at the two ends */}
                <div className="relative mt-3 flex h-3 w-full items-center justify-center">
                  <span
                    className={cn(
                      "absolute top-1/2 hidden h-px bg-ink-700/30 lg:block",
                      index === 0
                        ? "right-0 left-1/2"
                        : index === STEPS.length - 1
                          ? "right-1/2 left-0"
                          : "inset-x-0",
                    )}
                    aria-hidden
                  />
                  <span
                    className="relative size-2.5 rounded-full bg-azure-600"
                    aria-hidden
                  />
                </div>

                <Icon
                  className="mt-6 size-7 text-azure-600"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-4 text-[14.5px] font-semibold tracking-tight text-ink-900">
                  {title}
                </h3>
                <p className="mt-2 max-w-[15rem] text-[13.5px] leading-relaxed text-stone-600">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------ who it is built for -------------------- */}
      <section className="relative isolate overflow-hidden px-5 py-20 text-center sm:px-8">
        <CampusAccent side="right" />

        <div className="mx-auto max-w-5xl">
          <Eyebrow lead="Built for" emphasis="The PBL Ecosystem" />
          <h2 className="mt-4 font-display text-[2.2rem] leading-[1.1] tracking-tight text-ink-900 sm:text-[2.9rem]">
            Designed for Everyone Involved.
          </h2>
          <p className="mt-4 text-[15px] text-stone-600">
            A unified platform for students, faculty and administrators.
          </p>

          <div className="mt-14 grid gap-10 text-left sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-sand-200">
            {AUDIENCES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="sm:px-7 sm:first:pl-0 sm:last:pr-0">
                <Icon className="size-8 text-ink-800" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-5 flex items-center justify-between gap-3 font-display text-[1.3rem] tracking-tight text-ink-900">
                  {title}
                  <ArrowRight className="size-4 text-ink-700" aria-hidden />
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-stone-600">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- roadmap --------------------------- */}
      <section className="border-y border-sand-200 bg-ivory-50">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2 className="font-display text-[1.9rem] leading-tight tracking-tight text-ink-900">
              Designed to grow, not to be rebuilt
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-stone-600">
              Roles, routes and data access are separated from the first commit,
              so each release adds a module rather than reworking the ones
              already in use.
            </p>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-stone-500">
              <ShieldCheck className="size-4 text-sage-500" aria-hidden />
              Academic records stay read-only to students by design
            </p>
          </div>

          <ol className="space-y-3">
            {ROADMAP.map((item) => (
              <li
                key={item.tag}
                className="flex items-center gap-4 rounded-xl border border-sand-200 bg-white px-4 py-3"
              >
                <span className="tnum w-11 shrink-0 text-[12px] font-bold tracking-wide text-azure-600">
                  {item.tag}
                </span>
                <span className="flex-1 text-[13.5px] text-stone-700">
                  {item.label}
                </span>
                {item.live ? (
                  <span className="rounded-full bg-sage-100 px-2.5 py-1 text-[10.5px] font-semibold text-sage-500">
                    {item.note}
                  </span>
                ) : (
                  <LineChart className="size-4 text-sand-300" aria-hidden />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------- cta ----------------------------- */}
      <section className="relative isolate overflow-hidden px-5 py-20 text-center sm:px-8">
        <CampusAccent side="left" />
        <CampusAccent side="right" />

        <div className="mx-auto max-w-2xl">
          <Eyebrow lead="Ready" emphasis="To Get Started?" />
          <h2 className="mt-4 font-display text-[1.9rem] leading-tight tracking-tight text-ink-900 sm:text-[2.3rem]">
            Take Your PBL to the Next Level.
          </h2>
          <p className="mt-3 text-[14.5px] text-stone-600">
            Sign in to access your projects, deadlines, submissions and more.
          </p>

          <ButtonLink
            href="/login"
            size="lg"
            className="mt-8 bg-ink-800 px-8 text-white shadow-[0_14px_30px_-16px_rgba(13,31,63,0.95)] hover:bg-ink-700 active:bg-ink-900"
          >
            Sign In
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>

      {/* ----------------------------- footer ---------------------------- */}
      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-sand-200 px-5 py-10 sm:px-8">
        <Brand href="/" />
        <p className="text-[12.5px] text-stone-400">
          A university Project-Based Learning initiative · Semester 5
        </p>
      </footer>
    </div>
  );
}
