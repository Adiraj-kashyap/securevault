"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Shield, Lock, HardDrive, Key, FileText, UploadCloud,
  MessageSquare, Eye, Zap, Globe, ArrowRight, ChevronRight,
  CheckCircle, Activity, Layers, Users
} from "lucide-react";

/* ── Animation Variants ─────────────────────────────────────── */
const container: any = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: any = {
  hidden: { y: 24, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

/* ── Sub-components ─────────────────────────────────────────── */
function FeatureCard({
  icon, title, description, badge,
}: { icon: React.ReactNode; title: string; description: string; badge?: string }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="glass-card p-6 rounded-2xl group cursor-default"
    >
      {badge && (
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent-500 bg-accent-900/40 border border-accent-800/40 rounded-full px-2.5 py-0.5 mb-4">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-xl bg-accent-900/30 border border-accent-800/30 flex items-center justify-center mb-4 group-hover:border-accent-500/40 transition-colors">
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-primary-100 mb-2">{title}</h3>
      <p className="text-primary-100/55 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div variants={item} className="text-center">
      <div className="font-display font-extrabold text-4xl md:text-5xl glow-text text-accent-500 mb-1">
        {value}
      </div>
      <div className="text-primary-100/50 text-sm">{label}</div>
    </motion.div>
  );
}

function TierCard({
  level, name, icon: Icon, color, description, speed, features,
}: {
  level: string; name: string; icon: any; color: string;
  description: string; speed: string; features: string[];
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 250 }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[40px] ${color} opacity-10`} />
      <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${color} bg-opacity-20`}>
        <Icon className="w-3.5 h-3.5" />
        Level {level}
      </div>
      <h3 className="font-display font-bold text-xl text-primary-100 mb-1">{name}</h3>
      <p className="text-primary-100/50 text-sm mb-4 leading-relaxed">{description}</p>
      <div className="text-xs font-code text-primary-100/30 mb-4">Access speed: <span className="text-accent-300">{speed}</span></div>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-primary-100/60">
            <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%",  "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1,    0]);

  return (
    <div className="relative overflow-hidden">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        {/* Decorative background rings */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.04, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              className="absolute rounded-full border border-accent-500/20"
              style={{ width: `${24 + i * 18}rem`, height: `${24 + i * 18}rem` }}
            />
          ))}
          {/* Central shield glow */}
          <div
            className="absolute w-[35rem] h-[35rem] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(var(--theme-glow-rgb),0.06) 0%, transparent 70%)" }}
          />
        </motion.div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-5xl mx-auto text-center"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Pill badge */}
            <motion.div variants={item} className="flex justify-center">
              <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-glow" />
                <span className="text-primary-100/60 font-code text-xs">AES-256 + RSA-2048 · Zero-Knowledge</span>
                <span className="text-accent-300 font-code text-xs">ACTIVE</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display font-extrabold text-5xl md:text-7xl xl:text-8xl tracking-tight leading-[0.95]"
            >
              Encrypt Everything.{" "}
              <br />
              <span className="text-accent-500 glow-text">Trust No One.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={item}
              className="text-primary-100/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
            >
              The ultimate zero-knowledge platform. Your files, folders, and messages encrypted
              with military-grade cryptography — entirely in your browser. We never see your data.
            </motion.p>

            {/* CTA Row */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/auth?mode=register">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary flex items-center gap-2.5 px-8 py-4 text-base font-bold"
                >
                  <Shield className="w-5 h-5" />
                  Enter The Vault
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/architecture">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-ghost flex items-center gap-2 px-8 py-4 text-base font-semibold"
                >
                  How It Works
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-6 pt-4">
              {[
                "Client-side only",
                "No plaintext storage",
                "Open-source crypto",
                "PBKDF2 key derivation",
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-sm text-primary-100/40">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-500/60" />
                  {t}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-primary-100/20"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-accent-500/40 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-500/40" />
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/5">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <StatCard value="AES-256" label="Encryption Standard"  />
          <StatCard value="100K+"  label="PBKDF2 Iterations"     />
          <StatCard value="3-Tier" label="Storage Architecture"  />
          <StatCard value="0"      label="Server-side Key Access" />
        </motion.div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-3 font-code">
              Platform Features
            </p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary-100 mb-4">
              Built for Maximum Privacy
            </h2>
            <p className="text-primary-100/50 text-lg max-w-xl mx-auto">
              Every feature engineered with a zero-trust mindset. If we can&apos;t read it, no one can.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <FeatureCard
              icon={<Lock className="w-6 h-6 text-accent-500" />}
              title="Zero-Knowledge Encryption"
              description="PGP-style dual encryption: files encrypted with AES-256, keys wrapped in RSA-2048. The server stores only encrypted blobs."
              badge="Core"
            />
            <FeatureCard
              icon={<HardDrive className="w-6 h-6 text-accent-500" />}
              title="3-Tier Storage Engine"
              description="Intelligently route files to Hot (instant), Warm (compressed), or Cold (archive) storage based on access patterns."
            />
            <FeatureCard
              icon={<UploadCloud className="w-6 h-6 text-accent-500" />}
              title="Folder & Bulk Upload"
              description="Drag entire folder hierarchies. SecureVault mirrors your directory structure inside the encrypted vault instantly."
            />
            <FeatureCard
              icon={<Key className="w-6 h-6 text-accent-500" />}
              title="Decentralized Keys"
              description="Your master password never leaves the browser. AES keys are PBKDF2-derived locally with 100,000 iterations."
              badge="Security"
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6 text-accent-500" />}
              title="E2E Encrypted Messaging"
              description="Firebase-powered real-time messaging. Messages encrypted client-side before transit. Burn-after-reading mode included."
            />
            <FeatureCard
              icon={<Eye className="w-6 h-6 text-accent-500" />}
              title="Steganography Vaults"
              description="Hide an encrypted vault inside an innocuous image file. The vault only surfaces with the correct Master Password."
              badge="Coming Soon"
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-accent-500" />}
              title="Immutable Audit Log"
              description="Cryptographically signed records of every access event. Know exactly who accessed what and when."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-accent-500" />}
              title="Dead Man's Switch"
              description="If you don't check in within a set window, vaults auto-purge or transfer keys to your designated emergency contact."
              badge="Coming Soon"
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-accent-500" />}
              title="Vault Sharing"
              description="Share encrypted files with other users using recipient Public Key wrapping. Zero exposure during transit."
            />
          </motion.div>
        </div>
      </section>

      {/* ── STORAGE TIERS ────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-center opacity-50" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-3 font-code">
              Storage Architecture
            </p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary-100 mb-4">
              3-Tier Encrypted Storage
            </h2>
            <p className="text-primary-100/50 text-lg max-w-xl mx-auto">
              From instant access to deep archive — every tier fully encrypted, every file fully yours.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <TierCard
              level="1"
              name="Hot Storage"
              icon={Zap}
              color="text-orange-400 bg-orange-500"
              description="Instant-access encrypted storage. No compression overhead. Ideal for passwords, small PDFs, and active files."
              speed="< 100ms"
              features={["AES-256 encrypted at rest", "No compression", "Instant streaming decrypt", "GridFS MongoDB storage"]}
            />
            <TierCard
              level="2"
              name="Warm Storage"
              icon={Layers}
              color="text-accent-400 bg-accent-500"
              description="gzip/zlib compressed then encrypted. Significant size reduction for documents and media."
              speed="~500ms — 2s"
              features={["zlib/gzip pre-compression", "AES-256 post-encrypt", "Automatic decompression", "Optimized for archives"]}
            />
            <TierCard
              level="3"
              name="Cold Archive"
              icon={HardDrive}
              color="text-cyan-400 bg-cyan-500"
              description="LZMA-compressed, AES-encrypted deep archive. Maximum density for large folders and video archives."
              speed="5s — 30s+"
              features={["LZMA ultra-compression", "AES-256 encryption", "Glacier-style retrieval", "Massive folder hierarchies"]}
            />
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-4xl mx-auto glass-ultra rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Inner glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="orb-center opacity-30" />
          </div>

          <div className="relative z-10">
            <Shield className="w-16 h-16 text-accent-500 mx-auto mb-6 animate-float" strokeWidth={1} />
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary-100 mb-4">
              Ready to Encrypt Everything?
            </h2>
            <p className="text-primary-100/50 text-lg mb-10 max-w-lg mx-auto">
              Join thousands securing their most sensitive data with zero-knowledge architecture.
              Your keys, your vault, your rules.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=register">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary flex items-center gap-2 px-10 py-4 text-base font-bold"
                >
                  Create Your Vault
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="btn-ghost flex items-center gap-2 px-10 py-4 text-base font-semibold"
                >
                  <Users className="w-5 h-5" />
                  Enterprise Plans
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}