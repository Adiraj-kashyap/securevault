"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, Image, Upload, Shield, Lock, ChevronLeft, CheckCircle,
  ArrowRight, Info, Layers, AlertTriangle
} from "lucide-react";
import Link from "next/link";

function HowItWorksStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="step-badge flex-shrink-0">{num}</div>
      <div>
        <h3 className="font-display font-bold text-sm text-primary-100 mb-1">{title}</h3>
        <p className="text-sm text-primary-100/45 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function SteganographyPage() {
  const [demoStep, setDemoStep] = useState<"idle" | "uploading" | "encoding" | "done">("idle");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const runDemo = () => {
    setDemoStep("uploading");
    setTimeout(() => setDemoStep("encoding"), 1200);
    setTimeout(() => setDemoStep("done"), 2800);
    setTimeout(() => setDemoStep("idle"), 5000);
  };

  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
        <div className="absolute inset-0 grid-bg opacity-20" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
          <Link href="/features" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Features
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 80 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-code text-accent-500/70 mb-6 border border-accent-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
            Coming Soon · Beta Access Available
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl glass-ultra border border-accent-800/40 flex items-center justify-center animate-float">
              <Eye className="w-10 h-10 text-accent-500" strokeWidth={1.2} />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-primary-100 mb-5">
            Steganography{" "}
            <span className="text-accent-500 glow-text">Vaults</span>
          </h1>
          <p className="text-primary-100/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Hide an encrypted vault inside an ordinary image. To any observer, the file looks like a JPEG.
            With the correct Master Password, a full SecureVault surfaces inside.
          </p>
        </motion.div>

        {/* Grid: how it works + demo */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-7">
            <h2 className="font-display font-bold text-xl text-primary-100 mb-6">How It Works</h2>
            <div className="space-y-5">
              <HowItWorksStep num="01" title="Vault lives in image data" desc="Your encrypted vault is embedded in the least-significant bits of image pixel data — statistically indistinguishable from normal noise." />
              <HowItWorksStep num="02" title="Carrier image looks identical" desc="The modified image is visually pixel-perfect. Every image viewer, social platform, and forensic tool sees a normal JPEG." />
              <HowItWorksStep num="03" title="Dual-password deniability" desc="One password opens a decoy vault. A separate password reveals the real hidden vault. You can never be compelled to reveal what's hidden." />
              <HowItWorksStep num="04" title="AES-256 underneath" desc="The embedded vault data is still AES-256 encrypted. Even if steganographic content is detected, data is unreadable without the master password." />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-7">
            <h2 className="font-display font-bold text-xl text-primary-100 mb-2">Try the Demo</h2>
            <p className="text-sm text-primary-100/40 mb-6">Simulated steganography encoding pipeline</p>
            <div className="glass-thin rounded-xl p-6 text-center mb-6 relative overflow-hidden min-h-[180px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {demoStep === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Image className="w-14 h-14 text-primary-100/20 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-sm text-primary-100/35">Upload a carrier image to begin</p>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={runDemo}
                      className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl mt-4 mx-auto"
                    >
                      <Upload className="w-4 h-4" /> Simulate Encoding
                    </motion.button>
                  </motion.div>
                )}
                {demoStep === "uploading" && (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <Upload className="w-10 h-10 text-accent-500 mx-auto mb-3 animate-pulse" />
                    <p className="text-sm text-primary-100/55 font-code">Analyzing carrier image...</p>
                  </motion.div>
                )}
                {demoStep === "encoding" && (
                  <motion.div key="encode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <Layers className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                    <p className="text-sm text-primary-100/55 font-code">Embedding vault in LSBs...</p>
                    <div className="flex gap-1 justify-center mt-3">
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.div key={i} animate={{ height: [8, 20, 8] }} transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }} className="w-1.5 bg-accent-500 rounded-full" />
                      ))}
                    </div>
                  </motion.div>
                )}
                {demoStep === "done" && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <CheckCircle className="w-12 h-12 text-safe mx-auto mb-3" />
                    <p className="text-sm font-bold text-primary-100 mb-1">Vault hidden successfully</p>
                    <p className="text-xs text-primary-100/38 font-code">Image size +0.3% · Visually identical</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-accent-900/20 border border-accent-800/25">
              <Info className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary-100/48 leading-relaxed">
                Plausible deniability protects you legally. Even under compulsion, you can reveal the decoy vault without exposing the real one.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Security grid */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-7 mb-10">
          <h2 className="font-display font-bold text-xl text-primary-100 mb-6">Security Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Lock, title: "AES-256 layer", desc: "Vault data encrypted before embedding — two independent security layers." },
              { icon: Shield, title: "Forensic resistance", desc: "LSB steganography passes standard steganalysis tools under default embedding ratios." },
              { icon: Eye, title: "Plausible deniability", desc: "Dual password system. First password shows decoy, second reveals real vault." },
              { icon: AlertTriangle, title: "OPSEC reminder", desc: "Share the carrier image via encrypted channel. The image itself is the vault." },
              { icon: Lock, title: "Zero-knowledge", desc: "Even if the image is extracted, AES-256 still guards the vault contents." },
              { icon: CheckCircle, title: "Compatible formats", desc: "PNG, BMP, and TIFF. JPEG lossy compression destroys embedded data." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-thin rounded-xl p-4">
                <Icon className="w-4 h-4 text-accent-500 mb-2.5" />
                <p className="text-sm font-bold text-primary-100 mb-1">{title}</p>
                <p className="text-xs text-primary-100/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Waitlist */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-ultra rounded-3xl p-10 text-center">
          <Eye className="w-10 h-10 text-accent-500 mx-auto mb-4 glow-icon animate-float-slow" />
          <h2 className="font-display font-extrabold text-3xl text-primary-100 mb-3">Join the Beta Waitlist</h2>
          <p className="text-primary-100/45 mb-7 max-w-md mx-auto">Steganography Vaults are in active development. Get early access as soon as it ships.</p>
          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-safe font-semibold">
              <CheckCircle className="w-5 h-5" /> You&apos;re on the list!
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="vault-input flex-1 px-4 py-3 text-sm rounded-xl" />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => { if (email) setSubmitted(true); }} className="btn-primary flex items-center gap-2 px-6 py-3 font-bold rounded-xl whitespace-nowrap">
                Get Beta Access <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}