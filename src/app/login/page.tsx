import type { Metadata } from "next";

import { Brand } from "@/components/layout/brand";
import { CampusBackdrop } from "@/components/layout/campus-backdrop";
import { LoginForm } from "@/components/auth/login-form";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <CampusBackdrop priority />

      <header className="mx-auto flex h-20 w-full max-w-7xl items-center px-5 sm:px-8">
        <Brand href="/" />
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pb-12 sm:px-8">
        <div className="mx-auto w-full min-w-0 max-w-[27rem] lg:mx-0 lg:ml-auto lg:mr-6">
          <GlassCard className="animate-fade-rise">
            <div className="text-center">
              <h1 className="font-display text-[2rem] leading-tight tracking-tight text-stone-800">
                Welcome back
              </h1>
              <p className="mt-1.5 text-[14px] text-stone-600">
                Continue your PBL journey
              </p>
            </div>

            <LoginForm />
          </GlassCard>

          {/* Frosted backing — below lg this sits directly on the artwork. */}
          <p className="mx-auto mt-5 w-fit rounded-full bg-white/65 px-4 py-1.5 text-center text-[12px] text-stone-600 backdrop-blur-sm">
            Trouble signing in? Contact your PBL coordinator.
          </p>
        </div>
      </div>
    </div>
  );
}
