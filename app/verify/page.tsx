"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { BrowserMultiFormatReader, ChecksumException } from "@zxing/library";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  Database,
  Info,
  Keyboard,
  Lock,
  SearchCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { ContentPageShell } from "@/components/content/content-page-shell";

type VerificationMode = "manual" | "scan";
type VerificationStatus = "authentic" | "invalid" | "revoked";

type VerificationResult = {
  status: VerificationStatus;
  documentId?: string;
  title?: string;
  department?: string;
  recipient?: string;
  issueDate?: string;
  expiryDate?: string;
};

type ResultRow = {
  label: string;
  value: string | undefined;
  monospace?: boolean;
};

const formatResult = (value: string) => value.trim().toUpperCase();

function VerifyPreviewCard() {
  return (
    <aside className="verify-preview-card" aria-hidden>
      <div className="verify-preview-card__header">
        <span className="verify-preview-card__label">GDA Registry</span>
        <Image src="/gda_logo.png" alt="" width={28} height={28} className="verify-preview-card__logo" />
      </div>
      <div className="verify-preview-card__bars">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="verify-preview-card__bar"
            style={{ height: i % 2 === 0 ? "100%" : "65%", width: i % 3 === 0 ? 3 : 2 }}
          />
        ))}
      </div>
      <div className="verify-preview-card__footer">
        <span>Registry active</span>
        <Lock aria-hidden />
      </div>
    </aside>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<VerificationMode>("manual");
  const [documentId, setDocumentId] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const verifyDocument = useCallback(async (rawDocumentId: string): Promise<VerificationResult> => {
    const normalized = formatResult(rawDocumentId);
    if (!normalized) {
      return { status: "invalid" };
    }

    setIsChecking(true);
    try {
      const response = await fetch(`/api/verify?id=${encodeURIComponent(normalized)}`);
      const payload = (await response.json().catch(() => null)) as
        | VerificationResult
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("status" in payload)) {
        return { status: "invalid" };
      }
      return payload as VerificationResult;
    } catch {
      return { status: "invalid" };
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      const cleanId = idParam.trim();
      const autoVerify = async () => {
        await Promise.resolve();
        setDocumentId(cleanId);
        const res = await verifyDocument(cleanId);
        setResult(res);
      };
      void autoVerify();
    }
  }, [searchParams, verifyDocument]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();

    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        const selectedDeviceId =
          videoInputDevices.length > 1
            ? videoInputDevices.find((device) => device.label.toLowerCase().includes("back"))?.deviceId ||
              videoInputDevices[0].deviceId
            : videoInputDevices[0]?.deviceId;

        await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, async (scanResult, err) => {
          if (scanResult) {
            const detectedValue = scanResult.getText();
            if (detectedValue) {
              const verificationResult = await verifyDocument(detectedValue);
              setResult(verificationResult);
              setScanning(false);
              codeReader.reset();
            }
          }
          if (err && !(err instanceof ChecksumException)) {
            // non-critical scan errors
          }
        });
      } catch {
        setCameraError("Failed to initialize scanner. Please check camera permissions.");
      }
    };

    void startScanning();

    return () => {
      codeReader.reset();
    };
  }, [scanning, verifyDocument]);

  const handleManualVerify = async () => {
    if (!documentId.trim()) return;
    setResult(await verifyDocument(documentId));
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setMode("scan");
      setScanning(true);
    } catch {
      setCameraError("Camera access is unavailable or permission was denied.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const resetVerification = () => {
    setResult(null);
    setDocumentId("");
    setMode("manual");
    stopCamera();
    setCameraError(null);
  };

  const renderRows = (rows: ResultRow[]) => (
    <div className="verify-details">
      {rows.map((row, idx) => (
        <div key={row.label} className={`verify-details__row ${idx % 2 === 0 ? "verify-details__row--alt" : ""}`}>
          <span className="verify-details__label">{row.label}</span>
          <span className="verify-details__value">
            {row.label === "Status" ? (
              <span className="verify-status-pill">
                <span className="verify-status-pill-dot" aria-hidden />
                Active
              </span>
            ) : row.monospace ? (
              <span className="verify-details__mono">{row.value}</span>
            ) : (
              row.value
            )}
          </span>
        </div>
      ))}
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    if (result.status === "authentic") {
      const rows: ResultRow[] = [
        { label: "Document ID", value: result.documentId, monospace: true },
        { label: "Title", value: result.title },
        { label: "Department", value: result.department },
        { label: "Recipient / Entity", value: result.recipient },
        { label: "Issue Date", value: result.issueDate },
        { label: "Expiry Date", value: result.expiryDate || "N/A" },
        { label: "Status", value: "Active" },
      ];

      return (
        <div className="verify-result verify-result--authentic">
          <div className="verify-result__hero">
            <div className="verify-result__hero-main">
              <div className="verify-result__icon">
                <ShieldCheck aria-hidden />
              </div>
              <div>
                <h3 className="verify-result__title">Document Authentic</h3>
                <p className="verify-result__subtitle">
                  This document is verified and officially registered in the GDA-DVS registry.
                </p>
              </div>
            </div>
            <span className="verify-result__badge">Verified</span>
          </div>
          <div className="verify-result__panel">
            {renderRows(rows)}
            <button type="button" onClick={resetVerification} className="verify-result__cta mt-6">
              Verify Another Document
            </button>
          </div>
        </div>
      );
    }

    const queriedId = formatResult(documentId) || result.documentId;

    return (
      <div className="verify-result verify-result--invalid">
        <div className="verify-result__hero">
          <div className="verify-result__hero-main">
            <div className="verify-result__icon" aria-hidden>
              <XCircle />
            </div>
            <div>
              <h3 className="verify-result__title">Not Found in Registry</h3>
              <p className="verify-result__subtitle">
                This Document ID is not registered or has not been approved for public verification in GDA-DVS.
              </p>
            </div>
          </div>
          <span className="verify-result__badge">Unverified</span>
        </div>
        <div className="verify-result__panel">
          {queriedId ? (
            <div className="verify-result__id-block">
              <span className="verify-result__id-label">Submitted ID</span>
              {queriedId}
            </div>
          ) : null}
          <p className="verify-result__message">
            <AlertCircle aria-hidden />
            <span>
              No matching record exists for this ID. Check for typos or confirm the format{" "}
              <strong>GDA-[DEPT]-[YEAR]-[CODE]</strong>.
            </span>
          </p>
          <div className="verify-result__alert" role="note">
            <AlertTriangle aria-hidden />
            <span>
              <strong>Security notice:</strong> If someone presented this as an official GDA certificate or land
              record, treat it with caution and report suspected forgery to the relevant authorities.
            </span>
          </div>
          <button type="button" onClick={resetVerification} className="verify-result__cta">
            Verify Another Document
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="verify-panel">
      {result ? (
        renderResult()
      ) : (
        <>
          <div className="verify-tabs" role="tablist" aria-label="Verification method">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "manual"}
              onClick={() => {
                setMode("manual");
                stopCamera();
              }}
              className={`verify-tab ${mode === "manual" ? "verify-tab--active" : ""}`}
            >
              <Keyboard aria-hidden />
              Manual entry
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "scan"}
              onClick={() => {
                setMode("scan");
                void startCamera();
              }}
              className={`verify-tab ${mode === "scan" ? "verify-tab--active" : ""}`}
            >
              <Camera aria-hidden />
              Scan barcode
            </button>
          </div>

          {mode === "manual" ? (
            <div>
              <label htmlFor="document-id" className="verify-field__label">
                Document ID
              </label>
              <div className="verify-input-wrap">
                <Keyboard aria-hidden />
                <input
                  id="document-id"
                  value={documentId}
                  onChange={(event) => setDocumentId(event.target.value)}
                  placeholder="e.g. GDA-BCA-2026-X8A2"
                  className="verify-input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleManualVerify();
                  }}
                />
              </div>
              <p className="verify-hint">
                <Info aria-hidden />
                <span>Format: GDA-[DEPT]-[YEAR]-[ID]</span>
              </p>
              <button
                type="button"
                onClick={handleManualVerify}
                disabled={isChecking || !documentId.trim()}
                className="verify-btn-primary"
              >
                {isChecking ? (
                  <span className="verify-loading__spinner" aria-hidden />
                ) : (
                  <SearchCheck aria-hidden />
                )}
                {isChecking ? "Checking registry…" : "Verify document"}
              </button>
            </div>
          ) : (
            <div>
              {!scanning ? (
                <button type="button" onClick={startCamera} className="verify-btn-secondary">
                  <Camera aria-hidden />
                  Start camera
                </button>
              ) : null}

              <div className="verify-camera">
                <video ref={videoRef} playsInline muted className={scanning ? "opacity-100" : "opacity-0"} />
                {!scanning && (
                  <div className="verify-camera__placeholder">
                    <Camera aria-hidden />
                    <span>Camera preview</span>
                  </div>
                )}
                <span className="verify-camera__corner verify-camera__corner--tl" />
                <span className="verify-camera__corner verify-camera__corner--tr" />
                <span className="verify-camera__corner verify-camera__corner--bl" />
                <span className="verify-camera__corner verify-camera__corner--br" />
                {scanning ? <div className="verify-camera__scanline" /> : null}
              </div>

              <p className="verify-camera-help">Center the Code128 barcode within the frame.</p>

              {scanning ? (
                <button type="button" onClick={stopCamera} className="verify-btn-secondary verify-btn-danger mt-3">
                  Stop camera
                </button>
              ) : null}

              {cameraError ? (
                <div className="verify-alert" role="alert">
                  <AlertTriangle aria-hidden />
                  <span>{cameraError}</span>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function VerifyDocumentPage({ showFooter = true }: { showFooter?: boolean }) {
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user) return;

        const res = await fetch(`/api/access/context?userId=${user.id}`);
        const ctx = await res.json().catch(() => null);
        if (ctx?.found) {
          if (ctx.isAdmin) return router.replace("/admin/verify");
          if (ctx.canGenerate) return router.replace("/home/verify");
        }
      } catch {
        // ignore
      }
    })();
  }, [router, supabase]);

  const body = (
    <div className="verify-page">
      <section className="verify-hero" aria-labelledby="verify-hero-title">
        <div className="verify-hero__main">
          <h1 id="verify-hero-title" className="verify-hero__title">
            Verify document <span className="verify-hero__title-accent">authenticity</span>
          </h1>
          <p className="verify-hero__subtitle">
            Authenticate government records, land titles, and GDA certificate stamps in real time. Enter the
            printed Document ID or scan the barcode—no account required.
          </p>
        </div>
        <VerifyPreviewCard />
      </section>

      <Suspense
        fallback={
          <div className="verify-panel verify-loading">
            <div className="verify-loading__spinner" aria-hidden />
            <p className="verify-loading__text">Loading verification…</p>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );

  if (!showFooter) {
    return (
      <div className="content-shell">
        <div className="content-shell__gradient" aria-hidden />
        <main className="content-page-main">
          <div className="content-page-inner content-page-inner--narrow">{body}</div>
        </main>
      </div>
    );
  }

  return <ContentPageShell narrow>{body}</ContentPageShell>;
}
