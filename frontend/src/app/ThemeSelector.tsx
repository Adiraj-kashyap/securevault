"use client";

import { useTheme } from "./ThemeContext";
import { Palette } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THEMES = [
  { id: "gold",      name: "Golden Vault",    hex: "#d4af37", glow: "rgba(212,175,55,0.4)"  },
  { id: "emerald",   name: "Emerald Cipher",  hex: "#10b981", glow: "rgba(16,185,129,0.4)"  },
  { id: "sapphire",  name: "Sapphire Shield", hex: "#3b82f6", glow: "rgba(59,130,246,0.4)"  },
  { id: "amethyst",  name: "Amethyst Core",   hex: "#8b5cf6", glow: "rgba(139,92,246,0.4)"  },
  { id: "ruby",      name: "Ruby Protocol",   hex: "#ef4444", glow: "rgba(239,68,68,0.4)"   },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 p-2 rounded-xl btn-ghost"
        title="Change theme"
      >
        <div
          className="w-4 h-4 rounded-full border border-white/20 transition-all duration-300"
          style={{ background: currentTheme.hex, boxShadow: `0 0 8px ${currentTheme.glow}` }}
        />
        <Palette className="w-4 h-4 text-primary-100/50" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="absolute right-0 mt-2 w-52 glass-card border border-secondary-500/30 rounded-xl p-3 z-50 shadow-2xl origin-top-right"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-100/30 px-1 mb-3">
                Color Theme
              </p>
              <div className="space-y-1">
                {THEMES.map((t) => {
                  const active = theme === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setTheme(t.id); setIsOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? "bg-white/8 text-primary-100"
                          : "text-primary-100/60 hover:bg-white/5 hover:text-primary-100"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-5 h-5 rounded-full border-2 transition-all duration-300"
                          style={{
                            background: t.hex,
                            borderColor: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
                            boxShadow: active ? `0 0 10px ${t.glow}` : "none",
                          }}
                        />
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="white">
                              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <span className="font-medium">{t.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}