import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeContext";
import { SessionProvider } from "./SessionContext";
import { NavbarClient } from "./NavbarClient";
import { BackgroundCanvas } from "./BackgroundCanvas";
import { PatternLayer } from "./PatternLayer";
import { VaultTransitionProvider } from "./VaultTransition";
import { FooterGuard } from "./FooterGuard";
import { AppearanceProvider } from "./AppearanceContext";
import { PremiumProvider } from "./PremiumContext";
import { VaultLockGuard } from "./VaultLockGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureVault | Zero-Knowledge Encryption Platform",
  description:
    "The ultimate zero-knowledge platform. Encrypt, store, and share your most sensitive files, folders, and messages using AES-256 + RSA-2048.",
  keywords: "encryption, zero-knowledge, secure storage, AES-256, RSA, privacy",
  openGraph: {
    title: "SecureVault | Zero-Knowledge Encryption Platform",
    description: "Encrypt everything. Trust no one. Store fearlessly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-primary-900 text-primary-100 overflow-x-hidden">
        <SessionProvider>
          <ThemeProvider>
            <AppearanceProvider>
              <PremiumProvider>
                <VaultTransitionProvider>
                  {/* Interactive particle network — behind everything */}
                  <BackgroundCanvas />

                  {/* Background texture pattern layer (stars, plasma, hex, etc.) */}
                  <PatternLayer />

                  {/* Vault auto-lock overlay — sits above everything */}
                  <VaultLockGuard />

                  {/* Ambient orb layer on top of canvas */}
                  <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden>
                    <div className="orb-top-left" />
                    <div className="orb-bottom-right" />
                  </div>

                  {/* Navigation */}
                  <NavbarClient />

                  {/* Page Content */}
                  <main className="relative z-10 pt-[76px] min-h-screen">
                    {children}
                  </main>

                  {/* Footer — hidden on app routes (/dashboard, /settings, /profile etc.) */}
                  <FooterGuard>
                    <footer className="relative z-10 border-t border-white/5 py-10 mt-16">
                      <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-3">
                              <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                              </svg>
                              <span className="font-display font-bold text-lg glow-text">SecureVault</span>
                            </div>
                            <p className="text-primary-100/40 text-sm leading-relaxed max-w-xs">
                              Zero-knowledge encryption for the paranoid professional. Your keys, your data, your control — always.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-100/30 mb-4">Platform</p>
                            <ul className="space-y-2 text-sm text-primary-100/50">
                              <li><a href="/features" className="hover:text-accent-300 transition-colors">Features</a></li>
                              <li><a href="/architecture" className="hover:text-accent-300 transition-colors">Architecture</a></li>
                              <li><a href="/pricing" className="hover:text-accent-300 transition-colors">Enterprise</a></li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-100/30 mb-4">Security</p>
                            <ul className="space-y-2 text-sm text-primary-100/50">
                              <li><a href="/audit-log" className="hover:text-accent-300 transition-colors">Audit Log</a></li>
                              <li><a href="/steganography" className="hover:text-accent-300 transition-colors">Hidden Volumes</a></li>
                              <li><a href="/dead-mans-switch" className="hover:text-accent-300 transition-colors">Dead Man&apos;s Switch</a></li>
                            </ul>
                          </div>
                        </div>
                        <div className="divider-glow mb-6" />
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <p className="text-primary-100/25 text-xs font-code">
                            © {new Date().getFullYear()} SecureVault · AES-256 + RSA-2048 · Zero-Knowledge Architecture
                          </p>
                          <p className="text-primary-100/20 text-xs font-code">
                            All encryption occurs client-side. We never see your data.
                          </p>
                        </div>
                      </div>
                    </footer>
                  </FooterGuard>
                </VaultTransitionProvider>
              </PremiumProvider>
            </AppearanceProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}