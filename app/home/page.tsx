"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { OfficerAppbar } from "@/components/ui/officer-appbar";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Barcode, Calendar, History, TrendingUp, 
  FileText, ShieldCheck, Zap, Activity, Clock
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { cn } from "@/lib/utils";

type OfficerDashboardResponse = {
  officer: {
    userId: string;
    email: string;
    fullName: string;
    designation: string;
    department: string;
    role: string;
    approved: boolean;
    canGenerate: boolean;
  };
  metrics: {
    totalDocuments: number;
    todayDocuments: number;
    weekDocuments: number;
    monthDocuments: number;
    lastGeneratedAt: string | null;
  };
  recentDocuments: Array<{
    id: string;
    title: string;
    department: string;
    recipient_name: string | null;
    created_at: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    department: string;
    recipient_name: string | null;
    processed_by: string | null;
    created_at: string;
  }>;
};

export default function OfficerHomePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OfficerDashboardResponse | null>(null);

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
        if (!res.ok) throw new Error(body?.error ?? "Failed to load officer dashboard.");
        setData(body);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const stats = useMemo(() => [
    { label: "Total Generated", value: data?.metrics.totalDocuments ?? 0, icon: Barcode, color: "text-[#38bdf8]" },
    { label: "Today", value: data?.metrics.todayDocuments ?? 0, icon: Zap, color: "text-emerald-400" },
    { label: "This Week", value: data?.metrics.weekDocuments ?? 0, icon: TrendingUp, color: "text-sky-400" },
    { label: "This Month", value: data?.metrics.monthDocuments ?? 0, icon: Calendar, color: "text-purple-400" },
  ], [data]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  if (loading) {
    return <LoadingState title="GDA Workspace" subtitle="Preparing your officer dashboard..." />;
  }

  const dashboardData = data as OfficerDashboardResponse;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col w-full overflow-x-hidden">
      <BackgroundPaths mode="background" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
      
      <OfficerAppbar email={dashboardData.officer.email} active="home" />

      <main className="pt-[68px] sm:pt-[72px] flex-1 flex flex-col relative z-10 w-full">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#38bdf8]/40" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">Officer Terminal</span>
              </div>
              <h1 className="playfair text-4xl sm:text-6xl font-bold text-white">
                Welcome, <span className="text-gradient-blue">{dashboardData.officer.fullName.split(' ')[0]}</span>
              </h1>
              <p className="dmsans mt-4 max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                Manage your authentication workload and monitor document registry activity from your secure GDA workspace.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/generate"
                className="group relative h-14 px-8 rounded-2xl bg-[#38bdf8] text-[#020617] flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(56,189,248,0.2)]"
              >
                <Barcode className="h-5 w-5" />
                <span className="playfair font-bold text-lg">Generate New</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.section>

          {/* Stats Grid */}
          <motion.section 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative rounded-3xl border border-white/5 bg-[#0f172a]/40 backdrop-blur-md p-6 transition-all hover:border-[#38bdf8]/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition-colors group-hover:bg-[#38bdf8]/10", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    <Activity className="h-3 w-3" />
                    Live
                  </div>
                </div>
                <p className="playfair text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="dmsans text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">{stat.label}</p>
              </motion.div>
            ))}
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            
            {/* Recent Activity Ledger */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-[2.5rem] border border-white/5 bg-[#0f172a]/40 backdrop-blur-md overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="playfair text-2xl font-bold text-white">Recent Registry</h3>
                  <p className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Latest document stamping events</p>
                </div>
                <Link href="/history" className="text-[#38bdf8] dmsans text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                  View Full History <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/60">
                    <tr>
                      <th className="px-8 py-4">Credential ID</th>
                      <th className="px-8 py-4">Title</th>
                      <th className="px-8 py-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dashboardData.recentDocuments.length > 0 ? (
                      dashboardData.recentDocuments.map((doc) => (
                        <tr key={doc.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-5">
                            <span className="font-mono text-[11px] font-bold text-white/80 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                              {doc.id}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="dmsans text-sm font-semibold text-white group-hover:text-[#38bdf8] transition-colors">{doc.title}</p>
                            <p className="dmsans text-[10px] text-white/30">{doc.department}</p>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <p className="dmsans text-xs font-bold text-white/60">
                              {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="dmsans text-[10px] text-white/20">
                              {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <History className="h-10 w-10 text-white/5" />
                            <p className="dmsans text-sm text-white/20">No recent generation activity</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.section>

            {/* Quick Insights Sidebar */}
            <motion.aside 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Profile Card */}
              <div className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#0f172a] to-[#020617] p-8 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h4 className="playfair text-xl font-bold text-white mb-1">{dashboardData.officer.fullName}</h4>
                  <p className="dmsans text-[#38bdf8] text-[10px] font-bold uppercase tracking-widest mb-4">{dashboardData.officer.designation}</p>
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 dmsans uppercase tracking-widest">
                      <Building2 className="h-3 w-3" />
                      {dashboardData.officer.department}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 dmsans uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      Last Active: {dashboardData.metrics.lastGeneratedAt ? new Date(dashboardData.metrics.lastGeneratedAt).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="rounded-[2rem] border border-white/5 bg-[#0f172a]/40 backdrop-blur-md p-8">
                <div className="flex items-center gap-2 mb-6 text-[#38bdf8]/60">
                  <Zap className="h-4 w-4" />
                  <span className="dmsans text-[10px] font-bold uppercase tracking-widest">Registry Status</span>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="dmsans text-xs text-white/60">GDA Cloud Core</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dmsans text-xs text-white/60">Auth Gateway</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dmsans text-xs text-white/60">Encryption Key-v4</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              </div>
            </motion.aside>

          </div>
        </div>
      </main>

      <Footer variant="officer" />
    </div>
  );
}

function Building2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  );
}
