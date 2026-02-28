"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "./SessionContext";
import { ThemeSelector } from "./ThemeSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TransitionLink } from "./VaultTransition";
import {
  Shield, LayoutDashboard, MessageSquareLock, Settings,
  LogOut, User, ChevronDown, X, Menu, Lock, Activity, Mail
} from "lucide-react";

export function NavbarClient() {
  const { session, logout } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const publicLinks = [
    { href: "/features", label: "Features" },
    { href: "/architecture", label: "Architecture" },
    { href: "/pricing", label: "Enterprise" },
  ];
  const privateLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mail", label: "Mail", icon: Mail },
    { href: "/messages", label: "Messages", icon: MessageSquareLock },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const mobileItemVariants = {
    hidden: { x: -12, opacity: 0 },
    show: { x: 0, opacity: 1 },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 22, delay: 0.05 }}
        className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300 ${scrolled ? "py-2" : "py-3"
          }`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? "glass-nav shadow-2xl" : "glass"
            }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 350 }}
              className="relative"
            >
              <Shield className="w-6 h-6 text-accent-500" strokeWidth={1.5} />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -inset-1 rounded-full bg-accent-500/10"
              />
            </motion.div>
            <span className="font-display font-bold text-lg tracking-tight glow-text-subtle">
              SecureVault
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {session
              ? privateLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${active
                        ? "text-accent-300"
                        : "text-primary-100/60 hover:text-primary-100"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                      {active && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute bottom-0 left-3 right-3 h-px bg-accent-500 rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })
              : publicLinks.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors ${active
                        ? "text-accent-300"
                        : "text-primary-100/60 hover:text-primary-100"
                        }`}
                    >
                      {label}
                      {active && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute bottom-0 left-3 right-3 h-px bg-accent-500 rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Encryption status dot — always present */}
            <motion.div
              title="Zero-knowledge encryption active"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass border border-white/5"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-3 h-3 enc-locked" />
              </motion.div>
              <span className="text-[9px] font-code text-safe/70 font-bold hidden lg:block">
                E2E
              </span>
            </motion.div>

            <ThemeSelector />

            {session ? (
              /* User dropdown */
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card border-secondary-500/25 hover:border-accent-500/30 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg identicon-placeholder flex items-center justify-center">
                    <span className="font-code text-xs text-accent-300 font-bold">
                      {(session.tagline || session.email)[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-primary-100/75 max-w-[100px] truncate">
                    {session.tagline || session.email}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-primary-100/40 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                      className="absolute right-0 mt-2 z-[60] origin-top-right rounded-2xl shadow-2xl p-2 border border-white/10 overflow-hidden"
                      style={{
                        width: "220px",
                        background: "rgba(10, 10, 14, 0.97)",
                        backdropFilter: "blur(24px)",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="px-3 py-2.5 mb-1 border-b border-white/5">
                        <p className="text-[10px] text-primary-100/35 font-code uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm font-semibold text-primary-100 truncate mt-0.5">{session.tagline || session.email}</p>
                      </div>
                      {[
                        { href: "/profile", label: "Key Fingerprint", icon: User },
                        { href: "/settings", label: "Settings", icon: Settings },
                        { href: "/audit-log", label: "Audit Log", icon: Activity },
                      ].map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}>
                          <motion.div
                            whileHover={{ x: 3 }}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-primary-100/65 hover:text-primary-100 hover:bg-white/5 transition-all"
                          >
                            <Icon className="w-4 h-4 text-accent-500/65" />
                            {label}
                          </motion.div>
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <motion.button
                          whileHover={{ x: 3 }}
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-danger/80 hover:text-danger hover:bg-danger/8 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <TransitionLink href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-sm font-semibold text-primary-100/60 hover:text-primary-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    Sign In
                  </motion.button>
                </TransitionLink>
                <TransitionLink href="/auth?mode=register">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary text-sm px-5 py-2.5 rounded-xl"
                  >
                    Get Started
                  </motion.button>
                </TransitionLink>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-xl btn-ghost"
            >
              <AnimatePresence mode="wait">
                {mobileOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" /></motion.div>
                  : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto mt-2 glass-nav rounded-2xl overflow-hidden border border-white/6"
            >
              <motion.div
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                initial="hidden"
                animate="show"
                className="p-4 space-y-1"
              >
                {(session ? privateLinks : publicLinks).map((link) => (
                  <motion.div key={link.href} variants={mobileItemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.href)
                        ? "bg-accent-900/30 text-accent-300 border border-accent-800/30"
                        : "text-primary-100/60 hover:text-primary-100 hover:bg-white/5"
                        }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {!session && (
                  <motion.div variants={mobileItemVariants} className="pt-2 border-t border-white/5 flex gap-2">
                    <Link href="/auth" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 btn-ghost text-sm font-semibold rounded-xl">Sign In</button>
                    </Link>
                    <Link href="/auth?mode=register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 btn-primary text-sm rounded-xl">Get Started</button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}