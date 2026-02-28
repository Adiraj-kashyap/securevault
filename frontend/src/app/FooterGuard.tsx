"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// App-only routes that should NOT show the marketing footer
const APP_ROUTES = [
    "/dashboard",
    "/settings",
    "/profile",
    "/messages",
    "/audit-log",
    "/vault-sharing",
];

export function FooterGuard({ children }: { children: ReactNode }) {
    const pathname = usePathname() ?? "";
    const isAppRoute = APP_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"));
    if (isAppRoute) return null;
    return <>{children}</>;
}
