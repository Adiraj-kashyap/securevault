import { auth, database } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export const api = {
    // Authentication Endpoints
    auth: {
        login: async (payload: { email: string; passwordHash: string }) => {
            // 1. Authenticate with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.passwordHash);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // 2. Fetch User Crypto Metadata from Firebase RTDB
            const dbRef = ref(database, `users/${user.uid}/crypto`);
            const snapshot = await get(dbRef);

            if (!snapshot.exists()) {
                throw new Error("User metadata not found in Realtime Database.");
            }

            const metadata = snapshot.val();

            // 3. (Optional) Sync to MongoDB as a backup and get Tagline
            let tagline = metadata.tagline || "PendingTagline";
            try {
                const res = await fetch(`${API_BASE_URL}/auth/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ email: payload.email, passwordHash: payload.passwordHash })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.tagline) {
                        tagline = data.tagline;
                        // Cache the tagline in RTDB if it was missing or updated
                        if (metadata.tagline !== tagline) {
                            set(ref(database, `users/${user.uid}/crypto/tagline`), tagline).catch(console.error);
                        }
                    }
                }
            } catch (e) {
                console.warn("MongoDB sync failed on login, but proceeding with Firebase auth", e);
            }

            return {
                userId: user.uid,
                token,
                tagline,
                salt: metadata.salt,
                encryptedPrivateKey: metadata.encryptedPrivateKey,
                publicKey: metadata.publicKey
            };
        },

        register: async (payload: { email: string; passwordHash: string; publicKey: string; encryptedPrivateKey: string; salt: string }) => {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.passwordHash);
            const user = userCredential.user;
            const token = await user.getIdToken();

            const metadata = {
                publicKey: payload.publicKey,
                encryptedPrivateKey: payload.encryptedPrivateKey,
                salt: payload.salt
            };

            // 2. Store Crypto Metadata in Firebase RTDB
            await set(ref(database, `users/${user.uid}/crypto`), metadata);

            // 3. Sync full profile to MongoDB Backend and get Tagline
            const syncData = await api.auth.syncMongoBackup(token, { ...payload, email: payload.email });

            // 4. Cache tagline in RTDB to prevent "PendingTagline" if MongoDB fails in the future
            if (syncData.tagline) {
                await set(ref(database, `users/${user.uid}/crypto/tagline`), syncData.tagline);
            }

            return { userId: user.uid, token, tagline: syncData.tagline };
        },

        googleLogin: async (payload: { passwordHash: string; publicKey: string; encryptedPrivateKey: string; salt: string }) => {
            // Lazy load required Firebase deps
            const { signInWithPopup } = await import('firebase/auth');
            const { googleProvider } = await import('./firebase');

            const userCredential = await signInWithPopup(auth, googleProvider);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // Check if crypto metadata exists already
            const dbRef = ref(database, `users/${user.uid}/crypto`);
            const snapshot = await get(dbRef);

            let metadata: any;

            if (!snapshot.exists()) {
                // First time Google Login -> register keys
                metadata = {
                    publicKey: payload.publicKey,
                    encryptedPrivateKey: payload.encryptedPrivateKey,
                    salt: payload.salt
                };
                await set(ref(database, `users/${user.uid}/crypto`), metadata);
                const syncData = await api.auth.syncMongoBackup(token, { ...payload, email: user.email || undefined });
                metadata.tagline = syncData.tagline;

                if (syncData.tagline) {
                    await set(ref(database, `users/${user.uid}/crypto/tagline`), syncData.tagline);
                }
            } else {
                // Existing Google Login -> fetch keys
                metadata = snapshot.val();
                let tagline = metadata.tagline || "PendingTagline";
                try {
                    const res = await fetch(`${API_BASE_URL}/auth/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ email: user.email, passwordHash: payload.passwordHash })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.tagline) {
                            tagline = data.tagline;
                            if (metadata.tagline !== tagline) {
                                set(ref(database, `users/${user.uid}/crypto/tagline`), tagline).catch(console.error);
                            }
                        }
                    }
                } catch (e) {
                    console.warn("MongoDB sync failed on Google login", e);
                }
                metadata.tagline = tagline;
            }

            return {
                userId: user.uid,
                token,
                tagline: metadata.tagline,
                salt: metadata.salt,
                encryptedPrivateKey: metadata.encryptedPrivateKey,
                publicKey: metadata.publicKey
            };
        },

        syncMongoBackup: async (token: string, payload: { passwordHash: string; publicKey: string; encryptedPrivateKey: string; salt: string; email?: string }) => {
            const res = await fetch(`${API_BASE_URL}/auth/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        getPreferences: async (token: string): Promise<{ appearance: Record<string, any>; premiumUsedTodayMs: number; premiumDayDate: string } | null> => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/preferences`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) return null;
                return res.json();
            } catch { return null; }
        },

        savePreferences: async (token: string, payload: { appearance?: Record<string, any>; premiumUsedTodayMs?: number }): Promise<void> => {
            try {
                await fetch(`${API_BASE_URL}/auth/preferences`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } catch { /* fire-and-forget, silently ignore on offline */ }
        }
    },

    // Storage Endpoints
    storage: {
        // Analytics
        getStats: async (token: string) => {
            const res = await fetch(`${API_BASE_URL}/storage/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        // View Folders and Files
        getDirectory: async (token: string, folderId: string | null = null) => {
            const url = folderId
                ? `${API_BASE_URL}/storage/directory/${folderId}`
                : `${API_BASE_URL}/storage/directory`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        // Create a new logical folder
        createFolder: async (token: string, payload: { name: string; parentFolderId?: string; colorTheme?: string }) => {
            const res = await fetch(`${API_BASE_URL}/storage/folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        // Upload a file
        uploadFile: async (token: string, formData: FormData) => {
            const res = await fetch(`${API_BASE_URL}/storage/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        shareFile: async (token: string, fileId: string, payload: { recipientTagline: string; wrappedKey: string }) => {
            const res = await fetch(`${API_BASE_URL}/storage/file/${fileId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        getSharedFiles: async (token: string) => {
            const res = await fetch(`${API_BASE_URL}/storage/shared-with-me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        }
    },

    // Internal Secure Mail Endpoints
    mail: {
        send: async (token: string, payload: { receiverTagline: string; encryptedSubject: string; encryptedBody: string; attachments?: any[] }) => {
            const res = await fetch(`${API_BASE_URL}/mail/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        getInbox: async (token: string) => {
            const res = await fetch(`${API_BASE_URL}/mail/inbox`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        getSent: async (token: string) => {
            const res = await fetch(`${API_BASE_URL}/mail/sent`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        markRead: async (token: string, mailId: string) => {
            const res = await fetch(`${API_BASE_URL}/mail/${mailId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        }
    }
};

