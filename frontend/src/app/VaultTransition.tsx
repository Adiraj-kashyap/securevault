"use client";

/**
 * Vault Iris Transition System
 * ─────────────────────────────
 * When navigating to a new route via <TransitionLink>, a full-screen
 * cinematic overlay plays:
 *
 *   Phase 1 — "Iris closing" (0–600ms)
 *     A glowing ring expands from the click origin, covering the viewport.
 *     Concentric arcs spin inward like a vault door locking.
 *
 *   Phase 2 — Black (600–800ms)
 *     Router pushes the new route while viewport is opaque.
 *
 *   Phase 3 — "Iris opening" (800–1350ms)
 *     Ring contracts inward from the center, revealing the new page.
 */

import {
    createContext, useContext, useRef, useState, useCallback,
    useEffect, ReactNode, useMemo
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppearance } from "./AppearanceContext";

/* ─── Types ──────────────────────────────────────────────────── */
interface Origin { x: number; y: number }
interface TransitionCtx {
    navigate: (href: string, origin?: Origin) => void;
}

/* ─── Context ────────────────────────────────────────────────── */
const Ctx = createContext<TransitionCtx>({ navigate: () => { } });
export const useVaultTransition = () => useContext(Ctx);

/* ─── Iris SVG Overlay ───────────────────────────────────────── */
function IrisOverlay({
    phase, origin,
}: {
    phase: "closing" | "open" | "opening";
    origin: Origin;
}) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;

    // Radius needed to cover the entire viewport from origin
    const maxR = Math.ceil(
        Math.sqrt(
            Math.max(origin.x, vw - origin.x) ** 2 +
            Math.max(origin.y, vh - origin.y) ** 2
        )
    ) + 40;

    const isClosing = phase === "closing";
    const isOpen = phase === "open";

    return (
        <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 9999 }}
        >
            <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Radial glow gradient */}
                    <radialGradient id="iris-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(var(--theme-glow-rgb),0)" />
                        <stop offset="70%" stopColor="rgba(var(--theme-glow-rgb),0.12)" />
                        <stop offset="100%" stopColor="rgba(var(--theme-glow-rgb),0.55)" />
                    </radialGradient>
                    <radialGradient id="iris-fill" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(var(--theme-glow-rgb),0.06)" />
                        <stop offset="100%" stopColor="#06060a" />
                    </radialGradient>
                </defs>

                {/* Dark overlay — animates with the iris */}
                <motion.circle
                    cx={origin.x}
                    cy={origin.y}
                    initial={{ r: isClosing ? 0 : maxR }}
                    animate={{ r: isClosing ? maxR : isOpen ? maxR : 0 }}
                    transition={{
                        duration: isClosing ? 0.55 : 0.5,
                        ease: isClosing ? [0.36, 0, 0.66, -0.05] : [0.34, 1.56, 0.64, 1],
                    }}
                    fill="url(#iris-fill)"
                />

                {/* Glowing ring at edge of iris */}
                {[0, 1, 2].map((i) => (
                    <motion.circle
                        key={i}
                        cx={origin.x}
                        cy={origin.y}
                        fill="none"
                        stroke={`rgba(var(--theme-glow-rgb), ${0.7 - i * 0.2})`}
                        strokeWidth={6 - i * 1.5}
                        initial={{ r: isClosing ? 0 : maxR, opacity: 0 }}
                        animate={{
                            r: isClosing ? maxR : isOpen ? maxR : 0,
                            opacity: isOpen ? 0 : [0, 1, 0.6],
                        }}
                        transition={{
                            duration: isClosing ? 0.55 : 0.5,
                            delay: i * 0.04,
                            ease: isClosing ? [0.36, 0, 0.66, -0.05] : [0.34, 1.56, 0.64, 1],
                        }}
                        style={{
                            filter: `drop-shadow(0 0 ${14 - i * 3}px rgba(var(--theme-glow-rgb),0.9))`,
                        }}
                    />
                ))}

                {/* Spinning arc segments — the "iris petals" */}
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * 360;
                    const arcR = maxR * 0.8;
                    const rad = (angle * Math.PI) / 180;
                    const x1 = origin.x + arcR * Math.cos(rad);
                    const y1 = origin.y + arcR * Math.sin(rad);
                    const rad2 = ((angle + 40) * Math.PI) / 180;
                    const x2 = origin.x + arcR * Math.cos(rad2);
                    const y2 = origin.y + arcR * Math.sin(rad2);
                    return (
                        <motion.line
                            key={i}
                            x1={origin.x} y1={origin.y}
                            x2={isClosing ? x1 : origin.x}
                            y2={isClosing ? y1 : origin.y}
                            stroke={`rgba(var(--theme-glow-rgb), 0.3)`}
                            strokeWidth={1}
                            initial={{ opacity: 0 }}
                            animate={{
                                x2: isClosing ? x1 : isOpen ? x1 : origin.x,
                                y2: isClosing ? y1 : isOpen ? y1 : origin.y,
                                opacity: isOpen ? 0.25 : isClosing ? [0, 0.3] : 0,
                            }}
                            transition={{ duration: 0.55, delay: i * 0.02 }}
                        />
                    );
                })}

                {/* Center vault emblem — visible when fully closed */}
                {isOpen && (
                    <motion.g
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ transformOrigin: `${origin.x}px ${origin.y}px` }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Outer ring */}
                        <circle cx={origin.x} cy={origin.y} r={52}
                            fill="none" stroke={`rgba(var(--theme-glow-rgb),0.5)`} strokeWidth={2}
                            style={{ filter: "drop-shadow(0 0 12px rgba(var(--theme-glow-rgb),0.8))" }}
                        />
                        {/* Inner hex */}
                        <polygon
                            points={Array.from({ length: 6 }, (_, k) => {
                                const a = (k * 60 - 30) * Math.PI / 180;
                                return `${origin.x + 32 * Math.cos(a)},${origin.y + 32 * Math.sin(a)}`;
                            }).join(" ")}
                            fill="none"
                            stroke={`rgba(var(--theme-glow-rgb),0.8)`}
                            strokeWidth={1.5}
                            style={{ filter: "drop-shadow(0 0 8px rgba(var(--theme-glow-rgb),1))" }}
                        />
                        {/* Lock symbol */}
                        <rect x={origin.x - 9} y={origin.y - 4} width={18} height={14} rx={3}
                            fill="none" stroke={`rgba(var(--theme-glow-rgb),1)`} strokeWidth={1.5}
                            style={{ filter: "drop-shadow(0 0 6px rgba(var(--theme-glow-rgb),1))" }}
                        />
                        <path
                            d={`M${origin.x - 5},${origin.y - 4} a5,5 0 0,1 10,0`}
                            fill="none" stroke={`rgba(var(--theme-glow-rgb),1)`} strokeWidth={1.5}
                        />
                    </motion.g>
                )}
            </svg>

            {/* Full black bg when peak-closed */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary-950"
                    style={{ zIndex: -1 }}
                />
            )}
        </motion.div>
    );
}

