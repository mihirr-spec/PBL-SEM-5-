import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Sign-in screen: the campus watercolour fills the page and the form sits in
 * a frosted dialog over the painting's open left side.
 */
export default function LoginPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#fbfcfd]">
      <Image
        src="/art/login-bg.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[72%_bottom]"
      />
      {/* Light veil so the dialog reads cleanly over the busiest parts */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/15" />

      <header className="px-6 pt-6 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-3 text-ink-800">
          <GraduationCap className="size-8" strokeWidth={1.5} aria-hidden />
          <span className="text-[20px] font-semibold tracking-[0.04em]">PBL</span>
        </Link>
      </header>

      {/* On wide screens the dialog sits in the open paper left of the
          painting (centred on ~19vw); narrower screens centre it. */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 wide:justify-start wide:pl-[max(2.5rem,calc(19vw-13.5rem))]">
        <div
          role="dialog"
          aria-labelledby="signin-title"
          className="animate-fade-rise w-full max-w-[27rem] rounded-[26px] border border-white/80 bg-white/80 px-6 py-8 shadow-[0_30px_90px_-30px_rgba(13,31,63,0.45)] backdrop-blur-xl sm:px-9 sm:py-9"
        >
          <div className="text-center">
            <h1
              id="signin-title"
              className="font-display text-[2.3rem] leading-[1.05] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[2.6rem]"
            >
              Welcome <span className="text-azure-600">back</span>
            </h1>
            <p className="mt-2 text-[14.5px] text-stone-600">
              Sign in with your university email and password.
            </p>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
