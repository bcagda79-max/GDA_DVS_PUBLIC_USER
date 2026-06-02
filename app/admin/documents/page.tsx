"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { 
  Search, QrCode, FileText, Calendar, Building2, UserCircle, Database,
  ArrowUpDown, Filter, Download, ExternalLink, ChevronRight
} from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { cn } from "@/lib/utils";

export default function AdminDocumentsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return router.replace("/signin");

        const ctx = await fetch(`/api/access/context?userId=${user.id}`);
        const ctxt = await ctx.json();
        if (!ctxt?.isAdmin) return router.replace(ctxt?.canGenerate ? "/generate" : "/pending");

        const res = await fetch(`/api/admin/dashboard?userId=${user.id}`);
        const body = await res.json();
        if (!res.ok) {
          // If the server indicates the user is not an admin, redirect
          // to the officer generate page or pending page instead of
          // throwing an error that appears in the console.
          if (body?.error && String(body.error).toLowerCase().includes("admin access required")) {
            return router.replace(ctxt?.canGenerate ? "/generate" : "/pending");
          }
          throw new Error(body?.error ?? "Failed");
        }
        setDocuments(body.documentHistory ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Time filter
    if (timeFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      result = result.filter((item) => {
        const entryDate = new Date(item.created_at);
        if (timeFilter === "today") return entryDate >= today;
        if (timeFilter === "yesterday") return entryDate >= yesterday && entryDate < today;
        return true;
      });
    }

    // Search query filter
    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter((item) =>
        [item.id, item.officerName, item.title, item.department].some((field) => 
          String(field ?? "").toLowerCase().includes(term)
        )
      );
    }

    return result;
  }, [documents, query, timeFilter]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      } 
    }
  };

  if (loading) {
    return <LoadingState title="Retrieving Registry" subtitle="Accessing government document ledgers..." />;
  }

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden bg-[#020617]">
        {/* Advanced Background Layers */}
        <BackgroundPaths mode="background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-4 pb-2 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="mb-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#38bdf8]/40" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">Document Registry</span>
              </div>
              <h1 className="playfair text-4xl font-bold text-white sm:text-5xl">
                Barcode <span className="professional-gradient-text">History</span>
              </h1>
              <p className="dmsans mt-3 max-w-xl text-sm leading-relaxed text-white/40 sm:text-base">
                An immutable, centralized ledger of all QR-stamped credentials issued across GDA departments.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-[#38bdf8]" />
                <input 
                  type="text"
                  placeholder="Search ID, title, or officer..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 dmsans text-sm text-white placeholder:text-white/20 focus:border-[#38bdf8]/40 focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/40 transition-all sm:w-64"
                />
              </div>

              {/* Time Filters */}
              <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/5 p-1.5">
                {['today', 'yesterday', 'all'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={cn(
                      "h-full rounded-xl px-4 dmsans text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                      timeFilter === f 
                        ? "bg-[#38bdf8] text-[#020617] shadow-[0_4px_12px_rgba(56,189,248,0.3)]" 
                        : "text-white/40 hover:text-white/80"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Ledger Table Container */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="rounded-[2rem] border border-white/5 bg-[#0F172A]/40 backdrop-blur-md overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
          >
            <div className="overflow-x-auto admin-h-scroll">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-3.5 w-3.5" />
                        Credential ID
                      </div>
                    </th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        Document Details
                      </div>
                    </th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Department
                      </div>
                    </th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-3.5 w-3.5" />
                        Authorized By
                      </div>
                    </th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Timestamp
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((item) => (
                        <motion.tr 
                          key={item.id}
                          layout
                          variants={itemVariants}
                          className="group hover:bg-white/[0.02] transition-all duration-300"
                        >
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] group-hover:scale-110 group-hover:bg-[#38bdf8]/10 transition-all duration-300">
                                <QrCode className="h-4.5 w-4.5" />
                              </div>
                              <span className="font-mono text-[11px] font-bold text-white/80 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                {item.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 max-w-[300px]">
                            <div className="space-y-1">
                              <h4 className="dmsans text-sm font-semibold text-white group-hover:text-[#38bdf8] transition-colors line-clamp-1">{item.title}</h4>
                              <p className="dmsans text-[10px] font-medium text-white/30 uppercase tracking-widest truncate">{item.recipient_name || "Internal Record"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 dmsans text-[11px] font-medium text-white/60">
                              <Database className="h-3 w-3 text-[#38bdf8]/40" />
                              {item.department}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center text-white/30 text-[10px] font-bold border border-white/5">
                                {item.officerName?.charAt(0) || "U"}
                              </div>
                              <span className="dmsans text-xs font-medium text-white/70">{item.officerName || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="dmsans text-xs font-bold text-white/80">
                                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="dmsans text-[10px] font-medium text-white/20">
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr initial={{ opacity: 0 }}>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/10">
                              <FileText className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                              <p className="dmsans text-sm font-semibold text-white/40">No matching records found</p>
                              <p className="dmsans text-[11px] text-white/20">Try adjusting your filters or search terms</p>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Ledger Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/30">Registry Stream Active</span>
                </div>
                <div className="h-4 w-px bg-white/5" />
                <span className="dmsans text-[10px] font-medium text-white/20">{filteredDocuments.length} Records in Ledger</span>
              </div>
              <p className="dmsans text-[10px] text-white/20 uppercase tracking-tighter">
                GDA Distributed Verification Ledger v2.0
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}

// Simple Clock3 icon if not imported from lucide
function Clock3({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
