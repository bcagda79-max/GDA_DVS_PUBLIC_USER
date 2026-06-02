"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const contactInfo = [
  {
    icon: Mail,
    label: "Email Support",
    value: "info@gda.kp.gov.pk",
    href: "mailto:info@gda.kp.gov.pk",
    desc: "Send us a query anytime for official verification support.",
  },
  {
    icon: Phone,
    label: "Helpline",
    value: "0992-9310240 / 921240",
    href: "tel:0992-9310240",
    desc: "Available during official GDA work hours (9 AM - 5 PM).",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "ZTBL Building, Main Mansehra Road, Abbottabad, KPK, Pakistan",
    href: "https://maps.google.com/?q=Galiyat+Development+Authority+Abbottabad",
    desc: "Second Floor, Galiyat Development Authority Office.",
  },
];

export function GetInTouch() {
  return (
    <section id="get-in-touch" className="w-full bg-[#020617] border-t border-white/5 relative overflow-hidden py-20 sm:py-24">
      {/* Decorative blue divider */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-16 text-center md:text-left space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white playfair"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Get in Touch
          </motion.h2>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/60 font-light dmsans">
            Have questions about document verification, barcode validity, or need institutional support? Reach out to our dedicated GDA team.
          </p>
          <div className="h-[2px] w-[50px] bg-[#38bdf8] rounded-full mt-2 mx-auto md:mx-0 opacity-90" />
        </div>

        {/* Info Grid */}
        <div className="grid gap-8 sm:grid-cols-3">
          {contactInfo.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={idx}
                href={item.href}
                target={item.label === "Headquarters" ? "_blank" : undefined}
                rel={item.label === "Headquarters" ? "noopener noreferrer" : undefined}
                whileHover={{ translateY: -6 }}
                className="group flex flex-col items-start rounded-2xl border border-white/5 bg-white/2 p-8 transition-all duration-300 hover:border-[#38bdf8]/20"
              >
                {/* Icon Wrapper badge */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#38bdf8]/5 text-[#38bdf8] transition-all duration-300 shadow-sm group-hover:bg-[#38bdf8]/10">
                  <Icon size={22} />
                </div>
                
                {/* Meta details */}
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#38bdf8]/80 dmsans">
                  {item.label}
                </span>
                
                <h3 className="mt-3 text-base font-bold text-white leading-tight dmsans transition-colors group-hover:text-white">
                  {item.value}
                </h3>
                
                <p className="mt-2 text-xs text-white/60 leading-relaxed font-light dmsans">
                  {item.desc}
                </p>
                
                {/* Interactive Link action */}
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-white/80 opacity-90 transition-opacity">
                  <span className="dmsans">Contact Details</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </motion.a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
