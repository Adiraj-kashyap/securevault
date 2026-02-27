"use client";

import Link from "next/link";
import { useSession } from "./SessionContext";
import { useTheme } from "./ThemeContext";
import { ThemeSelector } from "./ThemeSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Shield, LayoutDashboard, MessageSquareLock, Settings,
  LogOut, User, ChevronDown, X, Menu,
} from "lucide-react";

export function NavbarClient() {
  const { session, logout } = useSession();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const publicLinks  = [
    { href: "/features",     label: "Features"      },
    { href: "/architecture", label: "Architecture"  },
    { href: "/pricing",      label: "Enterprise"    },
  ];
  const privateLinks = [
    { href: "/dashboard",        label: "Dashboard",  icon: LayoutDashboard      },
    { href: "/messages",         label: "Messages",   icon: MessageSquareLock    },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
        className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "glass shadow-2xl" : "glass"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="w-6 h-6 text-accent-500" strokeWidth={1.5} />
            </motion.div>
            <span className="font-display font-bold text-lg tracking-tight glow-text">
              SecureVault
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {session
              ? privateLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-primary-100/70 hover:text-primary-100 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </motion.div>
                  </Link>
                ))
              : publicLinks.map(({ href, label }) => (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-primary-100/70 hover:text-primary-100 transition-colors"
                    >
                      {label}
                    </motion.div>
                  </Link>
                ))}
          </div>

          {/* Right: Theme + Auth */}
          <div className="flex items-center gap-2">
            <ThemeSelector />

            {session ? (
              /* User menu */
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card border-secondary-500/30 hover:border-accent-500/30 transition-all"
                >
                  {/* Identicon placeholder */}
                  <div className="w-7 h-7 rounded-lg identicon-placeholder flex items-center justify-center">
                    <span className="font-code text-xs text-accent-300 font-bold">
                      {session.email[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-primary-100/80 max-w-[100px] truncate">
                    {session.email}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-primary-100/50 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute right-0 mt-2 w-52 glass-card border border-secondary-500/30 rounded-xl shadow-2xl p-2 z-50 origin-top-right"
                    >
                      <div className="px-3 py-2 mb-1 border-b border-white/5">
                        <p className="text-xs text-primary-100/40 font-code">Signed in as</p>
                        <p className="text-sm font-semibold text-primary-100 truncate">{session.email}</p>
                      </div>
                      {[
                        { href: "/profile",    label: "Key Fingerprint", icon: User       },
                        { href: "/settings",   label: "Settings",        icon: Settings   },
                        { href: "/audit-log",  label: "Audit Log",       icon: Shield     },
                      ].map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-primary-100/70 hover:text-primary-100 hover:bg-white/5 transition-all"
                          >
                            <Icon className="w-4 h-4 text-accent-500/70" />
                            {label}
                          </motion.div>
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition-all"
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
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-sm font-semibold text-primary-100/70 hover:text-primary-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/auth?mode=register">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary text-sm px-5 py-2.5"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl btn-ghost"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="max-w-7xl mx-auto mt-2 glass rounded-2xl overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {(session ? privateLinks : publicLinks).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-primary-100/70 hover:text-primary-100 hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                {!session && (
                  <div className="pt-2 border-t border-white/5 flex gap-2">
                    <Link href="/auth" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 btn-ghost text-sm font-semibold rounded-xl">Sign In</button>
                    </Link>
                    <Link href="/auth?mode=register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 btn-primary text-sm rounded-xl">Get Started</button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}