"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Lock, Shield, Search, Plus,
  MoreVertical, Flame, CheckCheck, Clock, User, X, AlertTriangle, Loader2, Users, Key
} from "lucide-react";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";
import { database } from "@/lib/firebase";
import { ref, push, onValue, off, serverTimestamp, remove, set, get } from "firebase/database";

/* ── Mock data for UI demonstration ────────────────────────── */
interface Message {
  id: string;
  from: "me" | "them";
  senderName?: string;
  content: string;
  timestamp: Date;
  encrypted: boolean;
  burnAfterRead?: boolean;
  read?: boolean;
}

interface Conversation {
  id: string;
  isGroup?: boolean;
  joinCode?: string;
  name: string;
  tagline?: string;
  email?: string;
  lastMessage: string;
  lastTime: Date;
  unread: number;
  online: boolean;
  members?: Record<string, boolean>;
}

const MOCK_CONVOS: Conversation[] = [
  { id: "1", name: "Alice K.", tagline: "alice#1204", email: "alice@example.com", lastMessage: "[Encrypted Message]", lastTime: new Date(Date.now() - 120000), unread: 2, online: true },
  { id: "2", name: "Bob M.", tagline: "bob#9921", email: "bob@example.com", lastMessage: "[Encrypted Message]", lastTime: new Date(Date.now() - 3600000), unread: 0, online: false },
  { id: "3", name: "Carol S.", tagline: "carol#5432", email: "carol@example.com", lastMessage: "[Encrypted Message]", lastTime: new Date(Date.now() - 86400000), unread: 0, online: true },
];

