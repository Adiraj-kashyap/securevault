"use client";

import React, {
    createContext, useContext, useState, useEffect, ReactNode, useCallback
} from "react";

/* ── Types ─────────────────────────────────────────────────── */
export type BgPattern = "none" | "dots" | "grid" | "hex" | "circuit" | "stars" | "plasma" | "topography";
export type MotionLevel = "full" | "reduced" | "none";
export type FontStyle = "syne" | "inter" | "mono";
export type Density = "compact" | "default" | "spacious";
export type BorderRadius = "sharp" | "normal" | "round";
export type TransitionStyle = "iris" | "shatter" | "portal";
export type SuccessStyle = "handshake" | "decrypt" | "assemble";

interface AppearanceState {
    bgPattern: BgPattern;
    glowIntensity: number;          // 0-100
    motionLevel: MotionLevel;
    fontStyle: FontStyle;
    density: Density;
    borderRadius: BorderRadius;
    particles: boolean;
    pageTransition: boolean;
    transitionStyle: TransitionStyle;
    successStyle: SuccessStyle;
}

interface AppearanceContextType extends AppearanceState {
    setBgPattern: (v: BgPattern) => void;
    setGlowIntensity: (v: number) => void;
    setMotionLevel: (v: MotionLevel) => void;
    setFontStyle: (v: FontStyle) => void;
    setDensity: (v: Density) => void;
    setBorderRadius: (v: BorderRadius) => void;
    setParticles: (v: boolean) => void;
    setPageTransition: (v: boolean) => void;
    setTransitionStyle: (v: TransitionStyle) => void;
    setSuccessStyle: (v: SuccessStyle) => void;
}

/* ── Defaults ───────────────────────────────────────────────── */
const DEFAULTS: AppearanceState = {
    bgPattern: "hex",
    glowIntensity: 70,
    motionLevel: "full",
    fontStyle: "syne",
    density: "default",
    borderRadius: "normal",
    particles: true,
    pageTransition: true,
    transitionStyle: "iris",
    successStyle: "handshake",
};

/* ── CSS application helpers ────────────────────────────────── */
function applyAll(s: AppearanceState) {
    const el = document.documentElement;

    // Background pattern
    el.setAttribute("data-bg-pattern", s.bgPattern);

    // Glow intensity → CSS var used by glow-related classes
    el.style.setProperty("--glow-intensity", String(s.glowIntensity / 100));

    // Density
    el.setAttribute("data-density", s.density);

    // Border radius
    el.setAttribute("data-radius", s.borderRadius);

    // Font
    el.setAttribute("data-font", s.fontStyle);

    // Motion
    el.setAttribute("data-motion", s.motionLevel);
}

/* ── Context ─────────────────────────────────────────────────── */
const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppearanceState>(DEFAULTS);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem("sv_appearance");
            if (saved) {
                const parsed = JSON.parse(saved);
                setState({ ...DEFAULTS, ...parsed });
                applyAll({ ...DEFAULTS, ...parsed });
            } else {
                applyAll(DEFAULTS);
            }
        } catch {
            applyAll(DEFAULTS);
        }
    }, []);

    // Persist + apply on every change
    useEffect(() => {
        if (!mounted) return;
        applyAll(state);
        try { localStorage.setItem("sv_appearance", JSON.stringify(state)); } catch { }
    }, [state, mounted]);

    const update = useCallback(<K extends keyof AppearanceState>(key: K, val: AppearanceState[K]) => {
        setState(prev => ({ ...prev, [key]: val }));
    }, []);

    return (
        <AppearanceContext.Provider value={{
            ...state,
            setBgPattern: v => update("bgPattern", v),
            setGlowIntensity: v => update("glowIntensity", v),
            setMotionLevel: v => update("motionLevel", v),
            setFontStyle: v => update("fontStyle", v),
            setDensity: v => update("density", v),
            setBorderRadius: v => update("borderRadius", v),
            setParticles: v => update("particles", v),
            setPageTransition: v => update("pageTransition", v),
            setTransitionStyle: v => update("transitionStyle", v),
            setSuccessStyle: v => update("successStyle", v),
        }}>
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const ctx = useContext(AppearanceContext);
    if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider");
    return ctx;
}
