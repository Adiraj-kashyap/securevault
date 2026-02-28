"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Timer, User, Trash2, Key, ChevronLeft, CheckCircle,
  ArrowRight, AlertTriangle, Plus, X, Clock, Shield
} from "lucide-react";
import Link from "next/link";

function CountdownRing({ percent }: { percent: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - percent / 100);
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle cx="60" cy="60" r={r} fill="none"
          stroke="rgba(var(--theme-glow-rgb),0.8)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: dash }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(var(--theme-glow-rgb),0.5))" }}
        />
      </svg>
      <div className="text-center">
        <p className="font-display font-extrabold text-2xl text-accent-500">{percent}%</p>
        <p className="text-[10px] text-primary-100/40 font-code">active</p>
      </div>
    </div>
  );
}

export default function DeadMansSwitchPage() {
  const [email, setEmail] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);
  const [contacts, setContacts] = useState(["emergency@family.com"]);
  const [newContact, setNewContact] = useState("");
  const [days, setDays] = useState(30);
  const [action, setAction] = useState<"purge" | "transfer">("transfer");

  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
        <div className="absolute inset-0 dot-bg opacity-20" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
          <Link href="/features" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Features
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 80 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-code text-accent-500/70 mb-6 border border-accent-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
            Coming Soon · Beta Access Available
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl glass-ultra border border-warn/30 flex items-center justify-center animate-float">
              <Zap className="w-10 h-10 text-warn" strokeWidth={1.2} />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-primary-100 mb-5">
            Dead Man&apos;s{" "}
            <span className="glow-text" style={{ color: "#f59e0b" }}>Switch</span>
          </h1>
          <p className="text-primary-100/50 text-lg max-w-2xl mx-auto leading-relaxed">
            If you don&apos;t check in within a defined window, your vault automatically purges,
            transfers keys, or triggers a custom secure action. True data sovereignty.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-7">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="w-5 h-5 text-warn" />
              <h2 className="font-display font-bold text-xl text-primary-100">Switch Status</h2>
            </div>
            <div className="flex flex-col items-center gap-5">
              <CountdownRing percent={74} />
              <div className="text-center">
                <p className="text-sm font-semibold text-primary-100">22 days remaining</p>
                <p className="text-xs text-primary-100/38 font-code">Next check-in: Mar 22, 2026</p>
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm w-full justify-center"
              >
                <CheckCircle className="w-4 h-4" /> Check In (Reset Timer)
              </motion.button>
              <div className="w-full p-3 rounded-xl bg-safe/8 border border-safe/18 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-safe flex-shrink-0" />
                <span className="text-xs text-safe/70 font-code">Last check-in: Feb 20, 2026 · 14:32 UTC</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-7 space-y-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-500" />
              <h2 className="font-display font-bold text-xl text-primary-100">Configuration</h2>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40 block mb-2">Inactivity Period</label>
              <div className="flex gap-2">
                {[7, 14, 30, 90].map(d => (
                  <motion.button key={d} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setDays(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${days === d ? "bg-accent-500 text-primary-900" : "glass-thin text-primary-100/50 hover:text-primary-100 border border-white/8"}`}
                  >
                    {d}d
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40 block mb-2">Trigger Action</label>
              <div className="space-y-2">
                {[
                  { id: "transfer", label: "Transfer Keys to Contact", icon: Key, desc: "Wrap private key with emergency contact's public key." },
                  { id: "purge", label: "Purge Entire Vault", icon: Trash2, desc: "Cryptographic shred — all blobs, keys, metadata gone." },
                ].map(opt => (
                  <motion.button key={opt.id} whileHover={{ scale: 1.01 }} onClick={() => setAction(opt.id as any)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all border ${action === opt.id ? "bg-accent-900/40 border-accent-800/50" : "border-white/6 glass-thin"}`}
                  >
                    <opt.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${action === opt.id ? "text-accent-500" : "text-primary-100/40"}`} />
                    <div>
                      <p className={`text-sm font-semibold ${action === opt.id ? "text-accent-300" : "text-primary-100/60"}`}>{opt.label}</p>
                      <p className="text-xs text-primary-100/35 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40 block mb-2">Emergency Contacts</label>
              <AnimatePresence>
                {contacts.map(c => (
                  <motion.div key={c} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                    className="flex items-center justify-between glass-thin rounded-lg px-3 py-2 border border-white/6 mb-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-accent-500/60" />
                      <span className="text-sm text-primary-100/70 font-code">{c}</span>
                    </div>
                    <button onClick={() => setContacts(prev => prev.filter(x => x !== c))} className="text-primary-100/20 hover:text-danger transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex gap-2 mt-2">
                <input value={newContact} onChange={e => setNewContact(e.target.value)} placeholder="Add email..." className="vault-input flex-1 px-3 py-2 text-sm rounded-xl" />
                <motion.button whileHover={{ scale: 1.04 }} onClick={() => { if (newContact) { setContacts(p => [...p, newContact]); setNewContact(""); } }} className="btn-ghost p-2 rounded-xl">
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-3 p-5 rounded-2xl bg-warn/8 border border-warn/20 mb-10">
          <AlertTriangle className="w-5 h-5 text-warn flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-warn mb-1">Irrevocable by design</p>
            <p className="text-sm text-primary-100/50 leading-relaxed">When the switch triggers, the action is immediate and cryptographically permanent. There is no undo, no recovery window, and no server-side override. Plan accordingly.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-ultra rounded-3xl p-10 text-center">
          <Zap className="w-10 h-10 text-warn mx-auto mb-4 animate-float-slow" style={{ filter: "drop-shadow(0 0 12px rgba(245,158,11,0.5))" }} />
          <h2 className="font-display font-extrabold text-3xl text-primary-100 mb-3">Join the Beta</h2>
          <p className="text-primary-100/45 mb-7 max-w-md mx-auto">Get early access to Dead Man&apos;s Switch when it launches.</p>
          {waitlisted ? (
            <div className="flex items-center justify-center gap-2 text-safe font-semibold">
              <CheckCircle className="w-5 h-5" /> You&apos;re on the list!
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="vault-input flex-1 px-4 py-3 text-sm rounded-xl" />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => { if (email) setWaitlisted(true); }} className="btn-primary flex items-center gap-2 px-6 py-3 font-bold rounded-xl whitespace-nowrap">
                Get Access <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}