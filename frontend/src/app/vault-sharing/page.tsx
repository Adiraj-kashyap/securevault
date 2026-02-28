"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, Shield, Key, Lock, User, ChevronLeft, ArrowRight,
    CheckCircle, Search, Send, FileKey, Clock, Inbox
} from "lucide-react";
import Link from "next/link";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";

const MOCK_CONTACTS = [
    { email: "alice@securevault.io", verified: true, lastSeen: "2h ago" },
    { email: "bob@protonmail.com", verified: true, lastSeen: "1d ago" },
    { email: "carol@example.com", verified: false, lastSeen: "5d ago" },
];

const MOCK_RECEIVED = [
    { from: "alice@securevault.io", file: "budget-2026.enc", size: "2.4 MB", time: "2h ago", status: "unread" },
    { from: "bob@protonmail.com", file: "contracts.z.enc", size: "8.1 MB", time: "1d ago", status: "read" },
];

function ShareFlow({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [recipient, setRecipient] = useState("");
    const [file, setFile] = useState("");

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass-ultra rounded-2xl p-7 relative overflow-hidden"
        >
            <div className="absolute inset-0 hex-bg opacity-20 pointer-events-none" />
            <div className="relative z-10">
                <h3 className="font-display font-bold text-lg text-primary-100 mb-5">Share Encrypted File</h3>

                {/* Step indicator */}
                <div className="flex gap-2 mb-6">
                    {["Select File", "Recipient", "Confirm"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i + 1 <= step ? "bg-accent-500 text-primary-900" : "glass-thin text-primary-100/30 border border-white/10"}`}>
                                {i + 1 <= step ? <CheckCircle className="w-3 h-3" /> : i + 1}
                            </div>
                            <span className={`text-xs hidden sm:block ${i + 1 === step ? "text-accent-300" : "text-primary-100/28"}`}>{s}</span>
                            {i < 2 && <div className="flex-1 h-px bg-white/8" />}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-3">
                        <p className="text-sm text-primary-100/45 mb-3">Choose a file from your vault to share</p>
                        {["report-q3.pdf.enc", "contracts.zip.enc", "backup-keys.enc"].map(f => (
                            <motion.button key={f} whileHover={{ x: 3 }} onClick={() => setFile(f)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${file === f ? "bg-accent-900/30 border-accent-800/40" : "border-white/6 glass-thin"}`}
                            >
                                <FileKey className={`w-4 h-4 flex-shrink-0 ${file === f ? "text-accent-500" : "text-primary-100/30"}`} />
                                <span className={`text-sm font-code ${file === f ? "text-accent-300" : "text-primary-100/60"}`}>{f}</span>
                            </motion.button>
                        ))}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => file && setStep(2)}
                            className="w-full btn-primary py-3 font-bold rounded-xl mt-2"
                        >
                            Continue <ArrowRight className="inline w-4 h-4 ml-1" />
                        </motion.button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-primary-100/45 mb-2">Enter the recipient&apos;s email. Their public key will be used to wrap the AES session key.</p>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/25" />
                            <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="recipient@email.com" className="vault-input w-full pl-10 pr-4 py-3 text-sm" />
                        </div>
                        {/* Contact suggestions */}
                        <div className="space-y-1">
                            {MOCK_CONTACTS.filter(c => c.verified).map(c => (
                                <motion.button key={c.email} whileHover={{ x: 3 }} onClick={() => setRecipient(c.email)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                                >
                                    <div className="w-6 h-6 rounded-full identicon-placeholder flex items-center justify-center text-[10px] font-bold text-accent-300">
                                        {c.email[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm text-primary-100/60">{c.email}</span>
                                    {c.verified && <CheckCircle className="w-3.5 h-3.5 text-safe ml-auto" />}
                                </motion.button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(1)} className="btn-ghost px-5 py-3 rounded-xl text-sm font-semibold flex-1">Back</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => recipient && setStep(3)} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex-1">
                                Next <ArrowRight className="inline w-4 h-4 ml-1" />
                            </motion.button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div className="glass-thin rounded-xl p-4 space-y-2 border border-white/6">
                            <div className="flex justify-between text-sm">
                                <span className="text-primary-100/40">File</span>
                                <span className="font-code text-primary-100/80">{file}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-primary-100/40">Recipient</span>
                                <span className="font-code text-primary-100/80">{recipient}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-primary-100/40">Key wrapping</span>
                                <span className="font-code text-safe">RSA-2048 Public Key</span>
                            </div>
                        </div>
                        <div className="flex gap-2.5 p-3.5 rounded-xl bg-accent-900/20 border border-accent-800/25">
                            <Key className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-primary-100/48 leading-relaxed">
                                The file&apos;s AES key will be wrapped with the recipient&apos;s RSA-2048 public key. They can decrypt it only with their private key.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(2)} className="btn-ghost px-5 py-3 rounded-xl text-sm font-semibold flex-1">Back</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClose} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex-1 flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Encrypt &amp; Share
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function VaultSharingPage() {
    const { session } = useSession();
    const router = useRouter();
    const [showShare, setShowShare] = useState(false);
    const [search, setSearch] = useState("");

    if (!session) { router.push("/auth"); return null; }

    const filteredContacts = MOCK_CONTACTS.filter(c =>
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="orb-top-left opacity-50" />
                <div className="orb-bottom-right opacity-40" />
            </div>

            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8 relative z-10">
                <Link href="/dashboard" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Vault
                </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                    <div>
                        <h1 className="font-display font-extrabold text-3xl text-primary-100 mb-1">Vault Sharing</h1>
                        <p className="text-primary-100/40 text-sm flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 enc-locked" />
                            End-to-end encrypted file transfer via RSA public key wrapping
                        </p>
                    </div>
                    <motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setShowShare(v => !v)}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl"
                    >
                        <Globe className="w-4 h-4" />
                        {showShare ? "Close" : "Share a File"}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showShare && (
                        <motion.div key="shareflow" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                            <ShareFlow onClose={() => setShowShare(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contacts */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-accent-500" />
                                <span className="font-semibold text-sm text-primary-100">Trusted Contacts</span>
                            </div>
                            <span className="text-xs text-primary-100/28 font-code">{filteredContacts.length} contacts</span>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-100/25" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
                                    className="vault-input w-full pl-9 pr-4 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                {filteredContacts.map(c => (
                                    <motion.div key={c.email} whileHover={{ x: 3 }}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-xl identicon-placeholder flex items-center justify-center font-bold text-sm text-accent-300">
                                            {c.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-primary-100 truncate">{c.email}</p>
                                            <p className="text-[10px] text-primary-100/30 font-code">{c.lastSeen}</p>
                                        </div>
                                        {c.verified
                                            ? <div className="flex items-center gap-1 text-[10px] text-safe font-code"><CheckCircle className="w-3 h-3" />Verified</div>
                                            : <div className="text-[10px] text-warn font-code">Unverified</div>
                                        }
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Received shares */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                            <Inbox className="w-4 h-4 text-accent-500" />
                            <span className="font-semibold text-sm text-primary-100">Received Shares</span>
                            <span className="ml-auto text-xs text-primary-100/28 font-code">{MOCK_RECEIVED.filter(r => r.status === "unread").length} unread</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {MOCK_RECEIVED.map(r => (
                                <motion.div key={r.file} whileHover={{ x: 3 }}
                                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-all cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-secondary-800/50 border border-secondary-500/20 flex items-center justify-center flex-shrink-0">
                                        <FileKey className="w-5 h-5 text-accent-500/60" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-primary-100 truncate">{r.file}</p>
                                            {r.status === "unread" && <div className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0 animate-pulse-glow" />}
                                        </div>
                                        <p className="text-xs text-primary-100/35">From: {r.from}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[10px] text-primary-100/30 font-code">{r.size}</p>
                                        <p className="text-[10px] text-primary-100/20 font-code">{r.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {MOCK_RECEIVED.length === 0 && (
                                <div className="py-16 text-center text-primary-100/28 text-sm">
                                    No received shares yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