function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
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
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [convos, setConvos] = useState<Conversation[]>(MOCK_CONVOS);
  const [input, setInput] = useState("");
  const [burnMode, setBurnMode] = useState(false);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Modals
  const [newContact, setNewContact] = useState(false);
  const [newTagline, setNewTagline] = useState("");

  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [joinGroupModal, setJoinGroupModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");

  const [loadingAction, setLoadingAction] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!session) { router.push("/auth"); }
  }, [session, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user's groups from Firebase
  useEffect(() => {
    if (!session) return;
    const userGroupsRef = ref(database, `userGroups/${session.userId}`);
    const unsubGroups = onValue(userGroupsRef, (snap) => {
      const groups = snap.val() || {};
      const groupPromises = Object.keys(groups).map(async (groupId) => {
        const gSnap = await get(ref(database, `groups/${groupId}/metadata`));
        if (gSnap.exists()) {
          const meta = gSnap.val();
          return {
            id: groupId,
            isGroup: true,
            name: meta.name,
            joinCode: meta.joinCode,
            lastMessage: "Tap to view encrypted chat",
            lastTime: new Date(), // mock
            unread: 0,
            online: true
          } as Conversation;
        }
        return null;
      });

      Promise.all(groupPromises).then((results) => {
        const validGroups = results.filter(g => g !== null) as Conversation[];
        setConvos([...MOCK_CONVOS, ...validGroups]);
      });
    });
    return () => off(userGroupsRef);
  }, [session]);

  // Real-time Firebase listener for selected conversation
  useEffect(() => {
    if (!selected || !session) return;

    const convo = convos.find(c => c.id === selected);
    let msgRef;

    if (convo?.isGroup) {
      msgRef = ref(database, `groups/${selected}/messages`);
    } else {
      const convoKey = [session.userId, selected].sort().join("_");
      msgRef = ref(database, `messages/${convoKey}`);
    }

    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setMessages([]); return; }
      const loaded: Message[] = Object.entries(data).map(([id, val]: any) => ({
        id,
        from: val.senderId === session.userId ? "me" : "them",
        senderName: val.senderName,
        content: val.content,
        timestamp: new Date(val.timestamp),
        encrypted: true,
        burnAfterRead: val.burnAfterRead ?? false,
        read: val.read ?? false,
      }));
      loaded.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setMessages(loaded);

      // Mark burn-after-read messages as read and schedule deletion
      if (!convo?.isGroup) {
        Object.entries(data).forEach(([id, val]: any) => {
          if (val.burnAfterRead && val.senderId !== session.userId && !val.read) {
            set(ref(database, `${msgRef.key}/${id}/read`), true);
            setTimeout(() => remove(ref(database, `${msgRef.key}/${id}`)), 30000);
          }
        });
      }
    });

    return () => off(msgRef);
  }, [selected, session, convos]);

  const sendMessage = async () => {
    if (!input.trim() || !selected || !session) return;
    setSending(true);
    try {
      const convo = convos.find(c => c.id === selected);
      let targetRef;
      if (convo?.isGroup) {
        targetRef = ref(database, `groups/${selected}/messages`);
      } else {
        const convoKey = [session.userId, selected].sort().join("_");
        targetRef = ref(database, `messages/${convoKey}`);
      }

      await push(targetRef, {
        senderId: session.userId,
        senderName: session.tagline || session.email,
        content: input.trim(), // In production: encrypt with recipient public key before push
        timestamp: Date.now(),
        encrypted: true,
        burnAfterRead: burnMode,
        read: false,
      });
      setInput("");
    } catch (e) {
      console.error("Message send failed:", e);
    } finally {
      setSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !session) return;
    setLoadingAction(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newGroupRef = push(ref(database, 'groups'));
      const groupId = newGroupRef.key;

      await set(newGroupRef, {
        metadata: {
          name: newGroupName.trim(),
          joinCode: code,
          creator: session.userId
        },
        members: {
          [session.userId]: true
        }
      });

      // Map code to groupId
      await set(ref(database, `joinCodes/${code}`), groupId);
      // Map user to group
      await set(ref(database, `userGroups/${session.userId}/${groupId}`), true);

      setCreatedCode(code);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCodeInput.trim() || !session) return;
    setLoadingAction(true);
    try {
      const gRef = await get(ref(database, `joinCodes/${joinCodeInput.trim()}`));
      if (!gRef.exists()) {
        alert("Invalid Join Code");
        return;
      }
      const groupId = gRef.val();

      // Add membership
      await set(ref(database, `groups/${groupId}/members/${session.userId}`), true);
      await set(ref(database, `userGroups/${session.userId}/${groupId}`), true);

      setJoinGroupModal(false);
      setJoinCodeInput("");
      setSelected(groupId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  if (!session) return null;

  const filteredConvos = convos.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tagline?.toLowerCase().includes(search.toLowerCase())
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
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setJoinGroupModal(true)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Join Group"
              >
                <Key className="w-4 h-4 text-primary-100/70" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCreateGroupModal(true)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Create Group"
              >
                <Users className="w-4 h-4 text-primary-100/70" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNewContact(true)}
                className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center"
                title="New Direct Message"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
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
              className={`w-full p-3 rounded-xl text-left transition-all ${selected === convo.id
                ? "bg-accent-900/30 border border-accent-800/40"
                : "hover:bg-white/5 border border-transparent"
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl ${convo.isGroup ? 'bg-primary-500/20' : 'identicon-placeholder'} flex items-center justify-center`}>
                    {convo.isGroup ? (
                      <Users className="w-5 h-5 text-primary-300" />
                    ) : (
                      <span className="font-code font-bold text-accent-300 text-sm">
                        {convo.name[0]}
                      </span>
                    )}
                  </div>
                  {convo.online && !convo.isGroup && (
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
                const convo = convos.find(c => c.id === selected)!;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-xl ${convo.isGroup ? 'bg-primary-500/20' : 'identicon-placeholder'} flex items-center justify-center`}>
                          {convo.isGroup ? <Users className="w-4 h-4 text-primary-300" /> : <span className="font-code font-bold text-accent-300 text-sm">{convo.name[0]}</span>}
                        </div>
                        {convo.online && !convo.isGroup && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-safe border-2 border-primary-900" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-primary-100">{convo.name}</p>
                          {convo.isGroup && (
                            <span className="px-2 py-0.5 rounded-md bg-accent-500/20 text-accent-400 text-[10px] font-code">
                              CODE: {convo.joinCode}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-primary-100/40">{convo.tagline || convo.email || "Group Chat"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <EncryptionShield />
                      {!convo.isGroup && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setBurnMode(v => !v)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${burnMode
                            ? "bg-danger/20 text-danger border border-danger/30"
                            : "btn-ghost"
                            }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          {burnMode ? "Burn: ON" : "Burn After Read"}
                        </motion.button>
                      )}
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

              {messages.map((msg, i) => {
                const showSender = msg.from === "them" && convos.find(c => c.id === selected)?.isGroup;
                const prevMsg = messages[i - 1];
                const isConsecutive = showSender && prevMsg?.senderName === msg.senderName;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} gap-2`}
                  >
                    {msg.from === "them" && (
                      <div className="w-8 h-8 rounded-xl identicon-placeholder flex items-center justify-center flex-shrink-0 self-end mb-1">
                        <span className="font-code font-bold text-accent-300 text-xs">
                          {(msg.senderName || "A")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`max-w-[70%] space-y-1 ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col`}>
                      {showSender && !isConsecutive && (
                        <span className="text-[10px] text-primary-100/40 font-semibold pl-1">
                          {msg.senderName}
                        </span>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${msg.from === "me"
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
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="glass border-t border-white/5 px-4 py-3">
              {burnMode && !convos.find(c => c.id === selected)?.isGroup && (
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
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
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
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                >
                  {sending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
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
            <div className="flex gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setJoinGroupModal(true)}
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm font-bold"
              >
                <Key className="w-4 h-4" />
                Join Group
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setNewContact(true)}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                New Direct Message
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <AnimatePresence>
        {newContact && (
          <ModalWrapper onClose={() => setNewContact(false)} title="New Direct Message">
            <div className="mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">Recipient Tagline</label>
              <input
                value={newTagline}
                onChange={e => setNewTagline(e.target.value)}
                placeholder="User#1234"
                className="vault-input w-full px-4 py-3 text-sm"
              />
            </div>
            <p className="text-xs text-primary-100/30 mb-5 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-accent-500/50 flex-shrink-0" />
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
          </ModalWrapper>
        )}

        {createGroupModal && (
          <ModalWrapper onClose={() => { setCreateGroupModal(false); setCreatedCode(null); }} title="Create Encrypted Group">
            {createdCode ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-safe/20 text-safe flex items-center justify-center mx-auto mb-4">
                  <CheckCheck className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-primary-100">Group Created!</h4>
                <p className="text-sm text-primary-100/60 mb-4">Share this code with others to let them join:</p>
                <div className="glass-ultra p-4 rounded-xl text-3xl font-code tracking-[0.2em] font-bold text-accent-400 mb-6">
                  {createdCode}
                </div>
                <button
                  onClick={() => { setCreateGroupModal(false); setCreatedCode(null); }}
                  className="btn-primary w-full py-3 text-sm font-bold"
                >
                  Start Messaging
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">Group Name</label>
                  <input
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="Project Delta Operations"
                    className="vault-input w-full px-4 py-3 text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || loadingAction}
                  className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  Create & Generate Code
                </motion.button>
              </>
            )}
          </ModalWrapper>
        )}

        {joinGroupModal && (
          <ModalWrapper onClose={() => setJoinGroupModal(false)} title="Join Group">
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">6-Digit Join Code</label>
              <input
                value={joinCodeInput}
                onChange={e => setJoinCodeInput(e.target.value)}
                placeholder="000000"
                className="vault-input w-full px-4 py-3 text-center text-2xl tracking-[0.2em] font-code"
                maxLength={6}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleJoinGroup}
              disabled={joinCodeInput.length < 6 || loadingAction}
              className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Join Group
            </motion.button>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to keep modal code DRY
function ModalWrapper({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/70 backdrop-blur-sm"
      onClick={onClose}
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
          <h3 className="font-display font-bold text-lg text-primary-100">{title}</h3>
          <button onClick={onClose} className="text-primary-100/30 hover:text-primary-100/70">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}