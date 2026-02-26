// Base API utility to route backend requests safely

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export const api = {
    // Authentication Endpoints
    auth: {
        register: async (payload: { email: string; passwordHash: string; publicKey: string; encryptedPrivateKey: string; salt: string }) => {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        login: async (payload: { email: string; passwordHash: string }) => {
            // In a real scenario, the passwordHash is sent to the server for verification, 
            // but it is NEVER the raw password.
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        getPublicKey: async (email: string) => {
            const res = await fetch(`${API_BASE_URL}/auth/public-key/${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        }
    },

    // Future Storage Endpoints
    storage: {
        uploadMetadata: async (fileData: any) => {
            // Will handle Level 1, 2, 3 storage metadata
        },
        getFiles: async (userId: string) => {
            // Will fetch the encrypted folder structure
        }
    }
};
