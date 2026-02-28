"use client";

import { useTheme } from "./ThemeContext";
import { Palette } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THEMES = [
  { id: "gold", name: "Golden Vault", hex: "#d4af37", glow: "rgba(212,175,55,0.4)", premium: false },
  { id: "emerald", name: "Emerald Cipher", hex: "#10b981", glow: "rgba(16,185,129,0.4)", premium: false },
  { id: "sapphire", name: "Sapphire Shield", hex: "#3b82f6", glow: "rgba(59,130,246,0.4)", premium: false },
  { id: "amethyst", name: "Amethyst Core", hex: "#8b5cf6", glow: "rgba(139,92,246,0.4)", premium: false },
  { id: "ruby", name: "Ruby Protocol", hex: "#ef4444", glow: "rgba(239,68,68,0.4)", premium: false },
  { id: "neon-cyan", name: "Neon Cyan", hex: "#06b6d4", glow: "rgba(6,182,212,0.4)", premium: true },
  { id: "sunset-orange", name: "Sunset Orange", hex: "#f97316", glow: "rgba(249,115,22,0.4)", premium: true },
  { id: "rose-quartz", name: "Rose Quartz", hex: "#f43f5e", glow: "rgba(244,63,94,0.4)", premium: true },
  { id: "toxic-lime", name: "Toxic Lime", hex: "#84cc16", glow: "rgba(132,204,22,0.4)", premium: true },
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
              className="absolute right-0 mt-2 w-64 glass-card border border-secondary-500/30 rounded-xl p-3 z-50 shadow-2xl origin-top-right max-h-[380px] overflow-y-auto"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-100/30 px-1 mb-2">
                Standard
              </p>
              <div className="space-y-0.5 mb-2">
                {THEMES.map((t, idx) => {
                  const active = theme === t.id;
                  // Insert divider before first premium theme
                  const showDivider = t.premium && (idx === 0 || !THEMES[idx - 1].premium);
                  return (
                    <div key={t.id}>
                      {showDivider && (
                        <div className="flex items-center gap-2 my-2">
                          <div className="flex-1 h-px bg-white/5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/60">Premium</span>
                          <div className="flex-1 h-px bg-white/5" />
                        </div>
                      )}
                      <motion.button
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setTheme(t.id as any); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${active
                          ? "bg-white/8 text-primary-100"
                          : "text-primary-100/60 hover:bg-white/5 hover:text-primary-100"
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-4 h-4 rounded-full border-2 transition-all duration-300"
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
                        <span className="font-medium flex-1 text-left">{t.name}</span>
                        {t.premium && !active && (
                          <span className="text-[8px] font-bold text-amber-400/70">✦</span>
                        )}
                      </motion.button>
                    </div>
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