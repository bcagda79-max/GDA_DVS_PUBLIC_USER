"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "./auth-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SiteHeader() {
  return (

    <header className="fixed inset-x-0 top-0 z-50 h-[72px] bg-[#060D14]/80 backdrop-blur-xl border-b border-white/5">

      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.7)] to-transparent" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-[rgba(201,168,76,0.12)] blur-md scale-125 group-hover:bg-[rgba(201,168,76,0.2)] transition-all duration-500" />
            <Image
              src="/gda_logo.png"
              alt="Galiyat Development Authority"
              width={40}
              height={40}
              className="relative h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
              priority
            />
          </div>

          <div className="hidden sm:block leading-tight">
            <div className="dmsans text-[12px] font-semibold text-white/90 tracking-[0.08em] uppercase">
              Galiyat Development Authority
            </div>
            <div className="dmsans text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: "var(--color-accent)" }}>
              Document Verification System
            </div>
          </div>

          <div className="sm:hidden leading-tight">
            <div className="dmsans text-[12px] font-semibold text-white/90 tracking-wide">GDA-DVS</div>
          </div>
        </Link>

        <div className="flex-shrink-0 flex items-center gap-3">
          <ThemeToggle />
          <AuthButton />
        </div>

      </div>
    </header>
  );
}