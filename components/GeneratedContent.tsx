import React, { useState } from 'react';
import { Copy, Check, Download, Printer, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { exportDocumentToPdf } from '../utils/pdfExport';
import { DocumentType } from '../types';

interface GeneratedContentProps {
    content: string;
    docType?: DocumentType | string;
    positionDetails?: string;
    tone?: string;
}

export const GeneratedContent: React.FC<GeneratedContentProps> = ({
    content,
    docType = 'Academic Application Document',
    positionDetails = '',
    tone = 'Formal & Academic',
}) => {
    const [copied, setCopied] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard', err);
        }
    };

    const handleExportPdf = () => {
        setIsExporting(true);
        try {
            exportDocumentToPdf({
                title: String(docType),
                content,
                subtitle: positionDetails ? `Target: ${positionDetails.slice(0, 100)}...` : undefined,
                institution: positionDetails || undefined,
            });
        } catch (err) {
            console.error('Failed to export PDF:', err);
        } finally {
            setTimeout(() => setIsExporting(false), 600);
        }
    };

    const handlePrint = () => {
        try {
            window.print();
        } catch (e) {
            console.debug('Print command not allowed in current window context:', e);
        }
    };

    return (
        <div id="generated-document-container" className="mt-6 rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-800 shadow-xl shadow-blue-500/5 overflow-hidden transition-all">
            {/* Top Accent Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-pink-500" />

            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-850 border-b border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {docType}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                {tone}
                            </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {wordCount} words • ~{readingTime} min read • IELTS Level 8.5 Style
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
                        title="Copy text to clipboard"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Text</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
                        title="Print document"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        <span>Print</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
                        title="Download formatted PDF file"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
                    </button>
                </div>
            </div>

            {/* Document Letterhead & Body */}
            <div className="p-5 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-md text-slate-800 dark:text-slate-100 relative">
                    {/* Decorative Academic Letterhead Badge */}
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-700">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                Academic Application Draft
                            </span>
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                                {docType}
                            </h4>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed tracking-normal select-text text-slate-800 dark:text-slate-100">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};
