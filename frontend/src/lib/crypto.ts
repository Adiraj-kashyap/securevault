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
    }
};
