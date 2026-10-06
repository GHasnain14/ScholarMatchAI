import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    X, 
    Search, 
    ExternalLink, 
    GraduationCap, 
    BookOpen, 
    Sparkles, 
    Copy, 
    Check, 
    FileText, 
    Award, 
    TrendingUp, 
    Download, 
    Filter,
    RefreshCw,
    Share2,
    Calendar,
    User,
    CheckCircle2,
    Send
} from 'lucide-react';
import { ScholarPaper, ScholarAuthorProfile } from '../types';
import { searchGoogleScholar, fetchScholarAuthorProfile } from '../services/geminiService';

export const GoogleScholarIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.8 3.73v5.93L12 24l7.2-4.84v-5.93L24 9.5 12 0zm0 3.72l7.7 6.08-7.7 5.13-7.7-5.13 7.7-6.08z" />
    </svg>
);

interface GoogleScholarModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery?: string;
    initialAuthor?: string;
    initialInstitution?: string;
    onInsertCitationIntoDraft?: (citationText: string) => void;
}

type FilterMode = 'all' | 'recent' | 'cited' | 'open-access';

export const GoogleScholarModal: React.FC<GoogleScholarModalProps> = ({
    isOpen,
    onClose,
    initialQuery = '',
    initialAuthor = '',
    initialInstitution = '',
    onInsertCitationIntoDraft,
}) => {
    const [searchQuery, setSearchQuery] = useState<string>(initialQuery || initialAuthor || '');
    const [authorName, setAuthorName] = useState<string>(initialAuthor);
    const [institutionName, setInstitutionName] = useState<string>(initialInstitution);
    
    const [papers, setPapers] = useState<ScholarPaper[]>([]);
    const [authorProfile, setAuthorProfile] = useState<ScholarAuthorProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [filterMode, setFilterMode] = useState<FilterMode>('all');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'papers' | 'profile'>('papers');

    // Sync props when opening
    useEffect(() => {
        if (isOpen) {
            const queryToUse = initialQuery || (initialAuthor ? `${initialAuthor} ${initialInstitution}`.trim() : '');
            setSearchQuery(queryToUse);
            setAuthorName(initialAuthor);
            setInstitutionName(initialInstitution);
            if (queryToUse) {
                performSearch(queryToUse, initialAuthor, initialInstitution);
            }
        }
    }, [isOpen, initialQuery, initialAuthor, initialInstitution]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const performSearch = async (query: string, author?: string, inst?: string) => {
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            // Search papers and author stats in parallel
            const papersPromise = searchGoogleScholar(query.trim(), author || undefined);
            const authorPromise = author ? fetchScholarAuthorProfile(author, inst) : Promise.resolve(null);

            const [fetchedPapers, fetchedAuthor] = await Promise.all([papersPromise, authorPromise]);
            setPapers(fetchedPapers);
            setAuthorProfile(fetchedAuthor);
        } catch (err: any) {
            console.error('Google Scholar search failed:', err);
            setError(err.message || 'Failed to search Google Scholar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery, authorName, institutionName);
    };

    const handleCopy = useCallback(async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2200);
        } catch (err) {
            console.error('Failed to copy citation:', err);
        }
    }, []);

    // Filtered papers
    const currentYear = new Date().getFullYear();
    const filteredPapers = useMemo(() => {
        return papers.filter(p => {
            if (filterMode === 'recent') {
                const yearNum = typeof p.year === 'number' ? p.year : parseInt(String(p.year), 10);
                return yearNum >= currentYear - 2;
            }
            if (filterMode === 'cited') {
                return (p.citationCount || 0) >= 100;
            }
            if (filterMode === 'open-access') {
                return Boolean(p.pdfUrl);
            }
            return true;
        });
    }, [papers, filterMode, currentYear]);

    if (!isOpen) return null;

    const directGoogleScholarSearchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(searchQuery || authorName || 'Academic Research')}`;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-850 dark:to-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4285F4] to-[#1a73e8] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                                    <span>Google Scholar Paper & Citation Explorer</span>
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-[#1a73e8] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                                    Live Literature
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Discover publications, citation metrics, and extract high-impact literature hooks for cold emails & SOPs.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={directGoogleScholarSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
                        >
                            <span>Open in Google Scholar</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Close (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search Bar & Controls */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 space-y-3">
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search professor name, university, or research topic (e.g., 'Yann LeCun NYU', 'CRISPR base editing', '3D Gaussian Splatting')..."
                                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100 shadow-2xs"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !searchQuery.trim()}
                            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 shrink-0 flex items-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    <span>Search Scholar</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Filter Pills */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                Filters:
                            </span>
                            <button
                                type="button"
                                onClick={() => setFilterMode('all')}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                                    filterMode === 'all'
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                All Papers ({papers.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('recent')}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                                    filterMode === 'recent'
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                📅 Recent (2024 - {currentYear})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('cited')}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                                    filterMode === 'cited'
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                ⭐ Highly Cited (100+)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('open-access')}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                                    filterMode === 'open-access'
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                📄 Open Access PDF
                            </button>
                        </div>

                        {authorName && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Target Professor: <strong className="text-slate-700 dark:text-slate-200">{authorName}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Author Metrics Card (if available) */}
                    {authorProfile && (
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white dark:from-slate-850 dark:via-slate-850 dark:to-slate-800 border border-blue-200/80 dark:border-slate-700 shadow-sm space-y-3">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                            {authorProfile.name}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                            Scholar Profile
                                        </span>
                                    </div>
                                    {authorProfile.institution && (
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                                            {authorProfile.institution}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Citations</span>
                                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                            {authorProfile.totalCitations?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">h-index</span>
                                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                            {authorProfile.hIndex}
                                        </span>
                                    </div>
                                    <a
                                        href={authorProfile.scholarProfileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#4285F4] hover:bg-[#3367d6] rounded-xl shadow-xs transition-colors"
                                    >
                                        <span>Google Scholar</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {authorProfile.interests && authorProfile.interests.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                    <span className="text-[11px] font-bold text-slate-500">Research Focus:</span>
                                    {authorProfile.interests.map((interest, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-100/60 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                                            #{interest}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Papers List */}
                    {isLoading ? (
                        <div className="py-16 text-center space-y-3">
                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Searching Google Scholar & academic citation graphs...
                            </p>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Fetching verified publication metadata, citation counts, open-access PDFs, and author bibtex entries.
                            </p>
                        </div>
                    ) : filteredPapers.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>Showing <strong>{filteredPapers.length}</strong> matching scholarly publications</span>
                                <span>Click "Cite in SOP / Email" to generate a tailored citation hook</span>
                            </div>

                            {filteredPapers.map((paper, idx) => (
                                <div 
                                    key={paper.id || idx}
                                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all space-y-3"
                                >
                                    {/* Paper Title & Top Badges */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <a 
                                                href={paper.scholarUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug flex items-baseline gap-1.5"
                                            >
                                                <span>{paper.title}</span>
                                                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                            </a>
                                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                {paper.authors.join(', ')} • <span className="font-semibold text-slate-700 dark:text-slate-300">{paper.journalOrVenue}</span> • <span className="font-bold text-blue-600 dark:text-blue-400">{paper.year}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {paper.citationCount > 0 && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 shadow-2xs">
                                                    ⭐ {paper.citationCount.toLocaleString()} citations
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Abstract Snippet */}
                                    {paper.abstract && (
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-100 dark:border-slate-750 line-clamp-3">
                                            {paper.abstract}
                                        </p>
                                    )}

                                    {/* SOP Hook Box */}
                                    {paper.sopHookSentence && (
                                        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                Suggested SOP / Cold Email Literature Hook:
                                            </span>
                                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic">
                                                "{paper.sopHookSentence}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions Toolbar */}
                                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={paper.scholarUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <GraduationCap className="w-3.5 h-3.5 text-[#4285F4]" />
                                                <span>Google Scholar</span>
                                            </a>

                                            {paper.pdfUrl && (
                                                <a 
                                                    href={paper.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline py-1 px-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Open PDF</span>
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Copy APA Citation */}
                                            {paper.apaCitation && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(paper.apaCitation!, `apa-${paper.id}`)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg transition-colors"
                                                    title="Copy APA Citation"
                                                >
                                                    {copiedKey === `apa-${paper.id}` ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-500" />
                                                            <span>Copied APA</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy APA</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {/* Copy SOP Hook */}
                                            {paper.sopHookSentence && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleCopy(paper.sopHookSentence!, `hook-${paper.id}`);
                                                        if (onInsertCitationIntoDraft) {
                                                            onInsertCitationIntoDraft(paper.sopHookSentence!);
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/70 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-lg transition-colors shadow-2xs"
                                                >
                                                    {copiedKey === `hook-${paper.id}` ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-500" />
                                                            <span>Copied Hook!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-3 h-3" />
                                                            <span>Cite in SOP / Email</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Search Google Scholar for any professor or paper topic.
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Type a query in the search bar above to fetch papers, publication dates, and citation metrics.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Integrated with Google Scholar links, OpenAlex bibliographic graph, and Europe PMC
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
