"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Lock, Shield, Search, Plus,
  MoreVertical, Flame, CheckCheck, Clock, User, X, AlertTriangle
} from "lucide-react";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";

/* ── Mock data for UI demonstration ────────────────────────── */
interface Message {
  id: string;
  from: "me" | "them";
  content: string;
  timestamp: Date;
  encrypted: boolean;
  burnAfterRead?: boolean;
  read?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  email: string;
  lastMessage: string;
  lastTime: Date;
  unread: number;
  online: boolean;
}

const MOCK_CONVOS: Conversation[] = [
  { id: "1", name: "Alice K.",  email: "alice@example.com",  lastMessage: "[Encrypted Message]", lastTime: new Date(Date.now() - 120000), unread: 2, online: true  },
  { id: "2", name: "Bob M.",    email: "bob@example.com",    lastMessage: "[Encrypted Message]", lastTime: new Date(Date.now() - 3600000), unread: 0, online: false },
  { id: "3", name: "Carol S.",  email: "carol@example.com",  lastMessage: "[Encrypted Message]", lastTime: new Date(Date.now() - 86400000), unread: 0, online: true },
];

function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60)   return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400)return `${Math.floor(sec / 3600)}h ago`;
  return date.toLocaleDateString();
}

function EncryptionShield() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2.5, repeat: Infinity }}
      className="flex items-center gap-1 text-[10px] font-code text-safe font-bold"
    >
      <Lock className="w-3 h-3 enc-locked" />
      E2E
    </motion.div>
  );
}

