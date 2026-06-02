"use client";

import React from "react";
import VerifyDocumentPage from "../../app/verify/page";

// Wrapper component to allow reuse of the existing verify page UI
export function SharedVerifyPage() {
  return (
    <>
      <VerifyDocumentPage />
    </>
  );
}

export default SharedVerifyPage;
