"use client";

import type { ReactNode } from "react";
import { Footer } from "@/components/ui/footer";

export function ContentPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="content-shell">
      <div className="content-shell__gradient" aria-hidden />
      <main className="content-page-main">
        <div className="content-page-inner">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
