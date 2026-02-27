"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// This context stores highly sensitive keys strictly in React state (Memory).
// We deliberately DO NOT store the derived AES Key or Private RSA Key in localStorage
// for extreme security. If the user refreshes the page, they must enter their master password again.

interface VaultSession {
    userId: string;
    email: string;
    token: string;
    derivedAesKey: string;      // Used to encrypt/decrypt local data before transit
    decryptedPrivateKey: string; // The raw RSA Private Key, ready for use
    publicKey: string;          // The raw RSA Public Key
}

interface SessionContextType {
    session: VaultSession | null;
    setSession: (session: VaultSession | null) => void;
    logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<VaultSession | null>(null);

    const logout = () => {
        // Clear everything from memory
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
