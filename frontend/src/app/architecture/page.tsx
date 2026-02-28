"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Key, HardDrive, Database, Zap, ArrowRight, Server, Globe, FileKey, ChevronLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";

const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item: any = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

function FlowStep({ num, icon: Icon, title, desc, color }: {
  num: string; icon: any; title: string; desc: string; color: string;
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-2xl p-5 relative"
    >
      <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary-800 border border-accent-800/50 flex items-center justify-center">
        <span className="font-code text-xs font-bold text-accent-500">{num}</span>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-display font-bold text-base text-primary-100 mb-1">{title}</h3>
      <p className="text-primary-100/50 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StackBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3">
      <div className="w-2 h-8 rounded-full bg-accent-500 glow-border" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-100/30">{label}</p>
        <p className="text-sm font-semibold text-primary-100">{value}</p>
      </div>
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back nav */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-3 font-code">
            Technical Deep Dive
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-primary-100 mb-4">
            Zero-Knowledge <span className="text-accent-500 glow-text">Architecture</span>
          </h1>
          <p className="text-primary-100/50 text-lg max-w-2xl mx-auto">
            A complete breakdown of the cryptographic engine that ensures SecureVault
            never has — and never can have — access to your plaintext data.
          </p>
        </motion.div>

        {/* Crypto Flow */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16"
        >
          <h2 className="font-display font-bold text-2xl text-primary-100 mb-2">
            The PGP Encryption Cycle
          </h2>
          <p className="text-primary-100/40 text-sm mb-8">
            Every file upload triggers this exact sequence — entirely in your browser.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FlowStep num="01" icon={FileKey} title="AES Key Generation" desc="Browser generates a cryptographically random one-time AES-256 session key for this specific file upload." color="bg-orange-900/30 text-orange-400" />
            <FlowStep num="02" icon={Lock} title="File Encryption" desc="The raw file is encrypted using the AES-256 session key via CBC mode. Only ciphertext leaves the browser." color="bg-accent-900/30 text-accent-400" />
            <FlowStep num="03" icon={Key} title="Key Wrapping" desc="The AES key is encrypted using the recipient's RSA-2048 Public Key. The plaintext AES key is discarded from memory." color="bg-violet-900/30 text-violet-400" />
            <FlowStep num="04" icon={Globe} title="Secure Transmission" desc="The encrypted file blob and RSA-wrapped AES key are transmitted to MongoDB GridFS. No plaintext involved." color="bg-cyan-900/30 text-cyan-400" />
            <FlowStep num="05" icon={Shield} title="Server Storage" desc="MongoDB stores only two things: the encrypted blob and the encrypted AES key. No plaintext. No server-side keys." color="bg-secondary-800/50 text-secondary-300" />
            <FlowStep num="06" icon={Lock} title="Decryption (Local)" desc="Recipient derives their AES key from Master Password via PBKDF2, decrypts their RSA Private Key, unwraps the AES key, decrypts the file." color="bg-safe/20 text-safe" />
          </div>

          {/* Flow diagram */}
          <motion.div
            variants={item}
            className="glass-ultra rounded-2xl p-6 overflow-x-auto"
          >
            <div className="flex items-center gap-2 min-w-max mx-auto w-fit">
              {[
                { label: "Browser", color: "bg-accent-500" },
                { icon: ArrowRight },
                { label: "AES-256 Encrypt", color: "bg-orange-500" },
                { icon: ArrowRight },
                { label: "RSA-2048 Wrap", color: "bg-violet-500" },
                { icon: ArrowRight },
                { label: "Transit (TLS)", color: "bg-secondary-500" },
                { icon: ArrowRight },
                { label: "MongoDB GridFS", color: "bg-cyan-500" },
              ].map((item: any, i) => {
                if (item.icon) {
                  const Icon = item.icon;
                  return <Icon key={i} className="w-4 h-4 text-primary-100/30" />;
                }
                return <div key={i} className={`px-4 py-2 rounded-xl text-xs font-bold font-code text-primary-900 ${item.color}`}>{item.label}</div>;
              })}
            </div>
          </motion.div>
        </motion.section>

        {/* Key Derivation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="glass-card rounded-2xl p-8">
            <h2 className="font-display font-bold text-2xl text-primary-100 mb-2">
              Master Password → AES Key Derivation
            </h2>
            <p className="text-primary-100/40 text-sm mb-6">
              Your password never leaves the browser. Ever.
            </p>
            <div className="relative">
              <div className="space-y-3">
                {[
                  { label: "Input", value: "Master Password (string) + Random Salt (128-bit)", color: "bg-accent-900/30 border-accent-800/30 text-accent-300" },
                  { label: "Algorithm", value: "PBKDF2-HMAC-SHA256 · 100,000 iterations", color: "bg-orange-900/20 border-orange-800/20 text-orange-300" },
                  { label: "Output", value: "256-bit AES Decryption Key (in-memory only)", color: "bg-safe/10 border-safe/20 text-safe" },
                  { label: "Usage", value: "Decrypt Encrypted RSA Private Key from server", color: "bg-violet-900/20 border-violet-800/20 text-violet-300" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`flex items-center gap-4 p-3 rounded-xl border ${color}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest w-20 flex-shrink-0 opacity-60">{label}</span>
                    <span className="font-code text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 p-3 rounded-xl bg-amber-900/10 border border-amber-800/20">
              <p className="text-xs text-amber-200/60 font-code">
                ⚠ The derived key exists only in React state (SessionContext). A page refresh clears it. This is intentional — your decrypted key should never persist on disk.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tech stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-display font-bold text-2xl text-primary-100 mb-6">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StackBadge label="Frontend" value="Next.js 14 + TypeScript" />
            <StackBadge label="Crypto Engine" value="node-forge + crypto-js" />
            <StackBadge label="Styling" value="Tailwind CSS v4 + Framer" />
            <StackBadge label="Backend API" value="Node.js + Express" />
            <StackBadge label="Primary DB" value="MongoDB + GridFS" />
            <StackBadge label="Realtime DB" value="Firebase RTDB" />
          </div>
        </motion.section>

        {/* Hybrid DB */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-accent-500" />
                <div>
                  <h3 className="font-display font-bold text-lg text-primary-100">MongoDB (Heavy Lifting)</h3>
                  <p className="text-xs text-primary-100/40">Persistent storage layer</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-primary-100/60">
                {["User metadata + encrypted RSA key pairs", "Chunked encrypted blob streaming (GridFS)", "Folder hierarchy structure", "Access log records (signed)"].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-orange-400" />
                <div>
                  <h3 className="font-display font-bold text-lg text-primary-100">Firebase (Real-Time)</h3>
                  <p className="text-xs text-primary-100/40">Messaging layer</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-primary-100/60">
                {["Encrypted message nodes (ciphertext only)", "WebSocket push for instant delivery", "Burn-after-read node purging", "Presence and typing indicators"].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      </div>

      {/* CTA block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center glass-ultra rounded-2xl p-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-bg opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <Shield className="w-10 h-10 text-accent-500 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-display font-extrabold text-3xl text-primary-100 mb-3">
            Ready to encrypt your world?
          </h2>
          <p className="text-primary-100/50 text-base mb-6 max-w-lg mx-auto">
            Everything described on this page is running right now. Your vault is one click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-2 px-7 py-3 rounded-xl font-bold"
              >
                Open Secure Vault <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/features">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn-ghost flex items-center gap-2 px-7 py-3 rounded-xl"
              >
                Explore All Features
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}