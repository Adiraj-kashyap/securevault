const admin = require('firebase-admin');
require('dotenv').config();

// Securely initialize Firebase Admin SDK using Environment Variables
// This ensures no hardcoded credentials exist in the codebase.
try {
    // Option 1: Provide the raw JSON private key string in .env
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        // Handle potential escaped newlines in the private key string from .env
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('✅ Firebase Admin initialized via App Credentials');
    } else {
        console.warn('⚠️ Firebase Admin credentials missing from .env');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
}

const db = admin.database ? admin.database() : null;

module.exports = { admin, db };