export default function MessagesPage() {
  const { session } = useSession();
  const router      = useRouter();
  const [selected, setSelected]     = useState<string | null>(null);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [burnMode, setBurnMode]     = useState(false);
  const [search, setSearch]         = useState("");
  const [newContact, setNewContact] = useState(false);
  const [newEmail, setNewEmail]     = useState("");
  const bottomRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) { router.push("/auth"); }
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selected) {
      // Simulate loading messages from Firebase
      setMessages([
        { id: "1", from: "them", content: "[Decrypted] Hey! Did you get the documents I sent?", timestamp: new Date(Date.now() - 300000), encrypted: true },
        { id: "2", from: "me",   content: "[Decrypted] Yes, reviewing them now. Strong AES wrap on those.", timestamp: new Date(Date.now() - 240000), encrypted: true },
        { id: "3", from: "them", content: "[Decrypted] Good. Let me know if the key decryption works properly.", timestamp: new Date(Date.now() - 120000), encrypted: true, read: true },
      ]);
    }
  }, [selected]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id:           Date.now().toString(),
      from:         "me",
      content:      `[Encrypted] ${input}`,
      timestamp:    new Date(),
      encrypted:    true,
      burnAfterRead: burnMode,
    }]);
    setInput("");
  };

  if (!session) return null;

  const filteredConvos = MOCK_CONVOS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-76px)] flex relative overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="w-80 glass-panel flex flex-col border-r border-white/5 flex-shrink-0"
      >
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-primary-100">Messages</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setNewContact(true)}
              className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-100/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="vault-input w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Convo list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConvos.map(convo => (
            <motion.button
              key={convo.id}
              whileHover={{ x: 2 }}
              onClick={() => setSelected(convo.id)}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                selected === convo.id
                  ? "bg-accent-900/30 border border-accent-800/40"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl identicon-placeholder flex items-center justify-center">
                    <span className="font-code font-bold text-accent-300 text-sm">
                      {convo.name[0]}
                    </span>
                  </div>
                  {convo.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-safe border-2 border-primary-900" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-primary-100">{convo.name}</span>
                    <span className="text-[10px] text-primary-100/30">{timeAgo(convo.lastTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-100/40 truncate">{convo.lastMessage}</span>
                    {convo.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-accent-500 text-primary-900 text-[9px] font-bold flex items-center justify-center flex-shrink-0 ml-1">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* E2E note */}
        <div className="p-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-primary-100/25 font-code">
          <Lock className="w-3 h-3" />
          All messages encrypted with RSA + AES
        </div>
      </motion.div>

      {/* ── Chat area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Chat header */}
            <div className="glass border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
              {(() => {
                const convo = MOCK_CONVOS.find(c => c.id === selected)!;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl identicon-placeholder flex items-center justify-center">
                          <span className="font-code font-bold text-accent-300 text-sm">{convo.name[0]}</span>
                        </div>
                        {convo.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-safe border-2 border-primary-900" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-primary-100">{convo.name}</p>
                        <p className="text-[10px] text-primary-100/40">{convo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <EncryptionShield />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setBurnMode(v => !v)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          burnMode
                            ? "bg-danger/20 text-danger border border-danger/30"
                            : "btn-ghost"
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        {burnMode ? "Burn: ON" : "Burn After Read"}
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* E2E banner */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-primary-100/40 font-code">
                  <Shield className="w-3.5 h-3.5 text-safe/60" />
                  Messages are end-to-end encrypted. SecureVault cannot read them.
                </div>
              </div>

              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.from === "them" && (
                    <div className="w-8 h-8 rounded-xl identicon-placeholder flex items-center justify-center flex-shrink-0 self-end mb-1">
                      <span className="font-code font-bold text-accent-300 text-xs">A</span>
                    </div>
                  )}
                  <div className={`max-w-[70%] space-y-1 ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${
                        msg.from === "me"
                          ? "glass-ultra rounded-br-sm border border-accent-800/30 text-primary-100"
                          : "glass rounded-bl-sm text-primary-100"
                      }`}
                    >
                      {msg.burnAfterRead && (
                        <div className="flex items-center gap-1 text-[9px] text-danger/70 font-code mb-1">
                          <Flame className="w-2.5 h-2.5" />
                          Burn after read
                        </div>
                      )}
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] text-primary-100/25 ${msg.from === "me" ? "flex-row-reverse" : ""}`}>
                      <Lock className="w-2.5 h-2.5 enc-locked" />
                      <span>{timeAgo(msg.timestamp)}</span>
                      {msg.from === "me" && msg.read && <CheckCheck className="w-3 h-3 text-accent-500/60" />}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="glass border-t border-white/5 px-4 py-3">
              {burnMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-danger/70 mb-2 font-code px-1"
                >
                  <Flame className="w-3 h-3" />
                  This message will self-destruct after being read.
                </motion.div>
              )}
              <div className="flex gap-3 items-end">
                <div className="relative flex-1">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                    placeholder="Type an encrypted message..."
                    rows={1}
                    className="vault-input w-full px-4 py-3 pr-10 text-sm resize-none"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <Lock className="absolute right-3 bottom-3.5 w-3.5 h-3.5 enc-locked opacity-50" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl glass-ultra flex items-center justify-center mb-6"
            >
              <MessageSquare className="w-12 h-12 text-accent-500/60" strokeWidth={1} />
            </motion.div>
            <h3 className="font-display font-bold text-2xl text-primary-100/60 mb-2">
              Select a Conversation
            </h3>
            <p className="text-primary-100/30 text-sm max-w-xs">
              All messages are end-to-end encrypted with recipient public keys via RSA wrapping.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setNewContact(true)}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold mt-6"
            >
              <Plus className="w-4 h-4" />
              New Encrypted Message
            </motion.button>
          </div>
        )}
      </div>

      {/* New contact modal */}
      <AnimatePresence>
        {newContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/70 backdrop-blur-sm"
            onClick={() => setNewContact(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="glass-ultra rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-primary-100">New Message</h3>
                <button onClick={() => setNewContact(false)} className="text-primary-100/30 hover:text-primary-100/70">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">Recipient Email</label>
                <input
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="vault-input w-full px-4 py-3 text-sm"
                />
              </div>
              <p className="text-xs text-primary-100/30 mb-5 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-accent-500/50" />
                SecureVault will fetch their public key to establish an encrypted channel.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Open Secure Channel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}