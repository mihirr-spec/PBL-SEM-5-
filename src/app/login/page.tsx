import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Split sign-in screen: the form on clean paper to the left, the campus
 * watercolour bleeding in from the right. Below lg the painting drops behind
 * the form as a faint wash so the page still reads as one piece.
 */
export default function LoginPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#fbfcfd]">
      {/* ------------------------------ artwork ------------------------------ */}
      <div
        className="absolute inset-0 -z-10 lg:left-[44%]"
        aria-hidden
      >
        <Image
          src="/art/login-campus.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 56vw"
          className="object-cover object-[center_bottom] opacity-25 lg:object-[left_bottom] lg:opacity-100 lg:[mask-image:linear-gradient(to_right,transparent_0%,black_22%)]"
        />
      </div>
      {/* Soft sky haze behind the form, as in the painting's own wash */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_0%_40%,rgba(185,224,240,0.35),transparent_55%)] lg:hidden"
        aria-hidden
      />

      <Image
        src="/art/login-doodles.webp"
        alt=""
        aria-hidden
        width={310}
        height={344}
        className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden w-[15rem] mix-blend-multiply [mask-image:radial-gradient(ellipse_at_bottom_left,black_55%,transparent_80%)] sm:block xl:w-[19rem]"
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
        <div className="animate-fade-rise w-full max-w-[32.5rem] rounded-[24px] bg-white/80 p-6 shadow-[0_24px_70px_-34px_rgba(61,78,92,0.45)] backdrop-blur-md sm:p-8 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <h1 className="font-display text-[2.9rem] leading-[1.02] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[4.1rem]">
            Welcome <span className="text-azure-600">back</span>
          </h1>
          <p className="mt-4 text-[17px] text-stone-600 sm:text-[19px]">
            Sign in to your PBL workspace.
          </p>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
