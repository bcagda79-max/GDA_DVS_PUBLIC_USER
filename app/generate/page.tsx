"use client";

import JsBarcode from "jsbarcode";
import {
  ArrowRight,
  Barcode,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  UploadCloud,
  X,
  Lock,
  Database,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/ui/footer";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { OfficerAppbar } from "@/components/ui/officer-appbar";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";
import type { ChangeEvent, DragEvent, FormEvent } from "react";

type Department = "BCA" | "Administration" | "Tourism" | "Accounts" | "Technical" | "Any Other";

type GeneratedDocument = {
  id: string;
  department: Department;
  title: string;
  recipientName: string;
  issueDate: string;
  expiryDate: string;
};

const departments: Department[] = [
  "BCA", "Administration", "Tourism", "Accounts", "Technical", "Any Other",
];

const initialIssueDate = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function GenerateDocumentPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({
    title: "",
    recipientName: "",
    department: "BCA" as Department,
    issueDate: initialIssueDate(),
    expiryDate: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const standbyRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) return router.replace("/signin");

        const res = await fetch(`/api/access/context?userId=${data.user.id}`);
        const body = await res.json();
        if (!body.canGenerate && !body.isAdmin) return router.replace("/pending");

        setUserEmail(data.user.email || "");
        setCurrentUserId(data.user.id);

        // Use officer metadata or context-provided department. Allow choosing any department.
        const userDept = data.user.user_metadata?.department || body.department || "Administration";
        setForm(f => ({ ...f, department: userDept as Department }));
      } catch (e) {
        router.replace("/signin");
      } finally {
        setAuthChecking(false);
      }
    })();
  }, [router, supabase]);

  // More robust rendering using SVG instead of Canvas
  const renderBarcode = (id: string, isStandby: boolean = false) => {
    const target = isStandby ? standbyRef.current : barcodeRef.current;
    if (!target) return;

    try {
      JsBarcode(target, id, {
        format: "CODE128",
        displayValue: true,
        fontSize: 16,
        font: "monospace",
        background: "#ffffff",
        lineColor: isStandby ? "#e5e7eb" : "#000000",
        margin: 15,
        width: 2.5,
        height: 60,
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 10
      });
    } catch (err) {
      console.error("Barcode rendering error:", err);
    }
  };

  useEffect(() => {
    if (!generatedDocument && standbyRef.current) {
      const timer = setTimeout(() => renderBarcode("GDA-DVS-SAMPLE", true), 100);
      return () => clearTimeout(timer);
    }
  }, [generatedDocument]);

  useEffect(() => {
    if (generatedDocument && barcodeRef.current) {
      // SVG is more reliable for immediate rendering
      const timer = setTimeout(() => renderBarcode(generatedDocument.id), 100);
      return () => clearTimeout(timer);
    }
  }, [generatedDocument]);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "docx"].includes(ext)) {
      setErrorMessage("Only PDF and DOCX files are supported. Please upload a PDF or DOCX.");
      setSelectedFile(null);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !form.title) {
      setErrorMessage("File and Title are required.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      // Validate extension on submit as well
      const allowed = ["pdf", "docx"];
      const ext = selectedFile?.name.split(".").pop()?.toLowerCase() || "";
      if (!allowed.includes(ext)) {
        throw new Error("Only PDF and DOCX files are supported. Please upload a PDF or DOCX.");
      }
      const payload = new FormData();
      payload.append("file", selectedFile);
      payload.append("department", form.department);
      payload.append("title", form.title);
      payload.append("recipientName", form.recipientName);
      payload.append("issueDate", form.issueDate);
      payload.append("expiryDate", form.expiryDate);
      if (currentUserId) payload.append("processedBy", currentUserId);

      const res = await fetch("/api/generate", { method: "POST", body: payload });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error || body?.message || "Stamping failed.";
        throw new Error(msg);
      }

      const contentType = res.headers.get("content-type") || "";
      // If server returned JSON (officer flow), parse it and show forward option
      if (contentType.includes("application/json")) {
        const body = await res.json();
        const docId = body.documentId || "GDA-DVS-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        setGeneratedDocument({ ...form, id: docId });
        setDownloadUrl(null);
        setDownloadName("");
        setPreviewUrl(body.signedUrl || null);
        setErrorMessage(null);
        return;
      }

      // Admin flow: server returns the file blob directly
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const docId = res.headers.get("x-document-id") || "GDA-DVS-" + Math.random().toString(36).substr(2, 9).toUpperCase();

      setDownloadUrl(url);
      setDownloadName(res.headers.get("x-output-name") || selectedFile.name);
      setGeneratedDocument({ ...form, id: docId });
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const forwardToAdmin = async () => {
    if (!generatedDocument) return;
    try {
      setIsGenerating(true);
      const res = await fetch("/api/documents/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: generatedDocument.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to forward");
      setErrorMessage("Forwarded to GDA DVS Admin.");
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Forward failed");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authChecking) return <LoadingState title="Loading" subtitle="Fetching Barcode Generator" />;

  return (
    <>
      <OfficerAppbar email={userEmail} active="generate" />
      <div className="relative min-h-screen w-full overflow-hidden bg-[#020617]">
        <BackgroundPaths mode="background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-20 pb-12 sm:px-6 lg:px-8">

          {/* Header Section */}
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#0EA5E9]/40" />
                <span className="dmsans text-[10px] font-bold uppercase tracking-[0.3em] text-[#0EA5E9]">Authentication Lab</span>
              </div>
              <h1 className="playfair text-4xl font-bold text-white sm:text-5xl">
                Generate <span className="professional-gradient-text">Credential</span>
              </h1>
              <p className="dmsans mt-3 max-w-xl text-sm leading-relaxed text-white/40">
                Establish verification credentials for GDA records. Stamped documents are instantly indexed for public verification.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              {[
                [Lock, "Secure"], [Database, "Indexed"], [ShieldCheck, "Verified"]
              ].map(([Icon, label]: any, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2">
                  <Icon className="h-3.5 w-3.5 text-[#0EA5E9]" />
                  <span className="dmsans text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Workspace */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">

            {/* Input Section */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/40 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
                <div className="grid gap-8 sm:grid-cols-2">

                  {/* File Upload */}
                  <div className="sm:col-span-2">
                    <label className="dmsans mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]/60">Document Source</label>
                    {selectedFile ? (
                      <div className="flex items-center justify-between rounded-2xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0EA5E9] text-[#020617]">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="dmsans text-sm font-bold text-white truncate max-w-[200px]">{selectedFile.name}</p>
                            <p className="dmsans text-[10px] text-white/40 uppercase tracking-widest">{formatBytes(selectedFile.size)}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setSelectedFile(null)} className="h-10 w-10 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all flex items-center justify-center">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
                        className={cn(
                          "flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed py-12 transition-all duration-500",
                          isDragging ? "border-[#0EA5E9] bg-[#0EA5E9]/5" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        )}
                      >
                        <input type="file" accept=".pdf,.docx" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="absolute inset-0 cursor-pointer opacity-0" />
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0EA5E9]/10 text-[#0EA5E9] group-hover:scale-110 transition-transform duration-500">
                          <UploadCloud className="h-8 w-8" />
                        </div>
                        <p className="dmsans text-sm font-bold text-white">Click or drag PDF record</p>
                        <p className="dmsans mt-1 text-[10px] uppercase tracking-widest text-white/30">Maximum file size: 10MB</p>
                      </label>
                    )}
                  </div>

                  {/* Metadata Fields */}
                  <div className="space-y-2">
                    <label className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]/60">Credential Title</label>
                    <input
                      required
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 dmsans text-sm text-white placeholder:text-white/20 focus:border-[#0EA5E9]/40 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/40 transition-all"
                      placeholder="e.g. Land Allotment Order"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]/60">Recipient Identity</label>
                    <input
                      required
                      value={form.recipientName}
                      onChange={e => setForm({ ...form, recipientName: e.target.value })}
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 dmsans text-sm text-white placeholder:text-white/20 focus:border-[#0EA5E9]/40 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/40 transition-all"
                      placeholder="Full legal name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]/60">Issuance Date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                      <input
                        type="date"
                        required
                        value={form.issueDate}
                        onChange={e => setForm({ ...form, issueDate: e.target.value })}
                        className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-14 pr-6 dmsans text-sm text-white focus:border-[#0EA5E9]/40 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]/60">Authority Unit</label>
                    <input
                      readOnly
                      value={form.department}
                      className="h-14 w-full rounded-2xl border border-white/10 bg-[#0f172a]/50 px-6 dmsans text-sm text-white/50 cursor-not-allowed appearance-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating || !selectedFile}
                    className="group relative mt-4 h-16 w-full overflow-hidden rounded-[2rem] bg-[#0EA5E9] text-[#020617] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-[0_20px_50px_rgba(14,165,233,0.2)]"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="playfair text-lg font-bold uppercase tracking-widest">Processing Core...</span>
                        </>
                      ) : (
                        <>
                          <Barcode className="h-5 w-5" />
                          <span className="playfair text-lg font-bold uppercase tracking-widest">Execute Stamping</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                  </button>

                  {errorMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 sm:col-span-2">
                      <AlertCircle className="h-5 w-5" />
                      <p className="dmsans text-xs font-medium">{errorMessage}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.form>

            {/* Real-time Monitor */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full rounded-[2.5rem] border border-white/5 bg-[#0F172A]/40 backdrop-blur-xl p-8 shadow-2xl"
            >
              <div className="mb-8 border-b border-white/5 pb-8">
                <h3 className="playfair text-xl font-bold text-white">Live Monitor</h3>
                <p className="dmsans mt-1 text-[10px] font-bold uppercase tracking-widest text-white/20">Stamping pipeline telemetry</p>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                  {generatedDocument ? (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                      <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-[#020617]">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h4 className="playfair text-xl font-bold text-white mb-1">Credential Stamped</h4>
                        <p className="dmsans text-xs text-white/40">Record indexed successfully</p>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <p className="dmsans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]/60 mb-2">Registry ID</p>
                          <p className="font-mono text-sm text-white truncate">{generatedDocument.id}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <svg ref={barcodeRef} className="max-w-full" />
                        </div>

                        {downloadUrl ? (
                          <a
                            href={downloadUrl || ""}
                            download={downloadName}
                            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-[#020617] dmsans text-xs font-bold uppercase tracking-widest transition-all hover:bg-[#0EA5E9]"
                          >
                            <Download className="h-4 w-4" /> Download
                          </a>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <button onClick={() => {
                              if (previewUrl) {
                                window.open(previewUrl, "_blank");
                              } else {
                                setErrorMessage("Preview is not available.");
                              }
                            }}
                              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-[#020617] dmsans text-xs font-bold uppercase tracking-widest transition-all hover:bg-[#0EA5E9]"
                            >
                              Preview
                            </button>
                            <button onClick={forwardToAdmin} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] text-[#020617] dmsans text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02]">
                              Forward to GDA DVS Admin
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="standby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-[#0EA5E9]/5 blur-3xl rounded-full" />
                        <div className="relative rounded-2xl bg-white/5 p-6 border border-white/5">
                          <svg ref={standbyRef} className="max-w-full grayscale opacity-20" />
                        </div>
                      </div>
                      <p className="dmsans text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 animate-pulse">Waiting for Stream</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Decor */}
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
                  <span className="dmsans text-[9px] font-bold uppercase tracking-widest text-white/40">Encryption Active</span>
                </div>
                <Clock3 className="h-3.5 w-3.5 text-white/10" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
