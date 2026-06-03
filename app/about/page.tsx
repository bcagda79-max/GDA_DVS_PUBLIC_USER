"use client";

import Image from "next/image";
import { ContentPageShell } from "@/components/content/content-page-shell";
import { ContentSection } from "@/components/content/content-section";

const leaders = [
  {
    name: "Mr. Fawad Khan",
    role: "Director General",
    organization: "Galiyat Development Authority (GDA), Abbottabad",
    description:
      "Leading GDA's digital governance initiatives and administrative transparency across the Galiyat region.",
  },
  {
    name: "Mr. Farukh Jadoon",
    role: "Director (BCA)",
    organization: "Galiyat Development Authority (GDA)",
    description:
      "Overseeing Building Control Authority operations and the digital security of official documentation.",
  },
];

const developers = [
  {
    name: "Muhammad Khizar Lodhi",
    role: "Full Stack Developer",
    contribution: "System architecture and frontend design",
    github: "https://github.com/khizar8055",
    linkedin: "https://www.linkedin.com/in/khizar-lodhi-612137359/",
  },
  {
    name: "Mohibullah Lodhi",
    role: "Full Stack Developer",
    contribution: "Backend systems and database security",
    github: "https://github.com/mohibullahlodhi",
    linkedin: "https://www.linkedin.com/in/mohib-ullah-lodhi-20baa03a7/",
  },
];

function SiGithub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.907-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.09.635-1.34-2.22-.252-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.03-2.692-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.202 2.397.1 2.65.64.704 1.028 1.599 1.028 2.692 0 3.848-2.339 4.695-4.566 4.942.359.309.678.921.678 1.856 0 1.34-.012 2.419-.012 2.747 0 .268.18.58.688.481A10.019 10.019 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  );
}

function SiLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM.18 8.98H4.8V24H.18V8.98ZM8.11 8.98h4.43v2.05h.06c.62-1.18 2.13-2.43 4.38-2.43 4.69 0 5.56 3.09 5.56 7.11V24h-4.62v-6.97c0-1.66-.03-3.8-2.32-3.8-2.33 0-2.69 1.82-2.69 3.68V24H8.11V8.98Z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <ContentPageShell>
      <header className="page-hero">
        <h1 className="page-hero__title">
          About <span className="page-hero__title-accent">GDA-DVS</span>
        </h1>
        <p className="page-hero__subtitle">
          A secure document verification platform for the Galiyat Development Authority—built for
          trusted issuance and public authentication.
        </p>
      </header>

      <section className="page-prose max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="page-prose__heading">About the system</h2>
        <p className="page-prose__text">
          The GDA Document Verification System (GDA-DVS) standardizes the lifecycle of official
          records—from secure issuance by authorized personnel to instant public verification. Each
          document receives a unique identifier and machine-readable barcode, registered in a
          protected central ledger. The platform supports administrative transparency, reduces
          forgery risk, and gives citizens a straightforward way to confirm authenticity online.
        </p>
      </section>

      <ContentSection eyebrow="Leadership" title="Under the leadership of">
        <div className="content-card-grid content-card-grid--2">
          {leaders.map((leader) => (
            <article key={leader.name} className="content-leader-card">
              <p className="content-leader-card__role">{leader.role}</p>
              <h3 className="content-leader-card__name">{leader.name}</h3>
              <p className="content-leader-card__text">{leader.description}</p>
              <p className="content-leader-card__org">{leader.organization}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection eyebrow="Development" title="Technical team" description="Engineering and implementation of GDA-DVS.">
        <div className="content-card-grid content-card-grid--2 max-w-3xl">
          {developers.map((dev) => (
            <article key={dev.name} className="content-team-card">
              <h3 className="content-team-card__name">{dev.name}</h3>
              <p className="content-team-card__role">{dev.role}</p>
              <p className="content-team-card__text">{dev.contribution}</p>
              <div className="content-team-card__links">
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${dev.name} on GitHub`}
                  className="content-team-card__link"
                >
                  <SiGithub />
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${dev.name} on LinkedIn`}
                  className="content-team-card__link"
                >
                  <SiLinkedin />
                </a>
              </div>
            </article>
          ))}
        </div>
      </ContentSection>

      <div className="content-page-footer-mark">
        <div className="content-page-footer-mark__logo relative h-16 w-16">
          <Image src="/gda_logo.png" alt="GDA official logo" fill sizes="64px" className="object-contain" />
        </div>
        <p className="content-page-footer-mark__caption">Galiyat Development Authority · Document Verification System</p>
      </div>
    </ContentPageShell>
  );
}
