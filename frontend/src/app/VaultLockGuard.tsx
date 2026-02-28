"use client";

/**
 * VaultLockGuard — renders the SessionLockModal when the 15-minute
 * inactivity timer fires in SessionContext (isLocked = true).
 * Lives at z-[999] above all other content.
 */

import { useSession } from "./SessionContext";
import { SessionLockModal } from "./SessionLockModal";

export function VaultLockGuard() {
    const { isLocked, lastActiveAt } = useSession();
    if (!isLocked) return null;
    return <SessionLockModal lastActiveAt={lastActiveAt} />;
}
