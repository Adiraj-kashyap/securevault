"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, KeyRound, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cryptoUtils } from "@/lib/crypto";
import { useSession } from "../SessionContext";

/* ── Password Strength ─────────────────────────────────────── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too short",  color: "#ef4444" },
    1: { label: "Weak",       color: "#f97316" },
    2: { label: "Fair",       color: "#eab308" },
    3: { label: "Good",       color: "#84cc16" },
    4: { label: "Strong",     color: "#22c55e" },
    5: { label: "Excellent",  color: "#10b981" },
  };
  return { score, ...map[score] };
}

/* ── RSA Key Generation Progress ───────────────────────────── */
function KeyGenAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-4"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-accent-500/20 border-t-accent-500"
        />
        <KeyRound className="w-7 h-7 text-accent-500 absolute inset-0 m-auto" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-primary-100">Generating RSA-2048 Keypair</p>
        <p className="text-xs text-primary-100/50 font-code mt-1">This may take a moment...</p>
      </div>
      <div className="flex gap-1.5">
        {[0,1,2,3].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-accent-500"
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
function AuthForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { setSession } = useSession();

  const [isLogin, setIsLogin]         = useState(searchParams.get("mode") !== "register");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [generatingKeys, setGenerating] = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.auth.login({ email, passwordHash: password });
        const derivedKey  = await cryptoUtils.deriveKeyFromPassword(password, res.salt);
        const privateKey  = await cryptoUtils.decryptPrivateKey(res.encryptedPrivateKey, derivedKey);
        if (!privateKey) throw new Error("Invalid Master Password. Decryption failed.");
        setSession({ userId: res.userId, email, token: res.token, derivedAesKey: derivedKey, decryptedPrivateKey: privateKey, publicKey: res.publicKey });
        router.push("/dashboard");
      } else {
        setLoading(false);
        setGenerating(true);
        const { publicKey, privateKey } = await cryptoUtils.generateRSAKeyPair();
        const salt             = cryptoUtils.generateSalt();
        const derivedKey       = await cryptoUtils.deriveKeyFromPassword(password, salt);
        const encryptedPrivKey = await cryptoUtils.encryptPrivateKey(privateKey, derivedKey);
        setGenerating(false);
        setLoading(true);
        await api.auth.register({ email, passwordHash: password, publicKey, encryptedPrivateKey: encryptedPrivKey, salt });
        setSuccess("Vault created! Redirecting to login...");
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      setError((err as Error).message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
        <div className="absolute inset-0 scanlines opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-primary-100/40 hover:text-primary-100/70 text-sm mb-6 transition-colors">
            ← Back to home
          </Link>
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ boxShadow: ["0 0 15px rgba(var(--theme-glow-rgb),0.2)", "0 0 30px rgba(var(--theme-glow-rgb),0.5)", "0 0 15px rgba(var(--theme-glow-rgb),0.2)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-accent-900/40 border border-accent-800/50 flex items-center justify-center"
            >
              <Lock className="w-8 h-8 text-accent-500" strokeWidth={1.5} />
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            <motion.h1
              key={isLogin ? "login" : "register"}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="font-display font-extrabold text-3xl text-primary-100 mb-1"
            >
              {isLogin ? "Access Your Vault" : "Create Your Vault"}
            </motion.h1>
          </AnimatePresence>
          <p className="text-primary-100/40 text-sm">
            {isLogin
              ? "Your master password never leaves this device."
              : "RSA-2048 keypair generated entirely in your browser."}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="glass-ultra rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Key gen overlay */}
          <AnimatePresence>
            {generatingKeys && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 glass-card rounded-2xl flex items-center justify-center"
              >
                <KeyGenAnimation />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle */}
          <div className="flex p-1 rounded-xl bg-primary-800/60 border border-white/5 mb-8">
            {(["Sign In", "Register"] as const).map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsLogin(i === 0); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  (isLogin ? i === 0 : i === 1)
                    ? "bg-accent-500 text-primary-900 shadow-md"
                    : "text-primary-100/50 hover:text-primary-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="vault-input w-full pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">
                {isLogin ? "Master Password" : "Create Master Password"}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/30" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  className="vault-input w-full pl-10 pr-12 py-3 text-sm font-code"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-100/30 hover:text-primary-100/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter — only on register */}
              <AnimatePresence>
                {!isLogin && password.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 overflow-hidden"
                  >
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)" }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-code" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Warning (register) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/70 leading-relaxed">
                      Your master password <strong>cannot be recovered</strong>. If lost, your encrypted data is permanently inaccessible. Store it securely.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-safe/10 border border-safe/20 text-sm text-safe"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || generatingKeys}
              className="w-full btn-primary flex items-center justify-center gap-2.5 py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : isLogin ? (
                <><ShieldCheck className="w-5 h-5" /> Unlock Vault <ArrowRight className="w-4 h-4" /></>
              ) : (
                <><KeyRound className="w-5 h-5" /> Generate Keys &amp; Register <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Zero-knowledge note */}
          <div className="mt-6 flex items-center gap-2 justify-center text-xs text-primary-100/30">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-500/50" />
            <span>All cryptographic operations occur in your browser</span>
          </div>
        </motion.div>

        {/* Security detail footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {[
            { label: "AES-256 Keys",    sub: "Derived locally"     },
            { label: "RSA-2048",        sub: "Browser generation"  },
            { label: "PBKDF2 100K",     sub: "Key stretching"      },
          ].map(({ label, sub }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-accent-300 font-code">{label}</p>
              <p className="text-[10px] text-primary-100/30 mt-0.5">{sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary-100/50">Loading Secure Environment...</div>}>
      <AuthForm />
    </Suspense>
  );
}