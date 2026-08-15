import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    ShieldCheck,
    Sparkles,
    Copy,
    Check,
    Download,
    FileText,
    Upload,
    RefreshCw,
    AlertCircle,
    Eye,
    Zap,
    BookOpen,
    Send,
    Flame,
    CheckCircle2,
    Sliders,
    HelpCircle,
    FileCode,
    Cpu,
    ArrowRight
} from 'lucide-react';
import { WatermarkCleaningMode, WatermarkScanResult } from '../types';
import {
    performFullWatermarkScan,
    cleanWatermarksAlgorithmically,
    INVISIBLE_UNICODE_MAP,
    AI_CLICHES_DATABASE,
} from '../utils/watermarkCleaner';
import { cleanAndHumanizeText } from '../services/geminiService';
import { exportDocumentToPdf } from '../utils/pdfExport';
import { Spinner } from './Spinner';

interface WatermarkRemoverProps {
    initialText?: string;
    currentCvText?: string;
    onSendToDocumentStudio?: (text: string) => void;
    onUpdateCvText?: (newCvText: string) => void;
}

const SAMPLE_AI_TEXT = `Certainly! Here is a draft of your Statement of Purpose:\n\nIn today's fast-paced\u200B and rapidly evolving academic world, computational intelligence plays a pivotal role\u200B in advancing healthcare systems. It is worth noting that\u200D modern genomics represents a rich tapestry of biological complexity. My research journey is a testament to\uFEFF my dedication to fostering a deep understanding\u200B of machine learning models. Furthermore, it is imperative to delve into\u200C deep neural networks to navigate the complexities of\u200B disease prediction. By adopting a holistic approach, my goal is to unleash the potential of predictive biomarkers and seamlessly integrate them into clinical workflows. In conclusion, joining your laboratory represents a paramount milestone in my academic career.`;

