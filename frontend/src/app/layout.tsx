import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Shield } from "lucide-react";
import { ThemeProvider } from "./ThemeContext";
import { ThemeSelector } from "./ThemeSelector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureVault | Ultimate Zero-Knowledge Storage",
  description: "Securely store files, folders, and messages with AES-256 and RSA cryptography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen relative selection:bg-accent-500/30 selection:text-accent-300">

        {/* Global Glassmorphism Navigation Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between pointer-events-auto">
            <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
              <Shield className="w-6 h-6 text-accent-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl tracking-wide glow-text">SecureVault</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-primary-100/70">
              <Link href="/features" className="hover:text-accent-300 transition-colors">Features</Link>
              <Link href="/architecture" className="hover:text-accent-300 transition-colors">Architecture</Link>
              <Link href="/pricing" className="hover:text-accent-300 transition-colors">Enterprise</Link>
            </div>

            <div className="flex items-center gap-4">
              <ThemeSelector />
              <Link href="/auth">
                <button className="text-sm font-semibold text-primary-100 hover:text-accent-300 transition-colors px-4 py-2">
                  Sign In
                </button>
              </Link>
              <Link href="/auth?mode=register">
                <button className="text-sm font-semibold bg-accent-500 hover:bg-accent-300 text-primary-900 px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <ThemeProvider>
          <main className="pt-24 min-h-screen">
            {children}
          </main>
        </ThemeProvider>

        {/* Global Footer */}
        <footer className="border-t border-secondary-500/20 py-8 text-center text-primary-100/40 text-sm mt-12 bg-primary-900/50 backdrop-blur-sm relative z-10">
          <p>© {new Date().getFullYear()} SecureVault. Advanced Encryption Systems.</p>
        </footer>
      </body>
    </html>
  );
}
