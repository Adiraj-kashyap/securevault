// Base API utility to route backend requests safely

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export const api = {
    // Authentication Endpoints
    auth: {
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
        }
    }
};
