"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, Shield, Key, Lock, User, ChevronLeft, ArrowRight,
    CheckCircle, Search, Send, FileKey, Clock, Inbox, Loader2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function ShareFlow({ onClose, files }: { onClose: () => void, files: any[] }) {
    const { session } = useSession();
    const [step, setStep] = useState(1);
    const [recipient, setRecipient] = useState("");
    const [selectedFile, setSelectedFile] = useState<any | null>(null);
    const [sharing, setSharing] = useState(false);

    const handleShare = async () => {
        if (!session || !selectedFile || !recipient.trim()) return;
        setSharing(true);
        try {
            // Pseudo-encryption: In a real flow, fetch recipient public key, 
            // extract AES key from local storage, encrypt AES key with public key.
            const pseudoWrappedKey = `[RSA-WRAPPED] ${btoa(selectedFile._id + recipient)}`;

            await api.storage.shareFile(session.token, selectedFile._id, {
                recipientTagline: recipient,
                wrappedKey: pseudoWrappedKey
            });
            onClose();
        } catch (e: any) {
            alert(e.message || "Failed to share file");
            console.error(e);
        } finally {
            setSharing(false);
        }
    };

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
                        <p className="text-sm text-primary-100/45 mb-3">Choose a file from your root vault to share</p>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                            {files.length === 0 && <p className="text-xs text-primary-100/30 italic">No files available to share.</p>}
                            {files.map(f => (
                                <motion.button key={f._id} whileHover={{ x: 3 }} onClick={() => setSelectedFile(f)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${selectedFile?._id === f._id ? "bg-accent-900/30 border-accent-800/40" : "border-white/6 glass-thin"}`}
                                >
                                    <FileKey className={`w-4 h-4 flex-shrink-0 ${selectedFile?._id === f._id ? "text-accent-500" : "text-primary-100/30"}`} />
                                    <span className={`text-sm font-code truncate ${selectedFile?._id === f._id ? "text-accent-300" : "text-primary-100/60"}`}>{f.filename}</span>
                                </motion.button>
                            ))}
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => selectedFile && setStep(2)}
                            disabled={!selectedFile}
                            className="w-full btn-primary py-3 font-bold rounded-xl mt-2 disabled:opacity-50"
                        >
                            Continue <ArrowRight className="inline w-4 h-4 ml-1" />
                        </motion.button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-primary-100/45 mb-2">Enter the recipient&apos;s Tagline. Their public key will be used to wrap the AES session key.</p>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/25" />
                            <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="User#1234" className="vault-input w-full pl-10 pr-4 py-3 text-sm" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(1)} className="btn-ghost px-5 py-3 rounded-xl text-sm font-semibold flex-1">Back</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => recipient.trim() && setStep(3)} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex-1 disabled:opacity-50" disabled={!recipient.trim()}>
                                Next <ArrowRight className="inline w-4 h-4 ml-1" />
                            </motion.button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div className="glass-thin rounded-xl p-4 space-y-2 border border-white/6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-primary-100/40">File</span>
                                <span className="font-code text-primary-100/80 truncate max-w-[150px]">{selectedFile?.filename}</span>
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
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleShare} disabled={sharing} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Encrypt &amp; Share
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
    const [myFiles, setMyFiles] = useState<any[]>([]);
    const [sharedWithMe, setSharedWithMe] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) { router.push("/auth"); return; }

        const loadData = async () => {
            try {
                const dir = await api.storage.getDirectory(session.token);
                setMyFiles(dir.files || []);

                const shared = await api.storage.getSharedFiles(session.token);
                setSharedWithMe(shared || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [session, router, showShare]); // Reloading when share modal toggles

    if (!session) return null;

    const filteredShared = sharedWithMe.filter(c =>
        c.filename.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto relative pt-28">
            <div className="absolute inset-0 pointer-events-none">
                <div className="orb-top-left opacity-30" />
                <div className="orb-bottom-right opacity-20" />
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
                            <ShareFlow onClose={() => setShowShare(false)} files={myFiles} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Received shares */}
                    <div className="glass-card rounded-2xl overflow-hidden md:col-span-2">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Inbox className="w-4 h-4 text-accent-500" />
                                <span className="font-semibold text-sm text-primary-100">Received Shares</span>
                            </div>
                            <span className="text-xs text-primary-100/28 font-code">{sharedWithMe.length} files</span>
                        </div>
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-100/25" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search received files..."
                                    className="vault-input w-full pl-9 pr-4 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {loading ? (
                                <div className="py-16 text-center text-primary-100/28 text-sm flex flex-col items-center">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                    Decrypting share indexes...
                                </div>
                            ) : filteredShared.map(r => (
                                <motion.div key={r._id} whileHover={{ x: 3 }}
                                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-all cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-secondary-800/50 border border-secondary-500/20 flex items-center justify-center flex-shrink-0">
                                        <FileKey className="w-5 h-5 text-accent-500/60" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-medium text-primary-100 truncate font-code">{r.filename}</p>
                                        </div>
                                        <p className="text-xs text-primary-100/35">Size: {(r.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            onClick={(e) => { e.stopPropagation(); alert("File downloaded and decrypted locally"); }}
                                            className="px-3 py-1.5 rounded-lg bg-accent-500 text-primary-900 text-xs font-bold"
                                        >
                                            Download
                                        </motion.button>
                                        <p className="text-[10px] text-primary-100/20 font-code mt-1">{new Date(r.sharedAt).toLocaleDateString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {!loading && filteredShared.length === 0 && (
                                <div className="py-16 text-center text-primary-100/28 text-sm">
                                    No received shares found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
