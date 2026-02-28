"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, Lock, HardDrive, Key, FileText, UploadCloud,
  MessageSquare, Eye, Zap, Globe, ArrowRight, ChevronRight,
  CheckCircle, Activity, Layers, Users, Terminal, Cpu,
  Database, Code2, Fingerprint, RefreshCw
} from "lucide-react";
import { TransitionLink } from "./VaultTransition";

/* ── Animation Variants ─────────────────────────────────────── */
const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: any = {
  hidden: { y: 28, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90, damping: 20 } },
};

/* ── Hex Grid Background ────────────────────────────────────── */
function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hexgrid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon
              points="30,1 56,15 56,43 30,57 4,43 4,15"
              fill="none"
              stroke="rgba(var(--theme-glow-rgb),1)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexgrid)" />
      </svg>
      {/* Radial fade to hide hard edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, var(--color-primary-900) 80%)"
        }}
      />
    </div>
  );
}

/* ── Live Encryption Counter ────────────────────────────────── */
function LiveCounter({ label, value, prefix = "" }: { label: string; value: string; prefix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="text-center"
    >
      <div className="font-display font-extrabold text-3xl md:text-4xl xl:text-5xl glow-text text-accent-500 mb-1">
        {prefix}{value}
      </div>
      <div className="text-primary-100/45 text-xs uppercase tracking-widest font-code">{label}</div>
    </motion.div>
  );
}

/* ── Feature Card (badge + title always above icon) ─────────── */
const FEATURE_CARDS = [
  { icon: Lock, title: "Zero-Knowledge Encryption", badge: "Core", badgeClass: "feature-badge-core", description: "PGP-style dual encryption: files encrypted with AES-256, keys wrapped in RSA-2048. The server stores only encrypted blobs — never plaintext." },
  { icon: HardDrive, title: "3-Tier Storage Engine", badge: "Storage", badgeClass: "feature-badge-storage", description: "Intelligently route files to Hot (instant), Warm (compressed), or Cold (archive) storage based on your access patterns and size requirements." },
  { icon: UploadCloud, title: "Folder & Bulk Upload", badge: "Storage", badgeClass: "feature-badge-storage", description: "Drag entire folder hierarchies. SecureVault mirrors your directory structure inside the encrypted vault, each file with its own unique AES key." },
  { icon: Key, title: "Decentralized Keys", badge: "Core", badgeClass: "feature-badge-core", description: "Your master password never leaves the browser. AES keys PBKDF2-derived locally with 100,000 iterations. Brute-force cost is extreme by design." },
  { icon: MessageSquare, title: "E2E Encrypted Messaging", badge: "Messaging", badgeClass: "feature-badge-messaging", description: "Firebase-powered real-time messaging. Messages encrypted client-side with the recipient's Public Key before transit. Firebase sees only ciphertext." },
  { icon: Eye, title: "Steganography Vaults", badge: "Coming Soon", badgeClass: "feature-badge-soon", description: "Hide an encrypted vault inside an innocuous image. The vault only surfaces with the correct Master Password targeting that specific file." },
  { icon: Activity, title: "Immutable Audit Log", badge: "Security", badgeClass: "feature-badge-security", description: "Cryptographically signed records of every access event. Any modification is mathematically detectable — know exactly who touched what, when." },
  { icon: Zap, title: "Dead Man's Switch", badge: "Coming Soon", badgeClass: "feature-badge-soon", description: "If you don't check in within a set window, vaults auto-purge or transfer keys to your designated emergency contact. True data sovereignty." },
  { icon: Globe, title: "Vault Sharing", badge: "Core", badgeClass: "feature-badge-core", description: "Share encrypted files with other users using recipient Public Key wrapping. Zero plaintext exposure at any stage of the transfer." },
];

function FeatureCard({ data }: { data: typeof FEATURE_CARDS[number] }) {
  const Icon = data.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-2xl group cursor-default relative overflow-hidden flex flex-col h-full"
    >
      {/* Corner glow on hover */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, rgba(var(--theme-glow-rgb),0.08), transparent 70%)" }}
      />
      {/* 1. Badge — always present */}
      <span className={`inline-block feature-badge mb-3 self-start ${data.badgeClass}`}>
        {data.badge}
      </span>
      {/* 2. Title */}
      <h3 className="font-display font-bold text-lg text-primary-100 mb-4 leading-snug">{data.title}</h3>
      {/* 3. Icon */}
      <div className="w-11 h-11 rounded-xl bg-accent-900/30 border border-accent-800/30 flex items-center justify-center mb-4 group-hover:border-accent-500/50 group-hover:bg-accent-900/50 transition-all duration-300 flex-shrink-0">
        <Icon className="w-5 h-5 text-accent-500" />
      </div>
      {/* 4. Description */}
      <p className="text-primary-100/50 text-sm leading-relaxed flex-1">{data.description}</p>
    </motion.div>
  );
}

