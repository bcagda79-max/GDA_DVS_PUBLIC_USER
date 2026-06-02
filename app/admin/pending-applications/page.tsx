"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { BackgroundPaths } from "@/components/ui/background-paths";
import {
  FileCheck,
  Eye,
  PenTool,
  Clock,
  Building2,
  User2,
  FileText,
  Search,
  AlertCircle,
  Hash,
  Calendar,
  Inbox,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function AdminPendingApplicationsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return router.replace("/signin");
        setUserId(user.id);

        const res = await fetch(`/api/admin/pending-documents?userId=${user.id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || "Failed");
        setPending(body.pending || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const handlePreview = async (doc: any) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
      return;
    }
    if (!doc.storage_path) {
      setPreviewError("No file associated with this record.");
      setTimeout(() => setPreviewError(null), 3000);
      return;
    }
    setPreviewingId(doc.id);
    try {
      const res = await fetch(`/api/admin/vault/preview?userId=${userId}&path=${encodeURIComponent(doc.storage_path)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.open(data.url, "_blank");
    } catch {
      setPreviewError("Preview generation failed.");
      setTimeout(() => setPreviewError(null), 3000);
    } finally {
      setPreviewingId(null);
    }
  };

  const handleAddSignature = (doc: any) => {
    // Navigate to e-signature page with the document ID as a query param
    router.push(`/admin/e-signature?documentId=${encodeURIComponent(doc.id)}`);
  };

  const handleReject = async (doc: any) => {
    if (!confirm(`Are you sure you want to completely remove "${doc.title || doc.id}" from the system? This action cannot be undone.`)) return;
    
    setRejectingId(doc.id);
    try {
      const res = await fetch("/api/admin/reject-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, documentId: doc.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject document.");
      
      setPending((prev) => prev.filter((d) => d.id !== doc.id));
      setFeedback({ type: "success", message: "Document permanently removed." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setRejectingId(null);
    }
  };

  const filteredPending = pending.filter((doc) => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return [doc.id, doc.title, doc.recipient_name, doc.department].some(
      (f) => String(f ?? "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <LoadingState title="Pending Applications" subtitle="Retrieving forwarded documents for review..." />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#020617] flex flex-col">
      <BackgroundPaths mode="background" className="opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col mx-auto w-full max-w-[1600px] px-4 pt-6 pb-10 sm:px-6 lg:px-8">

        {/* Error Toast */}
        <AnimatePresence>
          {previewError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-[#0f172a]/95 backdrop-blur-xl px-5 py-3.5 shadow-2xl"
            >
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="dmsans text-xs font-semibold text-red-400">{previewError}</p>
            </motion.div>
          )}
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <FileCheck className="h-4 w-4 text-amber-400" />
                </div>
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">Awaiting Review</span>
              </div>
              <h1 className="playfair text-4xl font-bold text-white sm:text-5xl leading-tight">
                Pending <span className="professional-gradient-text">Applications</span>
              </h1>
              <p className="dmsans mt-4 max-w-lg text-sm leading-relaxed text-white/35">
                Documents forwarded by officers awaiting your e-signature and approval. Only signed documents are verified in the public registry.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#0f172a]/50 backdrop-blur-md px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/15">
                  <Inbox className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="dmsans text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Pending</p>
                  <p className="dmsans text-2xl font-bold text-white leading-none mt-1">{pending.length}</p>
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
            <Hash className="h-3.5 w-3.5 text-amber-400/50" />
            <span className="dmsans text-xs font-bold text-white/50">{filteredPending.length}</span>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredPending.length > 0 ? (
          <div className="space-y-4">
            {filteredPending.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group rounded-2xl border border-white/[0.06] bg-[#0f172a]/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0f172a]/60"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-5 p-5 sm:p-6">
                  {/* Document Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/15 text-amber-400">
                      <FileText className="h-6 w-6" />
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
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-500/[0.08] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-400">
                      <Clock className="h-3 w-3" /> Awaiting Signature
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleReject(doc)}
                      disabled={rejectingId === doc.id}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
                    >
                      {rejectingId === doc.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => handlePreview(doc)}
                      disabled={previewingId === doc.id}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-[10px] font-bold uppercase tracking-wider text-white/60 transition-all duration-200 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                    >
                      {previewingId === doc.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      Preview
                    </button>
                    <button
                      onClick={() => handleAddSignature(doc)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#38bdf8] px-4 text-[10px] font-bold uppercase tracking-wider text-[#020617] transition-all duration-200 hover:shadow-lg hover:shadow-[#38bdf8]/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      Add E-Signature
                      <ArrowRight className="h-3 w-3" />
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
                <ShieldCheck className="h-10 w-10 text-white/10" />
              </div>
              <h3 className="dmsans text-lg font-bold text-white/40 mb-2">All Clear</h3>
              <p className="dmsans text-sm text-white/20 max-w-sm">No documents awaiting your signature at this time. All forwarded applications have been processed.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
