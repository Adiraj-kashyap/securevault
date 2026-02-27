"use client";

import { useState } from 'react';
import { Lock, Mail, KeyRound, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { auth, database } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { cryptoUtils } from '@/lib/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../SessionContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { setSession } = useSession();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // --- FIREBASE NATIVE LOGIN FLOW ---
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Fetch the user's public/private PGP keys from Firebase Realtime Database
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `users/${user.uid}/keys`));

                if (!snapshot.exists()) {
                    throw new Error("Vault keys not found. Has this account been initialized?");
                }

                const keys = snapshot.val();

                // Decrypt the Private RSA Key using the Master Password
                const derivedKey = await cryptoUtils.deriveKeyFromPassword(password, keys.salt);
                const privateKey = await cryptoUtils.decryptPrivateKey(keys.encryptedPrivateKey, derivedKey);

                if (!privateKey) throw new Error("Invalid Master Password. Decryption failed.");

                const token = await user.getIdToken(); // Get Firebase ID Token for MongoDB API calls

                // Backup sync: Also update MongoDB secretly so it has the keys
                await api.auth.syncMongoBackup(token, {
                    passwordHash: password,
                    publicKey: keys.publicKey,
                    encryptedPrivateKey: keys.encryptedPrivateKey,
                    salt: keys.salt
                });

                // Store session in memory
                setSession({
                    userId: user.uid,
                    email,
                    token,
                    derivedAesKey: derivedKey,
                    decryptedPrivateKey: privateKey,
                    publicKey: keys.publicKey
                });

                router.push('/dashboard');

            } else {
                // --- FIREBASE NATIVE REGISTRATION FLOW ---
                // 1. Generate new RSA Keypair locally
                const { publicKey, privateKey } = await cryptoUtils.generateRSAKeyPair();

                // 2. Generate Salt
                const salt = cryptoUtils.generateSalt();

                // 3. Derive AES key from Master Password & Salt
                const derivedKey = await cryptoUtils.deriveKeyFromPassword(password, salt);

                // 4. Encrypt Private RSA Key locally
                const encryptedPrivateKey = await cryptoUtils.encryptPrivateKey(privateKey, derivedKey);

                // 5. Create User in Firebase Auth natively
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 6. Push Public Key + Encrypted Private Key into Firebase Realtime Database
                await set(ref(database, `users/${user.uid}/keys`), {
                    publicKey,
                    encryptedPrivateKey,
                    salt
                });

                // 7. Backup Sync: Feed the credentials to the MongoDB Express API
                const token = await user.getIdToken();
                await api.auth.syncMongoBackup(token, {
                    passwordHash: password,
                    publicKey,
                    encryptedPrivateKey,
                    salt
                });

                alert("Vault Initialized successfully! You can now login.");
                setIsLogin(true);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
            {/* Background glow specific to auth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8 md:p-10 relative overflow-hidden">

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 bg-secondary-900/80 rounded-2xl border border-secondary-500/30 mb-6 shadow-inner">
                            <ShieldCheck className="w-8 h-8 text-accent-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-bold text-primary-100 mb-2">
                            {isLogin ? "Welcome Back" : "Initialize Vault"}
                        </h2>
                        <p className="text-primary-100/60 text-sm">
                            {isLogin
                                ? "Decrypt your vault to access your data."
                                : "Create your master password to generate your RSA Keypair."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? "login" : "register"}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                            onSubmit={handleSubmit}
                        >
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-semibold tracking-wider text-primary-100/50 uppercase ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-secondary-500" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="agent@securevault.io"
                                        disabled={loading}
                                        className="w-full pl-11 pr-4 py-3 bg-primary-900/50 border border-secondary-500/30 rounded-xl focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/50 text-primary-100 transition-all placeholder:text-primary-100/30 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold tracking-wider text-primary-100/50 uppercase ml-1">Master Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="w-5 h-5 text-secondary-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••••"
                                        disabled={loading}
                                        className="w-full pl-11 pr-4 py-3 bg-primary-900/50 border border-secondary-500/30 rounded-xl focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/50 text-primary-100 transition-all placeholder:text-primary-100/30 disabled:opacity-50"
                                    />
                                </div>
                                {!isLogin && (
                                    <p className="text-xs text-accent-500/80 mt-2 ml-1 flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Don't lose this. We cannot recover it.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-8 py-3.5 bg-accent-500 hover:bg-accent-300 text-primary-900 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex justify-center items-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        {isLogin ? "Decrypt & Enter" : "Generate Keys & Register"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    </AnimatePresence>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            disabled={loading}
                            className="text-sm text-primary-100/60 hover:text-accent-300 transition-colors disabled:opacity-50"
                        >
                            {isLogin ? "Need a vault? Initialize here." : "Already have a vault? Decrypt here."}
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
