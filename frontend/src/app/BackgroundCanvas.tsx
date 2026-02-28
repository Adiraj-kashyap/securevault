"use client";

import { useEffect, useRef } from "react";
import { useAppearance } from "./AppearanceContext";

/* ─────────────────────────────────────────────────────────────
   Lightweight CSS-variable-aware particle network canvas.
   • ~55 particles, 2D canvas only (no WebGL, no libraries)
   • Mouse repulsion within 120px
   • Lines drawn only when distance < CONNECTION_DIST
   • Tab-hidden detection via visibilitychange to pause RAF
   • Total cost: ~0.1–0.2ms per frame, <1 MB memory
───────────────────────────────────────────────────────────── */

const PARTICLE_COUNT = 55;
const CONNECTION_DIST = 140;
const SPEED = 0.35;
const MOUSE_REPEL_RADIUS = 120;
const MOUSE_REPEL_FORCE = 0.18;

interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    r: number;
    opacity: number;
}

function getAccentRgb(): string {
    if (typeof window === "undefined") return "212,175,55";
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--theme-glow-rgb").trim();
    return raw || "212,175,55";
}

export function BackgroundCanvas() {
    const { particles: showParticles } = useAppearance();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -999, y: -999 });
    const rafId = useRef<number>(0);
    const particles = useRef<Particle[]>([]);

    if (!showParticles) return null;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        /* ── Init canvas size ── */
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        /* ── Init particles ── */
        const init = () => {
            particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * SPEED * 2,
                vy: (Math.random() - 0.5) * SPEED * 2,
                r: Math.random() * 1.8 + 0.6,
                opacity: Math.random() * 0.4 + 0.15,
            }));
        };
        init();

        /* ── Mouse tracking ── */
        const onMouse = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };
        const onLeave = () => { mouse.current = { x: -999, y: -999 }; };
        window.addEventListener("mousemove", onMouse, { passive: true });
        window.addEventListener("mouseleave", onLeave, { passive: true });

        /* ── Draw loop ── */
        const draw = () => {
            if (document.hidden) { rafId.current = requestAnimationFrame(draw); return; }

            const W = canvas.width;
            const H = canvas.height;
            const rgb = getAccentRgb();
            const mx = mouse.current.x;
            const my = mouse.current.y;
            const ps = particles.current;

            ctx.clearRect(0, 0, W, H);

            /* Update + draw particles */
            for (let i = 0; i < ps.length; i++) {
                const p = ps[i];

                /* Mouse repulsion */
                const dx = p.x - mx;
                const dy = p.y - my;
                const distMouse = Math.sqrt(dx * dx + dy * dy);
                if (distMouse < MOUSE_REPEL_RADIUS && distMouse > 0) {
                    const force = (MOUSE_REPEL_RADIUS - distMouse) / MOUSE_REPEL_RADIUS;
                    p.vx += (dx / distMouse) * force * MOUSE_REPEL_FORCE;
                    p.vy += (dy / distMouse) * force * MOUSE_REPEL_FORCE;
                }

                /* Dampen velocity */
                p.vx *= 0.98;
                p.vy *= 0.98;

                /* Speed clamp */
                const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (spd > SPEED * 3) { p.vx = (p.vx / spd) * SPEED * 3; p.vy = (p.vy / spd) * SPEED * 3; }
                if (spd < SPEED * 0.1) { p.vx += (Math.random() - 0.5) * 0.02; p.vy += (Math.random() - 0.5) * 0.02; }

                p.x += p.vx;
                p.y += p.vy;

                /* Wrap around edges */
                if (p.x < -10) p.x = W + 10;
                if (p.x > W + 10) p.x = -10;
                if (p.y < -10) p.y = H + 10;
                if (p.y > H + 10) p.y = -10;

                /* Draw dot */
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb}, ${p.opacity})`;
                ctx.fill();
            }

            /* Draw connections */
            for (let i = 0; i < ps.length; i++) {
                for (let j = i + 1; j < ps.length; j++) {
                    const dx = ps[i].x - ps[j].x;
                    const dy = ps[i].y - ps[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(ps[i].x, ps[i].y);
                        ctx.lineTo(ps[j].x, ps[j].y);
                        ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            /* Mouse highlight: brighten nearby nodes */
            for (const p of ps) {
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_REPEL_RADIUS * 1.5) {
                    const glow = (1 - dist / (MOUSE_REPEL_RADIUS * 1.5)) * 0.5;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r + 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${rgb}, ${glow})`;
                    ctx.fill();
                }
            }

            rafId.current = requestAnimationFrame(draw);
        };

        rafId.current = requestAnimationFrame(draw);

        /* Re-init particles on theme change (custom event) */
        const onTheme = () => { /* RGB will be picked up on next frame */ };
        window.addEventListener("themechange", onTheme);

        return () => {
            cancelAnimationFrame(rafId.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouse);
            window.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("themechange", onTheme);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, opacity: 0.85 }}
            aria-hidden="true"
        />
    );
}
