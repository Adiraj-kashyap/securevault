"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, HardDrive, MessageSquare, Eye, Zap, Shield,
  Activity, Users, Globe, Key, CheckCircle, Layers,
  UploadCloud, Timer, FileKey, Database, Fingerprint,
  ArrowRight, Star
} from "lucide-react";
import Link from "next/link";

const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item: any = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90, damping: 22 } } };

type Category = "all" | "core" | "storage" | "messaging" | "security" | "soon";

interface Feature {
  icon: any; title: string; description: string;
  badge: string; category: Category;
  tags?: string[];
}

const FEATURES: Feature[] = [
  { icon: Lock, title: "Zero-Knowledge Encryption", category: "core", badge: "Core", description: "PGP-style dual encryption. Files encrypted with AES-256, keys wrapped in RSA-2048. Our servers store only ciphertext — mathematically unable to decrypt your files.", tags: ["AES-256", "RSA-2048", "Client-side"] },
  { icon: Key, title: "PBKDF2 Key Derivation", category: "core", badge: "Core", description: "Your master password feeds into PBKDF2-HMAC-SHA256 with 100,000 iterations and a random salt, producing a 256-bit AES key. Brute-force becomes computationally extreme.", tags: ["PBKDF2", "100K iterations", "SHA-256"] },
  { icon: UploadCloud, title: "Encrypted Folder Upload", category: "storage", badge: "Storage", description: "Drag entire directory hierarchies. SecureVault mirrors your folder structure inside the encrypted vault, each subfolder and file with its own unique session AES key.", tags: ["GridFS", "Chunked", "Folders"] },
  { icon: Layers, title: "3-Tier Storage Engine", category: "storage", badge: "Storage", description: "Intelligently route files to Hot (instant, MongoDB), Warm (gzip-compressed), or Cold (LZMA-archive) tiers. Each tier independently encrypted, each file AES-256.", tags: ["Hot/Warm/Cold", "Compression", "LZMA"] },
  { icon: MessageSquare, title: "E2E Encrypted Messaging", category: "messaging", badge: "Messaging", description: "Firebase-powered real-time messaging. Every message encrypted client-side with the recipient's RSA-2048 Public Key before transit. Firebase only stores ciphertext.", tags: ["Firebase RTDB", "RSA-wrapped", "Burn-after-read"] },
  { icon: Timer, title: "Burn-After-Read Messages", category: "messaging", badge: "Messaging", description: "Messages with a burn-timer are cryptographically scheduled for deletion. Once read, the Firebase node is purged — no recovery, no server-side backup.", tags: ["Firebase", "Node purge", "Auto-delete"] },
  { icon: Activity, title: "Immutable Audit Log", category: "security", badge: "Security", description: "Every access event is cryptographically signed with your key. Any modification is mathematically detectable. Know exactly who touched what, which IP, and when.", tags: ["Signed events", "Tamper-evident", "HMAC"] },
  { icon: Globe, title: "Vault Sharing", category: "core", badge: "Core", description: "Share encrypted files using recipient Public Key wrapping. The file's AES key is re-encrypted with the recipient's RSA Public Key. Zero plaintext at every stage.", tags: ["Key re-wrap", "RSA", "No plaintext"] },
  { icon: Shield, title: "Cryptographic Key Manager", category: "security", badge: "Security", description: "Export your AES-wrapped private key for offline backup, view your RSA key fingerprint, and regenerate a fresh RSA-2048 keypair at any time from the profile page.", tags: ["Key export", "Fingerprint", "Keypair regen"] },
  { icon: Fingerprint, title: "Public Key Fingerprinting", category: "security", badge: "Security", description: "Verify contacts' identities using canonical SHA-256 fingerprints of their RSA Public Keys. Humanized QR-style display makes man-in-the-middle detection simple.", tags: ["SHA-256", "QR display", "MITM protection"] },
  { icon: Eye, title: "Steganography Vaults", category: "soon", badge: "Coming Soon", description: "Hide an encrypted vault inside an innocuous image or audio file. The vault only surfaces with the correct Master Password targeting that plausible-deniability file.", tags: ["Hidden volumes", "Plausible deniability"] },
  { icon: Zap, title: "Dead Man's Switch", category: "soon", badge: "Coming Soon", description: "If you don't check in within a defined inactivity window, your vault can auto-purge, transfer keys to an emergency contact, or trigger a custom secure action.", tags: ["Inactivity timer", "Key transfer", "Auto-purge"] },
  { icon: Users, title: "Enterprise Team Vaults", category: "soon", badge: "Coming Soon", description: "Shared team vaults with role-based key distribution. Each member's access scoped individually — revoke a user's key without re-encrypting the entire vault.", tags: ["RBAC", "Team keys", "Revocation"] },
  { icon: Database, title: "MongoDB GridFS Streaming", category: "storage", badge: "Storage", description: "Encrypted files are chunked and streamed to MongoDB GridFS rather than stored as a single blob, enabling efficient range-byte delivery of very large encrypted archives.", tags: ["GridFS", "Chunked streaming", "Range-bytes"] },
  { icon: FileKey, title: "Per-File AES Session Keys", category: "core", badge: "Core", description: "Every file receives a unique cryptographically-random one-time AES-256 session key. A compromised key for one file has zero impact on any other file in the vault.", tags: ["One-time key", "AES-256-CBC", "Session key"] },
];