/* ─── Shatter Overlay ────────────────────────────────────────── */
function ShatterOverlay({ phase }: { phase: "closing" | "open" | "opening" }) {
    const COLS = 8, ROWS = 6;
    const tiles = Array.from({ length: COLS * ROWS }, (_, i) => i);
    const isClosing = phase === "closing";
    const isOpen = phase === "open";

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.4 } }}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 9999 }}
        >
            <div className="grid absolute inset-0" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                {tiles.map((i) => {
                    const col = i % COLS;
                    const row = Math.floor(i / COLS);
                    const cx = col / COLS - 0.5, cy = row / ROWS - 0.5;
                    const dist = Math.sqrt(cx * cx + cy * cy);
                    const angle = Math.atan2(cy, cx);
                    const scatter = 180 + dist * 300;

                    return (
                        <motion.div
                            key={i}
                            initial={isClosing
                                ? { opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 }
                                : { opacity: 1, x: Math.cos(angle) * scatter, y: Math.sin(angle) * scatter, rotate: (i % 7 - 3) * 25, scale: 0.3 }
                            }
                            animate={isOpen
                                ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                                : { opacity: isClosing ? 1 : 0, x: isClosing ? Math.cos(angle) * scatter : 0, y: isClosing ? Math.sin(angle) * scatter : 0, rotate: isClosing ? (i % 7 - 3) * 25 : 0, scale: isClosing ? 0.3 : 1 }
                            }
                            transition={{
                                duration: isClosing ? 0.4 : 0.45,
                                delay: isClosing ? dist * 0.15 : (1 - dist) * 0.12,
                                ease: isClosing ? [0.36, 0, 0.66, -0.05] : [0.34, 1.56, 0.64, 1],
                            }}
                            style={{
                                background: `rgba(6, 6, 10, 0.97)`,
                                border: `1px solid rgba(var(--theme-glow-rgb), 0.15)`,
                                boxShadow: isOpen ? `inset 0 0 8px rgba(var(--theme-glow-rgb), 0.08)` : `0 0 20px rgba(var(--theme-glow-rgb), 0.3)`,
                            }}
                        />
                    );
                })}
            </div>
        </motion.div>
    );
}

