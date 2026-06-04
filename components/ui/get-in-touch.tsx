"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { ContentSection } from "@/components/content/content-section";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "info@gda.kp.gov.pk",
    href: "mailto:info@gda.kp.gov.pk",
    desc: "Official correspondence and verification support.",
  },
  {
    icon: Phone,
    label: "Helpline",
    value: "0992-9310240",
    href: "tel:09929310240",
    desc: "GDA work hours, Monday–Friday (9 AM – 5 PM).",
  },
  {
    icon: MapPin,
    label: "Head office",
    value: "ZTBL Building, Mansehra Road, Abbottabad",
    href: "https://maps.google.com/?q=Galiyat+Development+Authority+Abbottabad",
    desc: "Galiyat Development Authority, Khyber Pakhtunkhwa.",
  },
];

export function GetInTouch() {
  return (
    <ContentSection
      title="Get in touch"
      description="Questions about document verification, barcode validity, or institutional support? Contact the GDA team directly."
    >
      <div className="content-card-grid content-card-grid--3">
        {contactInfo.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.label === "Head office" ? "_blank" : undefined}
              rel={item.label === "Head office" ? "noopener noreferrer" : undefined}
              className="content-card"
            >
              <div className="content-card__icon" aria-hidden>
                <Icon />
              </div>
              <h3 className="content-card__title">{item.label}</h3>
              <p className="content-card__body">{item.desc}</p>
              <span className="content-card__value content-card__value--link">{item.value}</span>
            </a>
          );
        })}
      </div>
    </ContentSection>
  );
}
