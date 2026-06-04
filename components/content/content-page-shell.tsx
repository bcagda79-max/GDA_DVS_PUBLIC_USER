"use client";

import type { ReactNode } from "react";
import { Footer } from "@/components/ui/footer";
import { cn } from "@/lib/utils";

export function ContentPageShell({
  children,
  narrow,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="content-shell">
      <div className="content-shell__gradient" aria-hidden />
      <main className="content-page-main">
        <div className={cn("content-page-inner", narrow && "content-page-inner--narrow")}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
