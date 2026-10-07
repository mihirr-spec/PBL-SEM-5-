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
import { demoPassword } from "@/lib/data/seed";
import { cn } from "@/lib/utils";

const DEMO_EMAIL = "mihir.sanghvi@university.edu.in";

const control =
  "h-12 w-full rounded-lg border border-[#c9d1dc] bg-white/90 pl-12 pr-4 text-[14.5px] text-ink-900 placeholder:text-stone-400 transition-colors hover:border-ink-400/60 focus:border-azure-500 focus:outline-none focus:ring-3 focus:ring-azure-100";

const fieldIcon =
  "pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-ink-800";

export function LoginForm() {
  const { signIn, user, loading } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in — go straight to the role's home.
  useEffect(() => {
    if (!loading && user) router.replace(HOME_BY_ROLE[user.role]);
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn(email, password);
    if (result.ok) {
      router.replace("/student/dashboard");
      return;
    }

    setError(result.error);
    setSubmitting(false);
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(demoPassword);
    setError(null);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-[14px] font-medium text-ink-900"
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
            className="mb-2 block text-[14px] font-medium text-ink-900"
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
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-[linear-gradient(90deg,#173b7e_0%,#1d4b93_55%,#2f62a6_100%)] text-[16px] font-medium text-white shadow-[0_14px_30px_-18px_rgba(13,31,63,0.95)] transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
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

      <div className="mt-6 flex items-center gap-5">
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
        className="mt-5 flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-ink-800/70 bg-white px-3 text-[14px] whitespace-nowrap sm:gap-4 sm:text-[15px] font-medium text-ink-900 transition-colors hover:bg-azure-50"
      >
        <Landmark className="size-5 shrink-0 text-ink-800 sm:size-6" strokeWidth={1.5} aria-hidden />
        Continue with University Account
      </button>

      <div className="mt-6 text-center">
        <p className="text-[13.5px] text-stone-500">Don&rsquo;t have access?</p>
        <p className="mt-1 text-[14.5px] text-azure-600">
          Contact your PBL coordinator
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-4 rounded-full border border-[#dbe3ee] bg-white/70 px-4 py-1.5 text-[12.5px] text-stone-500 transition-colors hover:border-azure-100 hover:text-azure-600"
        >
          Trying it out? Use the demo account
        </button>
      </div>
    </>
  );
}
