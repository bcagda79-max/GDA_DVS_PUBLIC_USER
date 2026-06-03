"use client";

import {
  Building2,
  Globe,
  Headphones,
  Laptop,
  Mail,
  MapPin,
  MessageSquare,
  Shield,
  Smartphone,
  UserCheck,
} from "lucide-react";
import { ContentPageShell } from "@/components/content/content-page-shell";
import { ContentSection } from "@/components/content/content-section";

const contacts = [
  {
    label: "General Helpline",
    value: "0992-9310240",
    href: "tel:09929310240",
    icon: Headphones,
    desc: "Primary support for Galiyat Development Authority services.",
  },
  {
    label: "Complaint Cell",
    value: "0992-9311082",
    href: "tel:09929311082",
    icon: MessageSquare,
    desc: "Formal registry for citizen grievances and tracking.",
  },
  {
    label: "Control Room",
    value: "0992-355539",
    href: "tel:0992355539",
    icon: Shield,
    desc: "Emergency response and facility monitoring.",
  },
  {
    label: "Official Email",
    value: "info@gda.kp.gov.pk",
    href: "mailto:info@gda.kp.gov.pk",
    icon: Mail,
    desc: "Secure digital correspondence and documentation.",
  },
];

const departments = [
  { id: "01", name: "Control Room & Facilitation Center", contact: "+92-992-355539", icon: Shield },
  { id: "02", name: "Planning & Development (P&D)", contact: "+92-0345-9322295", icon: Laptop },
  { id: "03", name: "Makhniyal Cell / AD Makhniyal", contact: "+92-0333-5025037", icon: MapPin },
  { id: "04", name: "One Window Operation", contact: "+92-099-311082", icon: UserCheck },
  { id: "05", name: "Tourism Section", contact: "+92-092-408014", icon: Globe },
  { id: "06", name: "Accounts Section", contact: "+92-992-637632", icon: Building2 },
  { id: "07", name: "Media Section (PRO)", contact: "+92-0311-5643556", icon: Smartphone },
  { id: "08", name: "PA to Director General", contact: "0992-9310240", icon: Building2 },
];

export default function ContactUsPage() {
  return (
    <ContentPageShell>
      <header className="page-hero">
        <h1 className="page-hero__title">
          Contact <span className="page-hero__title-accent">Us</span>
        </h1>
        <p className="page-hero__subtitle">
          Reach the Galiyat Development Authority for citizen services, departmental inquiries, and
          official correspondence.
        </p>
      </header>

      <ContentSection title="Primary channels" description="Official contact points for the public.">
        <div className="content-card-grid content-card-grid--4">
          {contacts.map((contact) => (
            <article key={contact.label} className="content-card">
              <div className="content-card__icon" aria-hidden>
                <contact.icon />
              </div>
              <h3 className="content-card__title">{contact.label}</h3>
              <p className="content-card__body">{contact.desc}</p>
              <a href={contact.href} className="content-card__value content-card__value--link">
                {contact.value}
              </a>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Directory"
        title="Department contacts"
        description="Direct lines for institutional units within GDA."
      >
        <div className="content-card-grid content-card-grid--2">
          {departments.map((dept) => (
            <div key={dept.id} className="content-list-item">
              <div className="content-list-item__icon" aria-hidden>
                <dept.icon />
              </div>
              <div className="min-w-0">
                <p className="content-list-item__meta">Unit {dept.id}</p>
                <p className="content-list-item__title">{dept.name}</p>
                <p className="content-list-item__detail">{dept.contact}</p>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      <aside className="content-callout">
        <h2 className="content-callout__title">Office hours & accountability</h2>
        <p className="content-callout__text">
          GDA operates under government transparency standards. For document verification, use the
          public portal; for administrative matters, contact the relevant department listed above.
        </p>
        <p className="content-callout__meta">
          Galiyat Development Authority · Abbottabad, Khyber Pakhtunkhwa
        </p>
      </aside>
    </ContentPageShell>
  );
}
