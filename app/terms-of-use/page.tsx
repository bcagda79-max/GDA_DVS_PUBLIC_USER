"use client";

import React from "react";
import { motion } from "framer-motion";
import { Footer } from "@/components/ui/footer";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { 
  Scale, ShieldAlert, FileCheck2, Ban, History, 
  Gavel, CheckCircle2, Info, ChevronRight 
} from "lucide-react";
import { SiteHeader } from "../components/site-header";

export default function TermsOfUsePage() {
  const terms = [
    {
      title: "Account Responsibility",
      icon: ShieldAlert,
      content: "Officers and administrative staff are strictly responsible for maintaining the confidentiality of their credentials. Any unauthorized access or credential sharing will result in immediate revocation of system privileges.",
      highlight: "Authorized Use Only"
    },
    {
      title: "Acceptable Use Policy",
      icon: Ban,
      content: "The GDA-DVS must not be used for generating fraudulent documents, unauthorized data scraping, or any activity that compromises the integrity of the Galiyat Development Authority's digital records.",
      highlight: "Zero Tolerance"
    },
    {
      title: "Verification Integrity",
      icon: FileCheck2,
      content: "Verification results are served directly from the GDA central registry. While we ensure maximum uptime, the results provided are for official authentication purposes and must be handled with care.",
      highlight: "Official Records"
    },
    {
      title: "Limitation of Liability",
      icon: Gavel,
      content: "GDA-DVS is provided as a secure utility. The Authority is not liable for indirect damages arising from system maintenance windows or user-side connectivity issues during critical verification tasks.",
      highlight: "Legal Disclaimer"
    },
    {
      title: "System Termination",
      icon: History,
      content: "The Galiyat Development Authority reserves the right to suspend access to any user found violating these terms or engaging in suspicious telemetry patterns detected by our security shield.",
      highlight: "Access Control"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-x-hidden selection:bg-[#38bdf8]/30 selection:text-white">
      {/* Optimized Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <BackgroundPaths mode="background" className="opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(56,189,248,0.05),transparent_70%)]" />
      </div>

      <SiteHeader />

      <main className="relative z-10 pt-32 pb-24 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          
          {/* HERO SECTION */}
          <div className="mb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/5 px-4 py-1.5 mb-6">
                <Scale className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">Governance Framework</span>
              </div>
              <h1 className="playfair text-5xl sm:text-7xl font-bold text-white mb-8 tracking-tight">
                Terms of <span className="text-gradient-blue">Service</span>
              </h1>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent mx-auto mb-8" />
              <p className="dmsans max-w-2xl mx-auto text-white/50 text-base sm:text-lg leading-relaxed font-light">
                Please review the legal guidelines and operational protocols governing the use of the Galiyat Development Authority Document Verification System.
              </p>
            </motion.div>
          </div>

          {/* TERMS LIST */}
          <div className="max-w-4xl mx-auto space-y-6 mb-32">
            {terms.map((term, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative rounded-3xl border border-white/5 bg-[#0f172a]/40 backdrop-blur-xl p-8 hover:border-[#38bdf8]/20 transition-all duration-500"
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] group-hover:bg-[#38bdf8]/10 transition-all duration-500">
                    <term.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="playfair text-xl font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                        {term.title}
                      </h3>
                      <span className="hidden sm:block dmsans text-[9px] font-bold uppercase tracking-widest text-[#38bdf8]/40">
                        {term.highlight}
                      </span>
                    </div>
                    <p className="dmsans text-white/40 text-sm leading-relaxed font-light">
                      {term.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ACCEPTANCE CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] border border-[#38bdf8]/20 bg-gradient-to-br from-[#0f172a] to-[#020617] p-10 text-center overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:30px_30px]" />
            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#38bdf8]/10 text-[#38bdf8] mx-auto mb-6">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="playfair text-2xl font-bold text-white mb-4">Implicit Acceptance</h2>
              <p className="dmsans text-white/50 text-sm max-w-2xl mx-auto mb-8 font-light">
                By accessing the GDA-DVS portal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws and regulations of the Government of Pakistan.
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
                <Info className="h-3 w-3" />
                Last Updated: May 23, 2026
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
