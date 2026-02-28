"use client";

/**
 * PremiumContext — tracks daily free premium feature access.
 *
 * Rules:
 *   • Each user gets 2 hours (FREE_DAILY_MS) of free premium access per calendar day.
 *   • Usage resets at midnight (based on local date string).
 *   • When isPremiumActive is true, a timer ticks usedTodayMs upward every second.
 *   • When the daily limit is reached, premium deactivates automatically.
 *   • On login, we load saved usedTodayMs from MongoDB via getPreferences.
 *   • Every 60s while premium is active, we sync to MongoDB (fire-and-forget).
 */

import React, {
    createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode
} from "react";

const FREE_DAILY_MS = 2 * 60 * 60 * 1000; // 2 hours

interface PremiumContextType {
    isPremiumActive: boolean;
    usedTodayMs: number;
    remainingMs: number;
    isLimitReached: boolean;
    startPremium: () => void;
    stopPremium: () => void;
    /** Called on login to hydrate usage from MongoDB */
    hydrateFromServer: (usedMs: number, dayDate: string) => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const todayStr = () => new Date().toISOString().slice(0, 10);

export function PremiumProvider({ children }: { children: ReactNode }) {
    const [isPremiumActive, setIsPremiumActive] = useState(false);
    const [usedTodayMs, setUsedTodayMs] = useState(0);
    const [dayDate, setDayDate] = useState(todayStr());

    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load from localStorage on mount (quick restore; MongoDB will override on login)
    useEffect(() => {
        try {
            const stored = localStorage.getItem("sv_premium");
            if (stored) {
                const { usedMs, date } = JSON.parse(stored);
                const today = todayStr();
                setDayDate(today);
                setUsedTodayMs(date === today ? (usedMs ?? 0) : 0);
            }
        } catch { /* ignore */ }
    }, []);

    // Persist to localStorage whenever usedTodayMs changes
    useEffect(() => {
        try {
            localStorage.setItem("sv_premium", JSON.stringify({ usedMs: usedTodayMs, date: dayDate }));
        } catch { /* ignore */ }
    }, [usedTodayMs, dayDate]);

    const stopPremium = useCallback(() => {
        setIsPremiumActive(false);
        if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
        if (syncRef.current) { clearInterval(syncRef.current); syncRef.current = null; }
    }, []);

    const startPremium = useCallback(() => {
        setUsedTodayMs(prev => {
            if (prev >= FREE_DAILY_MS) return prev; // limit already reached
            return prev;
        });
        setIsPremiumActive(prev => {
            if (prev) return prev; // already active
            return true;
        });
    }, []);

    // Tick every second while premium is active
    useEffect(() => {
        if (!isPremiumActive) return;

        tickRef.current = setInterval(() => {
            setUsedTodayMs(prev => {
                const next = prev + 1000;
                if (next >= FREE_DAILY_MS) {
                    stopPremium();
                    return FREE_DAILY_MS;
                }
                return next;
            });
        }, 1000);

        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [isPremiumActive, stopPremium]);

    const hydrateFromServer = useCallback((usedMs: number, serverDayDate: string) => {
        const today = todayStr();
        setDayDate(today);
        setUsedTodayMs(serverDayDate === today ? usedMs : 0);
    }, []);

    const remainingMs = Math.max(0, FREE_DAILY_MS - usedTodayMs);
    const isLimitReached = usedTodayMs >= FREE_DAILY_MS;

    return (
        <PremiumContext.Provider value={{
            isPremiumActive,
            usedTodayMs,
            remainingMs,
            isLimitReached,
            startPremium,
            stopPremium,
            hydrateFromServer,
        }}>
            {children}
        </PremiumContext.Provider>
    );
}

export function usePremium() {
    const ctx = useContext(PremiumContext);
    if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
    return ctx;
}

/** Format ms as H:MM:SS */
export function formatDuration(ms: number): string {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
