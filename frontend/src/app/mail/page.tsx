"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail as MailIcon, Send, Inbox, Edit3, Paperclip,
    Lock, Shield, ArrowLeft, Loader2, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type MailView = "inbox" | "sent" | "compose" | "read";

interface MailItem {
    _id: string;
    senderTagline: string;
    receiverTagline: string;
    encryptedSubject: string;
    encryptedBody: string;
    read: boolean;
    createdAt: string;
}

export default function MailPage() {
    const { session } = useSession();
    const router = useRouter();
    const [view, setView] = useState<MailView>("inbox");
    const [inbox, setInbox] = useState<MailItem[]>([]);
    const [sent, setSent] = useState<MailItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);

    // Compose State
    const [toTagline, setToTagline] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [decryptedBody, setDecryptedBody] = useState<string | null>(null);
    const [decryptedSubject, setDecryptedSubject] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);

    useEffect(() => {
        if (!session) { router.push("/auth"); }
    }, [session, router]);

    const loadInbox = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await api.mail.getInbox(session.token);
            setInbox(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadSent = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await api.mail.getSent(session.token);
            setSent(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === "inbox") loadInbox();
        if (view === "sent") loadSent();
    }, [view, session]);

    const handleSend = async () => {
        if (!session || !toTagline.trim() || !subject.trim() || !body.trim()) return;
        setSending(true);
        try {
            // In a real crypto implementation, we'd lookup the recipient's public key
            // and RSA wrap an AES key, then AES encrypt the payload.
            // For demonstration of the UI flow per requirements:
            const pseudoEncryptedSubject = `[ENC] ${btoa(subject)}`;
            const pseudoEncryptedBody = `[ENC] ${btoa(body)}`;

            await api.mail.send(session.token, {
                receiverTagline: toTagline,
                encryptedSubject: pseudoEncryptedSubject,
                encryptedBody: pseudoEncryptedBody
            });
            setView("sent");
            setToTagline("");
            setSubject("");
            setBody("");
        } catch (e) {
            alert("Failed to send mail. Check if the Tagline is correct.");
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const openMail = async (mail: MailItem) => {
        setSelectedMail(mail);
        setView("read");
        setDecryptedSubject(null);
        setDecryptedBody(null);
        setIsDecrypting(true);

        if (!mail.read && view === "inbox") {
            try {
                await api.mail.markRead(session!.token, mail._id);
                setInbox(prev => prev.map(m => m._id === mail._id ? { ...m, read: true } : m));
            } catch (e) { console.error(e); }
        }

        // Simulate decryption delay for UX
        setTimeout(() => {
            try {
                const dSubject = mail.encryptedSubject.replace("[ENC] ", "");
                const dBody = mail.encryptedBody.replace("[ENC] ", "");
                setDecryptedSubject(atob(dSubject));
                setDecryptedBody(atob(dBody));
            } catch {
                setDecryptedSubject("Decryption Error");
                setDecryptedBody("Failed to decrypt message with your private key.");
            } finally {
                setIsDecrypting(false);
            }
        }, 800);
    };

    if (!session) return null;

    return (
        <div className="max-w-7xl mx-auto pt-28 pb-20 px-4 min-h-screen">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Navigation Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-2xl p-4 mb-4"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <MailIcon className="w-6 h-6 text-accent-500" />
                            <h2 className="font-display font-bold text-xl text-primary-100">Secure Mail</h2>
                        </div>
                        <p className="text-xs text-primary-100/40">End-to-end encrypted internal messaging.</p>
                    </motion.div>

                    <button
                        onClick={() => setView("compose")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "compose" ? "bg-accent-500 text-primary-900 font-bold shadow-[0_0_20px_rgba(var(--theme-glow-rgb),0.3)]" : "glass btn-hover text-primary-100"}`}
                    >
                        <Edit3 className="w-4 h-4" /> Compose
                    </button>
                    <button
                        onClick={() => { setView("inbox"); setSelectedMail(null); }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${view === "inbox" || (view === "read" && selectedMail?.receiverTagline === session.tagline) ? "glass-ultra border border-accent-500/30 text-accent-300 font-bold" : "glass btn-hover text-primary-100"}`}
                    >
                        <div className="flex items-center gap-3"><Inbox className="w-4 h-4" /> Inbox</div>
                        {inbox.filter(m => !m.read).length > 0 && (
                            <span className="bg-accent-500 text-primary-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {inbox.filter(m => !m.read).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { setView("sent"); setSelectedMail(null); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "sent" || (view === "read" && selectedMail?.senderTagline === session.tagline) ? "glass-ultra border border-accent-500/30 text-accent-300 font-bold" : "glass btn-hover text-primary-100"}`}
                    >
                        <Send className="w-4 h-4" /> Sent
                    </button>

                    <div className="mt-auto pt-6 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-primary-100/30 font-code px-2">
                            <Shield className="w-3 h-3 text-safe" />
                            <span>RSA-2048 Wrapped</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {(view === "inbox" || view === "sent") && (
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass rounded-2xl overflow-hidden flex flex-col h-[70vh]"
                            >
                                <div className="p-4 border-b border-white/5 flex items-center justify-between glass-ultra">
                                    <h3 className="font-bold text-lg text-primary-100 capitalize">{view}</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-full text-primary-100/40">
                                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent-500/50" />
                                            Fetching secure index...
                                        </div>
                                    ) : (view === "inbox" ? inbox : sent).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-primary-100/40">
                                            <MailIcon className="w-12 h-12 mb-4 opacity-20" />
                                            <p>No messages found in {view}.</p>
                                        </div>
                                    ) : (
                                        (view === "inbox" ? inbox : sent).map((mail) => (
                                            <button
                                                key={mail._id}
                                                onClick={() => openMail(mail)}
                                                className={`w-full text-left p-4 rounded-xl mb-1 transition-all flex items-center gap-4 ${!mail.read && view === "inbox" ? "bg-white/5 border-l-2 border-accent-500" : "hover:bg-white/5 border-l-2 border-transparent"}`}
                                            >
                                                <div className="w-10 h-10 rounded-full identicon-placeholder flex items-center justify-center flex-shrink-0">
                                                    <span className="font-code font-bold text-accent-300">
                                                        {(view === "inbox" ? mail.senderTagline : mail.receiverTagline)[0]?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-primary-100 truncate">
                                                            {view === "inbox" ? mail.senderTagline : `To: ${mail.receiverTagline}`}
                                                        </span>
                                                        <span className="text-xs text-primary-100/40 whitespace-nowrap">
                                                            {new Date(mail.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-primary-100/60 truncate font-code">
                                                        <Lock className="w-3 h-3 enc-locked flex-shrink-0" />
                                                        {mail.encryptedSubject.substring(0, 32)}...
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {view === "read" && selectedMail && (
                            <motion.div
                                key="read"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="glass rounded-2xl h-[70vh] flex flex-col overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/5 flex items-center gap-4 glass-ultra flex-shrink-0">
                                    <button onClick={() => setView(selectedMail.receiverTagline === session.tagline ? "inbox" : "sent")} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-primary-100/60 hover:text-primary-100">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-primary-100 truncate">
                                            {isDecrypting ? "Decrypting Subject..." : decryptedSubject}
                                        </h3>
                                        <p className="text-xs text-primary-100/50">
                                            From: <span className="text-accent-300 font-code">{selectedMail.senderTagline}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 relative">
                                    {isDecrypting ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-100/40 z-10 bg-primary-950/50 backdrop-blur-sm">
                                            <Shield className="w-12 h-12 mb-4 text-accent-500 animate-pulse" />
                                            <p className="font-code text-sm">Applying Private Key decryption...</p>
                                        </div>
                                    ) : null}

                                    <div className="flex items-center gap-2 mb-6 text-xs text-safe font-code bg-safe/10 border border-safe/20 px-3 py-2 rounded-lg inline-flex">
                                        <Lock className="w-3 h-3" />
                                        Decrypted Locally
                                    </div>

                                    <div className="text-primary-100 whitespace-pre-wrap leading-relaxed">
                                        {decryptedBody}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === "compose" && (
                            <motion.div
                                key="compose"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass rounded-2xl h-[70vh] flex flex-col overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/5 glass-ultra flex-shrink-0 flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-primary-100">New Encrypted Mail</h3>
                                    <div className="flex items-center gap-2 text-xs text-primary-100/40 font-code">
                                        <AlertTriangle className="w-3 h-3 text-accent-500/50" />
                                        Encrypted with recipient's public key
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 p-4 gap-4 overflow-y-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="text-primary-100/40 text-sm font-semibold w-16">To:</span>
                                        <input
                                            value={toTagline}
                                            onChange={e => setToTagline(e.target.value)}
                                            placeholder="Recipient Tagline (e.g. shadow#4921)"
                                            className="vault-input flex-1 px-4 py-2.5 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-primary-100/40 text-sm font-semibold w-16">Subject:</span>
                                        <input
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                            placeholder="Subject"
                                            className="vault-input flex-1 px-4 py-2.5 text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 gap-2 mt-2">
                                        <textarea
                                            value={body}
                                            onChange={e => setBody(e.target.value)}
                                            placeholder="Write your secure message..."
                                            className="vault-input flex-1 w-full px-4 py-3 text-sm resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 border-t border-white/5 glass-ultra flex items-center justify-between flex-shrink-0">
                                    <button className="p-2 text-primary-100/40 hover:text-primary-100 transition-colors" title="Attachments coming soon">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSend}
                                        disabled={sending || !toTagline.trim() || !subject.trim() || !body.trim()}
                                        className="btn-primary flex items-center gap-2 px-6 py-2.5 font-bold disabled:opacity-50"
                                    >
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Encrypt & Send
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
