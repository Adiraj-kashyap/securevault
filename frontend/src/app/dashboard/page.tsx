"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Folder, FileKey, Shield, HardDrive, ThermometerSun, Snowflake,
  UploadCloud, Plus, ChevronRight, LogOut, Loader2, MessageSquare,
  Settings, User, Activity, Search, Grid3x3, List, Lock,
  FileText, Image, Video, Archive, ChevronLeft, Home
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
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return <Image className="w-5 h-5" />;
  if (["mp4","mov","avi","mkv"].includes(ext)) return <Video className="w-5 h-5" />;
  if (["zip","tar","gz","rar","7z"].includes(ext)) return <Archive className="w-5 h-5" />;
  if (["pdf","doc","docx","txt","md"].includes(ext)) return <FileText className="w-5 h-5" />;
  return <FileKey className="w-5 h-5" />;
}

function EncryptionBadge() {
  return (
    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-safe">
      <Lock className="w-3 h-3 enc-locked" />
      <span>E2E</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub: string; color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5 rounded-2xl"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <EncryptionBadge />
      </div>
      <p className="font-display font-bold text-2xl text-primary-100">{value}</p>
      <p className="text-sm text-primary-100/60 mt-0.5">{label}</p>
      <p className="text-xs text-primary-100/30 font-code mt-1">{sub}</p>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-2 animate-pulse">
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="shimmer h-3 w-1/2 rounded" />
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const { session, logout } = useSession();
  const router = useRouter();

  const [stats, setStats]         = useState({ hot:{size:0,count:0}, warm:{size:0,count:0}, cold:{size:0,count:0} });
  const [directory, setDirectory] = useState<{ folders: any[]; files: any[] }>({ folders: [], files: [] });
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string|null; name: string }[]>([{ id: null, name: "Root" }]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [search, setSearch]       = useState("");
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

  const navigateToBreadcrumb = useCallback((bc: { id: string|null; name: string }, idx: number) => {
    setCurrentFolderId(bc.id);
    setBreadcrumbs(prev => prev.slice(0, idx + 1));
  }, []);

  const filtered = {
    folders: directory.folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
    files:   directory.files.filter(f => f.filename.toLowerCase().includes(search.toLowerCase())),
  };

  const totalFiles = stats.hot.count + stats.warm.count + stats.cold.count;
  const totalSize  = stats.hot.size + stats.warm.size + stats.cold.size;

  if (!session) return null;

  return (
    <div className="min-h-screen flex relative">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed left-0 top-[76px] bottom-0 w-64 glass-panel z-30 flex flex-col py-6 px-3"
          >
            {/* User identity */}
            <div className="px-3 mb-6">
              <div className="glass rounded-xl p-3 flex items-center gap-3">
                {/* Identicon placeholder */}
                <div className="w-10 h-10 rounded-xl identicon-placeholder flex items-center justify-center flex-shrink-0">
                  <span className="font-code font-bold text-accent-300">
                    {session.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-primary-100 truncate">{session.email}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse-glow" />
                    <span className="text-[10px] text-primary-100/40 font-code">Vault Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-1 flex-1">
              {[
                { href: "/dashboard",  label: "My Vault",   icon: Shield,     active: true  },
                { href: "/dashboard/upload", label: "Upload",  icon: UploadCloud, active: false },
                { href: "/messages",   label: "Messages",   icon: MessageSquare, active: false },
                { href: "/audit-log",  label: "Audit Log",  icon: Activity,   active: false  },
                { href: "/profile",    label: "Key Profile", icon: User,       active: false  },
                { href: "/settings",   label: "Settings",   icon: Settings,   active: false  },
              ].map(({ href, label, icon: Icon, active }) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-accent-900/40 text-accent-300 border border-accent-800/30"
                        : "text-primary-100/50 hover:text-primary-100 hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-accent-500" : ""}`} />
                    {label}
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Storage usage mini-bar */}
            <div className="px-1 mt-4">
              <div className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-primary-100/40">Vault Storage</span>
                  <span className="text-xs font-code text-accent-300">{formatBytes(totalSize)}</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {[
                    { v: stats.hot.size,  c: "bg-orange-500" },
                    { v: stats.warm.size, c: "bg-accent-500"  },
                    { v: stats.cold.size, c: "bg-cyan-500"   },
                  ].map(({ v, c }, i) => (
                    <motion.div
                      key={i}
                      initial={{ width: 0 }}
                      animate={{ width: totalSize ? `${(v / totalSize) * 100}%` : "33%" }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`${c} rounded-full min-w-[4px]`}
                    />
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  {[["Hot","bg-orange-500"],["Warm","bg-accent-500"],["Cold","bg-cyan-500"]].map(([n,c]) => (
                    <div key={n} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${c}`} />
                      <span className="text-[10px] text-primary-100/30">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ x: 3 }}
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-3 px-4 py-2.5 mx-1 mt-4 rounded-xl text-sm text-primary-100/40 hover:text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} min-w-0`}>
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Top bar */}
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(v => !v)}
              className="btn-ghost p-2 rounded-xl"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </motion.button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
              {breadcrumbs.map((bc, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-primary-100/20" />}
                  <button
                    onClick={() => navigateToBreadcrumb(bc, i)}
                    className={`text-sm transition-colors truncate max-w-[120px] ${
                      i === breadcrumbs.length - 1
                        ? "text-primary-100 font-semibold"
                        : "text-primary-100/40 hover:text-primary-100"
                    }`}
                  >
                    {i === 0 ? <Home className="w-4 h-4 inline" /> : bc.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-100/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vault..."
                className="vault-input pl-9 pr-4 py-2 text-sm w-52"
              />
            </div>

            {/* View toggle */}
            <div className="flex p-1 rounded-xl bg-primary-800/60 border border-white/5">
              {(["grid","list"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-1.5 rounded-lg transition-all ${
                    view === v ? "bg-accent-500 text-primary-900" : "text-primary-100/40 hover:text-primary-100"
                  }`}
                >
                  {v === "grid" ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Upload button */}
            <Link href="/dashboard/upload">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </motion.button>
            </Link>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={Shield}
              label="Total Files"
              value={totalFiles.toString()}
              sub={`${formatBytes(totalSize)} encrypted`}
              color="bg-accent-900/40 text-accent-500"
            />
            <StatCard
              icon={ThermometerSun}
              label="Hot Storage"
              value={stats.hot.count.toString()}
              sub={formatBytes(stats.hot.size)}
              color="bg-orange-900/30 text-orange-400"
            />
            <StatCard
              icon={HardDrive}
              label="Warm Archive"
              value={stats.warm.count.toString()}
              sub={formatBytes(stats.warm.size)}
              color="bg-accent-900/30 text-accent-400"
            />
            <StatCard
              icon={Snowflake}
              label="Cold Archive"
              value={stats.cold.count.toString()}
              sub={formatBytes(stats.cold.size)}
              color="bg-cyan-900/30 text-cyan-400"
            />
          </motion.div>

          {/* File browser */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-500" />
                <span className="font-semibold text-sm text-primary-100">Encrypted Vault</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-code">
                <Lock className="w-3 h-3 enc-locked" />
                <span className="text-primary-100/40">End-to-end encrypted</span>
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
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => navigateToFolder(folder)}
                          className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 text-center group border-2 border-transparent hover:border-accent-500/30 transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-accent-900/30 border border-accent-800/30 flex items-center justify-center group-hover:border-accent-500/40 transition-all">
                            <Folder className="w-6 h-6 text-accent-500" fill="currentColor" fillOpacity={0.2} />
                          </div>
                          <p className="text-xs font-medium text-primary-100 truncate w-full">{folder.name}</p>
                          <p className="text-[10px] text-primary-100/30">{new Date(folder.createdAt).toLocaleDateString()}</p>
                        </motion.button>
                      ))}
                      {/* Files */}
                      {filtered.files.map(file => (
                        <motion.div
                          key={file._id}
                          whileHover={{ scale: 1.03, y: -2 }}
                          className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 text-center cursor-pointer group border-2 border-transparent hover:border-accent-500/30 transition-all relative"
                        >
                          {/* Encryption indicator */}
                          <div className="absolute top-2 right-2">
                            <Lock className="w-3 h-3 enc-locked" />
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-secondary-800/50 border border-secondary-500/30 flex items-center justify-center text-primary-100/50 group-hover:text-accent-500 group-hover:border-accent-500/30 transition-all">
                            {fileIcon(file.filename)}
                          </div>
                          <p className="text-xs font-medium text-primary-100 truncate w-full" title={file.filename}>{file.filename}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] text-primary-100/30">{formatBytes(file.size)}</p>
                            {file.storageLevel === "hot"  && <span className="badge-hot  text-[9px] px-1.5 py-0.5 rounded-full font-bold">HOT</span>}
                            {file.storageLevel === "warm" && <span className="badge-warm text-[9px] px-1.5 py-0.5 rounded-full font-bold">WARM</span>}
                            {file.storageLevel === "cold" && <span className="badge-cold text-[9px] px-1.5 py-0.5 rounded-full font-bold">COLD</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* List view */
                    <div className="space-y-1.5">
                      {filtered.folders.map(folder => (
                        <motion.button
                          key={folder._id}
                          whileHover={{ x: 2 }}
                          onClick={() => navigateToFolder(folder)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
                        >
                          <Folder className="w-5 h-5 text-accent-500 flex-shrink-0" fill="currentColor" fillOpacity={0.2} />
                          <span className="flex-1 text-sm font-medium text-primary-100 text-left">{folder.name}</span>
                          <span className="text-xs text-primary-100/30">{new Date(folder.createdAt).toLocaleDateString()}</span>
                          <ChevronRight className="w-4 h-4 text-primary-100/20 group-hover:text-primary-100/60" />
                        </motion.button>
                      ))}
                      {filtered.files.map(file => (
                        <motion.div
                          key={file._id}
                          whileHover={{ x: 2 }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary-800/50 border border-secondary-500/20 flex items-center justify-center text-primary-100/50 flex-shrink-0">
                            {fileIcon(file.filename)}
                          </div>
                          <span className="flex-1 text-sm font-medium text-primary-100 truncate">{file.filename}</span>
                          <span className="text-xs text-primary-100/30 hidden sm:block">{formatBytes(file.size)}</span>
                          {file.storageLevel === "hot"  && <span className="badge-hot  text-[9px] px-1.5 py-0.5 rounded-full font-bold hidden sm:block">HOT</span>}
                          {file.storageLevel === "warm" && <span className="badge-warm text-[9px] px-1.5 py-0.5 rounded-full font-bold hidden sm:block">WARM</span>}
                          {file.storageLevel === "cold" && <span className="badge-cold text-[9px] px-1.5 py-0.5 rounded-full font-bold hidden sm:block">COLD</span>}
                          <Lock className="w-3.5 h-3.5 enc-locked flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {filtered.folders.length === 0 && filtered.files.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-20 text-center"
                    >
                      <div className="w-20 h-20 rounded-2xl identicon-placeholder flex items-center justify-center mb-4">
                        <Shield className="w-10 h-10 text-accent-500/50" strokeWidth={1} />
                      </div>
                      <h3 className="font-display font-bold text-lg text-primary-100/60 mb-1">
                        {search ? "No results found" : "This vault is empty"}
                      </h3>
                      <p className="text-sm text-primary-100/30 mb-6">
                        {search ? "Try a different search term." : "Start by uploading your first encrypted file."}
                      </p>
                      {!search && (
                        <Link href="/dashboard/upload">
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold"
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