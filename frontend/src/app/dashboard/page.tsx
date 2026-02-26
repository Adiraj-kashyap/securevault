"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, UploadCloud, Shield, Database, Archive, Search, LogOut, Layers } from 'lucide-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'files' | 'messages'>('files');

    return (
        <div className="min-h-screen flex bg-primary-900 overflow-hidden relative">

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/5 blur-[150px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-500/10 blur-[150px] pointer-events-none rounded-full" />

            {/* Sidebar */}
            <aside className="w-64 glass border-r border-secondary-500/20 flex flex-col z-10 hidden md:flex">
                <div className="p-6 border-b border-secondary-500/20 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-accent-500" />
                    <span className="font-bold text-xl text-primary-100 glow-text">Vault</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon={<Folder />} label="My Files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
                    <SidebarItem icon={<Shield />} label="Secure Messaging" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                    <SidebarItem icon={<Archive />} label="Cold Archive" />
                    <SidebarItem icon={<Layers />} label="Key Management" />
                </nav>

                <div className="p-4 border-t border-secondary-500/20">
                    <button className="flex items-center gap-3 text-primary-100/60 hover:text-accent-300 w-full p-3 rounded-xl transition-colors hover:bg-secondary-800/50">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Lock & Exit</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col z-10 relative">

                {/* Header */}
                <header className="h-20 glass border-b border-secondary-500/20 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-100/40" />
                        <input
                            type="text"
                            placeholder="Search encrypted vault..."
                            className="w-full bg-secondary-900/50 border border-secondary-500/30 rounded-full py-2 pl-10 pr-4 text-sm text-primary-100 focus:outline-none focus:border-accent-500/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-primary-100">Agent 007</p>
                            <p className="text-xs text-accent-500">Keys Active 🟢</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary-800 border-2 border-accent-500/50 flex items-center justify-center font-bold text-primary-100 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                            A7
                        </div>
                    </div>
                </header>

                {/* content area */}
                <div className="flex-1 p-8 overflow-y-auto">

                    {/* Quick Upload Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-8 glass-card border-dashed border-2 border-secondary-500/40 hover:border-accent-500/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
                    >
                        <div className="p-4 bg-secondary-800 rounded-full mb-4 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                            <UploadCloud className="w-8 h-8 text-accent-500" />
                        </div>
                        <h3 className="text-lg font-bold text-primary-100 mb-1">Drag & Drop Secure Upload</h3>
                        <p className="text-primary-100/60 text-sm max-w-md">
                            Files are AES-256 encrypted directly in your browser before ever reaching our servers.
                        </p>

                        <div className="mt-6 flex flex-wrap justify-center gap-4">
                            <StorageLevelBadge icon={<Database className="w-4 h-4" />} title="Hot Storage" desc="Instant Decryption" active />
                            <StorageLevelBadge icon={<Archive className="w-4 h-4" />} title="Warm Storage" desc="Compressed" />
                            <StorageLevelBadge icon={<Layers className="w-4 h-4" />} title="Cold Archive" desc="Deep Freeze" />
                        </div>
                    </motion.div>

                    {/* File Grid */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-primary-100 flex items-center gap-2">
                            <Folder className="w-5 h-5 text-accent-500" /> Root Directory
                        </h2>
                        <div className="text-sm text-primary-100/60 font-mono">1.2 GB / 5.0 GB Encrypted</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <FileCard icon={<Folder className="w-10 h-10 text-accent-500" />} name="Financials_2026" details="Folder • 12 items" />
                        <FileCard icon={<Folder className="w-10 h-10 text-accent-500" />} name="Project_Phoenix" details="Folder • 8 items" />
                        <FileCard icon={<File className="w-10 h-10 text-secondary-300" />} name="passwords.kdbx.enc" details="Hot • 2.4 MB" />
                        <FileCard icon={<File className="w-10 h-10 text-secondary-300" />} name="Q3_Report.pdf.enc" details="Hot • 5.1 MB" />
                        <FileCard icon={<Archive className="w-10 h-10 text-secondary-500" />} name="old_photos.tar.xz.enc" details="Cold • 1.4 GB" />
                    </div>

                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active = false, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active
                    ? 'bg-accent-500/10 text-accent-500 border border-accent-500/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'text-primary-100/70 hover:bg-secondary-800/50 hover:text-primary-100'
                }`}
        >
            <div className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );
}

function StorageLevelBadge({ icon, title, desc, active = false }: any) {
    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer transition-all ${active
                ? 'bg-accent-500/20 border-accent-500/50 text-accent-300'
                : 'bg-secondary-900 border-secondary-500/30 text-primary-100/50 hover:border-secondary-500/70'
            }`}>
            {icon}
            <div className="text-left">
                <div className="text-xs font-bold">{title}</div>
                <div className="text-[10px] opacity-70">{desc}</div>
            </div>
        </div>
    );
}

function FileCard({ icon, name, details }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border border-secondary-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-secondary-800/80 hover:border-accent-500/30 transition-all cursor-pointer group"
        >
            <div className="mb-3 group-hover:scale-110 transition-transform">{icon}</div>
            <p className="text-sm font-semibold text-primary-100 truncate w-full">{name}</p>
            <p className="text-xs text-primary-100/50 mt-1 font-mono">{details}</p>
        </motion.div>
    );
}
