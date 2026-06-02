"use client";

import React from "react";
import VerifyDocumentPage from "../../verify/page";
import { OfficerAppbar } from "@/components/ui/officer-appbar";
import { Footer } from "@/components/ui/footer";

export default function OfficerVerifyPage() {
  return (
    <div className="min-h-screen bg-[#060D14] flex flex-col w-full overflow-x-hidden">
      <OfficerAppbar email={""} active={"verify"} />
      <main className="flex-1">
        <VerifyDocumentPage showFooter={false} />
      </main>
      <Footer variant="officer" />
    </div>
  );
}
