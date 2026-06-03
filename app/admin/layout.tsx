"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Database,
  Barcode,
  ScanLine,
  FolderOpen,
  ChevronRight,
  Zap,
  FileCheck,
  PenTool,
  Settings2,
  ChevronLeft
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function titleFromPathname(pathname: string) {
  const segment = pathname.split("?")[0]?.split("#")[0]?.split("/").filter(Boolean).pop() || "admin";
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState<string>("");
  const [authChecking, setAuthChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (!user) {
          router.replace("/signin");
          return;
        }

        const response = await fetch(`/api/access/context?userId=${user.id}`);
        const context = await response.json().catch(() => null);

        if (!context?.found) {
          router.replace("/signin");
          return;
        }

        if (!context?.isAdmin) {
          router.replace(context?.canGenerate ? "/home" : "/pending");
          return;
        }

        setEmail(user.email ?? "");
      } catch {
        router.replace("/signin");
        return;
      } finally {
        setAuthChecking(false);
      }
    })();
  }, [router, supabase]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
    setSignOutConfirmOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/signin");
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-7 w-7 rounded-full border-2 border-[#38bdf8] border-r-transparent animate-spin" />
          <p className="dmsans text-xs text-white/30">Checking access...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/vault", label: "Documents", icon: FolderOpen },
    { href: "/admin/pending-applications", label: "Pending Applications", icon: FileCheck },
    { href: "/admin/manage-documents", label: "Manage Documents", icon: Settings2 },
    { href: "/admin/requests", label: "Officer Requests", icon: Users },
    { href: "/admin/logins", label: "Login Details", icon: ShieldCheck },
    { href: "/admin/documents", label: "Barcode History", icon: Database },
    { href: "/admin/generate", label: "Generate Credential", icon: Barcode },
    { href: "/admin/e-signature", label: "E Signature", icon: PenTool },
    { href: "/admin/verify", label: "Verify Document", icon: ScanLine },
  ];

  const pageTitle = (() => {
    const match = [...navLinks]
      .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0];
    if (match) return match.label;
    if (pathname === "/admin") return "Dashboard";
    return titleFromPathname(pathname);
  })();

  const emailInitial = email ? email.charAt(0).toUpperCase() : "A";

  // Shared sidebar content for both desktop & mobile
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = !isMobile && !isDesktopOpen;
    
    return (
      <>
        {/* Sidebar Header / Logo */}
        <div className={`flex h-[72px] shrink-0 items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-white/[0.06]`}>
          <Link href="/admin" onClick={isMobile ? closeDrawer : undefined} className={`flex items-center gap-3 group transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#38bdf8]/10 blur-md scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Image src="/gda_logo.png" alt="GDA Logo" width={isCollapsed ? 36 : 30} height={isCollapsed ? 36 : 30} className="relative object-contain transition-all duration-300" priority />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col justify-center leading-tight">
                <h1 className="dmsans text-[11px] font-bold text-white/90 tracking-[0.1em] uppercase">
                  GDA Admin
                </h1>
                <p className="dmsans text-[8px] font-semibold tracking-[0.25em] uppercase text-[#38bdf8]/80 mt-px">
                  Super Portal
                </p>
              </div>
            )}
          </Link>
          {isMobile ? (
            <button onClick={closeDrawer} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-all">
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => setIsDesktopOpen(!isDesktopOpen)} className={`hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-all ${isCollapsed ? 'absolute -right-4 top-6 bg-[#0f172a] border border-white/10 rounded-full shadow-lg z-50' : ''}`}>
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Section Label */}
        <div className={`pt-7 pb-2 ${isCollapsed ? 'px-0 text-center' : 'px-6'}`}>
          {!isCollapsed ? (
            <p className="dmsans text-[9px] font-bold uppercase tracking-[0.25em] text-white/20">Navigation</p>
          ) : (
            <div className="h-[1px] w-8 mx-auto bg-white/10" />
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 overflow-y-auto space-y-1 admin-scrollbar ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                onClick={isMobile ? closeDrawer : undefined}
                className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center py-3.5' : 'gap-3 px-4 py-3'
                } ${
                  isActive 
                    ? "bg-[#38bdf8]/[0.08] text-white" 
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={isMobile ? "mobile-nav-indicator" : "desktop-nav-indicator"}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 bg-[#38bdf8] rounded-r-full ${isCollapsed ? 'w-[3px] h-6' : 'w-[3px] h-5'}`}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`shrink-0 transition-colors duration-200 ${
                  isCollapsed ? 'h-[20px] w-[20px]' : 'h-[17px] w-[17px]'
                } ${isActive ? "text-[#38bdf8]" : "text-white/30 group-hover:text-white/60"}`} />
                {!isCollapsed && (
                  <>
                    <span className={`dmsans text-[13px] tracking-wide transition-colors duration-200 ${isActive ? "font-semibold" : "font-medium"}`}>
                      {link.label}
                    </span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-[#38bdf8]/50 ml-auto" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer — Profile + Logout */}
        <div className={`shrink-0 border-t border-white/[0.06] ${isCollapsed ? 'p-3 flex flex-col items-center gap-3' : 'p-4'}`}>
          <div className={`relative ${isCollapsed ? 'w-full flex items-center justify-center' : ''}`}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              title="Admin profile"
              className={`group flex items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white font-bold shadow-lg border border-white/10 hover:border-[#38bdf8]/40 transition-all ${
                isCollapsed ? "h-11 w-11" : "h-11 w-11"
              }`}
            >
              <span className="text-sm">{emailInitial}</span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  {/* Click-away backdrop (only inside sidebar) */}
                  <button
                    type="button"
                    aria-label="Close profile menu"
                    onClick={() => setProfileOpen(false)}
                    className="fixed inset-0 z-[60] bg-transparent"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className={`absolute z-[70] bottom-[58px] ${isCollapsed ? "left-1/2 -translate-x-1/2 w-[240px]" : "left-0 w-[260px]"} rounded-2xl border border-white/[0.08] bg-[#0a101f]/95 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden`}
                  >
                    <div className="p-4 border-b border-white/[0.06]">
                      <p className="dmsans text-[9px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/70">Super Admin</p>
                      <p className="truncate dmsans text-[12px] font-semibold text-white/80 mt-1">{email || "..."}</p>
                    </div>
                    <div className="p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setSignOutConfirmOpen(true);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 text-[11px] font-semibold text-white/60 dmsans hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all duration-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <style jsx global>{`
        .admin-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .admin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.06);
          border-radius: 10px;
        }
        .admin-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(56,189,248,0.25);
        }
        /* Global horizontal scrollbar theming for admin tables */
        .admin-h-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .admin-h-scroll::-webkit-scrollbar-track {
          background: rgba(2,6,23,0.5);
          border-radius: 10px;
        }
        .admin-h-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(56,189,248,0.15);
          border-radius: 10px;
        }
        .admin-h-scroll:hover::-webkit-scrollbar-thumb {
          background-color: rgba(56,189,248,0.35);
        }
      `}</style>

      <div className="min-h-screen bg-[#020617] flex w-full overflow-x-hidden">
      
        {/* ═══ DESKTOP SIDEBAR ═══ */}
        <aside className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-[#0a101f]/80 backdrop-blur-2xl border-r border-white/[0.04] transition-all duration-300 ${isDesktopOpen ? "w-[260px]" : "w-[80px]"}`}>
          <SidebarContent />
        </aside>

        {/* ═══ MOBILE DRAWER OVERLAY ═══ */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] lg:hidden"
                onClick={closeDrawer}
              />
              {/* Drawer Panel */}
              <motion.aside
                key="drawer-panel"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-[#0a101f] border-r border-white/[0.04] lg:hidden shadow-2xl shadow-black/50"
              >
                <SidebarContent isMobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isDesktopOpen ? "lg:pl-[260px]" : "lg:pl-[80px]"}`}>

          {/* Page Content */}
          <main className="flex-1 flex flex-col relative z-10 w-full">
            {/* Global Admin Header */}
            <div className="sticky top-0 z-20 w-full border-b border-white/[0.06] bg-[#020617]/70 backdrop-blur-2xl">
              <div className="mx-auto w-full max-w-[1800px] px-3 sm:px-6 py-3">
                <div className="flex items-center justify-between gap-2">

                  {/* Left: mobile drawer icon (hidden on lg) + desktop spacer */}
                  <div className="flex items-center gap-2">
                    <button
                      className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
                      onClick={() => setDrawerOpen(true)}
                      aria-label="Open menu"
                    >
                      <Menu className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Center: page title */}
                  <div className="flex-1 text-center lg:text-left">
                    <p className="dmsans text-[9px] font-black uppercase tracking-[0.35em] text-white/20 hidden lg:block">
                      Admin Workspace
                    </p>
                    <h2 className="playfair text-[16px] sm:text-[20px] font-bold text-white/85 truncate">
                      {pageTitle}
                    </h2>
                  </div>

                  {/* Right: controls */}
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="hidden sm:flex h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.06] items-center justify-center text-white/60">
                      <Zap className="h-4 w-4 text-[#38bdf8]/70" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>

      {/* Sign out confirmation modal */}
      <AnimatePresence>
        {signOutConfirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]"
              onClick={() => setSignOutConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed left-1/2 top-1/2 z-[110] w-[92vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-[#0a101f]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-5 border-b border-white/[0.06]">
                <p className="dmsans text-[9px] font-black uppercase tracking-[0.35em] text-white/20">Confirmation</p>
                <h3 className="playfair text-[18px] font-bold text-white/85 mt-1">Do you want to sign out?</h3>
              </div>
              <div className="p-5 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSignOutConfirmOpen(false)}
                  className="px-4 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 dmsans text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/[0.06] transition-all"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setSignOutConfirmOpen(false);
                    await signOut();
                  }}
                  className="px-4 h-11 rounded-xl bg-rose-500 text-white dmsans text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/20"
                >
                  Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
