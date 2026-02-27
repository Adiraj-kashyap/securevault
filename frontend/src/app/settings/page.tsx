"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Key, Bell, Lock, ChevronLeft, AlertTriangle, ChevronRight, Moon, Zap, HardDrive, Snowflake } from "lucide-react";
import Link from "next/link";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";
import { ThemeSelector } from "../ThemeSelector";

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
  const router      = useRouter();
  const [tab, setTab] = useState<Tab>("security");

  // Setting states
  const [mfa,           setMfa]           = useState(false);
  const [sessionLock,   setSessionLock]   = useState(true);
  const [loginAlerts,   setLoginAlerts]   = useState(true);
  const [defaultTier,   setDefaultTier]   = useState<"hot"|"warm"|"cold">("hot");
  const [autoCompress,  setAutoCompress]  = useState(true);
  const [uploadNotifs,  setUploadNotifs]  = useState(true);
  const [msgNotifs,     setMsgNotifs]     = useState(true);

  if (!session) { router.push("/auth"); return null; }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "security",      label: "Security",      icon: Shield },
    { id: "storage",       label: "Storage",       icon: HardDrive },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance",    label: "Appearance",    icon: Moon },
  ];

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Vault
        </Link>
      </motion.div>

      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${
                tab === id
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
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-4">
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
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-accent-500" /> Default Storage Tier
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id:"hot",  icon:Zap,       label:"Hot",  sub:"Instant",   color:"text-orange-400" },
                  { id:"warm", icon:HardDrive, label:"Warm", sub:"Compressed", color:"text-accent-400" },
                  { id:"cold", icon:Snowflake, label:"Cold", sub:"Archive",    color:"text-cyan-400" },
                ] as const).map(({ id, icon: Icon, label, sub, color }) => (
                  <motion.button
                    key={id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDefaultTier(id)}
                    className={`glass-card p-4 rounded-xl text-left transition-all border-2 ${
                      defaultTier === id ? `border-current ${color}` : "border-transparent"
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
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
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
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-base text-primary-100 mb-4 flex items-center gap-2">
                <Moon className="w-4 h-4 text-accent-500" /> Interface Theme
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-100">Color Palette</p>
                  <p className="text-xs text-primary-100/40 mt-0.5">Choose from 5 premium color themes</p>
                </div>
                <ThemeSelector />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}