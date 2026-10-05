"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOME_BY_ROLE, useSession } from "@/lib/auth/session";
import { demoPassword } from "@/lib/data/seed";
import { cn } from "@/lib/utils";

const DEMO_EMAIL = "mihir.sanghvi@university.edu.in";

/** Translucent control, legible against the frosted card. */
const control =
  "h-12 w-full rounded-xl border border-white/70 bg-white/70 pl-11 pr-4 text-sm text-stone-800 placeholder:text-stone-400 transition-colors focus:border-gold-300 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-gold-200";

export function LoginForm() {
  const { signIn, user, loading } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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
      <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-400"
            aria-hidden
          />
          <input
            id="email"
            type="email"
            autoComplete="username"
            aria-label="University email or registration number"
            placeholder="Email or registration number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={control}
            required
          />
        </div>

        <div className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-400"
            aria-hidden
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(control, "pr-12")}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-stone-400 hover:text-stone-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-stone-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 cursor-pointer rounded border-stone-400 accent-gold-500"
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
            className="text-[13px] font-medium text-gold-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-clay-100/80 px-3 py-2.5 text-[13px] text-clay-500"
          >
            <AlertCircle className="mt-px size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          loading={submitting}
          className="mt-1 h-12 w-full rounded-xl text-[15px]"
        >
          {submitting ? "Signing in" : "Log in"}
          {!submitting ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-stone-400/25" />
        <span className="text-[11px] font-medium tracking-wider text-stone-500">
          DEMO ACCOUNT
        </span>
        <span className="h-px flex-1 bg-stone-400/25" />
      </div>

      <button
        type="button"
        onClick={fillDemo}
        className="mt-3 w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-center transition-colors hover:bg-white/80"
      >
        <span className="tnum block text-[12.5px] text-stone-600">
          {DEMO_EMAIL}
        </span>
        <span className="mt-0.5 block text-[12px] font-medium text-gold-600">
          Tap to fill these in
        </span>
      </button>
    </>
  );
}
