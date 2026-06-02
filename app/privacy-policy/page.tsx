"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Footer } from "@/components/ui/footer";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { 
  ShieldCheck, Lock, Eye, Database, Server, 
  FileCheck, User, Globe, ArrowRight, Shield 
} from "lucide-react";
import { SiteHeader } from "../components/site-header";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Data Sovereignty",
      icon: Database,
      content: "All document metadata and administrative logs are hosted on secure, government-authorized cloud infrastructure. We maintain strict data residency protocols ensuring all Galiyat Development Authority records remain within protected digital boundaries.",
      details: ["Tamper-Proof Verification", "Immutable Audit Logs", "Authorized Access Only"]
    },
    {
      title: "Information Vetting",
      icon: User,
      content: "We collect essential identifying information—including full name, department, and official credentials—strictly for the purpose of establishing a trusted chain of custody for document authentication.",
      details: ["Identity Verification", "Role-based Permissions", "Minimal Data Retention"]
    },
    {
      title: "Public Verification",
      icon: Eye,
      content: "Public users accessing the verification portal do so anonymously. We only track document ID queries to monitor system health and prevent brute-force attempts on the GDA registry.",
      details: ["Zero Public Tracking", "Rate Limiting Protection", "Secure ID Hashing"]
    },
    {
      title: "Cyber Security",
      icon: ShieldCheck,
      content: "Our system employs multi-layered defense mechanisms, including advanced threat detection and real-time monitoring of all administrative access points to safeguard GDA intellectual property.",
      details: ["SSL/TLS Protocols", "Bcrypt Hashing", "Periodic Security Audits"]
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
          
          {/* HERO HEADER */}
          <div className="mb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/5 px-4 py-1.5 mb-6">
                <Shield className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">GDA Security Protocol</span>
              </div>
              <h1 className="playfair text-5xl sm:text-7xl font-bold text-white mb-8 tracking-tight">
                Privacy <span className="text-gradient-blue">&</span> Trust
              </h1>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent mx-auto mb-8" />
              <p className="dmsans max-w-2xl mx-auto text-white/50 text-base sm:text-lg leading-relaxed font-light">
                The Galiyat Development Authority Document Verification System (GDA-DVS) is built on a foundation of absolute transparency and government-grade security.
              </p>
            </motion.div>
          </div>

          {/* GRID SECTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-32">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="group relative rounded-[2.5rem] border border-white/5 bg-[#0f172a]/40 backdrop-blur-xl p-8 sm:p-12 hover:border-[#38bdf8]/20 transition-all duration-500 overflow-hidden"
              >
                {/* Decorative Icon Background */}
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#38bdf8]/5 blur-3xl group-hover:bg-[#38bdf8]/10 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] mb-8 group-hover:scale-110 group-hover:bg-[#38bdf8]/10 transition-all duration-500">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <h3 className="playfair text-2xl font-bold text-white mb-4 group-hover:text-[#38bdf8] transition-colors">
                    {section.title}
                  </h3>
                  <p className="dmsans text-white/40 text-sm leading-relaxed mb-8 font-light">
                    {section.content}
                  </p>
                  <ul className="space-y-3">
                    {section.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#38bdf8]/60">
                        <div className="h-1 w-1 rounded-full bg-[#38bdf8]" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FINAL ASSURANCE CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] border border-[#38bdf8]/20 bg-gradient-to-br from-[#0f172a] to-[#020617] p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="playfair text-3xl sm:text-4xl font-bold text-white mb-6">Commitment to Integrity</h2>
              <p className="dmsans text-white/60 text-sm sm:text-base leading-relaxed mb-10 font-light">
                Our policy is updated periodically to reflect the latest cybersecurity standards and legal requirements of the Government of Pakistan. Your continued use of this portal signifies your trust in our digital governance protocols.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/40">Policy Active: May 2026</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <a href="mailto:info@gda.kp.gov.pk" className="group inline-flex items-center gap-2 text-[#38bdf8] dmsans text-[11px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors">
                  Contact GDA HQ
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// Simple ChevronRight if not imported
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
