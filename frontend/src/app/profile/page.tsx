"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Fingerprint, Copy, Download, KeyRound, Shield, CheckCircle,
    ChevronLeft, RefreshCw, Eye, EyeOff, Calendar, Lock, Cpu
} from "lucide-react";
import Link from "next/link";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";

function FingerprintDisplay({ fingerprint }: { fingerprint: string }) {
    const chunks = fingerprint.match(/.{1,4}/g) ?? [];
    return (
        <div className="flex flex-wrap gap-1.5 justify-center">
            {chunks.map((chunk, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="font-code text-xs text-accent-300 bg-accent-900/25 border border-accent-800/30 px-2 py-1 rounded-lg"
                >
                    {chunk}
                </motion.span>
            ))}
        </div>
    );
}

function IdentIcon({ email }: { email: string }) {
    // Simple visual hash grid based on email
    const hash = Array.from(email).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const grid = Array.from({ length: 25 }, (_, i) => (hash >> (i % 16)) & 1);
    return (
        <div className="grid grid-cols-5 gap-1 w-24 h-24">
            {grid.map((on, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015, type: "spring" }}
                    className={`rounded-sm ${on ? "bg-accent-500" : "bg-accent-900/30"}`}
                    style={{ boxShadow: on ? "0 0 6px rgba(var(--theme-glow-rgb), 0.4)" : undefined }}
                />
            ))}
        </div>
    );
}

export default function ProfilePage() {
    const { session } = useSession();
    const router = useRouter();
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!session) { router.push("/auth"); return null; }

    const mockFingerprint = "A4B2:9F3C:11D7:2E8A:43F1:C6B9:7D2E:4A5F:8E3C:0B1D";

    const copyKey = () => {
        navigator.clipboard.writeText("RSA-2048 Public Key (mock)");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="orb-top-left opacity-50" />
            </div>

            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8 relative z-10">
                <Link href="/dashboard" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Vault
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80 }}
                className="relative z-10 space-y-5"
            >
                {/* Identity card */}
                <div className="glass-ultra rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 dot-bg opacity-20 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex justify-center mb-5">
                            <IdentIcon email={session.email} />
                        </div>
                        <h1 className="font-display font-extrabold text-2xl text-primary-100 mb-1">{session.email}</h1>
                        <div className="flex items-center justify-center gap-2 text-xs text-primary-100/40">
                            <span className="w-1.5 h-1.5 rounded-full status-online" />
                            <span className="font-code">Vault Active · RSA-2048 · AES-256</span>
                        </div>
                    </div>
                </div>

                {/* Key Fingerprint */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Fingerprint className="w-5 h-5 text-accent-500" />
                        <h2 className="font-display font-bold text-lg text-primary-100">Public Key Fingerprint</h2>
                    </div>
                    <p className="text-xs text-primary-100/40 font-code mb-5">
                        SHA-256 fingerprint of your RSA-2048 public key. Share this with contacts to verify your identity.
                    </p>
                    <FingerprintDisplay fingerprint={mockFingerprint} />
                    <div className="mt-4 flex gap-2 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={copyKey}
                            className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm rounded-xl"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-safe" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Fingerprint"}
                        </motion.button>
                    </div>
                </div>

                {/* Key Metadata */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <KeyRound className="w-5 h-5 text-accent-500" />
                        <h2 className="font-display font-bold text-lg text-primary-100">Key Metadata</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: "Algorithm", value: "RSA-2048", icon: Cpu },
                            { label: "Key Size", value: "2048 bits", icon: Shield },
                            { label: "Key Wrapping", value: "AES-256 + PBKDF2", icon: Lock },
                            { label: "Generated", value: "Browser · In-memory", icon: Calendar },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-2.5">
                                    <Icon className="w-4 h-4 text-accent-500/60" />
                                    <span className="text-sm text-primary-100/50">{label}</span>
                                </div>
                                <span className="font-code text-sm text-primary-100">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Public Key Export */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-accent-500" />
                            <h2 className="font-display font-bold text-lg text-primary-100">Public Key</h2>
                        </div>
                        <motion.button whileHover={{ scale: 1.04 }} onClick={() => setShowKey(v => !v)}
                            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl"
                        >
                            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {showKey ? "Hide" : "Show"}
                        </motion.button>
                    </div>
                    {showKey && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            className="code-block text-accent-300/70 text-[11px] overflow-hidden"
                        >
                            {`-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdef...\n[Your RSA-2048 Public Key]\n-----END PUBLIC KEY-----`}
                        </motion.div>
                    )}
                    <div className="flex gap-2 mt-4">
                        <motion.button whileHover={{ scale: 1.03 }} onClick={copyKey}
                            className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm rounded-xl"
                        >
                            <Copy className="w-4 h-4" /> Copy Key
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.03 }}
                            className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm rounded-xl"
                        >
                            <Download className="w-4 h-4" /> Export PEM
                        </motion.button>
                    </div>
                </div>

                {/* Regen keypair danger */}
                <div className="glass-card rounded-2xl p-6 border border-danger/10">
                    <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-4 h-4 text-danger" />
                        <h2 className="font-semibold text-base text-danger">Regenerate Keypair</h2>
                    </div>
                    <p className="text-sm text-primary-100/40 mb-4">
                        Creates a new RSA-2048 keypair. <strong className="text-warn">All previously encrypted files will become permanently inaccessible.</strong>
                    </p>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="btn-danger flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl"
                    >
                        <RefreshCw className="w-4 h-4" /> Regenerate Keys
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
