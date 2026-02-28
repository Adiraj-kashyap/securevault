"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, Zap, HardDrive, Snowflake, X, Lock,
  FileKey, ChevronLeft, CheckCircle, AlertTriangle, Loader2, Shield
} from "lucide-react";
import Link from "next/link";
import { useSession } from "../../SessionContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cryptoUtils } from "@/lib/crypto";

type StorageTier = "hot" | "warm" | "cold";

interface QueuedFile {
  id: string;
  file: File;
  status: "queued" | "encrypting" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

const TIERS: { id: StorageTier; label: string; sub: string; icon: any; color: string; badgeClass: string }[] = [
  { id: "hot", label: "Hot", sub: "Instant access · No compression", icon: Zap, color: "text-orange-400 border-orange-500/40 bg-orange-900/20", badgeClass: "badge-hot" },
  { id: "warm", label: "Warm", sub: "Compressed · Standard retrieval", icon: HardDrive, color: "text-accent-400 border-accent-500/40 bg-accent-900/20", badgeClass: "badge-warm" },
  { id: "cold", label: "Cold", sub: "LZMA archive · Deep storage", icon: Snowflake, color: "text-cyan-400 border-cyan-500/40 bg-cyan-900/20", badgeClass: "badge-cold" },
];

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.3 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export default function UploadPage() {
  const { session, isHydrating } = useSession();
  const router = useRouter();
  const [tier, setTier] = useState<StorageTier>("hot");
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [folderName, setFolderName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isHydrating && !session) router.push("/auth");
  }, [session, isHydrating, router]);

  const addFiles = (files: File[]) => {
    const items: QueuedFile[] = files.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      status: "queued",
      progress: 0,
    }));
    setQueue(prev => [...prev, ...items]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) addFiles(files);
  }, []);

  const removeItem = (id: string) => setQueue(prev => prev.filter(q => q.id !== id));

  const updateItem = (id: string, patch: Partial<QueuedFile>) =>
    setQueue(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));

  if (isHydrating || !session) return null;

  const startUpload = async () => {
    const queued = queue.filter(q => q.status === "queued");
    for (const item of queued) {
      try {
        updateItem(item.id, { status: "encrypting", progress: 10 });
        // Encrypt file client-side using the session AES key
        const aesKey = cryptoUtils.generateAESKey();
        const encBlob = await cryptoUtils.encryptFile(item.file, aesKey);
        const encKey = await cryptoUtils.encryptAESKeyWithPublic(aesKey, session.publicKey);
        updateItem(item.id, { status: "uploading", progress: 50 });

        const formData = new FormData();
        formData.append("file", encBlob);
        formData.append("encryptedKey", encKey);
        formData.append("storageLevel", tier);
        formData.append("folderId", folderName);
        formData.append("originalName", item.file.name);

        await api.storage.uploadFile(session.token, formData);
        updateItem(item.id, { status: "done", progress: 100 });
      } catch (err) {
        updateItem(item.id, { status: "error", progress: 0, error: (err as Error).message });
      }
    }
  };

  const tierColor: Record<StorageTier, string> = {
    hot: "bg-orange-500",
    warm: "bg-accent-500",
    cold: "bg-cyan-500",
  };

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Vault
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-primary-100 mb-1">
          Encrypt &amp; Upload
        </h1>
        <p className="text-primary-100/40 text-sm mb-8 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 enc-locked" />
          Files are encrypted in your browser before being transmitted.
        </p>

        {/* Storage tier selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {TIERS.map(({ id, label, sub, icon: Icon, color }) => (
            <motion.button
              key={id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTier(id)}
              className={`glass-card p-4 rounded-2xl border-2 transition-all text-left ${tier === id ? `border-current ${color}` : "border-transparent"
                }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${tier === id ? "" : "text-primary-100/30"}`} />
              <p className={`text-sm font-bold ${tier === id ? "" : "text-primary-100/50"}`}>{label}</p>
              <p className="text-[10px] text-primary-100/30 mt-0.5 leading-tight">{sub}</p>
            </motion.button>
          ))}
        </div>

        {/* Drop zone */}
        <motion.div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          animate={{ scale: dragActive ? 1.01 : 1 }}
          className={`dropzone glass-ultra rounded-2xl p-12 text-center cursor-pointer mb-4 ${dragActive ? "drag-over" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
          />
          <motion.div
            animate={{ y: dragActive ? -4 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UploadCloud
              className="w-14 h-14 mx-auto mb-4"
              style={{ color: "rgba(var(--theme-glow-rgb), 0.6)" }}
            />
            <p className="font-display font-bold text-xl text-primary-100 mb-1">
              {dragActive ? "Release to queue files" : "Drop files here"}
            </p>
            <p className="text-sm text-primary-100/40 mb-4">or click to browse</p>
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${tierColor[tier]} animate-pulse-glow`} />
              <span className="text-xs text-primary-100/30 font-code capitalize">{tier} storage selected</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Folder input */}
        <div className="flex gap-3 mb-6">
          <input
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            placeholder="Target folder (optional)"
            className="vault-input flex-1 px-4 py-2.5 text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => folderRef.current?.click()}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap"
          >
            <input ref={folderRef} type="file" className="hidden" />
            Upload Folder
          </motion.button>
        </div>

        {/* File queue */}
        <AnimatePresence>
          {queue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl overflow-hidden mb-6"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <span className="font-semibold text-sm text-primary-100">Upload Queue ({queue.length})</span>
                <button
                  onClick={() => setQueue([])}
                  className="text-xs text-primary-100/30 hover:text-primary-100/70 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                {queue.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary-800/50 border border-secondary-500/20 flex items-center justify-center flex-shrink-0">
                      {item.status === "done" ? <CheckCircle className="w-4 h-4 text-safe" /> :
                        item.status === "error" ? <AlertTriangle className="w-4 h-4 text-danger" /> :
                          item.status === "encrypting" ? <Lock className="w-4 h-4 text-accent-400 animate-pulse" /> :
                            item.status === "uploading" ? <Loader2 className="w-4 h-4 text-accent-500 animate-spin" /> :
                              <FileKey className="w-4 h-4 text-primary-100/40" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-primary-100 truncate">{item.file.name}</p>
                      <div className="mt-1">
                        {item.status === "queued" && <p className="text-[10px] text-primary-100/30">Queued</p>}
                        {item.status === "encrypting" && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-accent-400 font-code">Encrypting AES-256...</p>
                            <ProgressBar value={item.progress} color="bg-accent-500" />
                          </div>
                        )}
                        {item.status === "uploading" && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-accent-300 font-code">Transmitting encrypted blob...</p>
                            <ProgressBar value={item.progress} color="bg-accent-300" />
                          </div>
                        )}
                        {item.status === "done" && <p className="text-[10px] text-safe font-code">Encrypted &amp; stored ✓</p>}
                        {item.status === "error" && <p className="text-[10px] text-danger font-code truncate">{item.error}</p>}
                      </div>
                    </div>
                    {item.status === "queued" && (
                      <button onClick={() => removeItem(item.id)} className="text-primary-100/20 hover:text-primary-100/60 transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload button */}
        {queue.some(q => q.status === "queued") && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={startUpload}
            className="w-full btn-primary flex items-center justify-center gap-2.5 py-4 text-base font-bold"
          >
            <Shield className="w-5 h-5" />
            Encrypt &amp; Upload {queue.filter(q => q.status === "queued").length} file{queue.filter(q => q.status === "queued").length !== 1 ? "s" : ""}
          </motion.button>
        )}

        {/* Zero-knowledge note */}
        <p className="mt-6 text-center text-xs text-primary-100/25 flex items-center justify-center gap-1.5 font-code">
          <Lock className="w-3 h-3" />
          Files are AES-256 encrypted before leaving your browser. The server never sees plaintext.
        </p>
      </motion.div>
    </div>
  );
}