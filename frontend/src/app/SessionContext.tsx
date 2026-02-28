"use client";

/**
 * SessionContext — vault session management with inactivity auto-lock.
 *
 * Timer flow:
 *   1. User has 15 minutes of inactivity before the vault locks.
 *   2. Any user interaction (click, keydown, scroll, mousemove) resets the timer.
 *   3. When the timer fires:
 *      a. Sync current appearance preferences to MongoDB (fire-and-forget).
 *      b. POST an audit log entry to record the session end.
 *      c. Clear sessionStorage and localStorage (sv_session, sv_appearance, sv_premium).
 *      d. Set session to null → SessionLockModal renders over the whole app.
 *   4. On login: fetch preferences from MongoDB and apply them during the animation.
 *
 * Note: We never store RSA private keys or the derived AES key in localStorage.
 */

import React, {
    createContext, useContext, useState, useEffect, useRef,
    useCallback, ReactNode
} from 'react';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export interface VaultSession {
    userId: string;
    email: string;
    tagline: string;
    token: string;
    derivedAesKey: string;
    decryptedPrivateKey: string;
    publicKey: string;
}

interface SessionContextType {
    session: VaultSession | null;
    setSession: (session: VaultSession | null) => void;
    logout: () => void;
    isLocked: boolean;
    lastActiveAt: number | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

async function preLockSync(session: VaultSession) {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
    // 1. Sync appearance preferences to MongoDB
    try {
        const stored = localStorage.getItem("sv_appearance");
        if (stored) {
            await fetch(`${base}/auth/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ appearance: JSON.parse(stored) })
            });
        }
    } catch { /* silent */ }

    // 2. Write audit log entry (best effort)
    try {
        await fetch(`${base}/audit/session-end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
            body: JSON.stringify({
                event: 'SESSION_LOCKED',
                reason: 'inactivity_timeout_15min',
                ts: new Date().toISOString(),
            })
        });
    } catch { /* audit endpoint may not exist yet */ }
}

function clearStorage() {
    try {
        sessionStorage.removeItem("sv_session");
        localStorage.removeItem("sv_appearance");
        localStorage.removeItem("sv_premium");
        localStorage.removeItem("vault-theme");
    } catch { /* ignore */ }
}

export function SessionProvider({ children }: { children: ReactNode }) {
    // Always start null — matches SSR, zero hydration mismatch
    const [session, setSessionState] = useState<VaultSession | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [lastActiveAt, setLastActiveAt] = useState<number | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionRef = useRef<VaultSession | null>(null);

    // Sync session ref so the timer callback always has the latest session
    useEffect(() => { sessionRef.current = session; }, [session]);

    // After mount: restore session from sessionStorage
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("sv_session");
            if (stored) setSessionState(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    const lock = useCallback(async () => {
        setLastActiveAt(Date.now());
        const s = sessionRef.current;
        if (s) await preLockSync(s);
        clearStorage();
        setSessionState(null);
        setIsLocked(true);
    }, []);

    const resetTimer = useCallback(() => {
        setLastActiveAt(Date.now());
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => { lock(); }, INACTIVITY_TIMEOUT_MS);
    }, [lock]);

    // Start / restart timer whenever session changes
    useEffect(() => {
        if (!session) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }
        // Start fresh timer
        resetTimer();

        // Activity listeners
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;
        events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [session, resetTimer]);

    const setSession = useCallback((s: VaultSession | null) => {
        setSessionState(s);
        setIsLocked(false);
        if (s) {
            try { sessionStorage.setItem("sv_session", JSON.stringify(s)); } catch { }
        } else {
            sessionStorage.removeItem("sv_session");
        }
    }, []);

    const logout = useCallback(() => {
        clearStorage();
        setSessionState(null);
        setIsLocked(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return (
        <SessionContext.Provider value={{ session, setSession, logout, isLocked, lastActiveAt }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within a SessionProvider');
    return ctx;
}
