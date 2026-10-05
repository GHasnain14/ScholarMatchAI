import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    Maximize2, 
    Minimize2, 
    Download, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    Edit3, 
    Eye, 
    Sparkles,
    X,
    Columns
} from 'lucide-react';

interface PdfViewerProps {
    file?: File | null;
    pdfUrl?: string | null;
    fileName?: string;
    extractedText?: string;
    onConfirmProcess?: () => void;
    onEditExtractedText?: () => void;
    onReUpload?: () => void;
    onClose?: () => void;
    isProcessing?: boolean;
    hasBeenProcessed?: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
    file,
    pdfUrl: propPdfUrl,
    fileName: propFileName,
    extractedText,
    onConfirmProcess,
    onEditExtractedText,
    onReUpload,
    onClose,
    isProcessing = false,
    hasBeenProcessed = false
}) => {
    const [numPages, setNumPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.1);
    const [rotation, setRotation] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(propPdfUrl || null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'visual' | 'extracted' | 'split'>('visual');
    const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pdfDocRef = useRef<any>(null);
    const renderTaskRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const fileName = propFileName || file?.name || 'Academic_CV.pdf';
    const fileSizeFormatted = file?.size 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : null;

    // Create or manage object URL from File
    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setObjectUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        } else if (propPdfUrl) {
            setObjectUrl(propPdfUrl);
        }
    }, [file, propPdfUrl]);

    // Load PDF document using pdfjsLib
    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        const loadPdf = async () => {
            try {
                const pdfjs = (window as any).pdfjsLib;
                if (!pdfjs) {
                    // Fallback to native iframe preview if pdfjsLib script isn't loaded
                    setUseIframeFallback(true);
                    setIsLoading(false);
                    return;
                }

                if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
                    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }

                let loadingTask: any;
                if (file) {
                    const arrayBuffer = await file.arrayBuffer();
                    loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                } else if (objectUrl) {
                    loadingTask = pdfjs.getDocument(objectUrl);
                } else {
                    setError('No PDF document source provided.');
                    setIsLoading(false);
                    return;
                }

                const pdfDoc = await loadingTask.promise;
                if (!isMounted) return;

                pdfDocRef.current = pdfDoc;
                setNumPages(pdfDoc.numPages);
                setCurrentPage(1);
                setIsLoading(false);
            } catch (err: any) {
                console.warn('PDF.js canvas renderer error, switching to native iframe viewer:', err);
                if (isMounted) {
                    setUseIframeFallback(true);
                    setIsLoading(false);
                }
            }
        };

        if (file || objectUrl) {
            loadPdf();
        }

        return () => {
            isMounted = false;
            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch {
                    // ignore
                }
            }
        };
    }, [file, objectUrl]);

    // Render active page to canvas
    const renderPage = useCallback(async (pageNum: number) => {
        if (!pdfDocRef.current || !canvasRef.current || useIframeFallback) return;

        try {
            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch {
                    // ignore cancellation
                }
            }

            const page = await pdfDocRef.current.getPage(pageNum);
            const viewport = page.getViewport({ scale, rotation });
            const canvas = canvasRef.current;
            if (!canvas) return;

            const context = canvas.getContext('2d');
            if (!context) return;

            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;

            const transform = outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : null;

            const renderContext = {
                canvasContext: context,
                transform,
                viewport
            };

            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            await renderTask.promise;
        } catch (err: any) {
            if (err?.name !== 'RenderingCancelledException') {
                console.error('Error rendering page:', err);
            }
        }
    }, [scale, rotation, useIframeFallback]);

    useEffect(() => {
        if (!isLoading && pdfDocRef.current && !useIframeFallback) {
            renderPage(currentPage);
        }
    }, [currentPage, scale, rotation, isLoading, useIframeFallback, renderPage]);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, numPages));
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 2.5));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.6));
    };

    const handleResetZoom = () => {
        setScale(1.1);
        setRotation(0);
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleDownload = () => {
        if (objectUrl) {
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div 
            ref={containerRef}
            className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 shadow-xl overflow-hidden flex flex-col transition-all ${
                isFullscreen 
                    ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500' 
                    : 'w-full my-4'
            }`}
        >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {/* File info */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate max-w-[220px] sm:max-w-xs">
                                {fileName}
                            </span>
                            <span className="px-2 py-0.2 text-[10px] font-semibold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded">
                                PDF Document
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {fileSizeFormatted ? `${fileSizeFormatted} • ` : ''}Preview mode: verify formatting before matching
                        </p>
                    </div>
                </div>

                {/* View Mode Toggle */}
                {extractedText && (
                    <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setViewMode('visual')}
                            className={`px-2.5 py-1 rounded-md transition-all ${
                                viewMode === 'visual'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                        >
                            Visual PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('extracted')}
                            className={`px-2.5 py-1 rounded-md transition-all ${
                                viewMode === 'extracted'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                        >
                            Extracted Text
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('split')}
                            className={`px-2.5 py-1 rounded-md transition-all hidden sm:block ${
                                viewMode === 'split'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                        >
                            Side-by-Side
                        </button>
                    </div>
                )}

                {/* PDF Controls (Page & Zoom) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {!useIframeFallback && viewMode !== 'extracted' && (
                        <>
                            {/* Page Controls */}
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-750 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-2xs">
                                <button
                                    type="button"
                                    onClick={handlePrevPage}
                                    disabled={currentPage <= 1}
                                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                    {currentPage} / {numPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleNextPage}
                                    disabled={currentPage >= numPages}
                                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-750 px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-2xs">
                                <button
                                    type="button"
                                    onClick={handleZoomOut}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetZoom}
                                    className="px-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                                    title="Reset Zoom"
                                >
                                    {Math.round(scale * 100)}%
                                </button>
                                <button
                                    type="button"
                                    onClick={handleZoomIn}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Rotate */}
                            <button
                                type="button"
                                onClick={handleRotate}
                                className="p-1.5 rounded-lg bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs"
                                title="Rotate 90 degrees"
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}

                    {/* Download */}
                    {objectUrl && (
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs"
                            title="Download original PDF"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Fullscreen Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
                    >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Close Preview */}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 transition-colors"
                            title="Close Preview Pane"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Viewer Stage Area */}
            <div className={`relative bg-slate-200/70 dark:bg-slate-900/90 overflow-auto flex items-center justify-center p-4 ${
                isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[460px] sm:h-[520px]'
            }`}>
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-3">
                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Rendering PDF document preview...
                        </p>
                    </div>
                )}

                {error ? (
                    <div className="p-6 text-center space-y-3 max-w-md">
                        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {error}
                        </p>
                        {onReUpload && (
                            <button
                                type="button"
                                onClick={onReUpload}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                            >
                                Select Another File
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* 1. VISUAL MODE (Canvas or Native iFrame) */}
                        {viewMode === 'visual' && (
                            <div className="w-full h-full flex items-center justify-center overflow-auto">
                                {useIframeFallback && objectUrl ? (
                                    <iframe 
                                        src={`${objectUrl}#toolbar=1&navpanes=0`} 
                                        className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <div className="shadow-2xl rounded-sm overflow-hidden bg-white max-w-full my-auto transition-transform">
                                        <canvas ref={canvasRef} className="block max-w-full" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. EXTRACTED TEXT MODE */}
                        {viewMode === 'extracted' && (
                            <div className="w-full h-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 overflow-auto">
                                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
                                    <span>Extracted Academic CV Text ({extractedText?.split(/\s+/).filter(Boolean).length || 0} words)</span>
                                    {onEditExtractedText && (
                                        <button
                                            type="button"
                                            onClick={onEditExtractedText}
                                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3 h-3" /> Edit in Text Area
                                        </button>
                                    )}
                                </div>
                                <pre className="text-xs font-mono text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed select-text font-normal">
                                    {extractedText || 'No text extracted yet.'}
                                </pre>
                            </div>
                        )}

                        {/* 3. SPLIT VIEW MODE (Side-by-side) */}
                        {viewMode === 'split' && (
                            <div className="w-full h-full grid grid-cols-2 gap-4">
                                <div className="h-full flex items-center justify-center overflow-auto bg-slate-300/40 dark:bg-slate-950/40 rounded-xl p-2">
                                    {useIframeFallback && objectUrl ? (
                                        <iframe 
                                            src={`${objectUrl}#toolbar=0`} 
                                            className="w-full h-full rounded-lg bg-white"
                                            title="PDF Preview"
                                        />
                                    ) : (
                                        <div className="shadow-lg rounded-sm overflow-hidden bg-white max-w-full my-auto">
                                            <canvas ref={canvasRef} className="block max-w-full" />
                                        </div>
                                    )}
                                </div>
                                <div className="h-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 overflow-auto">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
                                        <span>Extracted Text</span>
                                        {onEditExtractedText && (
                                            <button
                                                type="button"
                                                onClick={onEditExtractedText}
                                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                            >
                                                <Edit3 className="w-3 h-3" /> Edit
                                            </button>
                                        )}
                                    </div>
                                    <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                                        {extractedText}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Action Bar: Processing & Confirmation */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {hasBeenProcessed ? 'CV Processed & Active' : 'Document Ready to Process'}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                        • Verify your information looks accurate before matching opportunities
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {onReUpload && (
                        <button
                            type="button"
                            onClick={onReUpload}
                            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                            Upload Different File
                        </button>
                    )}

                    {onEditExtractedText && (
                        <button
                            type="button"
                            onClick={onEditExtractedText}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Text</span>
                        </button>
                    )}

                    {onConfirmProcess && (
                        <button
                            type="button"
                            onClick={onConfirmProcess}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Processing CV...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                    <span>{hasBeenProcessed ? 'Update & Re-process' : 'Confirm & Process CV'}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
