"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type OfficerAppbarProps = {
  email: string;
  active: "home" | "generate" | "history" | "verify";
};

const navItems = [
  { href: "/home", label: "Home", key: "home" as const },
  { href: "/generate", label: "Generate Bar Code", key: "generate" as const },
  { href: "/home/verify", label: "Verify Document", key: "verify" as const },
  { href: "/history", label: "Bar Code History", key: "history" as const },
];

export function OfficerAppbar({ email, active }: OfficerAppbarProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    function handleClickOutside(ev: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) setDropdownOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(ev.target as Node)) setMobileMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/signin");
  }

  return (
    <header className="fixed top-0 w-full z-50 h-[68px] sm:h-[72px]">
      <div className="absolute inset-0 bg-[#020617]/95" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-[7px] sm:pt-[9px]">
        <div className="flex h-full items-center justify-between gap-4">

          <div className="flex items-center gap-3 w-auto shrink-0 translate-y-[3px] sm:translate-y-[4px]">
            <button
              className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/home" className="flex items-center gap-2.5 group transition-all duration-300">
              <div className="relative flex-shrink-0">
                <Image src="/gda_logo.png" alt="GDA" width={36} height={36} className="relative object-contain sm:w-[42px] sm:h-[42px]" priority />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <span className="dmsans text-[11px] sm:text-[13px] font-semibold text-white/90 tracking-[0.06em] uppercase line-clamp-1">
                  Galiyat Development <span className="hidden sm:inline">Authority</span>
                </span>
                <span className="dmsans text-[9px] sm:text-[10px] font-medium tracking-[0.15em] uppercase text-[#38bdf8] mt-0.5">
                  Officer Portal
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 justify-center translate-y-[3px] sm:translate-y-[4px]">
            <ul className="flex h-full items-center gap-3 xl:gap-5">
              {navItems.map((link) => {
                const isActive = active === link.key;
                return (
                  <li key={link.href} className="relative flex h-full items-center group">
                    <Link
                      href={link.href}
                      className={`inline-flex h-full items-center px-1 dmsans text-[13px] ${isActive ? 'font-semibold text-[#38bdf8]' : 'font-medium text-white/45 hover:text-white/80'} tracking-wide whitespace-nowrap transition-colors duration-300`}
                    >
                      {link.label}
                    </Link>
                    {isActive && (
                      <motion.div
                        layoutId="officer-nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#38bdf8]"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-end w-auto relative shrink-0 translate-y-[3px] sm:translate-y-[4px] gap-2" ref={dropdownRef}>
            <ThemeToggle />
            <button
              onClick={() => {
                if (isMobile) setProfileSheetOpen(!profileSheetOpen);
                else setDropdownOpen(!dropdownOpen);
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 sm:pr-4 hover:bg-white/10 hover:border-[#38bdf8]/30 transition-all duration-300"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-white/40 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-60 origin-top-right rounded-2xl border border-[#38bdf8]/10 bg-[#020617]/95 backdrop-blur-xl p-2 shadow-[0_10px_20px_rgba(0,0,0,0.22)] z-50"
                >
                  <div className="px-4 py-3 mb-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#38bdf8] dmsans">Logged in as</p>
                    <p className="truncate text-xs font-medium text-white/80 mt-1 dmsans">{email || 'Loading...'}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-rose-400/80 dmsans hover:bg-[rgba(239,68,68,0.08)] hover:text-rose-400 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          {/* Mobile profile bottom sheet */}
          <AnimatePresence>
            {profileSheetOpen && isMobile && (
                <motion.div
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 300, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-0 bottom-0 z-60"
              >
                <div className="fixed inset-0 bg-black/30" onClick={() => setProfileSheetOpen(false)} />
                <div className="mx-auto max-w-2xl p-4">
                  <div className="rounded-t-2xl border border-[#38bdf8]/10 bg-[#020617]/95 p-4 backdrop-blur-xl shadow-[0_-10px_24px_rgba(0,0,0,0.22)]">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#38bdf8] dmsans">Signed in as</p>
                    <p className="truncate text-sm font-medium text-white/80 mt-1 dmsans">{email || 'Loading...'}</p>

                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => { setProfileSheetOpen(false); router.push('/home'); }}
                        className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 dmsans hover:bg-white/10"
                      >
                        Go to Home
                      </button>
                      <button
                        onClick={signOut}
                        className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-left text-sm font-semibold text-rose-400 dmsans hover:bg-rose-500/10"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[#38bdf8]/10 bg-[#020617]/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((link) => {
                const isActive = active === link.key;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block w-full rounded-xl px-4 py-3 text-sm dmsans font-medium transition-all ${isActive ? 'bg-gradient-to-r from-[#1e40af] to-[#38bdf8] text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
