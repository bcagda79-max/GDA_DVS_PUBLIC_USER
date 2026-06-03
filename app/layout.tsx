import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "./components/site-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GDAVS | Government Document Authentication & Verification System",
  description:
    "GDAVS provides secure document generation, barcode stamping, and public verification for government-issued records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('gdav_theme');
                  var theme = saved;
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                    var link = document.createElement('link');
                    link.id = 'gdav-light-theme';
                    link.rel = 'stylesheet';
                    link.href = '/light-theme.css';
                    document.head.appendChild(link);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#060D14] font-sans text-white">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
