import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, AlertCircle, Edit3, X, FileCheck, ArrowRight } from 'lucide-react';

const SAMPLE_CVS = [
    {
        title: '🤖 AI & Computer Vision',
        badge: 'CS / Machine Learning',
        color: 'from-blue-500 to-indigo-600',
        text: `NAME: Alex Chen
DEGREE: B.S. in Computer Science & Artificial Intelligence (GPA: 3.89/4.0)
INSTITUTION: University of Science and Technology
RESEARCH INTERESTS: Deep Learning, Generative Models, Autonomous Robotics, Real-time Computer Vision, Neural Radiance Fields (NeRF).

PUBLICATIONS & WORKSHOPS:
- Chen, A., et al. "Efficient Spatial Attention for Real-time Robotic Perception." Under review at CVPR Workshop, 2024.

HONORS & AWARDS:
- National Dean's Academic Excellence Award (Top 2%)
- 1st Place, National AI Hackathon (Medical Imaging Challenge)

RESEARCH & ACADEMIC EXPERIENCE:
- Undergraduate Researcher, Visual Perception Lab (2022 - 2024): Developed PyTorch-based neural architectures for 3D point cloud segmentation; optimized model inference using TensorRT yielding a 4.2x speedup on edge devices.
- Machine Learning Engineering Intern at Robotics Corp (Summer 2023): Designed LiDAR-camera fusion algorithms for autonomous obstacle navigation.

TECHNICAL PROFICIENCIES:
- Languages: Python, C++, CUDA, PyTorch, TensorFlow, OpenCV, ROS2, Linux.
- Standardized Tests: TOEFL iBT: 108 (R: 29, L: 28, S: 25, W: 26), GRE: Q: 168, V: 158, AW: 4.5.`,
    },
    {
        title: '🧬 Bioengineering & Genomics',
        badge: 'Biomedical & Health Tech',
        color: 'from-emerald-500 to-teal-600',
        text: `NAME: Maya Lin
DEGREE: B.S. in Biomedical Engineering (GPA: 3.92/4.0)
INSTITUTION: State University of Bioengineering
RESEARCH INTERESTS: Synthetic Biology, CRISPR Gene Editing, Single-cell RNA Sequencing, Biomaterials for Targeted Drug Delivery.

RESEARCH EXPERIENCE:
- Research Assistant, Molecular Therapeutics Laboratory (2022 - Present): Investigated polymeric nanoparticle vectors for mRNA delivery in oncology models; quantified cellular uptake via flow cytometry and confocal microscopy.
- Co-author on manuscript: "Lipid Nanoparticle Formulations for Targeted Hepatic Delivery," Journal of Nanomedicine (2023).

SKILLS:
- Wet Lab: Cell culture, CRISPR-Cas9, PCR, Western Blot, Flow Cytometry, ELISA, Microfluidics.
- Dry Lab: R (Bioconductor), Python (scikit-learn), NGS Bioinformatics pipelines.
- Standardized Tests: IELTS Academic 8.0, GRE: Q: 165, V: 161.`,
    },
    {
        title: '⚡ Clean Energy & Materials',
        badge: 'Materials Science & Renewable Energy',
        color: 'from-amber-500 to-rose-600',
        text: `NAME: Lucas Morales
DEGREE: B.Eng. in Chemical & Materials Engineering (First Class Honours)
INSTITUTION: Technical University of Engineering
RESEARCH INTERESTS: Next-generation Lithium-Sulfur Batteries, Solid-State Electrolytes, Perovskite Solar Cells, Electrocatalysis.

RESEARCH & LAB PROJECTS:
- Thesis Project: "Synthesis of High-Conductivity Composite Polymer Electrolytes for Solid-State Lithium Batteries."
- Laboratory Technician, Clean Energy Center: Operated SEM, XRD, XPS, and Electrochemical Impedance Spectroscopy (EIS).

AWARDS & DISTINCTIONS:
- University Research Fellowship for Outstanding Undergraduates
- Best Undergraduate Poster Presentation, National Renewable Energy Symposium.`,
    },
];

const getPdfjs = async (): Promise<any> => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
        const lib = (window as any).pdfjsLib;
        if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
            lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }
        return lib;
    }
    return null;
};

const getMammoth = (): any => {
    if (typeof window !== 'undefined' && (window as any).mammoth) {
        return (window as any).mammoth;
    }
    return null;
};

interface CVUploaderProps {
    onCvUpload: (text: string) => void;
    currentCvText?: string;
}

