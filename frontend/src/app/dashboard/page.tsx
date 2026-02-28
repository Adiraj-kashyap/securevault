"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "../SessionContext";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Folder, FileKey, Shield, HardDrive, Zap, Snowflake,
  UploadCloud, Plus, ChevronRight, LogOut, Loader2, MessageSquare,
  Settings, User, Activity, Search, Grid3x3, List, Lock,
  FileText, Image, Video, Archive, ChevronLeft, Home,
  FolderOpen, RefreshCw
} from "lucide-react";

/* ── Helpers ────────────────────────────────────────────────── */
function formatBytes(b: number): string {
  if (b === 0) return "0 B";
  const k = 1024;
  const sz = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${sz[i]}`;
}
function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return <Image className="w-5 h-5" />;
  if (["mp4", "mov", "avi", "mkv"].includes(ext)) return <Video className="w-5 h-5" />;
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return <Archive className="w-5 h-5" />;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return <FileText className="w-5 h-5" />;
  return <FileKey className="w-5 h-5" />;
}

/* ── Sub-components ─────────────────────────────────────────── */
function EncryptionBadge() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity }}
      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-safe"
    >
      <Lock className="w-3 h-3 enc-locked" />
      <span>E2E</span>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, accent }: {
  icon: any; label: string; value: string; sub: string; color: string; accent: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="glass-card p-5 rounded-2xl group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <EncryptionBadge />
      </div>
      <p className="font-display font-bold text-2xl text-primary-100">{value}</p>
      <p className="text-sm text-primary-100/55 mt-0.5">{label}</p>
      <p className="text-xs text-primary-100/28 font-code mt-1.5">{sub}</p>
      {/* Mini accent bar */}
      <div className={`h-0.5 rounded-full mt-3 ${accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-2.5">
      <div className="shimmer h-10 w-10 rounded-xl" />
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="shimmer h-3 w-1/2 rounded" />
    </div>
  );
}

