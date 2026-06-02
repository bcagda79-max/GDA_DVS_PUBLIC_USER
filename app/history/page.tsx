"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { OfficerAppbar } from "@/components/ui/officer-appbar";
import { Footer } from "@/components/ui/footer";
import { 
  FileText, Search, Filter, ArrowUpDown, Download, 
  ExternalLink, Calendar, Clock, Database, ShieldCheck,
  ChevronRight, Barcode
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { cn } from "@/lib/utils";

type HistoryItem = {
  id: string;
  title: string;
  department: string;
  recipient_name: string | null;
  created_at: string;
};

export default function OfficerHistoryPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return router.replace("/signin");

        const ctxRes = await fetch(`/api/access/context?userId=${user.id}`);
        const ctx = await ctxRes.json();
        if (!ctx?.found) return router.replace("/signin");
        if (ctx?.isAdmin) return router.replace("/admin");
        if (!ctx?.canGenerate) return router.replace("/pending");

        const res = await fetch(`/api/officer/dashboard?userId=${user.id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to load history.");

        setEmail(body?.officer?.email ?? user.email ?? "");
        setItems(body?.documents ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const filtered = useMemo(() => {
    let result = items;

    // Search filter
    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter((item) =>
        [item.id, item.title, item.department, item.recipient_name ?? ""].some((field) => 
          field.toLowerCase().includes(term)
        )
      );
    }

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

    return result;
  }, [items, query, timeFilter]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.05 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  if (loading) {
    return <LoadingState title="Accessing History" subtitle="Fetching your barcode generation records..." />;
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col w-full overflow-x-hidden">
      <BackgroundPaths mode="background" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
      
      <OfficerAppbar email={email} active="history" />

      <main className="pt-[68px] sm:pt-[72px] flex-1 flex flex-col relative z-10 w-full">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#38bdf8]/40" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">Archive Registry</span>
              </div>
              <h1 className="playfair text-4xl sm:text-5xl font-bold text-white">
                My Barcode <span className="professional-gradient-text">Records</span>
              </h1>
              <p className="dmsans mt-3 max-w-xl text-sm leading-relaxed text-white/40">
                Centralized ledger of all documents stamped under your authority. Audit and track generation telemetry in real-time.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-[#38bdf8] transition-colors" />
                <input 
                  type="text"
                  placeholder="Search Registry..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 w-full sm:w-64 rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 dmsans text-sm text-white placeholder:text-white/20 focus:border-[#38bdf8]/40 outline-none transition-all"
                />
              </div>

              <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/5 p-1.5">
                {['all', 'today', 'yesterday'].map((f) => (
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

          {/* Ledger Table */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/40 backdrop-blur-md overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">Credential ID</th>
                    <th className="px-8 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">Document Title</th>
                    <th className="px-8 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">Authority Unit</th>
                    <th className="px-8 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60 text-right">Issuance Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                      filtered.map((item) => (
                        <motion.tr 
                          key={item.id}
                          layout
                          variants={itemVariants}
                          className="group hover:bg-white/[0.02] transition-all duration-300"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] group-hover:scale-110 transition-all">
                                <Barcode className="h-4.5 w-4.5" />
                              </div>
                              <span className="font-mono text-[11px] font-bold text-white/80 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                {item.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <h4 className="dmsans text-sm font-semibold text-white group-hover:text-[#38bdf8] transition-colors">{item.title}</h4>
                              <p className="dmsans text-[10px] text-white/30 uppercase tracking-widest">Official GDA Manifest</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 dmsans text-[11px] font-medium text-white/60">
                              <Database className="h-3 w-3 text-[#38bdf8]/40" />
                              {item.department}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="dmsans text-xs font-bold text-white/80">
                                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="dmsans text-[10px] font-medium text-white/30 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr initial={{ opacity: 0 }}>
                        <td colSpan={4} className="px-8 py-32 text-center">
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

            {/* Footer Stats */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/30">GDA DVS</span>
                </div>
                <div className="h-4 w-px bg-white/5" />
                <span className="dmsans text-[10px] font-medium text-white/20">{filtered.length} Entries in View</span>
              </div>
              <p className="dmsans text-[10px] text-white/20 uppercase tracking-tighter">
                GDA DVS v2.4
              </p>
            </div>
          </motion.section>

        </div>
      </main>

      <Footer variant="officer" />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(201,168,76,0.15);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(201,168,76,0.3);
        }
      `}</style>
    </div>
  );
}
