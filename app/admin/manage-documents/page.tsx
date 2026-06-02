"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { BackgroundPaths } from "@/components/ui/background-paths";
import {
  FileText,
  Search,
  ShieldCheck,
  ShieldAlert,
  Building2,
  User2,
  Calendar,
  AlertCircle,
  Hash,
  CheckCircle2,
  Settings2,
  Database,
  Lock,
  Unlock,
} from "lucide-react";

export default function ManageDocumentsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return router.replace("/signin");
        setUserId(user.id);

        await fetchDocuments(user.id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const fetchDocuments = async (uid: string) => {
    try {
      const res = await fetch(`/api/admin/all-documents?userId=${uid}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed");
      setDocuments(body.documents || []);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to load documents.");
    }
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleVerification = async (doc: any) => {
    if (!userId) return;
    setTogglingId(doc.id);
    const newStatus = !doc.verified;
    try {
      const res = await fetch("/api/admin/toggle-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, documentId: doc.id, verifyStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Toggle failed");
      
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, verified: newStatus } : d))
      );
      showFeedback("success", `Document ${newStatus ? "verified" : "unverified"} successfully.`);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return [doc.id, doc.title, doc.recipient_name, doc.department].some(
      (f) => String(f ?? "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <LoadingState title="Manage Documents" subtitle="Retrieving master document registry..." />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#020617] flex flex-col">
      <BackgroundPaths mode="background" className="opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col mx-auto w-full max-w-[1600px] px-4 pt-6 pb-10 sm:px-6 lg:px-8">

        {/* Error/Success Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border backdrop-blur-xl px-5 py-3.5 shadow-2xl ${
                feedback.type === "success"
                  ? "border-emerald-500/20 bg-[#0f172a]/95"
                  : "border-red-500/20 bg-[#0f172a]/95"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <p className={`dmsans text-xs font-semibold ${feedback.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {feedback.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Database className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Master Registry</span>
              </div>
              <h1 className="playfair text-4xl font-bold text-white sm:text-5xl leading-tight">
                Manage <span className="professional-gradient-text">Documents</span>
              </h1>
              <p className="dmsans mt-4 max-w-lg text-sm leading-relaxed text-white/35">
                Full administrative control over all generated documents. Manually verify or revoke the verification status of any document in the system.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#0f172a]/50 backdrop-blur-md px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="dmsans text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Total Records</p>
                  <p className="dmsans text-2xl font-bold text-white leading-none mt-1">{documents.length}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-[#38bdf8]" />
            <input
              type="text"
              placeholder="Search by title, ID, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#0f172a]/60 pl-10 pr-4 dmsans text-sm text-white placeholder:text-white/20 focus:border-[#38bdf8]/30 focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0f172a]/50 px-3.5 py-2.5">
            <Hash className="h-3.5 w-3.5 text-white/20" />
            <span className="dmsans text-xs font-bold text-white/50">{filteredDocs.length}</span>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocs.length > 0 ? (
          <div className="space-y-4">
            {filteredDocs.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                className={`group rounded-2xl border ${doc.verified ? 'border-emerald-500/10 hover:border-emerald-500/30' : 'border-red-500/10 hover:border-red-500/30'} bg-[#0f172a]/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:bg-[#0f172a]/60`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-5 p-5 sm:p-6">
                  {/* Document Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${doc.verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {doc.verified ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="dmsans text-base font-bold text-white truncate">{doc.title || "Untitled Document"}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                        <div className="flex items-center gap-1.5">
                          <User2 className="h-3 w-3 text-white/25" />
                          <span className="dmsans text-[11px] font-medium text-white/40">{doc.recipient_name || "Internal"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-white/25" />
                          <span className="dmsans text-[11px] font-medium text-white/40">{doc.department}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-white/25" />
                          <span className="dmsans text-[11px] font-medium text-white/40">
                            {new Date(doc.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-mono text-[9px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.04]">
                          {doc.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${doc.verified ? 'border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-400' : 'border-red-500/15 bg-red-500/[0.08] text-red-400'}`}>
                      {doc.verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      {doc.verified ? 'Verified & Active' : 'Unverified / Revoked'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleVerification(doc)}
                      disabled={togglingId === doc.id}
                      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-40 ${
                        doc.verified 
                          ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300'
                      }`}
                    >
                      {togglingId === doc.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />
                      ) : (
                        doc.verified ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />
                      )}
                      {doc.verified ? "Revoke Verification" : "Mark as Verified"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-24">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.02]">
                <Settings2 className="h-10 w-10 text-white/10" />
              </div>
              <h3 className="dmsans text-lg font-bold text-white/40 mb-2">No Documents Found</h3>
              <p className="dmsans text-sm text-white/20 max-w-sm">No records match your search criteria or the database is currently empty.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