/* ── Sidebar Nav Item ───────────────────────────────────────── */
function SidebarLink({
  href, label, icon: Icon, active,
}: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${active
            ? "bg-accent-900/40 text-accent-300"
            : "text-primary-100/48 hover:text-primary-100 hover:bg-white/5"
          }`}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent-500"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-accent-500" : ""}`} />
        {label}
      </motion.div>
    </Link>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const { session, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [stats, setStats] = useState({ hot: { size: 0, count: 0 }, warm: { size: 0, count: 0 }, cold: { size: 0, count: 0 } });
  const [directory, setDirectory] = useState<{ folders: any[]; files: any[] }>({ folders: [], files: [] });
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: "Root" }]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!session) { router.push("/auth"); return; }
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, dirRes] = await Promise.all([
          api.storage.getStats(session.token),
          api.storage.getDirectory(session.token, currentFolderId),
        ]);
        setStats(statsRes);
        setDirectory(dirRes);
      } catch (err) {
        if ((err as Error).message.includes("Unauthorized")) { logout(); router.push("/auth"); }
      } finally { setLoading(false); }
    };
    load();
  }, [session, currentFolderId]);

  const navigateToFolder = useCallback((folder: any) => {
    setCurrentFolderId(folder._id);
    setBreadcrumbs(prev => [...prev, { id: folder._id, name: folder.name }]);
  }, []);

  const navigateToBreadcrumb = useCallback((bc: { id: string | null; name: string }, idx: number) => {
    setCurrentFolderId(bc.id);
    setBreadcrumbs(prev => prev.slice(0, idx + 1));
  }, []);

  const filtered = {
    folders: directory.folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
    files: directory.files.filter(f => f.filename.toLowerCase().includes(search.toLowerCase())),
  };

  const totalFiles = stats.hot.count + stats.warm.count + stats.cold.count;
  const totalSize = stats.hot.size + stats.warm.size + stats.cold.size;

  const sideLinks = [
    { href: "/dashboard", label: "My Vault", icon: Shield },
    { href: "/dashboard/upload", label: "Upload", icon: UploadCloud },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/audit-log", label: "Audit Log", icon: Activity },
    { href: "/profile", label: "Key Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  if (!session) return null;

  return (
    <div className="min-h-screen flex relative">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed left-0 top-[76px] bottom-0 w-64 glass-panel z-30 flex flex-col py-5 px-3 border-r border-white/5"
          >
            {/* User identity */}
            <div className="px-2 mb-5">
              <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl identicon-placeholder flex items-center justify-center flex-shrink-0">
                  <span className="font-code font-bold text-accent-300 text-sm">
                    {session.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-primary-100 truncate">{session.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full status-online animate-pulse-glow" />
                    <span className="text-[10px] text-primary-100/38 font-code">Vault Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-0.5 flex-1">
              {sideLinks.map(({ href, label, icon: Icon }) => (
                <SidebarLink
                  key={href}
                  href={href}
                  label={label}
                  icon={Icon}
                  active={pathname === href || (href !== "/dashboard" && pathname?.startsWith(href))}
                />
              ))}
            </nav>

            {/* Storage usage */}
            <div className="px-1 mt-4">
              <div className="glass rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs text-primary-100/38">Vault Storage</span>
                  <span className="text-xs font-code text-accent-300">{formatBytes(totalSize)}</span>
                </div>
                {/* Tier bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                  {[
                    { v: stats.hot.size, c: "bg-orange-500" },
                    { v: stats.warm.size, c: "bg-accent-500" },
                    { v: stats.cold.size, c: "bg-cyan-500" },
                  ].map(({ v, c }, i) => (
                    <motion.div
                      key={i}
                      initial={{ width: 0 }}
                      animate={{ width: totalSize ? `${(v / totalSize) * 100}%` : "33%" }}
                      transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                      className={`${c} rounded-full min-w-[3px]`}
                    />
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  {[["Hot", "bg-orange-500"], ["Warm", "bg-accent-500"], ["Cold", "bg-cyan-500"]].map(([n, c]) => (
                    <div key={n} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${c}`} />
                      <span className="text-[10px] text-primary-100/28">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ x: 3 }}
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-3 px-4 py-2.5 mx-1 mt-3 rounded-xl text-sm text-primary-100/38 hover:text-danger hover:bg-danger/8 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} min-w-0`}>
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Top bar */}
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSidebarOpen(v => !v)}
              className="btn-ghost p-2.5 rounded-xl flex-shrink-0"
            >
              {sidebarOpen
                ? <ChevronLeft className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />
              }
            </motion.button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
              {breadcrumbs.map((bc, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-primary-100/20 flex-shrink-0" />}
                  <button
                    onClick={() => navigateToBreadcrumb(bc, i)}
                    className={`text-sm transition-colors truncate max-w-[120px] ${i === breadcrumbs.length - 1
                        ? "text-primary-100 font-semibold"
                        : "text-primary-100/38 hover:text-primary-100"
                      }`}
                  >
                    {i === 0 ? <Home className="w-4 h-4 inline" /> : bc.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/28" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vault..."
                className="vault-input pl-9 pr-4 py-2 text-sm w-52"
              />
            </div>

            {/* View toggle */}
            <div className="flex p-1 rounded-xl bg-primary-800/60 border border-white/5">
              {(["grid", "list"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-1.5 rounded-lg transition-all ${view === v ? "bg-accent-500 text-primary-900" : "text-primary-100/38 hover:text-primary-100"
                    }`}
                >
                  {v === "grid" ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Upload button */}
            <Link href="/dashboard/upload">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </motion.button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Shield}
              label="Total Files"
              value={totalFiles.toString()}
              sub={`${formatBytes(totalSize)} encrypted`}
              color="bg-accent-900/40 text-accent-500"
              accent="bg-accent-500"
            />
            <StatCard
              icon={Zap}
              label="Hot Storage"
              value={stats.hot.count.toString()}
              sub={formatBytes(stats.hot.size)}
              color="bg-orange-900/30 text-orange-400"
              accent="bg-orange-500"
            />
            <StatCard
              icon={HardDrive}
              label="Warm Archive"
              value={stats.warm.count.toString()}
              sub={formatBytes(stats.warm.size)}
              color="bg-accent-900/30 text-accent-400"
              accent="bg-accent-500"
            />
            <StatCard
              icon={Snowflake}
              label="Cold Archive"
              value={stats.cold.count.toString()}
              sub={formatBytes(stats.cold.size)}
              color="bg-cyan-900/30 text-cyan-400"
              accent="bg-cyan-500"
            />
          </div>

          {/* File browser */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-500" />
                <span className="font-semibold text-sm text-primary-100">Encrypted Vault</span>
                {!loading && (
                  <span className="text-[10px] text-primary-100/30 font-code ml-1">
                    {filtered.folders.length + filtered.files.length} items
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLoading(true)}
                  className="text-primary-100/25 hover:text-primary-100/60 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.button>
                <div className="flex items-center gap-1.5 text-xs font-code">
                  <Lock className="w-3 h-3 enc-locked" />
                  <span className="text-primary-100/35">End-to-end encrypted</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className={`grid ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"} gap-3`}>
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <>
                  {view === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {/* Folders */}
                      {filtered.folders.map(folder => (
                        <motion.button
                          key={folder._id}
                          whileHover={{ scale: 1.04, y: -3 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => navigateToFolder(folder)}
                          className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 text-center group border-2 border-transparent hover:border-accent-500/25 transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-accent-900/30 border border-accent-800/30 flex items-center justify-center group-hover:border-accent-500/50 group-hover:bg-accent-900/50 transition-all">
                            <Folder className="w-6 h-6 text-accent-500" fill="currentColor" fillOpacity={0.15} />
                          </div>
                          <p className="text-xs font-medium text-primary-100 truncate w-full">{folder.name}</p>
                          <p className="text-[10px] text-primary-100/28">{new Date(folder.createdAt).toLocaleDateString()}</p>
                        </motion.button>
                      ))}
                      {/* Files */}
                      {filtered.files.map(file => (
                        <motion.div
                          key={file._id}
                          whileHover={{ scale: 1.04, y: -3 }}
                          className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 text-center cursor-pointer group border-2 border-transparent hover:border-accent-500/25 transition-all relative"
                        >
                          <div className="absolute top-2.5 right-2.5">
                            <Lock className="w-2.5 h-2.5 enc-locked opacity-70" />
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-secondary-800/50 border border-secondary-500/25 flex items-center justify-center text-primary-100/40 group-hover:text-accent-500 group-hover:border-accent-500/30 transition-all">
                            {fileIcon(file.filename)}
                          </div>
                          <p className="text-xs font-medium text-primary-100 truncate w-full" title={file.filename}>{file.filename}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] text-primary-100/28">{formatBytes(file.size)}</p>
                            {file.storageLevel === "hot" && <span className="badge-hot  text-[9px] px-1.5 py-0.5 rounded-full">HOT</span>}
                            {file.storageLevel === "warm" && <span className="badge-warm text-[9px] px-1.5 py-0.5 rounded-full">WARM</span>}
                            {file.storageLevel === "cold" && <span className="badge-cold text-[9px] px-1.5 py-0.5 rounded-full">COLD</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* List view */
                    <div className="space-y-1">
                      {filtered.folders.map(folder => (
                        <motion.button
                          key={folder._id}
                          whileHover={{ x: 3 }}
                          onClick={() => navigateToFolder(folder)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/4 transition-all group"
                        >
                          <FolderOpen className="w-5 h-5 text-accent-500 flex-shrink-0" />
                          <span className="flex-1 text-sm font-medium text-primary-100 text-left">{folder.name}</span>
                          <span className="text-xs text-primary-100/28">{new Date(folder.createdAt).toLocaleDateString()}</span>
                          <ChevronRight className="w-4 h-4 text-primary-100/18 group-hover:text-primary-100/60 flex-shrink-0" />
                        </motion.button>
                      ))}
                      {filtered.files.map(file => (
                        <motion.div
                          key={file._id}
                          whileHover={{ x: 3 }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/4 transition-all cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary-800/50 border border-secondary-500/18 flex items-center justify-center text-primary-100/45 flex-shrink-0">
                            {fileIcon(file.filename)}
                          </div>
                          <span className="flex-1 text-sm font-medium text-primary-100 truncate">{file.filename}</span>
                          <span className="text-xs text-primary-100/28 hidden sm:block">{formatBytes(file.size)}</span>
                          {file.storageLevel === "hot" && <span className="badge-hot  text-[9px] px-1.5 py-0.5 rounded-full hidden sm:block">HOT</span>}
                          {file.storageLevel === "warm" && <span className="badge-warm text-[9px] px-1.5 py-0.5 rounded-full hidden sm:block">WARM</span>}
                          {file.storageLevel === "cold" && <span className="badge-cold text-[9px] px-1.5 py-0.5 rounded-full hidden sm:block">COLD</span>}
                          <Lock className="w-3 h-3 enc-locked flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {filtered.folders.length === 0 && filtered.files.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-24 text-center"
                    >
                      <div className="relative mb-6">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-24 h-24 rounded-3xl glass-ultra flex items-center justify-center"
                        >
                          <Shield className="w-12 h-12 text-accent-500/40" strokeWidth={1} />
                        </motion.div>
                        {/* Orbiting ring */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute -inset-4 rounded-full border border-accent-500/10"
                        />
                      </div>
                      <h3 className="font-display font-bold text-xl text-primary-100/55 mb-2">
                        {search ? "No results found" : "This vault is empty"}
                      </h3>
                      <p className="text-sm text-primary-100/28 mb-8 max-w-xs">
                        {search
                          ? "Try a different search term."
                          : "Start by uploading your first encrypted file. All files are AES-256 encrypted in your browser."}
                      </p>
                      {!search && (
                        <Link href="/dashboard/upload">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            className="btn-primary flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-xl"
                          >
                            <UploadCloud className="w-4 h-4" />
                            Upload to Vault
                          </motion.button>
                        </Link>
                      )}
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}