"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Image, Lock, Shield, ChevronLeft, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";

export default function SteganographyPage() {
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

        {/* Coming Soon banner */}
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
              animate={{ scale:[1,1.05,1], opacity:[0.8,1,0.8] }}
              transition={{ duration:3, repeat:Infinity }}
              className="w-24 h-24 rounded-3xl glass-ultra flex items-center justify-center"
            >
              <EyeOff className="w-12 h-12 text-accent-500/70" strokeWidth={1} />
            </motion.div>
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-primary-100 mb-4">
            Hidden <span className="text-accent-500 glow-text">Volumes</span>
          </h1>
          <p className="text-primary-100/50 text-lg max-w-xl mx-auto">
            Conceal an entire encrypted vault inside an innocent image file.
            Plausible deniability, engineered at the pixel level.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.2 }}
          className="glass-ultra rounded-2xl p-8 mb-6"
        >
          <h2 className="font-display font-bold text-xl text-primary-100 mb-6 flex items-center gap-2">
            <Image className="w-5 h-5 text-accent-500" />
            How Steganography Works
          </h2>
          <div className="space-y-4">
            {[
              { step:"01", title:"Choose a Carrier Image",   desc:"Select any JPEG, PNG, or WebP image as the host. The image remains visually identical after embedding." },
              { step:"02", title:"Embed Encrypted Vault",    desc:"Your vault's encrypted blob is embedded in the least-significant bits (LSB) of the image's pixel data. The change is imperceptible to the human eye." },
              { step:"03", title:"Standard Image Output",    desc:"The output is a valid, viewable image file. To anyone inspecting it — or scanning it — it appears to be a completely normal photograph." },
              { step:"04", title:"Extract with Master Pass", desc:"Only users who know the correct Master Password AND target this exact image file will surface the hidden vault. Without both, the vault does not exist." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-900/30 border border-accent-800/40 flex items-center justify-center flex-shrink-0">
                  <span className="font-code text-xs font-bold text-accent-500">{step}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-primary-100 mb-0.5">{title}</p>
                  <p className="text-sm text-primary-100/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity:0, y:10 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 p-4 rounded-xl bg-amber-900/10 border border-amber-800/20 mb-8"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-200/80">Use Responsibly</p>
            <p className="text-xs text-amber-200/50 mt-0.5">
              Steganographic vaults are designed for extreme privacy use cases — investigative journalists, 
              political dissidents, and high-value target protection. Understand the legal context in your jurisdiction.
            </p>
          </div>
        </motion.div>

        {/* Disabled action */}
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