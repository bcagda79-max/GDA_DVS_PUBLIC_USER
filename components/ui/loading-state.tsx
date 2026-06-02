"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { BackgroundPaths } from "./background-paths";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

export function LoadingState({ 
  title = "Initializing Secure Stream", 
  subtitle = "Decrypting security telemetry..." 
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
      <BackgroundPaths mode="background" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-t-2 border-[#38bdf8]" />
          <Activity className="absolute inset-0 m-auto h-6 w-6 text-[#38bdf8] animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <p className="dmsans text-xs font-bold uppercase tracking-[0.25em] text-[#38bdf8]">{title}</p>
          <p className="dmsans text-[10px] text-white/30 uppercase tracking-[0.1em]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
