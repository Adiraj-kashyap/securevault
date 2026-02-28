import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
// We check if it's already initialized to prevent Next.js from initializing it multiple times during HMR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Auth and Providers often crash in Next.js SSR when using the browser bundle, 
// because they look for window or location. We initialize them only if window is defined.
const auth = typeof window !== "undefined" ? getAuth(app) : null as any;
const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null as any;

export { app, database, auth, googleProvider };