export const CVUploader: React.FC<CVUploaderProps> = ({ onCvUpload, currentCvText }) => {
    const [fileName, setFileName] = useState<string>('');
    const [isPasting, setIsPasting] = useState<boolean>(false);
    const [pastedText, setPastedText] = useState<string>(currentCvText || '');
    const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;
        setFileName(file.name);
        setError(null);
        setIsLoadingFile(true);

        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            let textContent = '';

            if (fileExtension === 'pdf') {
                const pdfjs = await getPdfjs();
                if (!pdfjs) {
                    throw new Error('PDF reader script is loading. Please paste your CV text or try again.');
                }
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const pageContent = await page.getTextContent();
                    const pageText = pageContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
                    fullText += pageText + '\n\n';
                }
                textContent = fullText.trim();
            } else if (fileExtension === 'docx') {
                const mammothLib = getMammoth();
                if (!mammothLib) {
                    throw new Error('Word parser is loading. Please paste your CV text or try again.');
                }
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammothLib.extractRawText({ arrayBuffer });
                textContent = result.value;
            } else if (fileExtension === 'txt') {
                textContent = await file.text();
            } else {
                setError('Please upload a valid PDF, DOCX, or TXT file.');
                setIsLoadingFile(false);
                return;
            }

            if (!textContent.trim()) {
                throw new Error('The uploaded file appears to be empty or image-only. Please paste your text directly.');
            }

            onCvUpload(textContent.trim());
        } catch (err: any) {
            console.error('Error processing file:', err);
            setError(err.message || 'Failed to extract text from this file. Please paste your CV text directly.');
        } finally {
            setIsLoadingFile(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handlePasteSubmit = () => {
        if (pastedText.trim()) {
            onCvUpload(pastedText.trim());
            setFileName('Pasted Academic CV');
            setIsPasting(false);
            setError(null);
        }
    };

    const handleLoadSample = (sampleText: string, sampleTitle: string) => {
        setPastedText(sampleText);
        setFileName(`Sample: ${sampleTitle}`);
        onCvUpload(sampleText);
        setError(null);
    };

    const hasActiveCv = Boolean(currentCvText && currentCvText.trim().length > 50);

    return (
        <div className="w-full space-y-4">
            {error && (
                <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-4 py-3 rounded-xl text-sm flex items-start justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setError(null); setIsPasting(true); }}
                        className="text-xs font-semibold underline shrink-0 hover:text-rose-950 dark:hover:text-white"
                    >
                        Paste CV text instead
                    </button>
                </div>
            )}

            {/* Active CV Badge indicator */}
            {hasActiveCv && !isPasting && (
                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                            <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                    {fileName || 'Active Candidate CV Loaded'}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-full">
                                    Ready for Matching
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {currentCvText?.slice(0, 80)}... ({currentCvText?.split(/\s+/).length} words)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => { setIsPasting(true); setPastedText(currentCvText || ''); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white/80 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                        >
                            <Edit3 className="w-3 h-3" /> Edit
                        </button>
                    </div>
                </div>
            )}

            {isPasting ? (
                <div className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Paste Academic CV / Resume
                        </label>
                        <span className="text-[11px] text-slate-400">
                            {pastedText.length} characters • {pastedText.split(/\s+/).filter(Boolean).length} words
                        </span>
                    </div>
                    <textarea
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-mono leading-relaxed"
                        rows={9}
                        placeholder="Paste your CV text here (Education, GPA, Publications, Thesis topic, Technical skills, English test scores)..."
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                    />
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handlePasteSubmit}
                                disabled={!pastedText.trim()}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Save & Analyze Profile
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsPasting(false); setError(null); }}
                                className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2 px-3.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                        isDragOver
                            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 scale-[1.01] ring-4 ring-blue-500/10'
                            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-800 dark:to-slate-850 hover:shadow-md'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            {isLoadingFile ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <UploadCloud className="w-7 h-7" />
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                Drag & drop your Academic CV or click to browse
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Supports <span className="font-semibold text-blue-600 dark:text-blue-400">PDF, DOCX, TXT</span> (Max 10MB)
                            </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                PDF Document
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                Word (.docx)
                            </span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIsPasting(true); }}
                                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline px-2 py-0.5"
                            >
                                Or Paste Text →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Demo CVs Section for instant testing */}
            <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Try Instant Demo Profiles
                    </span>
                    <span className="text-[11px] text-slate-400">1-Click Load</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SAMPLE_CVS.map((sample, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleLoadSample(sample.text, sample.title)}
                            className="flex flex-col items-start p-3 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl transition-all shadow-2xs hover:shadow-xs group"
                        >
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between w-full">
                                {sample.title}
                                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                                {sample.badge}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
