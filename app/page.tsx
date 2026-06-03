"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabaseClient";
import { OfficerAppbar } from "@/components/ui/officer-appbar";
// Removed public Generate button; ArrowRight icon no longer needed
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ScanLine, ArrowRight, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { GetInTouch } from "@/components/ui/get-in-touch";

export default function Home() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<{ value: string; label: string }[]>([
    { value: "10,000+", label: "Documents Authenticated" },
    { value: "15+", label: "Government Departments" },
    { value: "100%", label: "Verification Accuracy" },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user) {
          setCheckingAuth(false);
          return;
        }
        setUserEmail(user.email ?? null);
        const res = await fetch(`/api/access/context?userId=${user.id}`);
        const body = await res.json().catch(() => null);
        if (body?.found) {
          if (body.isAdmin) {
            router.replace("/admin");
            return;
          }
          if (body.canGenerate) {
            router.replace("/home");
            return;
          }
        }
      } catch (e) {
        // ignore and show public landing
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, [router, supabase]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/public/metrics');
        if (!res.ok) return;
        const body = await res.json().catch(() => null);
        if (!body || !mounted) return;
        const total = typeof body.totalDocuments === 'number' ? body.totalDocuments : 0;
        const depts = typeof body.departmentsCount === 'number' ? body.departmentsCount : 6;
        const displayTotal = total > 1000 ? "1000+" : total.toLocaleString();
        setStats([
          { value: displayTotal, label: 'Documents Authenticated' },
          { value: String(depts), label: 'Government Departments' },
          { value: '100%', label: 'Verification Accuracy' },
        ]);
      } catch (e) {
        // ignore and keep defaults
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-[var(--color-text)] overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        {checkingAuth && (
          <div className="absolute top-0 left-0 right-0">
            <OfficerAppbar email={userEmail ?? ""} active="home" />
          </div>
        )}

        {/* Background layers */}
        <BackgroundPaths mode="background" className="" />

        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px',
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none bg-gradient-to-t from-[#020617] to-transparent" />

        <div className="absolute left-0 right-0 h-[1px] top-1/2 pointer-events-none bg-gradient-to-r from-transparent via-[#38bdf8]/10 to-transparent" />

        {/* Hero content container */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-20 pb-16 flex flex-col items-center text-center">

          {/* System badge removed as requested */}

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="mb-2"
          >
            <div className="playfair text-[2.6rem] xs:text-5xl sm:text-7xl md:text-8xl lg:text-[96px] leading-[1.05] font-bold">
              <motion.span
                variants={{ hidden: { y: 60, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="block text-white text-glow-white"
              >
                Authenticate.
              </motion.span>
              <motion.span
                variants={{ hidden: { y: 60, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="block text-white text-glow-white"
              >
                Verify.
              </motion.span>
              <motion.span
                variants={{ hidden: { y: 60, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="block text-gradient-blue text-glow-blue"
              >
                Trust.
              </motion.span>
            </div>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 72, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mx-auto mt-4 h-[3px] rounded-full shimmer-line"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="dmsans mt-8 mx-auto max-w-[560px] text-base sm:text-lg leading-[1.85] text-white/60 font-light"
          >
            The Galiyat Development Authority Document Verification System ensures every
            official document is uniquely identified, barcode-authenticated, and instantly
            verifiable — protecting citizens and institutions alike.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10"
          >
            <Link href="/verify">
              <motion.span
                whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(56, 189, 248, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 rounded-2xl px-9 py-4 bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white dmsans text-sm font-semibold tracking-wide shadow-[0_8px_24px_rgba(37,99,235,0.2)] transition-all duration-300 cursor-pointer"
                style={{ display: "inline-flex" }}
              >
                <ScanLine className="h-4 w-4" />
                Verify Document
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-5 flex items-center justify-center gap-2 dmsans text-xs text-white/35 tracking-wide"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#38bdf8]" />
            No login required for public document verification
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            viewport={{ once: true }}
            className="mt-20 w-full max-w-3xl mx-auto grid grid-cols-3 divide-x divide-[#38bdf8]/10 border border-[#38bdf8]/10 rounded-2xl bg-[#0f172a]/40 backdrop-blur-md overflow-hidden"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="py-6 px-4 text-center">
                <div className="playfair text-3xl sm:text-4xl font-bold text-gradient-blue">{stat.value}</div>
                <div className="dmsans mt-1.5 text-[11px] uppercase tracking-[0.1em] text-white/40 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-16 flex flex-col items-center gap-2">
            <div className="h-10 w-[1px] bg-gradient-to-b from-[#38bdf8]/50 to-transparent animate-float" />
            <span className="dmsans text-[10px] tracking-[0.2em] uppercase text-white/25">Scroll</span>
          </motion.div>

        </div>
      </section>

      <GetInTouch />

      <Footer />
    </div>
  );
}
