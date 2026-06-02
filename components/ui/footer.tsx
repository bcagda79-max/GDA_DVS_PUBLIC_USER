"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { cn } from "@/lib/utils";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/gdaabbottabad/",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/gdaabbottabad?igsh=MWwyMjZrYzNvMWE3NQ==",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/gdaabbottabad",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const adminLinks = [
  { label: "Home", href: "/admin" },
  { label: "Officer Requests", href: "/admin/requests" },
  { label: "Login Details", href: "/admin/logins" },
  { label: "Barcode History", href: "/admin/documents" },
  { label: "Generate Bar Code", href: "/admin/generate" },
  { label: "Verify Document", href: "/admin/verify" },
];

const officerLinks = [
  { label: "Home", href: "/home" },
  { label: "Generate Bar Code", href: "/generate" },
  { label: "Verify Document", href: "/home/verify" },
  { label: "Bar Code History", href: "/history" },
];

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Verify Document", href: "/verify" },
  { label: "Get in Touch", href: "/#get-in-touch" },
];

type FooterLink = { label: string; href: string };
type FooterVariant = "auto" | "admin" | "officer" | "public";

function FooterBase({ links }: { links: FooterLink[] }) {
  const pathname = usePathname();

  return (
    <footer className="relative overflow-hidden border-t border-white/5" style={{ background: "linear-gradient(180deg, #070E17 0%, #040A10 100%)" }}>

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />

      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#38bdf8]/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#38bdf8]/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">

          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group transition-all duration-300">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-[#38bdf8]/10 blur-md scale-125 group-hover:bg-[#38bdf8]/18 transition-all duration-500" />
                <Image src="/gda_logo.png" alt="GDA Logo" width={44} height={44} className="relative h-11 w-11 object-contain" />
              </div>
              <div className="leading-tight">
                <div className="playfair text-lg font-bold text-white tracking-wide">GDA-DVS</div>
                <div className="dmsans text-[10px] uppercase tracking-[0.15em] text-[#38bdf8]/70">Document Verification</div>
              </div>
            </Link>

            <p className="dmsans text-sm leading-relaxed text-white/50 font-light max-w-xs">Secure, transparent, and official document registry and barcode verification platform for the Galiyat Development Authority.</p>

            <div className="flex gap-2 pt-1">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" title={social.name} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/50 hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/10 hover:text-[#38bdf8] hover:-translate-y-0.5 transition-all duration-300">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">Registry Actions</h3>
            <div className="h-[1px] w-8 bg-[#38bdf8]/40" />
            <nav className="flex flex-col gap-2.5">
              {links.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={cn(
                        "group inline-flex items-center gap-2 dmsans text-sm transition-all duration-300",
                        isActive 
                          ? "text-[#38bdf8] font-bold" 
                          : "text-white/50 font-light hover:text-[#38bdf8]"
                      )}
                    >
                      <span className={cn(
                        "h-[1px] bg-[#38bdf8] transition-all duration-300",
                        isActive ? "w-4" : "w-0 group-hover:w-4"
                      )} />
                      {link.label}
                    </Link>
                  );
                })}
            </nav>
          </div>

          <div className="space-y-5">
            <h3 className="dmsans text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">Legal & Info</h3>
            <div className="h-[1px] w-8 bg-[#38bdf8]/40" />
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" }, 
                { label: "Terms of Use", href: "/terms-of-use" }, 
                { label: "About", href: "/about" },
                { label: "Contact Us", href: "/contact-us" }
              ].map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={cn(
                      "group inline-flex items-center gap-2 dmsans text-sm transition-all duration-300",
                      isActive 
                        ? "text-[#38bdf8] font-bold" 
                        : "text-white/50 font-light hover:text-[#38bdf8]"
                    )}
                  >
                    <span className={cn(
                      "h-[1px] bg-[#38bdf8] transition-all duration-300",
                      isActive ? "w-4" : "w-0 group-hover:w-4"
                    )} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <p className="dmsans text-xs text-white/30 font-light">© {new Date().getFullYear()} Galiyat Development Authority. All rights reserved.</p>
            <p className="dmsans text-[11px] text-white/20 font-light italic">Developed under the Directorate of BCA & Office of the Director General, GDA</p>
          </div>
        </div>

      </div>
    </footer>
  );
}

export function AdminFooter() {
  return <FooterBase links={adminLinks} />;
}

export function OfficerFooter() {
  return <FooterBase links={officerLinks} />;
}

export function PublicFooter() {
  return <FooterBase links={publicLinks} />;
}

export function Footer({ variant = "auto" }: { variant?: FooterVariant }) {
  if (variant === "admin") return <AdminFooter />;
  if (variant === "officer") return <OfficerFooter />;
  if (variant === "public") return <PublicFooter />;

  const [links, setLinks] = useState<FooterLink[]>(publicLinks);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user) return; // keep public links

        const res = await fetch(`/api/access/context?userId=${user.id}`);
        if (!mounted) return;
        if (!res.ok) return;
        const body = await res.json();

        if (body?.isAdmin) {
          setLinks(adminLinks);
        } else if (body?.canGenerate || body?.isPending) {
          setLinks(officerLinks);
        } else {
          setLinks(publicLinks);
        }
      } catch (e) {
        // ignore and keep defaults
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return <FooterBase links={links} />;
}