/* ── Feature Carousel ───────────────────────────────────────── */
function FeatureCarousel() {
  const [page, setPage] = useState(0);
  const PER_PAGE = 3;
  const totalPages = Math.ceil(FEATURE_CARDS.length / PER_PAGE);
  const slice = FEATURE_CARDS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {slice.map((card) => (
          <FeatureCard key={card.title} data={card} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5">
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="w-10 h-10 rounded-xl btn-ghost flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </motion.button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setPage(i)}
              animate={{ width: i === page ? 24 : 8, opacity: i === page ? 1 : 0.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`h-2 rounded-full transition-colors ${i === page ? "bg-accent-500" : "bg-primary-100/25"}`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="w-10 h-10 rounded-xl btn-ghost flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Page label */}
      <p className="text-center text-xs text-primary-100/25 font-code mt-3">
        {page * PER_PAGE + 1}–{Math.min(page * PER_PAGE + PER_PAGE, FEATURE_CARDS.length)} of {FEATURE_CARDS.length} features
      </p>
    </div>
  );
}

/* ── Storage Tier Card ──────────────────────────────────────── */
function TierCard({
  level, name, icon: Icon, color, description, speed, features, latencyMs,
}: {
  level: string; name: string; icon: any; color: string;
  description: string; speed: string; features: string[]; latencyMs: number;
}) {
  const max = 30000;
  const pct = Math.min((latencyMs / max) * 100, 100);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 250 }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-28 h-28 rounded-bl-[48px] ${color} opacity-[0.08] group-hover:opacity-[0.14] transition-opacity`} />

      <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border feature-badge`}
        style={{ color: "inherit" }}
      >
        <Icon className="w-3.5 h-3.5" />
        Level {level}
      </div>

      <h3 className="font-display font-bold text-xl text-primary-100 mb-2">{name}</h3>
      <p className="text-primary-100/48 text-sm mb-5 leading-relaxed">{description}</p>

      {/* Latency bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-primary-100/30 font-code uppercase tracking-widest">Access Latency</span>
          <span className="text-xs font-code text-accent-300">{speed}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className={`h-full rounded-full ${color.includes("orange") ? "bg-orange-500" : color.includes("cyan") ? "bg-cyan-500" : "bg-accent-500"}`}
          />
        </div>
      </div>

      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-primary-100/55">
            <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── Floating Security Badge ────────────────────────────────── */
function SecurityBadge({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 120 }}
      className="flex items-center gap-1.5 text-xs text-primary-100/40"
    >
      <CheckCircle className="w-3.5 h-3.5 text-accent-500/60 flex-shrink-0" />
      {label}
    </motion.div>
  );
}

/* ── Terminal Widget ────────────────────────────────────────── */
function TerminalWidget() {
  const lines = [
    { prefix: "$", text: "securevault --init-vault", color: "text-accent-500" },
    { prefix: "→", text: "Generating RSA-2048 keypair...", color: "text-primary-100/50" },
    { prefix: "→", text: "Deriving AES-256 key (PBKDF2 ×100K)...", color: "text-primary-100/50" },
    { prefix: "✓", text: "Vault initialized. Zero-knowledge.", color: "text-safe" },
  ];
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines(v => {
        if (v >= lines.length) { clearInterval(timer); return v; }
        return v + 1;
      });
    }, 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="glass-card rounded-2xl overflow-hidden border border-accent-900/40 max-w-lg mx-auto"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-primary-800/30">
        <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warn/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-safe/60" />
        <span className="text-primary-100/25 text-xs font-code ml-2">securevault_cli</span>
      </div>
      {/* Content */}
      <div className="p-4 space-y-2 min-h-[120px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 font-code text-sm"
          >
            <span className={`${line.color} flex-shrink-0`}>{line.prefix}</span>
            <span className="text-primary-100/70">{line.text}</span>
          </motion.div>
        ))}
        {visibleLines < lines.length && (
          <div className="flex items-center gap-2 font-code text-sm">
            <span className="text-accent-500">$</span>
            <span className="w-2 h-4 bg-accent-500/70 animate-blink rounded-sm" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <div className="relative overflow-hidden">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden"
      >
        {/* Hex grid background */}
        <HexGrid />

        {/* Ambient orb layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-hero" />
          {/* Pulsing rings */}
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.06, 1],
                opacity: [0.04, 0.1, 0.04],
              }}
              transition={{
                duration: 3.5 + i * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
              className="absolute rounded-full border border-accent-500/20"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${18 + i * 14}rem`,
                height: `${18 + i * 14}rem`,
              }}
            />
          ))}
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-5xl mx-auto text-center"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7"
          >
            {/* Live status pill */}
            <motion.div variants={item} className="flex justify-center">
              <div className="glass inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm border border-white/8">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
                </div>
                <span className="text-primary-100/50 font-code text-xs">AES-256 + RSA-2048</span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-accent-300 font-code text-xs font-bold">ZERO-KNOWLEDGE ACTIVE</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display font-extrabold text-5xl md:text-7xl xl:text-[88px] tracking-tight leading-[0.93]"
            >
              Encrypt Everything.{" "}
              <br />
              <span className="text-accent-500 glow-text">Trust No One.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={item}
              className="text-primary-100/55 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
            >
              The ultimate zero-knowledge platform. Your files, folders, and messages are
              encrypted with military-grade cryptography —{" "}
              <span className="text-primary-100/80 font-medium">entirely in your browser.</span>{" "}
              We never see your data.
            </motion.p>

            {/* CTA Row */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <TransitionLink href="/auth?mode=register">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary flex items-center gap-2.5 px-9 py-4 text-base font-bold rounded-xl"
                >
                  <Shield className="w-5 h-5" />
                  Enter The Vault
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </TransitionLink>
              <TransitionLink href="/architecture">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-ghost flex items-center gap-2 px-9 py-4 text-base font-semibold rounded-xl"
                >
                  <Terminal className="w-4 h-4" />
                  How It Works
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </TransitionLink>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2">
              {[
                { label: "Client-side only", delay: 0 },
                { label: "No plaintext storage", delay: 0.1 },
                { label: "Open-source crypto", delay: 0.2 },
                { label: "PBKDF2 key derivation", delay: 0.3 },
              ].map(({ label, delay }) => (
                <SecurityBadge key={label} label={label} delay={delay} />
              ))}
            </motion.div>

            {/* Terminal widget */}
            <motion.div variants={item} className="pt-4">
              <TerminalWidget />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-primary-100/20"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-accent-500/40 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-500/40" />
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-y border-white/5 relative">
        <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10"
        >
          <LiveCounter value="AES-256" label="Encryption Standard" />
          <LiveCounter value="100K+" label="PBKDF2 Iterations" />
          <LiveCounter value="3-Tier" label="Storage Architecture" />
          <LiveCounter value="0" label="Server-side Key Access" />
        </motion.div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-top-left opacity-60" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-18"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-4 font-code">
              Platform Features
            </p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl xl:text-6xl text-primary-100 mb-5">
              Built for{" "}
              <span className="text-accent-500 glow-text-subtle">Maximum Privacy</span>
            </h2>
            <p className="text-primary-100/48 text-lg max-w-xl mx-auto">
              Every feature engineered with a zero-trust mindset. If we can&apos;t read it, no one can.
            </p>
          </motion.div>

          {/* 3-card carousel */}
          <FeatureCarousel />

          {/* View all features link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/features">
              <motion.button
                whileHover={{ scale: 1.03 }}
                className="btn-ghost flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl mx-auto"
              >
                View All {FEATURE_CARDS.length} Features
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-center opacity-40" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-4 font-code">
              The PGP Cycle
            </p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary-100 mb-5">
              How Zero-Knowledge{" "}
              <span className="text-accent-500 glow-text-subtle">Actually Works</span>
            </h2>
            <p className="text-primary-100/48 text-lg max-w-xl mx-auto">
              Every file upload triggers this exact sequence — entirely inside your browser.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { num: "01", icon: Cpu, title: "AES Key Generated", desc: "Browser generates a cryptographically random one-time AES-256 session key for this specific file.", color: "text-orange-400" },
              { num: "02", icon: Lock, title: "File Encrypted", desc: "The raw file is encrypted in-browser with the AES-256 key. Only ciphertext leaves your machine.", color: "text-accent-400" },
              { num: "03", icon: Key, title: "Key Wrapped (RSA)", desc: "The AES session key is encrypted with the recipient's RSA-2048 Public Key. Plaintext key discarded.", color: "text-violet-400" },
              { num: "04", icon: Globe, title: "Secure Transit", desc: "Encrypted blob + wrapped AES key transmitted over TLS. Server receives only ciphertext.", color: "text-cyan-400" },
              { num: "05", icon: Database, title: "Stored as Blob", desc: "MongoDB GridFS stores only: encrypted blob + encrypted key. No plaintext. No server-side keys.", color: "text-secondary-300" },
              { num: "06", icon: Fingerprint, title: "Decryption (Local)", desc: "Recipient derives AES key via PBKDF2, decrypts RSA Private Key, unwraps AES key, decrypts file.", color: "text-safe" },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-5 relative"
              >
                <div className="absolute -top-3 -left-3">
                  <div className="step-badge">{step.num}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-current/10 ${step.color}`}
                  style={{ background: "rgba(var(--theme-glow-rgb), 0.08)" }}
                >
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <h3 className="font-display font-bold text-base text-primary-100 mb-1.5">{step.title}</h3>
                <p className="text-primary-100/48 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Flow diagram */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 glass-ultra rounded-2xl p-5 overflow-x-auto"
          >
            <div className="flex items-center gap-2 min-w-max mx-auto w-fit text-xs font-code">
              {[
                { label: "Browser", bg: "bg-accent-500", text: "text-primary-900" },
                null,
                { label: "AES-256", bg: "bg-orange-500", text: "text-primary-900" },
                null,
                { label: "RSA-2048 Wrap", bg: "bg-violet-500", text: "text-white" },
                null,
                { label: "TLS Transit", bg: "bg-secondary-500", text: "text-primary-100" },
                null,
                { label: "MongoDB GridFS", bg: "bg-cyan-600", text: "text-white" },
              ].map((it, i) =>
                it === null ? (
                  <ArrowRight key={i} className="w-4 h-4 text-primary-100/20 flex-shrink-0" />
                ) : (
                  <span key={i} className={`px-3 py-1.5 rounded-lg font-bold ${it.bg} ${it.text}`}>
                    {it.label}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STORAGE TIERS ────────────────────────────────────── */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-bottom-right opacity-60" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-4 font-code">
              Storage Architecture
            </p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary-100 mb-5">
              3-Tier Encrypted Storage
            </h2>
            <p className="text-primary-100/48 text-lg max-w-xl mx-auto">
              From instant access to deep archive — every tier fully encrypted, every file fully yours.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <TierCard
              level="1"
              name="Hot Storage"
              icon={Zap}
              color="text-orange-400 bg-orange-500"
              description="Instant-access encrypted storage. No compression overhead. Ideal for passwords, small PDFs, and your most-accessed files."
              speed="< 100ms"
              latencyMs={100}
              features={["AES-256 encrypted at rest", "No compression overhead", "Instant streaming decrypt", "GridFS MongoDB storage"]}
            />
            <TierCard
              level="2"
              name="Warm Storage"
              icon={Layers}
              color="text-accent-400 bg-accent-500"
              description="gzip/zlib compressed then AES encrypted. Significant size reduction for documents, archives, and older media files."
              speed="~500ms — 2s"
              latencyMs={1250}
              features={["zlib/gzip pre-compression", "AES-256 post-encrypt", "Automatic decompression", "Optimized for archives"]}
            />
            <TierCard
              level="3"
              name="Cold Archive"
              icon={HardDrive}
              color="text-cyan-400 bg-cyan-500"
              description="LZMA-compressed, AES-encrypted deep archive. Maximum density for large folders, video archives, and compliance backups."
              speed="5s — 30s+"
              latencyMs={17500}
              features={["LZMA ultra-compression", "AES-256 encryption", "Glacier-style retrieval", "Massive folder hierarchies"]}
            />
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Code2, title: "Open Crypto", desc: "node-forge + crypto-js" },
              { icon: RefreshCw, title: "PBKDF2 100K+", desc: "Key stretching iterations" },
              { icon: Shield, title: "RSA-2048", desc: "Asymmetric key wrapping" },
              { icon: Lock, title: "AES-256-CBC", desc: "File-level encryption" },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-5 text-center"
              >
                <Icon className="w-6 h-6 text-accent-500 mx-auto mb-3 glow-icon" />
                <p className="font-display font-bold text-sm text-primary-100">{title}</p>
                <p className="text-[11px] text-primary-100/35 font-code mt-1">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 90 }}
          className="max-w-4xl mx-auto glass-ultra rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Inner glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="orb-center opacity-30" />
            <div className="absolute inset-0 hex-bg opacity-30" />
          </div>

          <div className="relative z-10">
            <motion.div
              animate={{ filter: ["drop-shadow(0 0 10px rgba(var(--theme-glow-rgb),0.3))", "drop-shadow(0 0 30px rgba(var(--theme-glow-rgb),0.7))", "drop-shadow(0 0 10px rgba(var(--theme-glow-rgb),0.3))"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield className="w-16 h-16 text-accent-500 mx-auto mb-7 animate-float" strokeWidth={1.2} />
            </motion.div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl xl:text-6xl text-primary-100 mb-5">
              Ready to Encrypt Everything?
            </h2>
            <p className="text-primary-100/48 text-lg mb-10 max-w-lg mx-auto">
              Join thousands securing their most sensitive data with zero-knowledge architecture.
              Your keys, your vault, your rules — always.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary flex items-center gap-2.5 px-10 py-4 text-base font-bold rounded-xl"
                >
                  <Shield className="w-5 h-5" />
                  Create Your Vault — Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="btn-ghost flex items-center gap-2.5 px-10 py-4 text-base font-semibold rounded-xl"
                >
                  <Users className="w-5 h-5" />
                  Enterprise Plans
                </motion.button>
              </Link>
            </div>
            <p className="mt-8 text-primary-100/25 text-xs font-code">
              No credit card required · All encryption client-side · Cancel anytime
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}