"use client";

import { motion } from "framer-motion";
import { Clock, Shield, AlertTriangle, ChevronLeft, Zap, UserX, Mail, Trash2, Lock } from "lucide-react";
import Link from "next/link";

export default function DeadMansSwitchPage() {
  return (
    <div className="min-h-screen px-4 py-16 max-w-3xl mx-auto relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left opacity-50" />
        <div className="orb-bottom-right opacity-30" />
      </div>

      <div className="relative z-10">
        <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Vault
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity:0, y:-10 }}
          animate={{ opacity:1, y:0 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-bold text-accent-300">
            <Zap className="w-4 h-4 text-accent-500" />
            Feature in Development · Vault Pro
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate:[0, -5, 5, 0] }}
              transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
              className="w-24 h-24 rounded-3xl glass-ultra flex items-center justify-center"
            >
              <Clock className="w-12 h-12 text-accent-500/70" strokeWidth={1} />
            </motion.div>
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-primary-100 mb-4">
            Dead Man&apos;s <span className="text-accent-500 glow-text">Switch</span>
          </h1>
          <p className="text-primary-100/50 text-lg max-w-xl mx-auto">
            Configure an inactivity protocol. If you don't check in, your vault
            either self-destructs or transfers access to your trusted contact.
          </p>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <div className="glass-card rounded-2xl p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-danger/20 border border-danger/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="font-display font-bold text-primary-100">Auto-Purge Mode</h3>
                <p className="text-xs text-primary-100/40">Destroy all encrypted blobs on trigger</p>
              </div>
            </div>
            <p className="text-sm text-primary-100/50">
              After X days of no activity, all encrypted files are securely wiped from MongoDB.
              Cryptographic keys are overwritten. Your data becomes irretrievably gone.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-900/30 border border-accent-800/40 flex items-center justify-center">
                <UserX className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-primary-100">Key Transfer Mode</h3>
                <p className="text-xs text-primary-100/40">Transfer vault access to a trusted contact</p>
              </div>
            </div>
            <p className="text-sm text-primary-100/50">
              Designate a trusted contact. On trigger, a re-encryption ceremony wraps your vault&apos;s
              AES keys with their RSA Public Key. They receive access; you&apos;re removed.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-900/30 border border-violet-800/40 flex items-center justify-center">
                <Mail className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-primary-100">Deadletter Message Mode</h3>
                <p className="text-xs text-primary-100/40">Send pre-written encrypted messages on trigger</p>
              </div>
            </div>
            <p className="text-sm text-primary-100/50">
              Compose encrypted messages to be delivered to named contacts only on switch trigger.
              Useful for final instructions, will notifications, or secure information disclosure.
            </p>
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay: 0.35 }}
          className="flex gap-3 p-4 rounded-xl bg-amber-900/10 border border-amber-800/20 mb-8"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/60">
            This feature requires extremely careful configuration. A misconfigured trigger can result in
            permanent, irrecoverable data loss. Test thoroughly before enabling on critical data.
          </p>
        </motion.div>

        <div className="text-center">
          <button
            disabled
            className="btn-primary px-8 py-4 text-sm font-bold opacity-40 cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <Lock className="w-4 h-4" />
            Available in Vault Pro — Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}