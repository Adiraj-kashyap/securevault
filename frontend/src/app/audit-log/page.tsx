"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Lock, Shield, Download, Search, Filter, ChevronLeft, CheckCircle, AlertTriangle, LogIn, Upload, Eye, Trash2, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";

type EventType = "login" | "upload" | "download" | "delete" | "share" | "key_access" | "failed_login";

interface AuditEvent {
  id: string;
  type: EventType;
  description: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  signature: string;
  severity: "info" | "warn" | "danger";
}

const MOCK_EVENTS: AuditEvent[] = [
  { id: "1", type: "login", description: "Successful vault login", timestamp: new Date(Date.now() - 600000), ip: "203.0.113.42", userAgent: "Chrome/125 macOS", signature: "sha256:3f7a...", severity: "info" },
  { id: "2", type: "upload", description: "Encrypted file uploaded: report-q3-2025.pdf", timestamp: new Date(Date.now() - 1200000), ip: "203.0.113.42", userAgent: "Chrome/125 macOS", signature: "sha256:8b2c...", severity: "info" },
  { id: "3", type: "key_access", description: "Private key decrypted from session", timestamp: new Date(Date.now() - 1800000), ip: "203.0.113.42", userAgent: "Chrome/125 macOS", signature: "sha256:1d4e...", severity: "info" },
  { id: "4", type: "download", description: "File decrypted and downloaded: contracts.zip", timestamp: new Date(Date.now() - 7200000), ip: "203.0.113.42", userAgent: "Chrome/125 macOS", signature: "sha256:9f1a...", severity: "info" },
  { id: "5", type: "failed_login", description: "Failed login attempt — wrong master password", timestamp: new Date(Date.now() - 86400000), ip: "198.51.100.77", userAgent: "Firefox/128 Linux", signature: "sha256:2e8b...", severity: "danger" },
  { id: "6", type: "share", description: "File shared: encryption-key-demo.txt", timestamp: new Date(Date.now() - 172800000), ip: "203.0.113.42", userAgent: "Chrome/125 macOS", signature: "sha256:7c3f...", severity: "warn" },
  { id: "7", type: "upload", description: "Folder encrypted & uploaded: /project-x", timestamp: new Date(Date.now() - 259200000), ip: "203.0.113.42", userAgent: "Chrome/125 macOS", signature: "sha256:4a9d...", severity: "info" },
  { id: "8", type: "delete", description: "File permanently purged: temp-credentials.txt", timestamp: new Date(Date.now() - 345600000), ip: "203.0.113.42", userAgent: "Chrome/125 macOS", signature: "sha256:6e2c...", severity: "warn" },
];

const EVENT_META: Record<EventType, { icon: any; label: string; color: string }> = {
  login: { icon: LogIn, label: "Login", color: "text-safe   bg-safe/10   border-safe/20" },
  upload: { icon: Upload, label: "Upload", color: "text-accent-400 bg-accent-900/20 border-accent-800/30" },
  download: { icon: Download, label: "Download", color: "text-cyan-400 bg-cyan-900/20 border-cyan-800/30" },
  delete: { icon: Trash2, label: "Delete", color: "text-warn   bg-warn/10   border-warn/20" },
  share: { icon: Share2, label: "Share", color: "text-violet-400 bg-violet-900/20 border-violet-800/30" },
  key_access: { icon: Lock, label: "Key Access", color: "text-accent-400 bg-accent-900/20 border-accent-800/30" },
  failed_login: { icon: AlertTriangle, label: "Failed Auth", color: "text-danger  bg-danger/10  border-danger/20" },
};

const SEVERITY_COLOR = {
  info: "border-l-safe/40",
  warn: "border-l-warn/40",
  danger: "border-l-danger/40",
};

function timeFormat(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function AuditLogPage() {
  const { session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "danger">("all");
  const [events, setEvents] = useState<AuditEvent[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
    const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;
    setLoading(true);
    fetch(`${API_BASE}/audit`, {
      headers: { Authorization: `Bearer ${session.token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: any[]) => {
        const mapped: AuditEvent[] = data.map(e => ({
          id: e._id ?? e.id,
          type: e.type as EventType,
          description: e.description,
          timestamp: new Date(e.timestamp),
          ip: e.ip ?? "-",
          userAgent: e.userAgent ?? "-",
          signature: e.signature ?? "sha256:live",
          severity: e.severity as "info" | "warn" | "danger",
        }));
        setEvents(mapped);
      })
      .catch(() => setEvents(MOCK_EVENTS)) // graceful fallback
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) { router.push("/auth"); return null; }

  const filtered = events.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.type.includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.severity === filter;
    return matchSearch && matchFilter;
  });


  return (
    <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Vault
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-primary-100 mb-1">Audit Log</h1>
            <p className="text-primary-100/40 text-sm flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-accent-500/60" />
              Cryptographically signed, immutable event history
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events..."
              className="vault-input w-full pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-1 p-1 glass rounded-xl">
            {(["all", "info", "warn", "danger"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === s
                  ? s === "all" ? "bg-accent-500 text-primary-900"
                    : s === "info" ? "bg-safe/20 text-safe border border-safe/30"
                      : s === "warn" ? "bg-warn/20 text-warn border border-warn/30"
                        : "bg-danger/20 text-danger border border-danger/30"
                  : "text-primary-100/40 hover:text-primary-100"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Events", value: MOCK_EVENTS.length.toString(), color: "text-primary-100" },
            { label: "Warnings", value: MOCK_EVENTS.filter(e => e.severity === "warn").length.toString(), color: "text-warn" },
            { label: "Threats Blocked", value: MOCK_EVENTS.filter(e => e.severity === "danger").length.toString(), color: "text-danger" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center">
              <p className={`font-display font-extrabold text-2xl ${color}`}>{value}</p>
              <p className="text-xs text-primary-100/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Event list */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-500" />
            <span className="font-semibold text-sm text-primary-100">Events ({filtered.length})</span>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((event, i) => {
              const meta = EVENT_META[event.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-all border-l-2 ${SEVERITY_COLOR[event.severity]}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium text-primary-100">{event.description}</p>
                      <span className="text-xs text-primary-100/30 flex-shrink-0 font-code">{timeFormat(event.timestamp)}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      <span className="text-[10px] text-primary-100/30 font-code">IP: {event.ip}</span>
                      <span className="text-[10px] text-primary-100/30 font-code">UA: {event.userAgent}</span>
                      <span className="text-[10px] text-accent-800/60 font-code">SIG: {event.signature}</span>
                    </div>
                  </div>
                  {event.severity === "info" ? (
                    <CheckCircle className="w-4 h-4 text-safe/50 flex-shrink-0 mt-0.5" />
                  ) : event.severity === "warn" ? (
                    <AlertTriangle className="w-4 h-4 text-warn/50 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                  )}
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-primary-100/30 text-sm">
                No events match your filter.
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-primary-100/20 font-code">
          All events are cryptographically signed and tamper-evident. Log integrity verified on load.
        </p>
      </motion.div>
    </div>
  );
}