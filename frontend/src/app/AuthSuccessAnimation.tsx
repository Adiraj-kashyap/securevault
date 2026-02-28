"use client";

/**
 * AuthSuccessAnimation
 * ─────────────────────────────────────────────────────────────────
 * A cinematic "Cryptographic Handshake" ceremony that plays after
 * a successful login or registration, before routing to /dashboard.
 *
 * Sequence (total ~2.8 s):
 *  Phase 1  0–350ms   Overlay blacks out with cascading hex rain
 *  Phase 2  350–850ms Scanner beam sweeps top → bottom
 *  Phase 3  850–1600ms "ACCESS GRANTED" assembles character by character
 *  Phase 4  1200–1800ms Fingerprint ring forms around a shield icon
 *  Phase 5  1800–2400ms Burst of radial lines then everything implodes
 *  Phase 6  2400ms     onComplete() called → router.push('/dashboard')
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Random hex char helpers ─────────────────────────────────── */
const HEX_CHARS = "0123456789ABCDEF";
const rand = (n: number) => Math.floor(Math.random() * n);
const randHex = (len: number) =>
    Array.from({ length: len }, () => HEX_CHARS[rand(16)]).join("");

/* ─── Rain Column ─────────────────────────────────────────────── */
function RainColumn({ x, delay }: { x: number; delay: number }) {
    const count = 18 + rand(10);
    return (
        <motion.g
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: [0, 0.7, 0.4, 0], y: ["0%", "110%"] }}
            transition={{ duration: 1.2, delay, ease: "easeIn" }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <text
                    key={i}
                    x={x}
                    y={i * 22}
                    fontSize={11}
                    fontFamily="'JetBrains Mono', monospace"
                    fill={`rgba(var(--theme-glow-rgb), ${0.2 + Math.random() * 0.6})`}
                    style={{ userSelect: "none" }}
                >
                    {HEX_CHARS[rand(16)]}
                </text>
            ))}
        </motion.g>
    );
}

/* ─── Scramble Text ───────────────────────────────────────────── */
function ScrambleText({ text, startDelay }: { text: string; startDelay: number }) {
    const [displayChars, setDisplayChars] = useState<string[]>(
        () => text.split("").map(() => " ")
    );

    useEffect(() => {
        let cancelled = false;
        const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

        async function run() {
            await sleep(startDelay);
            for (let i = 0; i < text.length; i++) {
                if (cancelled) return;

                if (text[i] === " ") {
                    setDisplayChars(prev => { const n = [...prev]; n[i] = " "; return n; });
                    continue;
                }

                // Scramble this position 6 times before locking
                for (let s = 0; s < 6; s++) {
                    if (cancelled) return;
                    const scrambled = HEX_CHARS[rand(16)];
                    setDisplayChars(prev => { const n = [...prev]; n[i] = scrambled; return n; });
                    await sleep(32);
                }

                // Lock the correct character
                if (!cancelled) {
                    setDisplayChars(prev => { const n = [...prev]; n[i] = text[i]; return n; });
                    await sleep(38);
                }
            }
        }

        run();
        return () => { cancelled = true; };
    }, [text, startDelay]);

    return (
        <span className="font-code tracking-[0.2em]">
            {displayChars.map((ch, i) => {
                const locked = ch === text[i] && text[i] !== " ";
                return (
                    <motion.span
                        key={i}
                        animate={{
                            color: locked
                                ? "rgba(var(--theme-glow-rgb), 1)"
                                : "rgba(var(--theme-glow-rgb), 0.4)",
                            textShadow: locked
                                ? "0 0 12px rgba(var(--theme-glow-rgb), 0.9)"
                                : "none",
                        }}
                        transition={{ duration: 0.08 }}
                    >
                        {ch}
                    </motion.span>
                );
            })}
        </span>
    );
}

/* ─── Fingerprint Ring ─────────────────────────────────────────── */
function FingerprintRing({ show }: { show: boolean }) {
    const rings = [52, 42, 32, 22];
    return (
        <AnimatePresence>
            {show && (
                <motion.svg
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.8 }}
                    transition={{ type: "spring", stiffness: 180, damping: 18 }}
                    width={120} height={120}
                    viewBox="-60 -60 120 120"
                    className="absolute"
                >
                    {rings.map((r, i) => (
                        <motion.circle
                            key={r}
                            r={r}
                            cx={0} cy={0}
                            fill="none"
                            stroke={`rgba(var(--theme-glow-rgb), ${0.5 - i * 0.09})`}
                            strokeWidth={1.4}
                            strokeDasharray={`${r * 0.4} ${r * 0.18}`}
                            initial={{ pathLength: 0, rotate: 0 }}
                            animate={{
                                pathLength: 1,
                                rotate: i % 2 === 0 ? 360 : -360,
                            }}
                            transition={{
                                pathLength: { duration: 0.7, delay: i * 0.12 },
                                rotate: { duration: 8 + i * 2, repeat: Infinity, ease: "linear" },
                            }}
                            style={{
                                filter: `drop-shadow(0 0 4px rgba(var(--theme-glow-rgb),0.8))`,
                                transformOrigin: "0 0",
                            }}
                        />
                    ))}
                    {/* Center shield */}
                    <motion.path
                        d="M0,-14 L10,-9 L10,4 C10,10 5,14 0,16 C-5,14 -10,10 -10,4 L-10,-9 Z"
                        fill="none"
                        stroke={`rgba(var(--theme-glow-rgb), 0.9)`}
                        strokeWidth={1.5}
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ filter: "drop-shadow(0 0 6px rgba(var(--theme-glow-rgb),1))" }}
                    />
                    {/* Check inside shield */}
                    <motion.path
                        d="M-4,1 L-1,4 L5,-3"
                        fill="none"
                        stroke={`rgba(var(--theme-glow-rgb), 1)`}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                        style={{ filter: "drop-shadow(0 0 4px rgba(var(--theme-glow-rgb),1))" }}
                    />
                </motion.svg>
            )}
        </AnimatePresence>
    );
}

