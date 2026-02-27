"use client";

import { motion } from "framer-motion";
import { Shield, Lock, HardDrive, Key, MessageSquare, Eye, Activity, Zap, Globe, Flame, Clock, Users } from "lucide-react";
import Link from "next/link";

const container: any = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.07}} };
const item: any = { hidden:{y:20,opacity:0}, show:{y:0,opacity:1,transition:{type:"spring",stiffness:100}} };

const FEATURES = [
  {
    icon: Lock, title: "Zero-Knowledge AES-256",
    desc: "Every file is encrypted with a unique one-time AES-256 session key generated fresh in your browser. The server never sees the plaintext, never sees the AES key. Only ciphertext arrives at our storage layer.",
    badge: "Core · Always On",
  },
  {
    icon: Key, title: "RSA-2048 Key Wrapping",
    desc: "The per-file AES key is encrypted using the recipient's RSA-2048 Public Key. This creates a PGP-style dual-encryption loop: breaking one layer still leaves the other intact.",
    badge: "Core · Always On",
  },
  {
    icon: Shield, title: "PBKDF2 Key Derivation",
    desc: "Your Master Password never transmits. Instead, PBKDF2 with 100,000 iterations and a random salt derives the AES decryption key locally. Brute-force cost is extreme by design.",
    badge: "Core · Always On",
  },
  {
    icon: HardDrive, title: "3-Tier Storage Engine",
    desc: "Hot (no compression, instant), Warm (gzip/zlib pre-compression), and Cold (LZMA ultra-archive) tiers allow users to balance access speed against storage density — all still fully encrypted.",
    badge: "Storage",
  },
  {
    icon: MessageSquare, title: "E2E Encrypted Messaging",
    desc: "Firebase Realtime Database powers instant delivery. Messages are encrypted client-side with the recipient's Public Key before being transmitted. Firebase sees only ciphertext.",
    badge: "Messaging",
  },
  {
    icon: Flame, title: "Burn-After-Reading",
    desc: "Set any message to self-destruct immediately after the recipient's client decrypts it. The Firebase node is purged the moment decryption occurs. No trace remains.",
    badge: "Messaging",
  },
  {
    icon: Eye, title: "Steganography (Hidden Vaults)",
    desc: "Advanced mode: embed an entire encrypted vault inside a standard image file using steganographic techniques. The vault surface only with the correct Master Password targeting that exact file. Plausible deniability by design.",
    badge: "Coming Soon",
  },
  {
    icon: Clock, title: "Dead Man's Switch",
    desc: "Configure an inactivity timeout. If you don't check in within the window, SecureVault will either auto-purge your encrypted blobs or transfer decryption authority to a designated emergency contact.",
    badge: "Coming Soon",
  },
  {
    icon: Activity, title: "Immutable Audit Log",
    desc: "Every vault access, upload, download, and key use is cryptographically signed and logged. Logs are tamper-evident: any modification is detectable. Know exactly who touched what, when.",
    badge: "Security",
  },
  {
    icon: Globe, title: "Vault Sharing",
    desc: "Share encrypted files with any other SecureVault user. The system fetches their Public Key and re-wraps the AES session key for their RSA pair. Zero plaintext at any stage of the transfer.",
    badge: "Collaboration",
  },
  {
    icon: Users, title: "Enterprise Team Vaults",
    desc: "Shared organizational vaults with hierarchical key management. Admins hold master re-encryption authority. Perfect for legal, financial, and healthcare teams requiring compliance-grade privacy.",
    badge: "Enterprise",
  },
  {
    icon: Zap, title: "Instant Folder Encryption",
    desc: "Drag entire directory trees. SecureVault traverses, encrypts each file individually with a unique AES key, and mirrors your exact folder structure inside the encrypted vault — instantly.",
    badge: "Storage",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-3 font-code">
            Full Feature Overview
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-primary-100 mb-4">
            Every Feature, <span className="text-accent-500 glow-text">Every Layer</span>
          </h1>
          <p className="text-primary-100/50 text-lg max-w-2xl mx-auto">
            SecureVault is not a simple file locker. It is a complete cryptographic ecosystem.
            Here is a full breakdown of every capability — current and upcoming.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map(({ icon: Icon, title, desc, badge }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="glass-card rounded-2xl p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-accent-900/30 border border-accent-800/30 flex items-center justify-center group-hover:border-accent-500/40 transition-colors">
                  <Icon className="w-5 h-5 text-accent-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-500/60 bg-accent-900/30 border border-accent-800/30 rounded-full px-2.5 py-1">
                  {badge}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-primary-100 mb-2">{title}</h3>
              <p className="text-primary-100/50 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link href="/auth?mode=register">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2 px-10 py-4 text-base font-bold mx-auto"
            >
              <Shield className="w-5 h-5" />
              Start With All Features Free
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}