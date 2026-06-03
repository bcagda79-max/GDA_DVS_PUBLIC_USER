"use client";

import { Database, Eye, ShieldCheck, User } from "lucide-react";
import { ContentPageShell } from "@/components/content/content-page-shell";
import { ContentSection } from "@/components/content/content-section";

const sections = [
  {
    title: "Data sovereignty",
    icon: Database,
    content:
      "Document metadata and administrative logs are hosted on secure, government-authorized infrastructure with strict data residency controls for Galiyat Development Authority records.",
    details: ["Tamper-proof verification", "Immutable audit logs", "Authorized access only"],
  },
  {
    title: "Information vetting",
    icon: User,
    content:
      "We collect identifying information—name, department, and official credentials—only to establish a trusted chain of custody for document authentication.",
    details: ["Identity verification", "Role-based permissions", "Minimal data retention"],
  },
  {
    title: "Public verification",
    icon: Eye,
    content:
      "Public users may verify documents without creating an account. Query activity is monitored only to protect system integrity and prevent abuse of the registry.",
    details: ["No public user profiles", "Rate limiting", "Secure document IDs"],
  },
  {
    title: "Cyber security",
    icon: ShieldCheck,
    content:
      "Multi-layered defenses protect administrative access points, including encryption in transit, hardened authentication, and ongoing security review.",
    details: ["TLS encryption", "Secure credential storage", "Periodic audits"],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <ContentPageShell>
      <header className="page-hero">
        <h1 className="page-hero__title">
          Privacy <span className="page-hero__title-accent">&</span> Policy
        </h1>
        <p className="page-hero__subtitle">
          How GDA-DVS collects, protects, and uses information across public verification and
          authorized officer access.
        </p>
      </header>

      <ContentSection title="Our commitments">
        <div className="content-card-grid content-card-grid--2">
          {sections.map((section) => (
            <article key={section.title} className="content-policy-card">
              <div className="content-policy-card__icon" aria-hidden>
                <section.icon />
              </div>
              <h3 className="content-policy-card__title">{section.title}</h3>
              <p className="content-policy-card__text">{section.content}</p>
              <ul className="content-tag-list">
                {section.details.map((detail) => (
                  <li key={detail} className="content-tag">
                    {detail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ContentSection>

      <aside className="content-callout">
        <h2 className="content-callout__title">Policy updates</h2>
        <p className="content-callout__text">
          This policy may be revised to reflect changes in cybersecurity standards and applicable
          regulations. Continued use of GDA-DVS indicates acceptance of the current version.
        </p>
        <p className="content-callout__meta">
          Effective May 2026 · Questions:{" "}
          <a href="mailto:info@gda.kp.gov.pk" className="content-callout__link">
            info@gda.kp.gov.pk
          </a>
        </p>
      </aside>
    </ContentPageShell>
  );
}