const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: "all", label: "All Features", color: "bg-accent-500 text-primary-900" },
  { id: "core", label: "Core Crypto", color: "bg-accent-900/40 text-accent-300 border border-accent-800/30" },
  { id: "storage", label: "Storage", color: "bg-orange-900/30 text-orange-300 border border-orange-800/20" },
  { id: "messaging", label: "Messaging", color: "bg-cyan-900/30   text-cyan-300   border border-cyan-800/20" },
  { id: "security", label: "Security", color: "bg-violet-900/30 text-violet-300 border border-violet-800/20" },
  { id: "soon", label: "Coming Soon", color: "bg-white/5 text-primary-100/48 border border-white/8" },
];

const BADGE_CLASS: Record<string, string> = {
  "Core": "feature-badge-core",
  "Storage": "feature-badge-storage",
  "Messaging": "feature-badge-messaging",
  "Security": "feature-badge-security",
  "Coming Soon": "feature-badge-soon",
};

function FeatureCard({ feature, idx }: { feature: Feature; idx: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="glass-card rounded-2xl p-6 flex flex-col group relative overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-36 h-36 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, rgba(var(--theme-glow-rgb),0.07), transparent 70%)" }} />

      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl glass-thin border border-white/8 flex items-center justify-center group-hover:border-accent-500/40 group-hover:bg-accent-900/30 transition-all duration-300">
          <Icon className="w-5 h-5 text-accent-500" />
        </div>
        <span className={`feature-badge ${BADGE_CLASS[feature.badge] ?? "feature-badge-core"}`}>
          {feature.badge}
        </span>
      </div>

      <h3 className="font-display font-bold text-base text-primary-100 mb-2 flex-shrink-0">{feature.title}</h3>
      <p className="text-primary-100/48 text-sm leading-relaxed flex-1">{feature.description}</p>

      {feature.tags && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {feature.tags.map(tag => (
            <span key={tag} className="text-[9px] font-code font-bold px-2 py-0.5 rounded border border-white/8 text-primary-100/30">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function FeaturesPage() {
  const [active, setActive] = useState<Category>("all");
  const shown = active === "all" ? FEATURES : FEATURES.filter(f => f.category === active);

  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
        <div className="absolute inset-0 dot-bg opacity-25" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-4 font-code">
            Complete Feature Breakdown
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-primary-100 mb-5">
            Everything You Need to{" "}
            <span className="text-accent-500 glow-text">Trust SecureVault</span>
          </h1>
          <p className="text-primary-100/48 text-lg max-w-xl mx-auto">
            {FEATURES.length} features engineered with zero-trust principles. Every function,
            every layer, every cryptographic operation — purpose-built for maximum privacy.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActive(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${active === cat.id ? cat.color : "text-primary-100/45 hover:text-primary-100 border border-white/8 hover:border-white/16"
                }`}
            >
              {cat.label}
              {active === cat.id && cat.id !== "all" && (
                <span className="ml-1.5 opacity-60">({shown.length})</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          key={active}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {shown.map((f, i) => <FeatureCard key={f.title} feature={f} idx={i} />)}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-ultra rounded-3xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 hex-bg opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <Star className="w-10 h-10 text-accent-500 mx-auto mb-4 animate-float-slow glow-icon" />
            <h2 className="font-display font-extrabold text-3xl text-primary-100 mb-3">
              Ready to use all of this?
            </h2>
            <p className="text-primary-100/45 mb-7 max-w-md mx-auto">
              All core features available on the free tier. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth?mode=register">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary flex items-center gap-2 px-8 py-3.5 font-bold rounded-xl"
                >
                  <Shield className="w-4 h-4" /> Create Free Vault
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="btn-ghost flex items-center gap-2 px-8 py-3.5 font-semibold rounded-xl"
                >
                  View Enterprise Plans
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}