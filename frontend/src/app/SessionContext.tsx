"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Session is always null on first render (matches SSR).
// After mount, we restore from sessionStorage so refreshing the page rehydrates cleanly.
// We deliberately DO NOT store the derived AES Key or Private RSA Key in localStorage.

interface VaultSession {
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
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    // Always start null — matches SSR, no hydration mismatch
    const [session, setSessionState] = useState<VaultSession | null>(null);

    // After mount: restore session from sessionStorage (safe — only runs on client)
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("sv_session");
            if (stored) setSessionState(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    const setSession = (s: VaultSession | null) => {
        setSessionState(s);
        if (s) {
            try { sessionStorage.setItem("sv_session", JSON.stringify(s)); } catch { }
        } else {
            sessionStorage.removeItem("sv_session");
        }
    };

    const logout = () => {
        setSession(null);
    };

    return (
        <SessionContext.Provider value={{ session, setSession, logout }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}

