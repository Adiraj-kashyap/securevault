"use client";

import { motion } from "framer-motion";
import { Shield, Lock, HardDrive, Key, FileText, UploadCloud } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-800/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-500/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        className="w-full max-w-7xl mx-auto text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="p-4 bg-secondary-900/50 rounded-2xl border border-secondary-500/30 glass">
            <Shield className="w-16 h-16 text-accent-500" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
        >
          Welcome to <span className="text-accent-500 glow-text">SecureVault</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-primary-100/80 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
        >
          The ultimate zero-knowledge platform. Encrypt, store, and share your most sensitive files, folders, and messages using advanced AES-256 and RSA cryptography.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <Link href="/auth">
            <button className="px-8 py-4 bg-accent-500 hover:bg-accent-300 text-primary-900 font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] active:scale-95">
              Enter The Vault
            </button>
          </Link>
          <Link href="#features">
            <button className="px-8 py-4 bg-secondary-900/50 hover:bg-secondary-800 border border-secondary-500/30 text-primary-100 font-semibold rounded-xl transition-all glass active:scale-95">
              Explore Architecture
            </button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          id="features"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left"
        >
          <FeatureCard
            icon={<Lock className="w-8 h-8 text-accent-500" />}
            title="Zero-Knowledge Encryption"
            description="Two-fold PGP-style architecture. Your data is encrypted with AES-256, and keys are wrapped in RSA. We never see your files."
          />
          <FeatureCard
            icon={<HardDrive className="w-8 h-8 text-accent-500" />}
            title="3-Tier Storage System"
            description="Intelligently route files between Instant (Hot), Compressed (Warm), and Ultimate Archive (Cold) storage levels based on need."
          />
          <FeatureCard
            icon={<UploadCloud className="w-8 h-8 text-accent-500" />}
            title="Folder & Bulk Uploads"
            description="Drag and drop entire folder hierarchies. SecureVault encrypts and mirrors your directory structure instantly."
          />
          <FeatureCard
            icon={<Key className="w-8 h-8 text-accent-500" />}
            title="Decentralized Key Management"
            description="Your master password never leaves your device. Keys are derived locally and strictly remain in browser memory."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8 text-accent-500" />}
            title="Immutable Logging"
            description="Track exactly who accessed what and when, with cryptographically signed access logs."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-accent-500" />}
            title="Commercial Grade"
            description="Built to global compliance standards, seamlessly balancing heavy server loads using a Hybrid DB approach."
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="glass-card p-8 group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-accent-500/10" />
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-primary-100">{title}</h3>
      <p className="text-primary-100/70 leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}
