"use client";

/**
 * SessionLockModal — shown when the 1-hour inactivity timer fires.
 * Renders a full-screen frosted glass overlay over the entire app.
 * The user must click "Unlock Again" to navigate to /auth and re-authenticate.
 */

import { motion } from "framer-motion";
import { Lock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
    lastActiveAt: number | null;
}

function timeAgo(ts: number | null): string {
    if (!ts) return "a while ago";
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 minute ago";
    return `${mins} minutes ago`;
}

export function SessionLockModal({ lastActiveAt }: Props) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] flex items-center justify-center"
            style={{ backdropFilter: "blur(24px)", background: "rgba(5,5,7,0.85)" }}
        >
            {/* Animated ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-72 h-72 rounded-full border border-accent-500/10"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-52 h-52 rounded-full border border-accent-500/15"
            />

            <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.1 }}
                className="glass-card border border-accent-800/40 rounded-3xl p-10 text-center max-w-sm w-full mx-6 relative"
            >
                {/* Lock icon */}
                <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-2xl bg-accent-900/40 border border-accent-800/40 flex items-center justify-center mx-auto mb-6"
                >
                    <Lock className="w-9 h-9 text-accent-500" />
                </motion.div>

                <div className="flex items-center justify-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Vault Locked</p>
                </div>

                <h2 className="text-2xl font-bold text-primary-100 mb-2">
                    Session Expired
                </h2>
                <p className="text-sm text-primary-100/50 mb-1">
                    Your vault was automatically locked after 1 hour of inactivity.
                </p>
                <p className="text-xs text-primary-100/30 mb-8">
                    Last active: {timeAgo(lastActiveAt)}
                </p>

                <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(var(--theme-glow-rgb),0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/auth")}
                    className="w-full py-3.5 rounded-2xl bg-accent-500 text-primary-900 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                    <Lock className="w-4 h-4" />
                    Unlock Vault
                </motion.button>

                <p className="text-[10px] text-primary-100/20 mt-4">
                    Your keys remain encrypted. No data was cleared.
                </p>
            </motion.div>
        </motion.div>
    );
}
