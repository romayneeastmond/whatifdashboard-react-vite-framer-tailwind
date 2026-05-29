import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { exportNotion, exportObsidian, exportMcpRag, exportExcel } from '../utils/exportMarkdown';

const handleExport = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) data[key] = localStorage.getItem(key) || '';
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatif-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

const handleImport = (file: File, onDone: () => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            localStorage.clear();
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, value as string);
            });
            onDone();
            window.location.reload();
        } catch {
            alert('Invalid backup file');
        }
    };
    reader.readAsText(file);
};

export const DataPage = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPurgeModal, setShowPurgeModal] = useState(false);

    const exportOptions = [
        {
            emoji: '🗂️',
            label: 'JSON Backup',
            description: 'Full backup of all calculator data as a JSON file. Use this to restore your data later.',
            action: handleExport,
        },
        {
            emoji: '📊',
            label: 'Excel (.xlsx)',
            description: 'All calculator results formatted as a spreadsheet with one sheet per calculator.',
            action: exportExcel,
        },
        {
            emoji: '📋',
            label: 'Notion (.zip)',
            description: 'Markdown files formatted for pasting into Notion pages.',
            action: () => exportNotion(),
        },
        {
            emoji: '💎',
            label: 'Obsidian (.zip)',
            description: 'Markdown files formatted for an Obsidian vault, with wiki-style links.',
            action: () => exportObsidian(),
        },
        {
            emoji: '🤖',
            label: 'MCP / RAG (.json)',
            description: 'Structured JSON optimised for AI tools, MCP servers, and retrieval-augmented generation.',
            action: exportMcpRag,
        },
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-12">

            {/* Export */}
            <section aria-labelledby="export-heading">
                <h2 id="export-heading" className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-white/30 font-normal mb-4">
                    Export
                </h2>
                <div className="space-y-3">
                    {exportOptions.map(({ emoji, label, description, action }) => (
                        <button
                            key={label}
                            onClick={action}
                            className="w-full flex items-start gap-4 px-5 py-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15 transition-colors text-left group"
                        >
                            <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 text-lg leading-none">
                                {emoji}
                            </span>
                            <span className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-2">
                                    <Download size={12} className="text-slate-400 dark:text-white/30" />
                                    {label}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-white/40">{description}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Import */}
            <section aria-labelledby="import-heading">
                <h2 id="import-heading" className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-white/30 font-normal mb-4">
                    Import
                </h2>
                <label className="w-full flex items-start gap-4 px-5 py-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15 transition-colors cursor-pointer group">
                    <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40">
                        <Upload size={16} className="text-teal-600 dark:text-teal-400" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-2">
                            <Upload size={12} className="text-slate-400 dark:text-white/30" />
                            Restore from JSON Backup
                        </span>
                        <span className="text-xs text-slate-500 dark:text-white/40">
                            Select a <code className="font-mono">.json</code> file previously exported from this app. All current data will be replaced.
                        </span>
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        aria-label="Select JSON backup file to import"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImport(file, () => {});
                        }}
                    />
                </label>
            </section>

            {/* Purge */}
            <section aria-labelledby="purge-heading">
                <h2 id="purge-heading" className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-white/30 font-normal mb-4">
                    Danger Zone
                </h2>
                <div className="border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 px-5 py-4 flex items-start gap-4">
                    <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950">
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-0.5">Purge All Data</p>
                        <p className="text-xs text-red-500 dark:text-red-500/70 mb-4">
                            Permanently deletes all saved inputs, preferences, and settings stored in your browser. This cannot be undone.
                        </p>
                        <button
                            onClick={() => setShowPurgeModal(true)}
                            className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                        >
                            Purge Everything
                        </button>
                    </div>
                </div>
            </section>

            {/* Purge confirmation modal */}
            {showPurgeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-red-200 dark:border-red-900">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950">
                                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Purge All Data</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                            This will permanently delete all saved inputs, preferences, and settings stored in your browser. This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowPurgeModal(false)}
                                className="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    setShowPurgeModal(false);
                                    window.location.reload();
                                }}
                                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                            >
                                Purge Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
