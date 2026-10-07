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
        className="-z-10 object-cover object-[72%_bottom] lg:object-[right_bottom] [@media(min-aspect-ratio:3/2)]:object-contain [@media(min-aspect-ratio:3/2)]:[mask-image:linear-gradient(to_right,transparent_calc(100%-150vh),black_calc(100%-125vh))]"
      />
      {/* Paper-white haze so the trees never run under the form */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_48%_70%_at_24%_55%,rgba(253,253,251,0.92)_0%,rgba(253,253,251,0.7)_55%,transparent_100%)] wide:block"
      />

      {/* ------------------------------- header ------------------------------ */}
      <header className="px-6 pt-6 sm:px-12 lg:px-[6%]">
        <Link href="/" className="inline-flex items-center gap-3 text-ink-800">
          <GraduationCap className="size-8" strokeWidth={1.5} aria-hidden />
          <span className="text-[20px] font-semibold tracking-[0.04em]">PBL</span>
        </Link>
      </header>

      {/* -------------------------------- form ------------------------------- */}
      <main className="flex flex-1 items-center px-6 pt-8 pb-12 sm:px-12 lg:px-[10%] lg:py-6">
        <div className="animate-fade-rise w-full max-w-[26.5rem] rounded-[24px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_-34px_rgba(61,78,92,0.45)] backdrop-blur-md sm:p-8 wide:rounded-none wide:border-0 wide:bg-transparent wide:p-0 wide:shadow-none wide:backdrop-blur-none">
          <h1 className="font-display text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[3.1rem]">
            Welcome <span className="text-azure-600">back</span>
          </h1>
          <p className="mt-2.5 text-[15.5px] text-stone-600">
            Sign in with your university email and password.
          </p>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
