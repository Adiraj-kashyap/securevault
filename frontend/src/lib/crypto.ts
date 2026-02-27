import CryptoJS from 'crypto-js';
import forge from 'node-forge';

export const cryptoUtils = {
    // Derives an AES key from the master password to encrypt the Private Key
    deriveKeyFromPassword: (password: string, salt: string): string => {
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 100000
        });
        return key.toString(CryptoJS.enc.Hex);
    },

    // Generates a new RSA Keypair for the user
    generateRSAKeyPair: () => {
        return new Promise<{ publicKey: string, privateKey: string }>((resolve, reject) => {
            forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, (err, keypair) => {
                if (err) return reject(err);

                const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
                const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

                resolve({ publicKey, privateKey });
            });
        });
    },

    // Encrypts the Private RSA Key with the derived AES key before sending to DB
    encryptPrivateKey: (privateKeyPem: string, derivedAesKey: string): string => {
        const encrypted = CryptoJS.AES.encrypt(privateKeyPem, derivedAesKey).toString();
        return encrypted;
    },

    // Decrypts the Private RSA Key from the DB using the locally derived AES key
    decryptPrivateKey: (encryptedPrivateKey: string, derivedAesKey: string): string | null => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, derivedAesKey);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            return originalText || null;
        } catch (e) {
            return null;
        }
    },

    // Generates a random Salt
    generateSalt: (): string => {
        return CryptoJS.lib.WordArray.random(128 / 8).toString();
    },

    // Generates a one-time 256-bit AES key for file encryption
    generateAESKey: (): string => {
        return CryptoJS.lib.WordArray.random(256 / 8).toString();
    },

    // Encrypts the AES key using the user's RSA Public Key
    encryptAESKeyWithPublic: async (aesKey: string, publicKeyPem: string): Promise<string> => {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const encrypted = publicKey.encrypt(aesKey, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: { md: forge.md.sha256.create() }
        });
        return forge.util.encode64(encrypted);
    },

    // Client-Side File Encryption (Simple string approach for now)
    encryptFile: async (file: File, aesKey: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result as string;
                const encrypted = CryptoJS.AES.encrypt(data, aesKey).toString();
                const blob = new Blob([encrypted], { type: 'application/octet-stream' });
                resolve(blob);
            };
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file); // DataRL for simplicity vs ArrayBuffer
        });
    }
};
