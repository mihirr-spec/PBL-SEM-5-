"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Landmark,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import { HOME_BY_ROLE, useSession } from "@/lib/auth/session";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Shared password of the seeded demo accounts (supabase/migrations). */
const DEMO_PASSWORD = "pbl@2026";

/** One sign-in tab per kind of account, each with its demo login. */
const TABS = [
  {
    key: "student",
    label: "Student",
    roles: ["student"],
    demoEmail: "mihir.sanghvi@university.edu.in",
  },
  {
    key: "teacher",
    label: "Teacher",
    roles: ["faculty", "supervisor"],
    demoEmail: "a.deshpande@university.edu.in",
  },
  {
    key: "admin",
    label: "Administrator",
    roles: ["admin"],
    demoEmail: "pbl.admin@university.edu.in",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  roles: readonly Role[];
  demoEmail: string;
}>;

type TabKey = (typeof TABS)[number]["key"];

const control =
  "h-11 w-full rounded-lg border border-[#c9d1dc] bg-white/90 pl-12 pr-4 text-[14.5px] text-ink-900 placeholder:text-stone-400 transition-colors hover:border-ink-400/60 focus:border-azure-500 focus:outline-none focus:ring-3 focus:ring-azure-100";

const fieldIcon =
  "pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-ink-800";

export function LoginForm() {
  const { signIn, user, loading } = useSession();
  const router = useRouter();

  const [tabKey, setTabKey] = useState<TabKey>("student");
  const tab = TABS.find((t) => t.key === tabKey) ?? TABS[0];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in — go straight to the role's home.
  useEffect(() => {
    // Not while a submit is in flight: a wrong-tab sign-in is briefly signed
    // in before it is rejected and signed out again.
    if (!loading && user && !submitting) router.replace(HOME_BY_ROLE[user.role]);
  }, [loading, user, submitting, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn(email, password, [...tab.roles]);
    if (result.ok) {
      router.replace(HOME_BY_ROLE[result.user.role]);
      return;
    }

    setError(result.error);
    setSubmitting(false);
  }

  function fillDemo() {
    setEmail(tab.demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  function chooseTab(key: TabKey) {
    setTabKey(key);
    setEmail("");
    setPassword("");
    setError(null);
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Account type"
        className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-ink-900/[0.06] p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tabKey}
            onClick={() => chooseTab(t.key)}
            className={cn(
              "rounded-lg px-2 py-2 text-[13px] font-medium transition-colors",
              t.key === tabKey
                ? "bg-white text-ink-900 shadow-[0_4px_12px_-6px_rgba(13,31,63,0.45)]"
                : "text-stone-600 hover:text-ink-800",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5" noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[14px] font-medium text-ink-900"
          >
            University Email / ID
          </label>
          <div className="relative">
            <Mail className={fieldIcon} strokeWidth={1.6} aria-hidden />
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@university.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={control}
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[14px] font-medium text-ink-900"
          >
            Password
          </label>
          <div className="relative">
            <Lock className={fieldIcon} strokeWidth={1.6} aria-hidden />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(control, "pr-14")}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-md p-1.5 text-ink-800 transition-colors hover:text-azure-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-5" strokeWidth={1.6} />
              ) : (
                <Eye className="size-5" strokeWidth={1.6} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-stone-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 cursor-pointer rounded border-ink-400 accent-ink-800"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() =>
              setError(
                "Password resets are handled by the academic office in this release.",
              )
            }
            className="text-[14px] text-azure-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-clay-100/80 px-3.5 py-3 text-[14px] text-clay-500"
          >
            <AlertCircle className="mt-px size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg bg-[linear-gradient(90deg,#173b7e_0%,#1d4b93_55%,#2f62a6_100%)] text-[16px] font-medium text-white shadow-[0_14px_30px_-18px_rgba(13,31,63,0.95)] transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="size-[18px] animate-spin" aria-hidden />
              Signing in
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="size-[18px]" strokeWidth={1.8} />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 flex items-center gap-5">
        <span className="h-px flex-1 bg-[#c9d1dc]" />
        <span className="text-[13px] tracking-wide text-stone-500">OR</span>
        <span className="h-px flex-1 bg-[#c9d1dc]" />
      </div>

      <button
        type="button"
        onClick={() =>
          setError(
            "University single sign-on arrives in a later release. Sign in with your email and password for now.",
          )
        }
        className="mt-4 flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-ink-800/70 bg-white px-3 text-[14px] whitespace-nowrap sm:gap-4 sm:text-[15px] font-medium text-ink-900 transition-colors hover:bg-azure-50"
      >
        <Landmark className="size-5 shrink-0 text-ink-800 sm:size-6" strokeWidth={1.5} aria-hidden />
        Continue with University Account
      </button>

      <div className="mt-4 text-center">
        <p className="text-[13.5px] text-stone-500">
          Don&rsquo;t have access?{" "}
          <span className="text-azure-600">Contact your PBL coordinator</span>
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-3 rounded-full border border-[#dbe3ee] bg-white/70 px-4 py-1.5 text-[12.5px] text-stone-500 transition-colors hover:border-azure-100 hover:text-azure-600"
        >
          Trying it out? Use the demo {tab.label.toLowerCase()} account
        </button>
      </div>
    </>
  );
}