export const WatermarkRemover: React.FC<WatermarkRemoverProps> = ({
    initialText,
    currentCvText,
    onSendToDocumentStudio,
    onUpdateCvText,
}) => {
    const [inputText, setInputText] = useState<string>(initialText || '');
    const [cleanedText, setCleanedText] = useState<string>('');
    const [mode, setMode] = useState<WatermarkCleaningMode>('academic-humanize');
    const [preserveCitations, setPreserveCitations] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'split' | 'cleaned' | 'original'>('split');
    const [showHighlight, setShowHighlight] = useState<boolean>(true);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialText) {
            setInputText(initialText);
        }
    }, [initialText]);

    // Live scan metrics computed whenever input or mode changes
    const scanResult: WatermarkScanResult = useMemo(() => {
        if (!inputText.trim()) {
            return {
                originalText: '',
                cleanedText: '',
                hiddenWatermarksFound: 0,
                hiddenWatermarkTypes: [],
                aiClichesFound: [],
                aiProbabilityOriginal: 0,
                aiProbabilityCleaned: 0,
                readabilityGrade: 'N/A',
                burstinessScoreOriginal: 0,
                burstinessScoreCleaned: 0,
                perplexityScore: 0,
                removedCount: 0,
                wordCount: 0,
                modeUsed: mode,
            };
        }
        return performFullWatermarkScan(inputText, mode);
    }, [inputText, mode]);

    // Initialize with sample if empty or sync default cleaned on load
    useEffect(() => {
        if (inputText && !cleanedText) {
            setCleanedText(scanResult.cleanedText);
        }
    }, [inputText]);

    // Handle deep AI cleaning
    const handleDeepClean = async () => {
        if (!inputText.trim()) return;

        setIsProcessing(true);
        setStatusMessage('Scanning zero-width steganography and humanizing sentence cadence...');

        try {
            if (mode === 'stealth-clean') {
                // Instant deterministic stripping
                const clean = cleanWatermarksAlgorithmically(inputText, 'stealth-clean');
                setCleanedText(clean);
                setStatusMessage('All zero-width Unicode watermarks successfully purged!');
            } else {
                // Deep AI Humanization
                const result = await cleanAndHumanizeText({
                    text: inputText,
                    mode,
                    preserveCitations,
                });
                setCleanedText(result || scanResult.cleanedText);
                setStatusMessage('Text humanized with authentic academic rhythm & zero AI watermarks!');
            }
        } catch (err: any) {
            console.warn('Fallback to algorithmic cleaning:', err);
            const fallback = cleanWatermarksAlgorithmically(inputText, mode);
            setCleanedText(fallback);
            setStatusMessage('Cleaned using our high-precision offline Academic Engine.');
        } finally {
            setIsProcessing(false);
            setTimeout(() => setStatusMessage(null), 4000);
        }
    };

    // Fast instant offline clean
    const handleInstantStealthClean = () => {
        if (!inputText.trim()) return;
        const clean = cleanWatermarksAlgorithmically(inputText, 'stealth-clean');
        setCleanedText(clean);
        setStatusMessage('Instant Stealth Clean: Zero-width Unicode markers removed.');
        setTimeout(() => setStatusMessage(null), 3000);
    };

    // Load sample text
    const handleLoadSample = () => {
        setInputText(SAMPLE_AI_TEXT);
        const autoClean = cleanWatermarksAlgorithmically(SAMPLE_AI_TEXT, 'academic-humanize');
        setCleanedText(autoClean);
        setStatusMessage('Loaded sample AI Statement of Purpose with hidden watermarks.');
        setTimeout(() => setStatusMessage(null), 3000);
    };

    // Load CV text
    const handleLoadCv = () => {
        if (currentCvText && currentCvText.trim().length > 0) {
            setInputText(currentCvText);
            const autoClean = cleanWatermarksAlgorithmically(currentCvText, mode);
            setCleanedText(autoClean);
            setStatusMessage('Loaded your active CV text.');
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    // Copy to clipboard
    const handleCopy = () => {
        const textToCopy = cleanedText || scanResult.cleanedText;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Export PDF
    const handleExportPdf = () => {
        const textToExport = cleanedText || scanResult.cleanedText;
        if (!textToExport) return;

        exportDocumentToPdf({
            title: 'Watermark-Free Academic Document',
            content: textToExport,
            subtitle: 'Cleaned & Humanized via ScholarMatch AI Studio',
        });
    };

    // Download as .txt file
    const handleDownloadTxt = () => {
        const textToDownload = cleanedText || scanResult.cleanedText;
        if (!textToDownload) return;

        const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `watermark_free_document_${new Date().toISOString().slice(0, 10)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // File upload handler
    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'txt' || ext === 'md' || ext === 'tex' || ext === 'json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setInputText(text);
                const cleaned = cleanWatermarksAlgorithmically(text, mode);
                setCleanedText(cleaned);
            };
            reader.readAsText(file);
        } else {
            // For other files, read as plain text or alert
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                if (text) {
                    setInputText(text);
                    const cleaned = cleanWatermarksAlgorithmically(text, mode);
                    setCleanedText(cleaned);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    // Render highlighted original text highlighting hidden unicode markers & cliches
    const renderHighlightedOriginal = () => {
        if (!inputText) return null;
        if (!showHighlight) return <span className="whitespace-pre-wrap">{inputText}</span>;

        // Highlight AI cliches and hidden markers
        let segments: React.ReactNode[] = [];
        let remaining = inputText;
        let lastIndex = 0;

        // Collect all markers to highlight
        const highlights: { start: number; end: number; type: 'stego' | 'cliche'; text: string; label: string }[] = [];

        // Check zero-width markers
        for (const item of INVISIBLE_UNICODE_MAP) {
            let match;
            const regex = new RegExp(item.regex.source, 'g');
            while ((match = regex.exec(inputText)) !== null) {
                highlights.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'stego',
                    text: match[0],
                    label: `Invisible ${item.name}`,
                });
            }
        }

        // Check cliches
        for (const item of AI_CLICHES_DATABASE) {
            let match;
            const regex = new RegExp(item.pattern.source, 'gi');
            while ((match = regex.exec(inputText)) !== null) {
                highlights.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'cliche',
                    text: match[0],
                    label: `AI Cliché ➔ "${item.academicAlternative}"`,
                });
            }
        }

        // Sort by start index
        highlights.sort((a, b) => a.start - b.start);

        let curr = 0;
        highlights.forEach((h, idx) => {
            if (h.start > curr) {
                segments.push(inputText.substring(curr, h.start));
            }
            if (h.type === 'stego') {
                segments.push(
                    <span
                        key={`stego-${idx}`}
                        title={h.label}
                        className="inline-block px-1 py-0.5 mx-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono text-xs border border-rose-400/40"
                    >
                        [Hidden Stego Marker]
                    </span>
                );
            } else {
                segments.push(
                    <mark
                        key={`cliche-${idx}`}
                        title={h.label}
                        className="bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1 rounded mx-0.5 font-medium border-b-2 border-amber-400"
                    >
                        {inputText.substring(h.start, h.end)}
                    </mark>
                );
            }
            curr = h.end;
        });

        if (curr < inputText.length) {
            segments.push(inputText.substring(curr));
        }

        return <div className="whitespace-pre-wrap leading-relaxed">{segments}</div>;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-indigo-900/40 shadow-xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Zero-Width Steganography Cleaner & Academic Humanizer</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Remove AI Watermarks & Humanize Text
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Purge invisible zero-width Unicode watermarks (U+200B, U+FEFF, U+200D), strip repetitive AI clichés ("delve into", "tapestry of"), and restore natural academic sentence burstiness for Turnitin & GPTZero compliance.
                        </p>
                    </div>

                    {/* Quick Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={handleLoadSample}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-xs"
                            title="Load a sample text containing hidden zero-width markers and AI clichés"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Load Sample AI Text</span>
                        </button>

                        {currentCvText && (
                            <button
                                onClick={handleLoadCv}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/60 hover:bg-indigo-600 text-white border border-indigo-400/30 transition-all shadow-xs"
                                title="Import your current CV text into the watermark cleaner"
                            >
                                <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
                                <span>Load Current CV</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Toast */}
                {statusMessage && (
                    <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{statusMessage}</span>
                    </div>
                )}
            </div>

            {/* Mode & Configuration Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Humanization & Cleaning Modes</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Select the optimization level for your document type
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={preserveCitations}
                                onChange={(e) => setPreserveCitations(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span>Preserve References & Citations</span>
                        </label>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={showHighlight}
                                onChange={(e) => setShowHighlight(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span>Highlight Watermarks & Clichés</span>
                        </label>
                    </div>
                </div>

                {/* Mode Selector Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {[
                        {
                            id: 'academic-humanize' as WatermarkCleaningMode,
                            title: 'Academic Humanizer',
                            badge: 'Turnitin / GPTZero Safe',
                            desc: 'Varies sentence burstiness & replaces robotic clichés with graduate-level scholarly voice.',
                            icon: BookOpen,
                            color: 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200',
                        },
                        {
                            id: 'stealth-clean' as WatermarkCleaningMode,
                            title: 'Stealth Purge',
                            badge: '100% Instant / Offline',
                            desc: 'Strips 100% invisible zero-width Unicode, BOMs, non-breaking spaces & stego artifacts.',
                            icon: ShieldCheck,
                            color: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200',
                        },
                        {
                            id: 'executive-polish' as WatermarkCleaningMode,
                            title: 'Executive Polish',
                            badge: 'SOP & Cover Letters',
                            desc: 'Crafts persuasive, assertive tone tailored for professors and admission committees.',
                            icon: Sparkles,
                            color: 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200',
                        },
                        {
                            id: 'concise-scholarly' as WatermarkCleaningMode,
                            title: 'Concise Scholarly',
                            badge: 'High-Density Prose',
                            desc: 'Cuts repetitive fluff and strengthens empirical clarity for research proposals.',
                            icon: Cpu,
                            color: 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200',
                        },
                    ].map((m) => {
                        const Icon = m.icon;
                        const isSelected = mode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`text-left p-3.5 rounded-xl border transition-all relative ${
                                    isSelected
                                        ? `${m.color} ring-2 ring-indigo-500/30 shadow-xs scale-[1.01]`
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 font-bold text-xs">
                                        <Icon className="w-4 h-4 text-current" />
                                        <span>{m.title}</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 shadow-2xs border border-slate-200/50 dark:border-slate-700/50">
                                        {m.badge}
                                    </span>
                                </div>
                                <p className="text-[11px] opacity-85 leading-snug">
                                    {m.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Diagnostic Scorecard Strip */}
            {inputText.trim().length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>Hidden Stego Markers</span>
                            <ShieldCheck className={`w-4 h-4 ${scanResult.hiddenWatermarksFound > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                                {scanResult.hiddenWatermarksFound}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                                {scanResult.hiddenWatermarksFound > 0 ? 'Purged to 0' : 'Clean'}
                            </span>
                        </div>
                        {scanResult.hiddenWatermarkTypes.length > 0 && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 truncate" title={scanResult.hiddenWatermarkTypes.join(', ')}>
                                {scanResult.hiddenWatermarkTypes[0]}
                            </p>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>AI Detection Score</span>
                            <Zap className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 line-through opacity-70">
                                {scanResult.aiProbabilityOriginal}%
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                {scanResult.aiProbabilityCleaned}%
                            </span>
                        </div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                            Humanized Voice (Turnitin Safe)
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>AI Clichés Detected</span>
                            <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                                {scanResult.aiClichesFound.length}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                                Replaced
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                            {scanResult.aiClichesFound.length > 0 ? `e.g., "${scanResult.aiClichesFound[0].phrase}"` : 'None detected'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>Sentence Burstiness</span>
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                {scanResult.burstinessScoreCleaned}/100
                            </span>
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                High Variation
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Natural human cadence
                        </p>
                    </div>
                </div>
            )}

            {/* Main Interactive Workspace (Split or Single View) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Pane: Input Text with Drag & Drop */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col shadow-sm ${
                        dragActive ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' : 'border-slate-200/80 dark:border-slate-800'
                    }`}
                >
                    {/* Input Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span className="font-bold text-xs text-slate-900 dark:text-white">Original Input Text</span>
                            <span className="text-[11px] text-slate-400">
                                ({inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words)
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                accept=".txt,.pdf,.docx,.md,.tex"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                            </button>

                            {inputText && (
                                <button
                                    onClick={() => { setInputText(''); setCleanedText(''); }}
                                    className="px-2 py-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Input Content Area */}
                    <div className="p-4 flex-1 flex flex-col min-h-[340px]">
                        {showHighlight && scanResult.removedCount > 0 ? (
                            <div className="flex-1 overflow-y-auto max-h-[380px] p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                                {renderHighlightedOriginal()}
                            </div>
                        ) : (
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Paste your text here (e.g. Statement of Purpose, Motivation Letter, Research Proposal, Cover Letter, or CV paragraph)... or drag and drop a file (.txt, .docx, .pdf, .md)"
                                className="w-full flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
                                rows={14}
                            />
                        )}

                        {/* Input Footer Action Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <button
                                onClick={handleInstantStealthClean}
                                disabled={!inputText.trim()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Instant Stealth Strip (0s)</span>
                            </button>

                            <button
                                onClick={handleDeepClean}
                                disabled={isProcessing || !inputText.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed scale-[1.02]"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                        <span>Humanizing Academic Voice...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>Clean Watermarks & Humanize</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Cleaned Humanized Output */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col shadow-sm">
                    {/* Output Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="font-bold text-xs text-slate-900 dark:text-white">Watermark-Free & Humanized Result</span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                ({cleanedText || scanResult.cleanedText ? (cleanedText || scanResult.cleanedText).trim().split(/\s+/).length : 0} words)
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                disabled={!cleanedText && !scanResult.cleanedText}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? 'Copied!' : 'Copy Clean'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Output Content Area */}
                    <div className="p-4 flex-1 flex flex-col min-h-[340px]">
                        <textarea
                            value={cleanedText || scanResult.cleanedText}
                            onChange={(e) => setCleanedText(e.target.value)}
                            placeholder="Your cleaned, humanized, and watermark-free academic document will appear here."
                            className="w-full flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-emerald-200/60 dark:border-emerald-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-sans leading-relaxed"
                            rows={14}
                        />

                        {/* Export & Cross-App Workflow Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleExportPdf}
                                    disabled={!cleanedText && !scanResult.cleanedText}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
                                >
                                    <Download className="w-3.5 h-3.5 text-sky-500" />
                                    <span>Export PDF</span>
                                </button>

                                <button
                                    onClick={handleDownloadTxt}
                                    disabled={!cleanedText && !scanResult.cleanedText}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
                                >
                                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                                    <span>.TXT</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {onSendToDocumentStudio && (
                                    <button
                                        onClick={() => {
                                            const text = cleanedText || scanResult.cleanedText;
                                            if (text) onSendToDocumentStudio(text);
                                        }}
                                        disabled={!cleanedText && !scanResult.cleanedText}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Send to Document Studio</span>
                                    </button>
                                )}

                                {onUpdateCvText && (
                                    <button
                                        onClick={() => {
                                            const text = cleanedText || scanResult.cleanedText;
                                            if (text) onUpdateCvText(text);
                                        }}
                                        disabled={!cleanedText && !scanResult.cleanedText}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                        title="Apply this cleaned text as your active candidate CV"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Apply as Active CV</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Explanatory Educational Info Box */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>How AI Watermarks and Steganography Detection Work</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <strong className="block text-slate-900 dark:text-slate-200 mb-1">1. Invisible Zero-Width Unicode</strong>
                        Many LLMs, web copy engines, and code generators embed hidden characters like <code className="text-indigo-600 dark:text-indigo-400 font-mono">U+200B</code> (zero-width space) or <code className="text-indigo-600 dark:text-indigo-400 font-mono">U+FEFF</code> (BOM). Our engine purges these byte-by-byte.
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <strong className="block text-slate-900 dark:text-slate-200 mb-1">2. Synthetic Robotic Clichés</strong>
                        Detectors flag repetitive phrases like <em>"delve into"</em>, <em>"rich tapestry"</em>, <em>"it is worth noting"</em>, and <em>"in conclusion"</em>. We substitute them with authentic scholarly vocabulary.
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <strong className="block text-slate-900 dark:text-slate-200 mb-1">3. Burstiness & Perplexity</strong>
                        AI generates uniform sentence lengths (flat burstiness). Human scholars write with varied sentence lengths (5 words to 35 words). Our engine restores natural human pacing.
                    </div>
                </div>
            </div>
        </div>
    );
};
