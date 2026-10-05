import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Sign-in screen over a single full-bleed watercolour. The painting leaves
 * its left side as open paper, so on wide screens the form sits directly on
 * it; on narrow screens the campus moves behind a frosted card.
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
        className="-z-10 object-cover object-[72%_bottom] lg:object-[right_bottom]"
      />
      {/* Paper-white haze so the trees never run under the form */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_48%_70%_at_24%_55%,rgba(253,253,251,0.92)_0%,rgba(253,253,251,0.7)_55%,transparent_100%)] lg:block"
      />

      {/* ------------------------------- header ------------------------------ */}
      <header className="px-6 pt-8 sm:px-12 lg:px-[6.5%]">
        <Link href="/" className="inline-flex items-center gap-3 text-ink-800">
          <GraduationCap className="size-9" strokeWidth={1.5} aria-hidden />
          <span className="text-[22px] font-semibold tracking-[0.04em]">PBL</span>
        </Link>
      </header>

      {/* -------------------------------- form ------------------------------- */}
      <main className="flex flex-1 items-center px-6 pt-10 pb-16 sm:px-12 lg:px-[11.5%] lg:pt-0">
        <div className="animate-fade-rise w-full max-w-[32.5rem] rounded-[24px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_-34px_rgba(61,78,92,0.45)] backdrop-blur-md sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <h1 className="font-display text-[2.9rem] leading-[1.02] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[4.1rem]">
            Welcome <span className="text-azure-600">back</span>
          </h1>
          <p className="mt-4 text-[17px] text-stone-600 sm:text-[19px]">
            Sign in with your university email and password.
          </p>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
