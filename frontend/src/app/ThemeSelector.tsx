"use client";

import { useTheme } from "./ThemeContext";
import { Settings2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'gold', name: 'Golden Vault', customClass: 'bg-[#d4af37]' },
        { id: 'emerald', name: 'Emerald Cipher', customClass: 'bg-[#10b981]' },
        { id: 'sapphire', name: 'Sapphire Shield', customClass: 'bg-[#3b82f6]' },
        { id: 'amethyst', name: 'Amethyst Core', customClass: 'bg-[#8b5cf6]' },
        { id: 'ruby', name: 'Ruby Protocol', customClass: 'bg-[#ef4444]' }
    ] as const;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-primary-100/70 hover:text-accent-500 hover:bg-secondary-800 transition-colors"
            >
                <Settings2 className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 p-2 glass-card rounded-xl border border-secondary-500/30 shadow-2xl z-50 origin-top-right"
                    >
                        <div className="mb-2 px-2 text-xs font-bold text-primary-100/50 uppercase tracking-wider">
                            Theme Color
                        </div>
                        <div className="space-y-1">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id as any);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${theme === t.id ? 'bg-secondary-800 text-primary-100' : 'text-primary-100/70 hover:bg-secondary-800/50'
                                        }`}
                                >
                                    {t.name}
                                    <div className={`w-3 h-3 rounded-full ${t.customClass} shadow-md`} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
