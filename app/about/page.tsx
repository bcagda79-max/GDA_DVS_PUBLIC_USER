"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ShieldCheck, BadgeCheck, Building2, FileScan, LockKeyhole, Users, Code, Award, ChevronRight } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { SiteHeader } from "../components/site-header";
import { cn } from "@/lib/utils";

const leaders = [
  {
    name: "MR. Fawad Khan",
    role: "Director General",
    organization: "Galiyat Development Authority (GDA) Abbottabad",
    description: "Visionary leadership steering GDA towards digital excellence and administrative transparency.",
    icon: Award,
  },
  {
    name: "MR. Farukh Jadoon",
    role: "Director (BCA)",
    organization: "Galiyat Development Authority (GDA)",
    description: "Driving force behind the Building Control Authority's digital transformation and document security.",
    icon: ShieldCheck,
  }
];

const developers = [
  {
    name: "Muhammad Khizar Lodhi",
    role: "Full Stack Developer",
    contribution: "System Architecture & Frontend Design",
    image: "/khizar.jpg", // Placeholder if not exist
    github: "https://github.com/khizar8055",
    linkedin: "https://www.linkedin.com/in/khizar-lodhi-612137359/",
  },
  {
    name: "Mohibullah Lodhi",
    role: "Full Stack Developer",
    contribution: "Backend Systems & Database Security",
    image: "/mohib.jpg", // Placeholder if not exist
    github: "https://github.com/mohibullahlodhi",
    linkedin: "https://www.linkedin.com/in/mohib-ullah-lodhi-20baa03a7/",
  }
];

function SiGithub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.907-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.09.635-1.34-2.22-.252-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.03-2.692-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.202 2.397.1 2.65.64.704 1.028 1.599 1.028 2.692 0 3.848-2.339 4.695-4.566 4.942.359.309.678.921.678 1.856 0 1.34-.012 2.419-.012 2.747 0 .268.18.58.688.481A10.019 10.019 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  );
}

function SiLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM.18 8.98H4.8V24H.18V8.98ZM8.11 8.98h4.43v2.05h.06c.62-1.18 2.13-2.43 4.38-2.43 4.69 0 5.56 3.09 5.56 7.11V24h-4.62v-6.97c0-1.66-.03-3.8-2.32-3.8-2.33 0-2.69 1.82-2.69 3.68V24H8.11V8.98Z" />
    </svg>
  );
}

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, rotateX: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-x-hidden selection:bg-[#38bdf8]/30 selection:text-white">
      <BackgroundPaths mode="background" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
      
      <SiteHeader />

      <main className="relative z-10 pt-32 pb-24 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          
          {/* HERO SECTION */}
          <motion.section 
            style={{ opacity, scale }}
            className="mb-32 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/5 px-4 py-1.5 mb-8">
                <Building2 className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">About GDA-DVS</span>
              </div>
              <h1 className="playfair text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
                Institutional <span className="professional-gradient-text">Excellence</span>
              </h1>
              <p className="dmsans max-w-3xl mx-auto text-white/50 text-lg sm:text-xl leading-relaxed font-light mb-12">
                A state-of-the-art Document Verification System (DVS) designed for the Galiyat Development Authority to ensure immutable trust and digital accountability.
              </p>

              {/* Professional System Description Paragraph */}
              <div className="max-w-4xl mx-auto rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-md">
                <h3 className="playfair text-2xl font-bold text-[#38bdf8] mb-6">About the System</h3>
                <p className="dmsans text-white/60 text-base leading-relaxed text-justify">
                  The GDA Document Verification System (GDA-DVS) stands as a cornerstone of digital governance within the Galiyat Development Authority. 
                  Engineered with a focus on administrative transparency and document integrity, this platform standardizes the lifecycle of official 
                  records—from secure issuance by authorized personnel to instant, decentralized verification by the public. By leveraging unique 
                  barcode identifiers and encrypted registry ledgers, the system mitigates the risk of document tampering and ensures that 
                  citizens and institutions can interact with the Authority through a trusted, verifiable digital interface. This initiative 
                  represents our commitment to modernizing public service delivery through cutting-edge technology and rigorous security protocols.
                </p>
              </div>
            </motion.div>
          </motion.section>

          {/* LEADERSHIP SECTION */}
          <section className="mb-40">
            <div className="flex items-center gap-4 mb-16">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#38bdf8]/20" />
              <h2 className="playfair text-3xl font-bold text-white">Under the Leadership of</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#38bdf8]/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {leaders.map((leader, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group relative rounded-[3rem] border border-white/5 bg-[#0F172A]/40 backdrop-blur-xl p-8 sm:p-12 hover:border-[#38bdf8]/20 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#38bdf8]/5 blur-3xl group-hover:bg-[#38bdf8]/10 transition-colors duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] mb-8 group-hover:scale-110 group-hover:bg-[#38bdf8]/10 transition-all duration-500">
                      <leader.icon className="h-8 w-8" />
                    </div>
                    <h3 className="playfair text-3xl font-bold text-white mb-2 group-hover:text-[#38bdf8] transition-colors">
                      {leader.name}
                    </h3>
                    <p className="dmsans text-[#38bdf8] text-sm font-bold uppercase tracking-[0.15em] mb-6">
                      {leader.role}
                    </p>
                    <p className="dmsans text-white/40 text-sm leading-relaxed mb-6 font-light">
                      {leader.description}
                    </p>
                    <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-white/20 dmsans text-[10px] font-bold uppercase tracking-widest">
                      <Building2 className="h-3.5 w-3.5" />
                      {leader.organization}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* DEVELOPMENT TEAM SECTION */}
          <section className="mb-32">
            <div className="text-center mb-20">
              <h2 className="playfair text-4xl font-bold text-white mb-4">Architects of DVS</h2>
              <p className="dmsans text-white/30 text-sm tracking-widest uppercase">Developed & Engineered By</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {developers.map((dev, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative group rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-10 hover:border-[#38bdf8]/30 transition-all duration-500"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="h-24 w-24 rounded-full border-2 border-[#38bdf8]/20 p-1 group-hover:border-[#38bdf8]/50 transition-all duration-500">
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-[#0F172A] to-[#020617] flex items-center justify-center">
                          <Users className="h-10 w-10 text-white/20 group-hover:text-[#38bdf8] transition-colors" />
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-[#020617] border border-white/5 flex items-center justify-center text-[#38bdf8] shadow-2xl">
                        <Code className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <h3 className="playfair text-2xl font-bold text-white mb-2">{dev.name}</h3>
                    <p className="dmsans text-[#38bdf8]/80 text-xs font-bold uppercase tracking-[0.2em] mb-4">{dev.role}</p>
                    <p className="dmsans text-white/30 text-[13px] leading-relaxed mb-8">{dev.contribution}</p>
                    
                    <div className="flex items-center gap-4">
                      <a
                        href={dev.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${dev.name} GitHub`}
                        className="h-10 w-10 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-[#38bdf8]/20 transition-all"
                      >
                        <SiGithub className="h-4.5 w-4.5" />
                      </a>
                      <a
                        href={dev.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${dev.name} LinkedIn`}
                        className="h-10 w-10 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-[#38bdf8]/20 transition-all"
                      >
                        <SiLinkedin className="h-4.5 w-4.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* GDA LOGO SECTION */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center pt-20 border-t border-white/5"
          >
            <div className="relative h-40 w-40 mb-8 grayscale hover:grayscale-0 transition-all duration-700 opacity-20 hover:opacity-100">
              <Image
                src="/gda_logo.png"
                alt="GDA Official Logo"
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
            <p className="dmsans text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Official GDA Document Verification System</p>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
