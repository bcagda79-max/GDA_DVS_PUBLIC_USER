"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { AuthFeedback } from "@/components/ui/auth-feedback";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { 
  ShieldCheck, UserPlus, UserX, Mail, Building2, Calendar, 
  CheckCircle2, XCircle, Clock, Filter, Search, ChevronRight,
  MoreVertical, ShieldAlert
} from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { cn } from "@/lib/utils";

export default function AdminRequestsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [filter, setFilter] = useState("pending"); // all | pending | approved | rejected
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = feedback ? window.setTimeout(() => setFeedback(null), 5000) : null;
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [feedback]);

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
        if (!res.ok) throw new Error(body?.error ?? "Failed");
        setOfficers(body.allOfficers ?? body.pendingOfficers ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  async function approve(officerId: string) {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const adminUserId = userData?.user?.id;

      if (!adminUserId) throw new Error("Admin session not found.");

      const { data } = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId, adminUserId }),
      }).then((r) => r.json());

      if (data?.error) throw new Error(data.error);
      setFeedback({ type: "success", message: "Officer approved successfully." });
      
      const res = await fetch(`/api/admin/dashboard?userId=${adminUserId}`);
      const body = await res.json();
      setOfficers(body.allOfficers ?? body.pendingOfficers ?? []);
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message ?? "Approval Failed" });
    } finally {
      setLoading(false);
    }
  }

  async function reject(officerId: string) {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const adminUserId = userData?.user?.id;
      if (!adminUserId) throw new Error("Admin session missing");

      const { data } = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId, adminUserId }),
      }).then((r) => r.json());

      if (data?.error) throw new Error(data.error);
      setFeedback({ type: "success", message: "Officer rejected" });

      const res = await fetch(`/api/admin/dashboard?userId=${adminUserId}`);
      const body = await res.json();
      setOfficers(body.allOfficers ?? body.pendingOfficers ?? []);
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message ?? "Reject failed" });
    } finally {
      setLoading(false);
    }
  }

  const filteredOfficers = officers.filter((o) => {
    const matchesSearch = 
      (o.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (o.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (o.department?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === "all") return true;
    if (filter === "approved") return o.approved === true;
    if (filter === "rejected") return o.rejected === true;
    return o.approved !== true && o.rejected !== true;
  });

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
    return <LoadingState title="Access Control" subtitle="Reviewing pending officer credentials..." />;
  }

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden bg-[#020617]">
        {/* Advanced Background Layers */}
        <BackgroundPaths mode="background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-2 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="mb-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#38bdf8]/40" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">Identity Management</span>
              </div>
              <h1 className="playfair text-4xl font-bold text-white sm:text-5xl">
                Officer <span className="professional-gradient-text">Requests</span>
              </h1>
              <p className="dmsans mt-3 max-w-xl text-sm leading-relaxed text-white/40 sm:text-base">
                Vetting and authorization portal for GDA personnel. Review registration credentials before granting system-wide access.
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
                  placeholder="Search name, email, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 dmsans text-sm text-white placeholder:text-white/20 focus:border-[#38bdf8]/40 focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/40 transition-all sm:w-64"
                />
              </div>

              {/* Status Filters */}
              <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/5 p-1.5">
                {['pending', 'approved', 'rejected', 'all'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "h-full rounded-xl px-4 dmsans text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                      filter === f 
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

          <AuthFeedback message={feedback?.message ?? null} type={feedback?.type ?? "error"} onClose={() => setFeedback(null)} />

          {/* Main Content Area */}
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
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">Personnel Details</th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">Communication</th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">Request Date</th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">Access Status</th>
                    <th className="px-6 py-5 dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filteredOfficers.length > 0 ? (
                      filteredOfficers.map((o) => (
                        <motion.tr 
                          key={o.id}
                          layout
                          variants={itemVariants}
                          className="group hover:bg-white/[0.01] transition-all duration-300"
                        >
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] group-hover:scale-105 transition-transform duration-500">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="dmsans text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors">{o.full_name}</p>
                                <p className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/30">{o.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2 text-xs text-white/50 dmsans">
                              <Mail className="h-3.5 w-3.5 text-[#38bdf8]/40" />
                              {o.email}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2 text-xs text-white/40 dmsans">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            {o.approved === true ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 dmsans text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Authorized
                              </span>
                            ) : o.rejected === true ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 dmsans text-[10px] font-bold uppercase tracking-wider text-rose-400">
                                <XCircle className="h-3 w-3" /> Revoked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-3 py-1 dmsans text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] animate-pulse">
                                <Clock className="h-3 w-3" /> Pending Vetting
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {o.approved !== true && o.rejected !== true ? (
                                <>
                                  <button
                                    onClick={() => approve(o.id)}
                                    className="h-9 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 dmsans text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-emerald-500 hover:text-[#020617] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => reject(o.id)}
                                    className="h-9 px-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 dmsans text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-rose-500 hover:text-[#020617] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/20 hover:text-white/40 transition-all">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={5} className="px-6 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/10">
                              <ShieldAlert className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                              <p className="dmsans text-sm font-semibold text-white/40">No pending vetting requests</p>
                              <p className="dmsans text-[11px] text-white/20">All officer registrations have been processed for the current queue.</p>
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
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/30">Auth Gateway Online</span>
                </div>
                <div className="h-4 w-px bg-white/5" />
                <span className="dmsans text-[10px] font-medium text-white/20">{filteredOfficers.length} Profiles in View</span>
              </div>
              <p className="dmsans text-[10px] text-white/20 uppercase tracking-tighter">
                GDA Identity Protection • Secure Vetting Protocol v4.1
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
