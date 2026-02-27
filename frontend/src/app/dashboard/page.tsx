"use client";

import { useEffect, useState } from "react";
import { useSession } from "../SessionContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileKey, Shield, HardDrive, ThermometerSun, Snowflake, UploadCloud, Plus, ChevronRight, LogOut, Loader2 } from "lucide-react";

export default function Dashboard() {
    const { session, logout } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState({ hot: { size: 0, count: 0 }, warm: { size: 0, count: 0 }, cold: { size: 0, count: 0 } });
    const [directory, setDirectory] = useState<{ folders: any[], files: any[] }>({ folders: [], files: [] });
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial Auth Check & Data Fetch
    useEffect(() => {
        if (!session) {
            router.push("/auth");
            return;
        }

        const loadData = async () => {
            try {
                const [statsRes, dirRes] = await Promise.all([
                    api.storage.getStats(session.token),
                    api.storage.getDirectory(session.token, currentFolderId)
                ]);
                setStats(statsRes);
                setDirectory(dirRes);
            } catch (error) {
                console.error("Failed to load vault data", error);
                if ((error as Error).message.includes("Unauthorized")) {
                    logout();
                    router.push("/auth");
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [session, currentFolderId, router, logout]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!session) return null; // Prevent flash before redirect

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 relative">

            {/* Header / Identity */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-primary-100 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-accent-500" />
                        SecureVault Dashboard
                    </h1>
                    <p className="text-primary-100/50 mt-1 font-mono text-sm">
                        ID: {session.email} | Encrypted PGP Keys Loaded
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                    <button className="bg-accent-500 hover:bg-accent-300 text-primary-900 px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" />
                        Secure Upload
                    </button>
                    <button onClick={() => { logout(); router.push('/') }} className="glass hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-primary-100 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Lock Vault
                    </button>
                </motion.div>
            </div>

            {/* 3-Tier Storage Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { title: "Hot Storage", icon: <ThermometerSun className="w-6 h-6 text-orange-400" />, desc: "Instant Access (Uncompressed)", data: stats.hot, glow: "hover:shadow-orange-500/10" },
                    { title: "Warm Storage", icon: <HardDrive className="w-6 h-6 text-accent-500" />, desc: "Standard Zlib Compression", data: stats.warm, glow: "hover:shadow-accent-500/10" },
                    { title: "Cold Archive", icon: <Snowflake className="w-6 h-6 text-cyan-400" />, desc: "Deep LZMA Compression", data: stats.cold, glow: "hover:shadow-cyan-500/10" }
                ].map((tier, i) => (
                    <motion.div
                        key={tier.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-card p-6 ${tier.glow}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-secondary-900/50 rounded-xl border border-secondary-500/30">
                                {tier.icon}
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-primary-100">{formatBytes(tier.data.size)}</span>
                                <span className="text-xs text-primary-100/50">{tier.data.count} Blobs</span>
                            </div>
                        </div>
                        <h3 className="font-semibold text-primary-100">{tier.title}</h3>
                        <p className="text-xs text-primary-100/50">{tier.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Directory Explorer */}
            <div className="glass-card rounded-2xl overflow-hidden border border-secondary-500/30">
                <div className="p-4 border-b border-secondary-500/30 bg-secondary-900/30 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-primary-100/70">
                        <button
                            onClick={() => setCurrentFolderId(null)}
                            className="hover:text-accent-500 transition-colors"
                        >
                            Root
                        </button>
                        {currentFolderId && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-primary-100">Current Folder</span>
                            </>
                        )}
                    </div>
                    <button className="text-sm font-semibold flex items-center gap-2 text-accent-500 hover:text-accent-300 transition-colors">
                        <Plus className="w-4 h-4" /> New Folder
                    </button>
                </div>
                <div className="p-2 min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 opacity-50">
                            <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                            {/* Render Folders First */}
                            {directory.folders.map(folder => (
                                <motion.button
                                    key={folder._id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCurrentFolderId(folder._id)}
                                    className="p-4 rounded-xl border border-secondary-500/30 bg-primary-900/30 flex items-center gap-4 hover:border-accent-500/50 transition-all text-left"
                                >
                                    <Folder className={`w-8 h-8 ${folder.colorTheme === 'gold' ? 'text-accent-500' : 'text-emerald-500'} fill-current/20`} />
                                    <div>
                                        <p className="font-medium text-sm text-primary-100 truncate w-32">{folder.name}</p>
                                        <p className="text-xs text-primary-100/40">{new Date(folder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </motion.button>
                            ))}

                            {/* Render Files */}
                            {directory.files.map(file => (
                                <motion.div
                                    key={file._id}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-xl border border-secondary-500/30 bg-primary-900/30 flex items-start gap-4 hover:border-accent-500/50 transition-all cursor-pointer group"
                                >
                                    <div className="relative">
                                        <FileKey className="w-8 h-8 text-primary-100/50 group-hover:text-accent-500 transition-colors" />
                                        {file.storageLevel === 'hot' && <ThermometerSun className="w-3 h-3 text-orange-400 absolute -bottom-1 -right-1" />}
                                        {file.storageLevel === 'warm' && <HardDrive className="w-3 h-3 text-accent-500 absolute -bottom-1 -right-1" />}
                                        {file.storageLevel === 'cold' && <Snowflake className="w-3 h-3 text-cyan-400 absolute -bottom-1 -right-1" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-sm text-primary-100 truncate w-28" title={file.filename}>{file.filename}</p>
                                        <p className="text-xs text-primary-100/40">{formatBytes(file.size)}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {directory.folders.length === 0 && directory.files.length === 0 && (
                                <div className="col-span-full py-12 text-center text-primary-100/40 italic">
                                    This vault directory is empty.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
