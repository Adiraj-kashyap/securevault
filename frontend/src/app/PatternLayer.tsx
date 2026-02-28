"use client";

import { useAppearance } from "./AppearanceContext";
import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────
   PatternLayer — renders the active background pattern as a fixed
   full-screen element. Much more reliable than body::before CSS,
   because body background-color doesn't cover a React-rendered div.
───────────────────────────────────────────────────────────────── */

export function PatternLayer() {
    const { bgPattern } = useAppearance();
    const starsCanvasRef = useRef<HTMLCanvasElement>(null);
    const starsRafRef = useRef<number>(0);

    // Stars pattern: animated canvas of drifting multi-size dots
    useEffect(() => {
        const canvas = starsCanvasRef.current;
        if (!canvas || bgPattern !== "stars") {
            cancelAnimationFrame(starsRafRef.current);
            return;
        }

        const ctx = canvas.getContext("2d")!;
        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        const onResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", onResize, { passive: true });

        // Generate stars of varying sizes
        const STARS = Array.from({ length: 160 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.4 + 0.3,
            speed: Math.random() * 0.3 + 0.05,
            opacity: Math.random() * 0.6 + 0.2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            const rgb = getComputedStyle(document.documentElement)
                .getPropertyValue("--theme-glow-rgb").trim() || "212,175,55";

            for (const s of STARS) {
                s.y -= s.speed;
                if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb}, ${s.opacity})`;
                ctx.fill();
            }
            starsRafRef.current = requestAnimationFrame(draw);
        };

        starsRafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(starsRafRef.current);
            window.removeEventListener("resize", onResize);
        };
    }, [bgPattern]);

    if (bgPattern === "none") return null;

    if (bgPattern === "stars") {
        return (
            <canvas
                ref={starsCanvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1, opacity: 0.7 }}
                aria-hidden="true"
            />
        );
    }

    // CSS-driven patterns — use inline style for the pattern
    const getStyle = (): React.CSSProperties => {
        // We read the CSS var at render time using a data attribute approach
        const common: React.CSSProperties = {
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
        };

        switch (bgPattern) {
            case "dots":
                return {
                    ...common,
                    backgroundImage: "radial-gradient(rgba(var(--theme-glow-rgb),0.15) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                };
            case "grid":
                return {
                    ...common,
                    backgroundImage:
                        "linear-gradient(rgba(var(--theme-glow-rgb),0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-glow-rgb),0.07) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                };
            case "hex":
                return {
                    ...common,
                    backgroundImage:
                        "radial-gradient(circle at 25% 25%, rgba(var(--theme-glow-rgb),0.06) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(var(--theme-glow-rgb),0.04) 0%, transparent 50%), linear-gradient(rgba(var(--theme-glow-rgb),0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-glow-rgb),0.04) 1px, transparent 1px)",
                    backgroundSize: "100% 100%, 100% 100%, 60px 52px, 60px 52px",
                };
            case "circuit":
                return {
                    ...common,
                    backgroundImage:
                        "linear-gradient(rgba(var(--theme-glow-rgb),0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-glow-rgb),0.08) 1px, transparent 1px), radial-gradient(circle, rgba(var(--theme-glow-rgb),0.18) 1.5px, transparent 1.5px)",
                    backgroundSize: "80px 80px, 80px 80px, 80px 80px",
                    backgroundPosition: "0 0, 0 0, 40px 40px",
                };
            case "plasma":
                return {
                    ...common,
                    background:
                        "radial-gradient(ellipse 65% 45% at 20% 30%, rgba(var(--theme-glow-rgb),0.14) 0%, transparent 70%), radial-gradient(ellipse 55% 65% at 80% 70%, rgba(var(--theme-glow-rgb),0.10) 0%, transparent 60%), radial-gradient(ellipse 80% 55% at 50% 10%, rgba(var(--theme-glow-rgb),0.08) 0%, transparent 50%)",
                };
            case "topography":
                return {
                    ...common,
                    backgroundImage:
                        "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(var(--theme-glow-rgb),0.05) 0%, transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgba(var(--theme-glow-rgb),0.04) 0%, transparent 60%), linear-gradient(rgba(var(--theme-glow-rgb),0.03) 1px, transparent 1px), linear-gradient(60deg, rgba(var(--theme-glow-rgb),0.02) 1px, transparent 1px), linear-gradient(-60deg, rgba(var(--theme-glow-rgb),0.02) 1px, transparent 1px)",
                    backgroundSize: "100% 100%, 100% 100%, 80px 80px, 80px 80px, 80px 80px",
                };
            default:
                return common;
        }
    };

    return (
        <div
            aria-hidden="true"
            style={getStyle()}
        />
    );
}
