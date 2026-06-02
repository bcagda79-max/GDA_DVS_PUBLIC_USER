"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Footer } from "@/components/ui/footer";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { SiteHeader } from "../components/site-header";
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, 
  Send, Building2, Shield, ChevronRight, 
  Globe, Headphones, HelpCircle, ExternalLink,
  Smartphone, Laptop, UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactUsPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const contacts = [
    { 
      label: "General Helpline", 
      value: "0992-9310240", 
      icon: Headphones,
      desc: "Primary support for Galiyat Development Authority services.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    { 
      label: "Complaint Cell", 
      value: "0992-9311082", 
      icon: MessageSquare,
      desc: "Formal registry for citizen grievances and tracking.",
      color: "from-indigo-500/20 to-blue-500/20"
    },
    { 
      label: "Control Room", 
      value: "0992-355539", 
      icon: Shield,
      desc: "Emergency response and 24/7 facility monitoring.",
      color: "from-cyan-500/20 to-sky-500/20"
    },
    { 
      label: "Official Email", 
      value: "info@gda.kp.gov.pk", 
      icon: Mail,
      desc: "Secure digital correspondence and documentation.",
      color: "from-blue-600/20 to-indigo-600/20"
    },
  ];

  const departments = [
    { id: "01", name: "Control Room & Facilitation Center", contact: "+92-992-355539", tag: "Critical", icon: Shield },
    { id: "02", name: "Planning & Development (P&D)", contact: "+92-03459322295", tag: "Technical", icon: Laptop },
    { id: "03", name: "Makhniyal Cell / AD Makhniyal", contact: "+92-03335025037", tag: "Regional", icon: MapPin },
    { id: "04", name: "One Window Operation", contact: "+92-09311082", tag: "Public", icon: UserCheck },
    { id: "05", name: "Tourism Section", contact: "+92-092408014", tag: "Tourism", icon: Globe },
    { id: "06", name: "Accounts Section", contact: "+0992-637632", tag: "Finance", icon: Building2 },
    { id: "07", name: "Media Section (PRO)", contact: "+92-03115643556", tag: "Publicity", icon: Smartphone },
    { id: "08", name: "PA to Director General", contact: "9310240", tag: "Admin", icon: Building2 },
  ];

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-x-hidden selection:bg-[#38bdf8]/30 selection:text-white font-dm-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <BackgroundPaths mode="background" className="opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(56,189,248,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />
      </div>

      <SiteHeader />

      <main className="relative z-10 pt-32 pb-24 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          
          {/* HERO SECTION */}
          <motion.div 
            style={{ opacity, scale }}
            className="mb-32 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/5 px-5 py-2 mb-8 backdrop-blur-md">
                <div className="h-2 w-2 rounded-full bg-[#38bdf8] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">Official Contact Portal</span>
              </div>
              <h1 className="font-playfair text-6xl sm:text-8xl font-bold text-white mb-8 tracking-tighter leading-tight">
                Contact <span className="professional-gradient-text">Us</span>
              </h1>
              <div className="relative h-[1px] w-48 mx-auto mb-10 overflow-hidden bg-white/10">
                <div className="shimmer-line absolute inset-0" />
              </div>
              <p className="max-w-2xl mx-auto text-white/50 text-lg sm:text-xl leading-relaxed font-light">
                Direct access to the Galiyat Development Authority's administrative network. 
                We are committed to providing seamless communication for all citizens and tourists.
              </p>
            </motion.div>
          </motion.div>

          {/* 3D CONTACT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40 perspective-2000">
            {contacts.map((contact, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: idx * 0.1, 
                  duration: 1.2, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                whileHover={{ 
                  y: -15, 
                  rotateX: 8, 
                  rotateY: 8,
                  scale: 1.02,
                  transition: { duration: 0.4 }
                }}
                className="group relative rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-10 hover:border-[#38bdf8]/30 transition-all duration-500 overflow-hidden"
              >
                {/* 3D Decorative Background */}
                <div className={cn(
                  "absolute -right-16 -top-16 h-64 w-64 rounded-full blur-[80px] transition-all duration-700 opacity-20 group-hover:opacity-40",
                  contact.color
                )} />

                <div className="relative z-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-[#38bdf8]/5">
                    <contact.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-white mb-3 group-hover:text-[#38bdf8] transition-colors">
                    {contact.label}
                  </h3>
                  <p className="text-white/30 text-[13px] leading-relaxed mb-8 font-light min-h-[48px]">
                    {contact.desc}
                  </p>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[#38bdf8] font-bold text-lg tracking-tight group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                      {contact.value}
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mb-40">
            
            {/* DIRECTORY SECTION */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="space-y-10"
            >
              <div className="flex items-end justify-between px-2">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px w-8 bg-[#38bdf8]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">Department Directory</span>
                  </div>
                  <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-white">Institutional <span className="text-white/40">Units</span></h2>
                </div>
                <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-white/20">
                  <Building2 size={24} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept, idx) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#38bdf8]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#38bdf8]/5 text-[#38bdf8]/60 group-hover:text-[#38bdf8] transition-colors">
                        <dept.icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">Ext: {dept.id}</p>
                        <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate mb-1">{dept.name}</h4>
                        <p className="text-[11px] font-medium text-[#38bdf8]/50 group-hover:text-[#38bdf8] transition-colors">{dept.contact}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* FINAL INSTITUTIONAL CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[4rem] border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-16 sm:p-24 text-center overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent" />
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.03] border border-white/5 mb-10">
                <Shield className="h-10 w-10 text-[#38bdf8]" />
              </div>
              <h2 className="font-playfair text-4xl sm:text-6xl font-bold text-white mb-8 tracking-tight">Administrative Integrity</h2>
              <p className="text-white/40 text-lg leading-relaxed mb-12 font-light">
                The Galiyat Development Authority operates under the strictest protocols of transparency 
                and public accountability. Our digital infrastructure is designed to facilitate 
                citizens while ensuring the preservation of our regional heritage and values.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Registry Status: Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-[#38bdf8]/40" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Official KP Govt Portal</span>
                </div>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-[#38bdf8]/40" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Verified Authority</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
