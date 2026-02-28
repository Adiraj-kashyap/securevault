"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Shield, Key, Bell, Lock, ChevronLeft, AlertTriangle,
  ChevronRight, Moon, Zap, HardDrive, Snowflake, Sparkles,
  Palette, Type, Layers, Gauge, Wind, LayoutGrid, Flame
} from "lucide-react";
import Link from "next/link";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";
import { ThemeSelector } from "../ThemeSelector";
import { useAppearance } from "../AppearanceContext";

type Tab = "security" | "storage" | "notifications" | "appearance";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${on ? "bg-accent-500" : "bg-secondary-500"}`}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </motion.button>
  );
}

function SettingRow({
  icon: Icon, label, desc, children,
}: { icon: any; label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-accent-900/30 border border-accent-800/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-accent-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary-100">{label}</p>
          {desc && <p className="text-xs text-primary-100/40 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function DangerZoneItem({ label, desc, action }: { label: string; desc: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-semibold text-primary-100">{label}</p>
        <p className="text-xs text-primary-100/40 mt-0.5">{desc}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-4 py-2 rounded-xl text-sm font-bold text-danger border border-danger/30 bg-danger/10 hover:bg-danger/20 transition-all flex-shrink-0"
      >
        {action}
      </motion.button>
    </div>
  );
}

export default function SettingsPage() {
  const { session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("security");

  // Setting states
  const [mfa, setMfa] = useState(false);
  const [sessionLock, setSessionLock] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [defaultTier, setDefaultTier] = useState<"hot" | "warm" | "cold">("hot");
  const [autoCompress, setAutoCompress] = useState(true);
  const [uploadNotifs, setUploadNotifs] = useState(true);
  const [msgNotifs, setMsgNotifs] = useState(true);

  // Appearance — pulled from AppearanceContext (persisted, applies globally)
  const {
    particles, setParticles,
    pageTransition, setPageTransition,
    motionLevel, setMotionLevel,
    borderRadius, setBorderRadius,
    fontStyle, setFontStyle,
    density, setDensity,
    glowIntensity, setGlowIntensity,
    bgPattern, setBgPattern,
  } = useAppearance();

  if (!session) { router.push("/auth"); return null; }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "security", label: "Security", icon: Shield },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Moon },
  ];

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Vault
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-7 h-7 text-accent-500" />
          <div>
            <h1 className="font-display font-extrabold text-3xl text-primary-100">Settings</h1>
            <p className="text-primary-100/40 text-sm">{session.email}</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 glass rounded-2xl mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${tab === id
                ? "bg-accent-500 text-primary-900"
                : "text-primary-100/50 hover:text-primary-100"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Security */}
        {tab === "security" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-500" /> Authentication
              </h2>
              <SettingRow icon={Lock} label="Two-Factor Authentication" desc="Adds an extra layer to vault access">
                <Toggle on={mfa} onChange={setMfa} />
              </SettingRow>
              <SettingRow icon={Key} label="Session Auto-Lock" desc="Lock vault after 15 min of inactivity">
                <Toggle on={sessionLock} onChange={setSessionLock} />
              </SettingRow>
              <SettingRow icon={AlertTriangle} label="Login Alerts" desc="Email notification on new session">
                <Toggle on={loginAlerts} onChange={setLoginAlerts} />
              </SettingRow>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-accent-500" /> Key Management
              </h2>
              <SettingRow icon={Key} label="Regenerate RSA Keypair" desc="Creates a new RSA-2048 keypair. Old encrypted files will be inaccessible.">
                <Link href="/profile">
                  <button className="text-sm text-accent-300 hover:text-accent-500 transition-colors flex items-center gap-1">
                    View Keys <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </SettingRow>
              <SettingRow icon={Lock} label="Export Encrypted Private Key" desc="Download your AES-wrapped private key for backup.">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="btn-ghost px-3 py-1.5 text-xs font-semibold rounded-xl"
                >
                  Export
                </motion.button>
              </SettingRow>
            </div>

            {/* Danger zone */}
            <div className="glass-card rounded-2xl p-5 border border-danger/10">
              <h2 className="font-semibold text-base text-danger mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Danger Zone
              </h2>
              <DangerZoneItem
                label="Purge All Files"
                desc="Permanently delete all encrypted blobs. This cannot be undone."
                action="Purge Vault"
              />
              <DangerZoneItem
                label="Delete Account"
                desc="Destroy your account, all keys, and all stored data permanently."
                action="Delete Account"
              />
            </div>
          </motion.div>
        )}

        {/* Storage */}
        {tab === "storage" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-accent-500" /> Default Storage Tier
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "hot", icon: Zap, label: "Hot", sub: "Instant", color: "text-orange-400" },
                  { id: "warm", icon: HardDrive, label: "Warm", sub: "Compressed", color: "text-accent-400" },
                  { id: "cold", icon: Snowflake, label: "Cold", sub: "Archive", color: "text-cyan-400" },
                ] as const).map(({ id, icon: Icon, label, sub, color }) => (
                  <motion.button
                    key={id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDefaultTier(id)}
                    className={`glass-card p-4 rounded-xl text-left transition-all border-2 ${defaultTier === id ? `border-current ${color}` : "border-transparent"
                      }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${defaultTier === id ? color : "text-primary-100/30"}`} />
                    <p className={`text-sm font-bold ${defaultTier === id ? color : "text-primary-100/50"}`}>{label}</p>
                    <p className="text-[10px] text-primary-100/30">{sub}</p>
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-500" /> Upload Options
              </h2>
              <SettingRow icon={HardDrive} label="Auto-Compress Before Encrypt" desc="Reduces upload size with gzip before AES encryption">
                <Toggle on={autoCompress} onChange={setAutoCompress} />
              </SettingRow>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent-500" /> Notification Preferences
              </h2>
              <SettingRow icon={Shield} label="Upload Complete" desc="Notify when encrypted upload finishes">
                <Toggle on={uploadNotifs} onChange={setUploadNotifs} />
              </SettingRow>
              <SettingRow icon={Bell} label="New Encrypted Messages" desc="Notify on incoming secure messages">
                <Toggle on={msgNotifs} onChange={setMsgNotifs} />
              </SettingRow>
            </div>
          </motion.div>
        )}

        {/* Appearance */}
        {tab === "appearance" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* ── 1. Color Palette ── */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-1 flex items-center gap-2">
                <Palette className="w-4 h-4 text-accent-500" /> Color Palette
              </h2>
              <p className="text-xs text-primary-100/35 mb-4">Pick an accent theme. All colors adapt globally.</p>
              <div className="flex items-center justify-between">
                <ThemeSelector />
                <span className="text-[10px] font-code text-primary-100/30">5 themes available</span>
              </div>

              {/* Extended palette cards */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { name: "Void Purple", color: "#8b5cf6", active: true, premium: false },
                  { name: "Emerald", color: "#10b981", active: false, premium: false },
                  { name: "Sapphire", color: "#3b82f6", active: false, premium: false },
                  { name: "Gold", color: "#f59e0b", active: false, premium: false },
                  { name: "Rose Quartz", color: "#f43f5e", active: false, premium: true },
                  { name: "Neon Cyan", color: "#06b6d4", active: false, premium: true },
                  { name: "Sunset Orange", color: "#f97316", active: false, premium: true },
                  { name: "Toxic Lime", color: "#84cc16", active: false, premium: true },
                  { name: "Cherry Blossom", color: "#ec4899", active: false, premium: true },
                ].map(p => (
                  <motion.button
                    key={p.name}
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative glass-card p-3 rounded-xl text-left border-2 transition-all ${p.active ? "border-accent-500/60" : "border-transparent"
                      }`}
                  >
                    {p.premium && (
                      <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-amber-500/90 text-black px-1.5 py-0.5 rounded-full">PREMIUM</span>
                    )}
                    <div className="w-6 h-6 rounded-full mb-2" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}60` }} />
                    <p className="text-[11px] text-primary-100/65 font-medium truncate">{p.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── 2. Background Pattern ── */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-1 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-accent-500" /> Background Pattern
              </h2>
              <p className="text-xs text-primary-100/35 mb-4">Subtle texture rendered behind all page content.</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "none", label: "Off", desc: "No texture" },
                  { id: "dots", label: "Dots", desc: "Dot grid" },
                  { id: "grid", label: "Grid", desc: "Line grid" },
                  { id: "hex", label: "Hex", desc: "Honeycomb" },
                  { id: "circuit", label: "Circuit", desc: "PCB lines" },
                  { id: "matrix", label: "Matrix", desc: "Rain lines" },
                ] as const).map(p => (
                  <motion.button
                    key={p.id}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setBgPattern(p.id)}
                    className={`glass-card p-3 rounded-xl text-left border-2 transition-all ${bgPattern === p.id ? "border-accent-500/60" : "border-transparent"
                      }`}
                  >
                    <p className={`text-sm font-semibold mb-0.5 ${bgPattern === p.id ? "text-accent-400" : "text-primary-100/70"}`}>{p.label}</p>
                    <p className="text-[10px] text-primary-100/30">{p.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── 3. Animations ── */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Wind className="w-4 h-4 text-accent-500" /> Animations & Motion
              </h2>
              <SettingRow icon={Sparkles} label="Particle Network" desc="Interactive background particle canvas">
                <Toggle on={particles} onChange={setParticles} />
              </SettingRow>
              <SettingRow icon={Zap} label="Page Transitions" desc="Vault iris animation between pages">
                <Toggle on={pageTransition} onChange={setPageTransition} />
              </SettingRow>
              <div className="pt-3">
                <p className="text-sm font-medium text-primary-100 mb-3 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-accent-500" /> Motion Intensity
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(["full", "reduced", "none"] as const).map(m => (
                    <motion.button
                      key={m}
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setMotionLevel(m)}
                      className={`glass-card p-3 rounded-xl border-2 text-sm capitalize transition-all ${motionLevel === m ? "border-accent-500/60 text-accent-400" : "border-transparent text-primary-100/45"
                        }`}
                    >
                      {m}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 4. Glow Intensity ── */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-1 flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent-500" /> Glow Intensity
              </h2>
              <p className="text-xs text-primary-100/35 mb-4">Controls accent aura strength across UI.</p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-primary-100/35 font-code w-6">0</span>
                <input
                  type="range" min={0} max={100} value={glowIntensity}
                  onChange={e => setGlowIntensity(+e.target.value)}
                  className="flex-1 accent-accent-500 cursor-pointer"
                />
                <span className="text-xs text-accent-400 font-code w-8">{glowIntensity}%</span>
              </div>
              <div className="mt-3 h-0.5 rounded-full" style={{
                background: `linear-gradient(90deg, transparent, rgba(var(--theme-glow-rgb), ${glowIntensity / 100}), transparent)`,
                boxShadow: `0 0 ${glowIntensity / 5}px rgba(var(--theme-glow-rgb), 0.6)`,
              }} />
            </div>

            {/* ── 5. Typography ── */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Type className="w-4 h-4 text-accent-500" /> Font Style
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "syne", label: "Syne", sub: "Display", premium: false },
                  { id: "inter", label: "Inter", sub: "Clean", premium: false },
                  { id: "mono", label: "JetBrains", sub: "Terminal", premium: true },
                ] as const).map(f => (
                  <motion.button
                    key={f.id}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setFontStyle(f.id)}
                    className={`relative glass-card p-3 rounded-xl border-2 text-left transition-all ${fontStyle === f.id ? "border-accent-500/60" : "border-transparent"
                      }`}
                  >
                    {f.premium && (
                      <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-amber-500/90 text-black px-1.5 py-0.5 rounded-full">PREMIUM</span>
                    )}
                    <p className="text-sm font-bold text-primary-100">{f.label}</p>
                    <p className="text-[10px] text-primary-100/35">{f.sub}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── 6. Layout ── */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-500" /> Layout & Density
              </h2>
              <div className="mb-5">
                <p className="text-sm font-medium text-primary-100 mb-3">Interface Density</p>
                <div className="grid grid-cols-3 gap-3">
                  {(["compact", "default", "spacious"] as const).map(d => (
                    <motion.button
                      key={d}
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setDensity(d)}
                      className={`glass-card p-3 rounded-xl border-2 text-sm capitalize transition-all ${density === d ? "border-accent-500/60 text-accent-400" : "border-transparent text-primary-100/45"
                        }`}
                    >
                      {d}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-100 mb-3">Border Radius</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: "sharp", label: "Sharp", class: "rounded-sm" },
                    { id: "normal", label: "Smooth", class: "rounded-xl" },
                    { id: "round", label: "Pill", class: "rounded-full" },
                  ] as const).map(r => (
                    <motion.button
                      key={r.id}
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setBorderRadius(r.id)}
                      className={`glass-card p-3 border-2 text-sm transition-all flex flex-col items-center gap-2 ${borderRadius === r.id ? "border-accent-500/60 text-accent-400" : "border-transparent text-primary-100/45"
                        } ${r.class}`}
                    >
                      <div className={`w-8 h-4 bg-accent-500/30 border border-accent-500/40 ${r.class}`} />
                      {r.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </motion.div>
    </div>
  );
}