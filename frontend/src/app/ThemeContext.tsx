"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'gold' | 'emerald' | 'sapphire' | 'amethyst' | 'ruby' | 'neon-cyan' | 'sunset-orange' | 'rose-quartz' | 'toxic-lime';

interface ThemeContextType {
    theme: ThemeColor;
    setTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeColor>('gold');
    useEffect(() => {
        // Load saved theme on mount
        const saved = localStorage.getItem('vault-theme') as ThemeColor;
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        // Apply theme data attribute to body
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('vault-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
