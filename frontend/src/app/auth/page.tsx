"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Mail, KeyRound, ShieldCheck, ArrowRight, Loader2,
  Eye, EyeOff, AlertTriangle, CheckCircle, Shield, Cpu, Database
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cryptoUtils } from "@/lib/crypto";
import { useSession } from "../SessionContext";
import { useAppearance } from "../AppearanceContext";
import { usePremium } from "../PremiumContext";
import { AuthSuccessAnimation } from "../AuthSuccessAnimation";
import { AnimatePresence as AP } from "framer-motion";

/* ── Password Strength ─────────────────────────────────────── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too short", color: "#ef4444" },
    1: { label: "Weak", color: "#f97316" },
    2: { label: "Fair", color: "#eab308" },
    3: { label: "Good", color: "#84cc16" },
    4: { label: "Strong", color: "#22c55e" },
    5: { label: "Excellent", color: "#10b981" },
  };
  return { score, ...map[score] };
}

/* ── RSA Key Generation Progress Animation ─────────────────── */
const GEN_STEPS = [
  { label: "Seeding entropy pool", icon: Cpu },
  { label: "Generating RSA-2048 primes", icon: KeyRound },
  { label: "Encrypting private key", icon: Lock },
  { label: "Storing to vault", icon: Database },
];

function KeyGenAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => {
        if (s >= GEN_STEPS.length - 1) { clearInterval(timer); return s; }
        return s + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-5 py-6"
    >
      {/* Outer spinning ring */}
      <div className="relative w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-500 border-r-accent-500/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-accent-500/20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <KeyRound className="w-8 h-8 text-accent-500 animate-shield-pulse" />
        </div>
      </div>

      <div className="text-center">
        <p className="font-display font-bold text-primary-100 text-lg mb-1">
          Generating RSA-2048 Keypair
        </p>
        <p className="text-xs text-primary-100/40 font-code">All operations occur in your browser</p>
      </div>

      {/* Step progress */}
      <div className="w-full space-y-2">
        {GEN_STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active ? "bg-accent-900/30 border border-accent-800/40" :
                done ? "opacity-50" : "opacity-30"
                }`}
            >
              {done ? (
                <CheckCircle className="w-4 h-4 text-safe flex-shrink-0" />
              ) : active ? (
                <Loader2 className="w-4 h-4 text-accent-500 animate-spin flex-shrink-0" />
              ) : (
                <Icon className="w-4 h-4 text-primary-100/30 flex-shrink-0" />
              )}
              <span className="text-sm font-code text-primary-100/70">{s.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Pulse dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
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

/* ── Hex Background ─────────────────────────────────────────── */
function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hex grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
        <defs>
          <pattern id="authhex" x="0" y="0" width="50" height="43" patternUnits="userSpaceOnUse">
            <polygon
              points="25,1 47,13 47,37 25,49 3,37 3,13"
              fill="none"
              stroke="rgba(var(--theme-glow-rgb),1)"
              strokeWidth="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authhex)" />
      </svg>
      {/* Scan line */}
      <div className="absolute inset-0 scanlines opacity-20" />
      {/* Orbs */}
      <div className="orb-top-left opacity-60" />
      <div className="orb-bottom-right opacity-50" />
    </div>
  );
}

/* ── Main Auth Form ─────────────────────────────────────────── */
function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, setSession } = useSession();
  const appearance = useAppearance();
  const { hydrateFromServer } = usePremium();

  // Already logged in → bounce to dashboard
  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingKeys, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState<{ email: string; isLogin: boolean } | null>(null);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.auth.login({ email, passwordHash: password });
        const derivedKey = await cryptoUtils.deriveKeyFromPassword(password, res.salt);
        const privateKey = await cryptoUtils.decryptPrivateKey(res.encryptedPrivateKey, derivedKey);
        if (!privateKey) throw new Error("Invalid Master Password. Decryption failed.");
        const newSession = { userId: res.userId, email, tagline: res.tagline, token: res.token, derivedAesKey: derivedKey, decryptedPrivateKey: privateKey, publicKey: res.publicKey };
        setSession(newSession);
        // 🚀 Fast preference load — fires in parallel during the animation window (~2.9s)
        api.auth.getPreferences(res.token).then(prefs => {
          if (!prefs) return;
          // Apply appearance blob from MongoDB
          if (prefs.appearance && Object.keys(prefs.appearance).length > 0) {
            const saved = JSON.stringify(prefs.appearance);
            localStorage.setItem("sv_appearance", saved);
            // Patch each known key into AppearanceContext
            const a = prefs.appearance as any;
            if (a.bgPattern) appearance.setBgPattern(a.bgPattern);
            if (a.glowIntensity !== undefined) appearance.setGlowIntensity(a.glowIntensity);
            if (a.motionLevel) appearance.setMotionLevel(a.motionLevel);
            if (a.fontStyle) appearance.setFontStyle(a.fontStyle);
            if (a.density) appearance.setDensity(a.density);
            if (a.borderRadius) appearance.setBorderRadius(a.borderRadius);
            if (a.particles !== undefined) appearance.setParticles(a.particles);
            if (a.pageTransition !== undefined) appearance.setPageTransition(a.pageTransition);
            if (a.transitionStyle) appearance.setTransitionStyle(a.transitionStyle);
            if (a.successStyle) appearance.setSuccessStyle(a.successStyle);
          }
          // Hydrate premium daily usage
          hydrateFromServer(prefs.premiumUsedTodayMs ?? 0, prefs.premiumDayDate ?? "");
        }).catch(() => { /* non-critical */ });
        setLoading(false);
        setShowSuccess({ email, isLogin: true });
      } else {
        setLoading(false);
        setGenerating(true);
        const { publicKey, privateKey } = await cryptoUtils.generateRSAKeyPair();
        const salt = cryptoUtils.generateSalt();
        const derivedKey = await cryptoUtils.deriveKeyFromPassword(password, salt);
        const encryptedPrivKey = await cryptoUtils.encryptPrivateKey(privateKey, derivedKey);
        setGenerating(false);
        setLoading(true);
        await api.auth.register({ email, passwordHash: password, publicKey, encryptedPrivateKey: encryptedPrivKey, salt });
        setLoading(false);
        setShowSuccess({ email, isLogin: false });
      }
    } catch (err) {
      setError((err as Error).message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      {/* Cinematic success ceremony overlay */}
      <AP>
        {showSuccess && (
          <AuthSuccessAnimation
            key="success"
            email={showSuccess.email}
            isLogin={showSuccess.isLogin}
            onComplete={() => {
              if (showSuccess.isLogin) {
                router.push("/dashboard");
              } else {
                setShowSuccess(null);
                setIsLogin(true);
              }
            }}
          />
        )}
      </AP>

      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90 }}
          className="text-center mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-primary-100/35 hover:text-primary-100/70 text-sm mb-7 transition-colors font-code"
          >
            ← Back to home
          </Link>

          {/* Animated icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(var(--theme-glow-rgb),0.15)",
                    "0 0 40px rgba(var(--theme-glow-rgb),0.5)",
                    "0 0 15px rgba(var(--theme-glow-rgb),0.15)",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-18 h-18 rounded-2xl bg-accent-900/40 border border-accent-800/50 flex items-center justify-center w-[72px] h-[72px]"
              >
                <Lock className="w-9 h-9 text-accent-500" strokeWidth={1.5} />
              </motion.div>
              {/* Orbiting dot */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-8px]"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-accent-500 absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(var(--theme-glow-rgb),0.8)]" />
              </motion.div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={isLogin ? "login" : "register"}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-display font-extrabold text-3xl text-primary-100 mb-1.5"
            >
              {isLogin ? "Access Your Vault" : "Create Your Vault"}
            </motion.h1>
          </AnimatePresence>
          <p className="text-primary-100/38 text-sm font-code">
            {isLogin
              ? "Your master password never leaves this device."
              : "RSA-2048 keypair generated entirely in your browser."}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="glass-ultra rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Shimmer sweep on load */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none skew-x-[-20deg]"
          />

          {/* Key gen overlay */}
          <AnimatePresence>
            {generatingKeys && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 glass-ultra rounded-2xl flex items-center justify-center p-6"
              >
                <KeyGenAnimation />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle tabs */}
          <div className="flex p-1 rounded-xl bg-primary-800/60 border border-white/5 mb-8">
            {(["Sign In", "Register"] as const).map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsLogin(i === 0); setError(""); setSuccess(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${(isLogin ? i === 0 : i === 1)
                  ? "bg-accent-500 text-primary-900 shadow-md shadow-black/20"
                  : "text-primary-100/45 hover:text-primary-100"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/25" />
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40 block mb-1.5">
                {isLogin ? "Master Password" : "Create Master Password"}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/25" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-100/25 hover:text-primary-100/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter — register only */}
              <AnimatePresence>
                {!isLogin && password.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2.5 overflow-hidden"
                  >
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-500"
                          style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.06)" }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-code" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                      <p className="text-[10px] text-primary-100/25">
                        {password.length < 8 ? `${8 - password.length} more chars` : "Length ✓"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Warning box — register only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/18">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/65 leading-relaxed">
                      Your master password <strong>cannot be recovered</strong>. If lost, your encrypted data is permanently inaccessible. Store it securely — we have no way to help you.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error / Success states */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-danger/8 border border-danger/20 text-sm text-danger"
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
                  className="flex items-center gap-2 p-3 rounded-xl bg-safe/8 border border-safe/20 text-sm text-safe"
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
              className="w-full btn-primary flex items-center justify-center gap-2.5 py-4 text-base font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-primary-100/28">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-500/50" />
            <span className="font-code">All cryptographic operations occur in your browser</span>
          </div>
        </motion.div>

        {/* Security chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-5 grid grid-cols-3 gap-3"
        >
          {[
            { label: "AES-256 Keys", sub: "Derived locally" },
            { label: "RSA-2048", sub: "Browser generation" },
            { label: "PBKDF2 100K", sub: "Key stretching" },
          ].map(({ label, sub }) => (
            <div key={label} className="glass rounded-xl p-3 text-center border border-white/5">
              <p className="text-xs font-bold text-accent-300 font-code">{label}</p>
              <p className="text-[10px] text-primary-100/28 mt-0.5">{sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-100/40 font-code text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading Secure Environment...
        </div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}