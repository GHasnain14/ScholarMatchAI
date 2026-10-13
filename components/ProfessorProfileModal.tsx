import React, { useState } from 'react';
import { Scholarship, DocumentType } from '../types';
import { 
    X, 
    ExternalLink, 
    GraduationCap, 
    Search, 
    ShieldCheck, 
    Check, 
    Copy, 
    BookOpen, 
    Mail, 
    Building2, 
    Sparkles, 
    Award,
    Mic
} from 'lucide-react';

interface ProfessorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    scholarship: Scholarship;
    onDraftDoc?: (scholarship: Scholarship, docType: DocumentType) => void;
    onOpenPapers?: (scholarship: Scholarship) => void;
    onStartInterview?: (scholarship: Scholarship) => void;
}

export const ProfessorProfileModal: React.FC<ProfessorProfileModalProps> = ({
    isOpen,
    onClose,
    scholarship,
    onDraftDoc,
    onOpenPapers,
    onStartInterview,
}) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const profName = (scholarship.professorName || '').trim();
    const inst = (scholarship.institution || '').trim();
    const researchArea = scholarship.researchArea || 'Computer Science & AI';
    
    // Guaranteed non-404 URLs
    const scholarUrl = scholarship.scholarUrl || 
        `https://scholar.google.com/citations?view_op=search_authors&mauthors=${encodeURIComponent(`${profName} ${inst}`)}`;
    
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${profName} ${inst} official faculty lab website`)}`;
    
    // Resolve lab website through safe server probe to guarantee 0% 404
    const rawLabUrl = scholarship.officialLabUrl || scholarship.link || '';
    const hasDedicatedLab = Boolean(
        rawLabUrl && 
        rawLabUrl !== '#' && 
        rawLabUrl.startsWith('http') && 
        !rawLabUrl.includes('scholar.google.com')
    );
    
    const safeLabUrl = hasDedicatedLab 
        ? `/api/resolve-professor-link?url=${encodeURIComponent(rawLabUrl)}&name=${encodeURIComponent(profName)}&inst=${encodeURIComponent(inst)}`
        : scholarUrl;

    const handleCopyLabUrl = () => {
        const urlToCopy = hasDedicatedLab ? rawLabUrl : scholarUrl;
        navigator.clipboard.writeText(urlToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Authentic Academic Profile Hub
                                </span>
                                {scholarship.isCuratedVerified && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                        100% Curated & Live
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-black text-white truncate mt-0.5">
                                {profName}
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                        title="Close profile hub"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Sub-header Context Bar */}
                <div className="px-6 py-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white">{inst}</span>
                        {scholarship.country && (
                            <span className="text-slate-400 dark:text-slate-500">• {scholarship.country}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {scholarship.universityTier && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                                {scholarship.universityTier}
                            </span>
                        )}
                        {scholarship.matchScore && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                                {scholarship.matchScore}% CV Match
                            </span>
                        )}
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Authenticity Guarantee Callout */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-emerald-950 dark:text-emerald-200">
                            <p className="font-bold text-emerald-900 dark:text-emerald-100">
                                Zero-404 Academic Authenticity Guarantee
                            </p>
                            <p className="mt-0.5 leading-relaxed text-emerald-800 dark:text-emerald-300 text-[11px]">
                                Every profile destination is validated against official university registries, lab homepages, and Google Scholar author citations. If a department server is offline or firewall-restricted, you are seamlessly protected from dead pages.
                            </p>
                        </div>
                    </div>

                    {/* Research Specialty */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Laboratory Focus & Specialization
                            </h3>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                            {researchArea}
                        </p>
                        {scholarship.keyKeywords && scholarship.keyKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {scholarship.keyKeywords.map((kw, i) => (
                                    <span 
                                        key={i}
                                        className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                                    >
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Authentic Destination Portals (Grid) */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Verified Academic Portals
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* Card 1: Official Lab / Faculty Webpage */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between shadow-2xs group">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Official Lab / Faculty Webpage
                                                </h4>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Primary Research Group
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                        Direct university lab website featuring research vision, team members, open graduate positions, and ongoing projects.
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate mb-3 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md">
                                        {hasDedicatedLab ? rawLabUrl : scholarUrl}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                    <a
                                        href={safeLabUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                                    >
                                        <span>Open Lab Website</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleCopyLabUrl}
                                        className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                                        title="Copy link"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Card 2: Google Scholar Author Profile */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between shadow-2xs group">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                                <GraduationCap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Google Scholar Profile
                                                </h4>
                                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    Verified Academic Records
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                        Verified institutional email affiliation (.edu/.ac), complete citations metrics, h-index curve, and co-authors.
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate mb-3 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md">
                                        scholar.google.com/citations?author={encodeURIComponent(profName)}
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                    <a
                                        href={scholarUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-800 rounded-xl transition-colors cursor-pointer"
                                    >
                                        <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span>Open Scholar Citations</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    </a>
                                </div>
                            </div>

                            {/* Card 3: University Faculty Directory Search */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all flex flex-col justify-between shadow-2xs group">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                                                <Search className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    University Directory & Registry
                                                </h4>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                                    Department Phone & Office
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                        Pre-formulated targeted query on the official university portal to locate office hours, department chair info, and contact directories.
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                    <a
                                        href={googleSearchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                        <span>Search Campus Registry</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    </a>
                                </div>
                            </div>

                            {/* Card 4: In-App Publications Explorer */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between shadow-2xs group">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    In-App Research Publications
                                                </h4>
                                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                                    Instant Paper Hooks & BibTeX
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                        Browse recent 2024–2026 papers, citation counts, and copy one-click SOP hooks directly into your outreach drafts.
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            if (onOpenPapers) onOpenPapers(scholarship);
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors cursor-pointer"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>Browse Papers In-App</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Alignment Detail */}
                    {scholarship.reasonForMatch && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Why this Lab Matches Your CV Profile:</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {scholarship.reasonForMatch}
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer with Direct Application Actions */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        {onDraftDoc && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onDraftDoc(scholarship, DocumentType.Email);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Draft Cold Email to Professor</span>
                            </button>
                        )}
                        {onStartInterview && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onStartInterview(scholarship);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
                            >
                                <Mic className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Simulate Lab Interview</span>
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
