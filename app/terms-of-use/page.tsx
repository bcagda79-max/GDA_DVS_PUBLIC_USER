"use client";

import { ContentPageShell } from "@/components/content/content-page-shell";
import { ContentSection } from "@/components/content/content-section";

const terms = [
  {
    title: "Account responsibility",
    content:
      "Officers and administrative staff must safeguard login credentials. Unauthorized sharing or misuse may result in immediate suspension of system access.",
  },
  {
    title: "Acceptable use",
    content:
      "GDA-DVS must not be used to create fraudulent documents, scrape registry data without authorization, or compromise the integrity of official records.",
  },
  {
    title: "Verification integrity",
    content:
      "Verification results are sourced from the GDA central registry. Results are intended for official authentication and should be interpreted in that context.",
  },
  {
    title: "Limitation of liability",
    content:
      "The Authority provides GDA-DVS as a secure utility and is not liable for indirect damages arising from scheduled maintenance or connectivity issues beyond its control.",
  },
  {
    title: "Access suspension",
    content:
      "GDA reserves the right to suspend access for users who violate these terms or engage in activity that threatens system security or data integrity.",
  },
];

export default function TermsOfUsePage() {
  return (
    <ContentPageShell>
      <header className="page-hero">
        <h1 className="page-hero__title">
          Terms of <span className="page-hero__title-accent">Use</span>
        </h1>
        <p className="page-hero__subtitle">
          Legal guidelines governing use of the Galiyat Development Authority Document Verification
          System.
        </p>
      </header>

      <ContentSection title="Terms & conditions">
        <ol className="space-y-3 list-none p-0 m-0">
          {terms.map((term, idx) => (
            <li key={term.title} className="content-term-item">
              <span className="content-term-item__number" aria-hidden>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="content-term-item__title">{term.title}</h3>
                <p className="content-term-item__text">{term.content}</p>
              </div>
            </li>
          ))}
        </ol>
      </ContentSection>

      <aside className="content-callout">
        <h2 className="content-callout__title">Acceptance of terms</h2>
        <p className="content-callout__text">
          By accessing GDA-DVS, you confirm that you have read and agree to these terms and all
          applicable laws and regulations of the Government of Pakistan.
        </p>
        <p className="content-callout__meta">Last updated: May 23, 2026</p>
      </aside>
    </ContentPageShell>
  );
}