/* ─── Burst Lines ─────────────────────────────────────────────── */
function BurstLines({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6 }}
                >
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i / 24) * Math.PI * 2;
                        const len = 80 + rand(120);
                        const cx = "50%";
                        const cy = "50%";
                        return (
                            <motion.line
                                key={i}
                                x1={cx} y1={cy}
                                x2={`calc(50% + ${Math.cos(angle) * len}px)`}
                                y2={`calc(50% + ${Math.sin(angle) * len}px)`}
                                stroke={`rgba(var(--theme-glow-rgb), ${0.4 + Math.random() * 0.5})`}
                                strokeWidth={0.8 + Math.random()}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.5, delay: i * 0.012 }}
                                style={{ filter: "drop-shadow(0 0 3px rgba(var(--theme-glow-rgb),0.8))" }}
                            />
                        );
                    })}
                </motion.svg>
            )}
        </AnimatePresence>
    );
}

/* ─── Main Component ──────────────────────────────────────────── */
export function AuthSuccessAnimation({
    email,
    isLogin,
    onComplete,
}: {
    email: string;
    isLogin: boolean;
    onComplete: () => void;
}) {
    const [phase, setPhase] = useState(1);
    const called = useRef(false);

    // Phase timer chain
    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(2), 350),   // scanner starts
            setTimeout(() => setPhase(3), 750),   // text assembles
            setTimeout(() => setPhase(4), 1200),  // ring forms
            setTimeout(() => setPhase(5), 1850),  // burst
            setTimeout(() => setPhase(6), 2100),  // implode
            setTimeout(() => {                     // done
                if (!called.current) { called.current = true; onComplete(); }
            }, 2600),
        ];
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    // Rain columns — seeded once
    const cols = useRef(
        Array.from({ length: 28 }, (_, i) => ({
            x: 20 + i * (typeof window !== "undefined" ? (window.innerWidth - 40) / 28 : 50),
            delay: Math.random() * 0.3,
        }))
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 9998, background: "#06060a" }}
        >
            {/* ── Phase 1+: Hex rain ── */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                {cols.current.map((col, i) => (
                    <RainColumn key={i} x={col.x} delay={col.delay} />
                ))}
            </svg>

            {/* ── Phase 2: Scanner beam ── */}
            <AnimatePresence>
                {phase >= 2 && (
                    <motion.div
                        key="scanner"
                        initial={{ top: "-2px" }}
                        animate={{ top: "102%" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] pointer-events-none"
                        style={{
                            background: `linear-gradient(90deg, transparent, rgba(var(--theme-glow-rgb),0.8), transparent)`,
                            boxShadow: `0 0 18px 4px rgba(var(--theme-glow-rgb),0.4)`,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── Center stage ── */}
            <div className="relative flex flex-col items-center gap-6 z-10">

                {/* Fingerprint / shield ring */}
                <div className="relative w-[120px] h-[120px] flex items-center justify-center">
                    <FingerprintRing show={phase >= 4} />
                </div>

                {/* Main text */}
                <AnimatePresence>
                    {phase >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <div className="text-2xl md:text-3xl font-bold mb-2">
                                <ScrambleText
                                    text={isLogin ? "ACCESS  GRANTED" : "VAULT  CREATED"}
                                    startDelay={0}
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="text-xs font-code text-primary-100/35 tracking-widest"
                            >
                                {email.toUpperCase()}
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1 }}
                                className="text-[10px] font-code mt-1 tracking-wider"
                                style={{ color: "rgba(var(--theme-glow-rgb),0.5)" }}
                            >
                                RSA-2048 · AES-256 · PBKDF2×100K
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress bar */}
                <AnimatePresence>
                    {phase >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                            className="w-48 h-[1px] origin-left"
                            style={{
                                background: `linear-gradient(90deg, rgba(var(--theme-glow-rgb),0), rgba(var(--theme-glow-rgb),0.9), rgba(var(--theme-glow-rgb),0))`,
                                boxShadow: `0 0 8px rgba(var(--theme-glow-rgb),0.6)`,
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* ── Phase 5: Burst ── */}
            <BurstLines show={phase === 5} />

            {/* ── Phase 6: Implode vignette ── */}
            <AnimatePresence>
                {phase >= 6 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45 }}
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at center, rgba(var(--theme-glow-rgb),0.15) 0%, #06060a 70%)`,
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
