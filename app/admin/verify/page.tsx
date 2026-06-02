"use client";

import React from "react";
import VerifyDocumentPage from "../../verify/page";

export default function AdminVerifyPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col w-full overflow-x-hidden">
      {/* Admin layout will provide the header; render the shared verify UI */}
      <VerifyDocumentPage showFooter={false} />
    </div>
  );
}
