"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Activity, Monitor, Smartphone, Globe, Clock, ShieldCheck, 
  MapPin, Fingerprint, Database, CheckCircle2, XCircle, User, X,
  Search, Filter, ChevronRight, Cpu, Network, Shield
} from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

export default function AdminLoginsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [logins, setLogins] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "today", "yesterday"
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (showMobileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileModal]);

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
        
        const loginHistory = body.loginHistory ?? [];
        setLogins(loginHistory);
        if (loginHistory.length > 0) {
          setSelected(loginHistory[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

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
    return <LoadingState title="Analyzing Security Logs" subtitle="Syncing with GDA authentication servers..." />;
  }

  const filteredLogins = logins.filter(entry => {
    const matchesSearch = 
      (entry.officerName?.toLowerCase() || entry.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (entry.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (timeFilter === "all") return true;
    const entryDate = new Date(entry.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (timeFilter === "today") return entryDate >= today;
    if (timeFilter === "yesterday") return entryDate >= yesterday && entryDate < today;
    
    return true;
  });

  const renderDetailContent = (isMobile: boolean = false) => {
    if (!selected) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[rgba(56,189,248,0.12)] bg-[rgba(56,189,248,0.03)] text-[#38bdf8]/40">
            <Activity className="h-10 w-10" />
          </div>
          <h3 className="playfair text-2xl font-bold text-white mb-3">No Active Selection</h3>
          <p className="dmsans max-w-xs text-sm leading-relaxed text-white/40">
            Select a security event from the telemetry stream to examine detailed environmental and authentication metadata.
          </p>
        </div>
      );
    }

    const isSuccess = selected.login_status?.toLowerCase() === "success" || selected.login_status?.toLowerCase() === "granted";

    return (
      <div className="flex flex-col h-full relative">
        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            onClick={() => setShowMobileModal(false)}
            className="absolute -right-1 -top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Detailed Header */}
        <div className="mb-8 flex flex-col gap-6 border-b border-white/5 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#38bdf8] shadow-[0_0_25px_rgba(56,189,248,0.1)]">
                <User className="h-8 w-8" />
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#020617]",
                isSuccess ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
              )} />
            </div>
            <div>
              <h2 className="playfair text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                {selected.officerName ?? selected.full_name ?? "Unknown Identity"}
              </h2>
              <p className="dmsans mt-1 text-sm font-medium text-[#38bdf8]/60 tracking-wide uppercase">
                {selected.role || "Officer"} • Telemetry ID: {selected.id?.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] sm:self-center",
            isSuccess 
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
              : "border-rose-500/20 bg-rose-500/10 text-rose-400"
          )}>
            {isSuccess ? <ShieldCheck className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            Access {selected.login_status}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 admin-scrollbar">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* Metadata Card: Primary Details */}
            <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-[#38bdf8]/20 hover:bg-white/[0.04]">
              <div className="mb-4 flex items-center gap-2 text-[#38bdf8]/60">
                <Clock className="h-4 w-4" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.2em]">Temporal Data</span>
              </div>
              <div className="space-y-1">
                <p className="dmsans text-lg font-medium text-white/90">
                  {new Date(selected.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </p>
                <p className="dmsans text-xs text-white/40">
                  {new Date(selected.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Metadata Card: Network */}
            <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-[#38bdf8]/20 hover:bg-white/[0.04]">
              <div className="mb-4 flex items-center gap-2 text-[#38bdf8]/60">
                <Network className="h-4 w-4" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.2em]">Network Context</span>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-lg font-medium text-white/90">
                  {selected.ip_address ?? "0.0.0.0"}
                </p>
                <p className="dmsans text-xs text-white/40">
                  IPv4 Protocol • Public Gateway
                </p>
              </div>
            </div>

            {/* Metadata Card: Environment */}
            <div className="col-span-full rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-[#38bdf8]/20 hover:bg-white/[0.04]">
              <div className="mb-6 flex items-center gap-2 text-[#38bdf8]/60">
                <Cpu className="h-4 w-4" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.2em]">Environmental Profile</span>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/30">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="dmsans text-[9px] font-bold uppercase tracking-widest">Browser Agent</span>
                  </div>
                  <p className="dmsans text-sm font-medium text-white/80 line-clamp-1">
                    {selected.browser ?? "Unknown Client"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/30">
                    <Fingerprint className="h-3.5 w-3.5" />
                    <span className="dmsans text-[9px] font-bold uppercase tracking-widest">Platform Kernel</span>
                  </div>
                  <p className="dmsans text-sm font-medium text-white/80 line-clamp-1">
                    {selected.operating_system ?? "Unknown OS"}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata Card: Security */}
            <div className="col-span-full rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-[#38bdf8]/20 hover:bg-white/[0.04]">
              <div className="mb-6 flex items-center gap-2 text-[#38bdf8]/60">
                <Shield className="h-4 w-4" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.2em]">Security Manifest</span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
                  <p className="dmsans mb-1 text-[9px] font-bold uppercase tracking-widest text-white/20">Authorized Email</p>
                  <p className="dmsans truncate text-sm font-medium text-white/70">{selected.email}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
                  <p className="dmsans mb-1 text-[9px] font-bold uppercase tracking-widest text-white/20">System Identifier</p>
                  <p className="font-mono truncate text-[10px] text-white/30">{selected.user_id}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden bg-[#020617]">
        {/* Background Animation Layers */}
        <BackgroundPaths mode="background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-4 pb-2 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#38bdf8]/40" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">System Telemetry</span>
              </div>
              <h1 className="playfair text-4xl font-bold text-white sm:text-5xl">
                Login <span className="professional-gradient-text">Activity</span>
              </h1>
              <p className="dmsans mt-3 max-w-xl text-sm leading-relaxed text-white/40 sm:text-base">
                Real-time security logs monitoring officer access patterns and session metadata across the GDA verification network.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-[#38bdf8]" />
                <input 
                  type="text"
                  placeholder="Search email, IP, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 dmsans text-sm text-white placeholder:text-white/20 focus:border-[#38bdf8]/40 focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/40 transition-all sm:w-64"
                />
              </div>

              {/* Time Filter */}
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

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr]">
            
            {/* Telemetry Stream (Left) */}
            <motion.section 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-[700px] rounded-[2rem] border border-white/5 bg-[#0F172A]/40 backdrop-blur-md overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/40">Live Stream</span>
                </div>
                <span className="dmsans text-[10px] font-medium text-white/20">{filteredLogins.length} events found</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 admin-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredLogins.length > 0 ? (
                    filteredLogins.map((entry) => {
                      const isSelected = selected?.id === entry.id;
                      const isSuccess = entry.login_status?.toLowerCase() === "success" || entry.login_status?.toLowerCase() === "granted";
                      
                      return (
                        <motion.button
                          key={entry.id}
                          layout
                          variants={itemVariants}
                          onClick={() => {
                            setSelected(entry);
                            if (window.innerWidth < 1024) setShowMobileModal(true);
                          }}
                          className={cn(
                            "group relative w-full rounded-2xl border p-4 text-left transition-all duration-500",
                            isSelected 
                              ? "border-[#38bdf8]/40 bg-[#38bdf8]/5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]" 
                              : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                          )}
                        >
                          {isSelected && (
                            <motion.div 
                              layoutId="active-pill"
                              className="absolute -left-px top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-r-full bg-[#38bdf8]"
                            />
                          )}
                          
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h4 className={cn(
                              "dmsans text-sm font-semibold transition-colors truncate",
                              isSelected ? "text-white" : "text-white/70 group-hover:text-white"
                            )}>
                              {entry.officerName ?? entry.full_name ?? "Unknown Identity"}
                            </h4>
                            <span className={cn(
                              "h-2 w-2 rounded-full",
                              isSuccess ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                          </div>

                          <p className="dmsans mb-4 truncate text-[11px] text-white/30">{entry.email}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                                <Clock className="h-3 w-3 text-[#38bdf8]/60" />
                                {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                                {entry.device_type?.toLowerCase() === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                                {entry.browser?.split(' ')[0] ?? "Unknown"}
                              </div>
                            </div>
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-all",
                              isSelected ? "text-[#38bdf8] translate-x-0" : "text-white/10 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            )} />
                          </div>
                        </motion.button>
                      );
                    })
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-full flex-col items-center justify-center py-20 text-center"
                    >
                      <Database className="h-10 w-10 text-white/10 mb-4" />
                      <p className="dmsans text-sm text-white/30">No matching security records</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Analysis Panel (Right) */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden h-[700px] flex-col rounded-[2rem] border border-white/5 bg-[#0F172A]/40 backdrop-blur-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] lg:flex"
            >
              {renderDetailContent(false)}
            </motion.section>

          </div>
        </div>
      </div>

      {/* Mobile Telemetry Modal */}
      <AnimatePresence>
        {showMobileModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md sm:items-center lg:hidden"
            onClick={() => setShowMobileModal(false)}
          >
            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0F172A] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              {renderDetailContent(true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