/* ─── Portal Overlay ─────────────────────────────────────────── */
function PortalOverlay({ phase, origin }: { phase: "closing" | "open" | "opening"; origin: Origin }) {
    const isClosing = phase === "closing";
    const isOpen = phase === "open";
    const RINGS = 6;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 9999 }}
        >
            {/* Dark fill */}
            <motion.div
                className="absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 50%, rgba(6,6,10,0.98) 0%, rgba(2,2,5,1) 100%)" }}
                initial={{ opacity: isClosing ? 0 : 1 }}
                animate={{ opacity: isOpen ? 1 : isClosing ? 1 : 0 }}
                transition={{ duration: isClosing ? 0.4 : 0.5 }}
            />
            {/* Swirling rings */}
            {Array.from({ length: RINGS }, (_, i) => {
                const scale = isClosing ? (i + 1) / RINGS : (RINGS - i) / RINGS;
                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border"
                        style={{
                            width: `${(i + 1) * 120}px`,
                            height: `${(i + 1) * 120}px`,
                            left: origin.x,
                            top: origin.y,
                            marginLeft: `-${(i + 1) * 60}px`,
                            marginTop: `-${(i + 1) * 60}px`,
                            borderColor: `rgba(var(--theme-glow-rgb), ${0.6 - i * 0.08})`,
                            boxShadow: `0 0 ${20 - i * 2}px rgba(var(--theme-glow-rgb), ${0.5 - i * 0.06})`,
                        }}
                        initial={{ scale: 0, rotate: 0, opacity: 0 }}
                        animate={{
                            scale: isClosing ? [0, 1.2, 1] : isOpen ? 1 : [1, 0],
                            rotate: isClosing ? [0, 180 + i * 30] : isOpen ? 180 + i * 30 : [180 + i * 30, 360 + i * 30],
                            opacity: isOpen ? 1 : isClosing ? [0, 1] : [1, 0],
                        }}
                        transition={{
                            duration: isClosing ? 0.5 : 0.4,
                            delay: i * 0.06,
                            ease: "easeInOut",
                        }}
                    />
                );
            })}
            {/* Center vortex glow */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: "200px", height: "200px",
                    left: origin.x - 100, top: origin.y - 100,
                    background: `radial-gradient(circle, rgba(var(--theme-glow-rgb), 0.4) 0%, transparent 70%)`,
                    filter: "blur(20px)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isOpen ? 1 : isClosing ? [0, 1] : 0, scale: isOpen ? 1 : isClosing ? [0, 1.5] : 0 }}
                transition={{ duration: 0.4 }}
            />
        </motion.div>
    );
}

/* ─── Provider ───────────────────────────────────────────────── */
export function VaultTransitionProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { transitionStyle, pageTransition } = useAppearance();
    const [phase, setPhase] = useState<"idle" | "closing" | "open" | "opening">("idle");
    const [origin, setOrigin] = useState<Origin>({ x: 720, y: 400 });
    const pendingHref = useRef<string>("");

    const navigate = useCallback((href: string, org?: Origin) => {
        if (phase !== "idle") return;
        const ox = org?.x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 720);
        const oy = org?.y ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 400);
        setOrigin({ x: ox, y: oy });
        pendingHref.current = href;
        if (!pageTransition) {
            // No animation — just navigate
            router.push(href);
            return;
        }
        setPhase("closing");
    }, [phase, pageTransition, router]);

    useEffect(() => {
        if (phase === "closing") {
            const t = setTimeout(() => {
                setPhase("open");
                router.push(pendingHref.current);
            }, 600);
            return () => clearTimeout(t);
        }
        if (phase === "open") {
            const t = setTimeout(() => setPhase("opening"), 220);
            return () => clearTimeout(t);
        }
        if (phase === "opening") {
            const t = setTimeout(() => setPhase("idle"), 600);
            return () => clearTimeout(t);
        }
    }, [phase, router]);

    return (
        <Ctx.Provider value={{ navigate }}>
            {children}
            <AnimatePresence>
                {phase !== "idle" && transitionStyle === "iris" && (
                    <IrisOverlay key="iris" phase={phase as any} origin={origin} />
                )}
                {phase !== "idle" && transitionStyle === "shatter" && (
                    <ShatterOverlay key="shatter" phase={phase as any} />
                )}
                {phase !== "idle" && transitionStyle === "portal" && (
                    <PortalOverlay key="portal" phase={phase as any} origin={origin} />
                )}
            </AnimatePresence>
        </Ctx.Provider>
    );
}

/* ─── TransitionLink ─────────────────────────────────────────── */
export function TransitionLink({
    href, children, className, ...rest
}: {
    href: string;
    children: ReactNode;
    className?: string;
    [k: string]: any;
}) {
    const { navigate } = useVaultTransition();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        navigate(href, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
    };

    return (
        <a href={href} onClick={handleClick} className={className} {...rest}>
            {children}
        </a>
    );
}

/* ─── TransitionButton ───────────────────────────────────────── */
export function TransitionButton({
    href, children, className, ...rest
}: {
    href: string;
    children: ReactNode;
    className?: string;
    [k: string]: any;
}) {
    const { navigate } = useVaultTransition();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        navigate(href, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
    };

    return (
        <button onClick={handleClick} className={className} {...rest}>
            {children}
        </button>
    );
}
