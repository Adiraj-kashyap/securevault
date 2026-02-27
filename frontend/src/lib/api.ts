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
            
            // 3. (Optional) Sync to MongoDB as a backup
            try {
                await fetch(`${API_BASE_URL}/auth/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ email: payload.email, passwordHash: payload.passwordHash })
                });
            } catch (e) {
                console.warn("MongoDB sync failed on login, but proceeding with Firebase auth", e);
            }

            return {
                userId: user.uid,
                token,
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
            
            // 3. Sync full profile to MongoDB Backend
            await api.auth.syncMongoBackup(token, { ...payload });
            
            return { userId: user.uid, token };
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
            
            let metadata;
            
            if (!snapshot.exists()) {
                // First time Google Login -> register keys
                metadata = {
                    publicKey: payload.publicKey,
                    encryptedPrivateKey: payload.encryptedPrivateKey,
                    salt: payload.salt
                };
                await set(ref(database, `users/${user.uid}/crypto`), metadata);
                await api.auth.syncMongoBackup(token, { ...payload });
            } else {
                // Existing Google Login -> fetch keys
                metadata = snapshot.val();
                try {
                    await fetch(`${API_BASE_URL}/auth/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ email: user.email, passwordHash: payload.passwordHash })
                    });
                } catch (e) {
                    console.warn("MongoDB sync failed on Google login", e);
                }
            }

            return {
                userId: user.uid,
                token,
                salt: metadata.salt,
                encryptedPrivateKey: metadata.encryptedPrivateKey,
                publicKey: metadata.publicKey
            };
        },

        syncMongoBackup: async (token: string, payload: { passwordHash: string; publicKey: string; encryptedPrivateKey: string; salt: string }) => {
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
        }
    }
};
