import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    BookOpen,
    Search,
    Plus,
    Filter,
    ExternalLink,
    Download,
    Copy,
    Check,
    Trash2,
    Edit3,
    CheckCircle2,
    Clock,
    AlertCircle,
    Bookmark,
    GraduationCap,
    Sparkles,
    FileText,
    Share2,
    ArrowUpDown,
    Tag,
    Building2,
    User as UserIcon,
    X,
    ChevronDown,
    ChevronUp,
    Save,
    RotateCcw,
    BarChart3,
    Flame,
    School
} from 'lucide-react';
import { ResearchPaperItem, ReadingStatus, PaperPriority, ScholarPaper, Scholarship } from '../types';

interface ResearchPaperTrackerProps {
    papers: ResearchPaperItem[];
    onSavePaper: (paper: ResearchPaperItem) => void;
    onDeletePaper: (paperId: string) => void;
    onOpenScholarModal: (query?: string, author?: string, institution?: string) => void;
    applicationTargets?: Scholarship[];
}

export const ResearchPaperTracker: React.FC<ResearchPaperTrackerProps> = ({
    papers,
    onSavePaper,
    onDeletePaper,
    onOpenScholarModal,
    applicationTargets = []
}) => {
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | ReadingStatus>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | PaperPriority>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'dateAdded-desc' | 'dateAdded-asc' | 'priority' | 'year-desc' | 'title'>('dateAdded-desc');

    // Modals & Editors
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPaper, setEditingPaper] = useState<ResearchPaperItem | null>(null);
    const [activeNotesId, setActiveNotesId] = useState<string | null>(null);
    const [activeNotesText, setActiveNotesText] = useState<string>('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [exportNotice, setExportNotice] = useState<string | null>(null);

    // Calculate reading stats
    const stats = useMemo(() => {
        const total = papers.length;
        const read = papers.filter(p => p.status === 'read').length;
        const pending = total - read;
        const highPriority = papers.filter(p => p.priority === 'high').length;
        const percentage = total > 0 ? Math.round((read / total) * 100) : 0;
        return { total, read, pending, highPriority, percentage };
    }, [papers]);

    // State for Analytics Summary Card collapse/expand
    const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState<boolean>(true);

    // Distribution by Status: Read vs Pending
    const statusDistribution = useMemo(() => {
        const total = papers.length;
        const read = papers.filter(p => p.status === 'read').length;
        const pending = papers.filter(p => p.status === 'pending').length;
        const readPct = total > 0 ? Math.round((read / total) * 100) : 0;
        const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
        return { total, read, pending, readPct, pendingPct };
    }, [papers]);

    // Distribution by Priority Level: High vs Medium vs Low
    const priorityDistribution = useMemo(() => {
        const total = papers.length;
        const high = papers.filter(p => p.priority === 'high').length;
        const medium = papers.filter(p => p.priority === 'medium').length;
        const low = papers.filter(p => p.priority === 'low').length;
        const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
        const mediumPct = total > 0 ? Math.round((medium / total) * 100) : 0;
        const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;
        return { total, high, medium, low, highPct, mediumPct, lowPct };
    }, [papers]);

    // Distribution by Target University
    const universityDistribution = useMemo(() => {
        const total = papers.length;
        const map = new Map<string, number>();
        let unassignedCount = 0;

        papers.forEach(p => {
            const uni = p.targetUniversity?.trim();
            if (uni) {
                map.set(uni, (map.get(uni) || 0) + 1);
            } else {
                unassignedCount += 1;
            }
        });

        const items: { name: string; count: number; pct: number; isUnassigned?: boolean }[] = [];
        map.forEach((count, name) => {
            items.push({
                name,
                count,
                pct: total > 0 ? Math.round((count / total) * 100) : 0,
                isUnassigned: false,
            });
        });

        // Sort universities by paper count descending, then alphabetically
        items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        if (unassignedCount > 0) {
            items.push({
                name: 'General / Unassigned',
                count: unassignedCount,
                pct: total > 0 ? Math.round((unassignedCount / total) * 100) : 0,
                isUnassigned: true,
            });
        }

        return {
            total,
            uniqueCount: map.size,
            items,
        };
    }, [papers]);

    // Unique tags and universities
    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        papers.forEach(p => {
            if (Array.isArray(p.tags)) {
                p.tags.forEach(t => {
                    const clean = t.trim();
                    if (clean) tagsSet.add(clean);
                });
            }
        });
        return Array.from(tagsSet).sort();
    }, [papers]);

    const allUniversities = useMemo(() => {
        const uniSet = new Set<string>();
        papers.forEach(p => {
            if (p.targetUniversity && p.targetUniversity.trim()) {
                uniSet.add(p.targetUniversity.trim());
            }
        });
        applicationTargets.forEach(app => {
            if (app.institution && app.institution.trim()) {
                uniSet.add(app.institution.trim());
            }
        });
        return Array.from(uniSet).sort();
    }, [papers, applicationTargets]);

    // Filtered and sorted papers
    const filteredPapers = useMemo(() => {
        return papers
            .filter(paper => {
                // Status filter
                if (statusFilter !== 'all' && paper.status !== statusFilter) return false;
                
                // Priority filter
                if (priorityFilter !== 'all' && paper.priority !== priorityFilter) return false;

                // Tag filter
                if (selectedTag !== 'all' && !(paper.tags || []).includes(selectedTag)) return false;

                // University filter
                if (selectedUniversity !== 'all' && paper.targetUniversity !== selectedUniversity) return false;

                // Search query matching
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const titleMatch = paper.title.toLowerCase().includes(q);
                    const authorMatch = (paper.authors || []).some(a => a.toLowerCase().includes(q));
                    const venueMatch = (paper.journalOrVenue || '').toLowerCase().includes(q);
                    const notesMatch = (paper.notes || '').toLowerCase().includes(q);
                    const tagMatch = (paper.tags || []).some(t => t.toLowerCase().includes(q));
                    const uniMatch = (paper.targetUniversity || '').toLowerCase().includes(q);
                    const profMatch = (paper.targetProfessor || '').toLowerCase().includes(q);
                    const hookMatch = (paper.sopHookSentence || '').toLowerCase().includes(q);

                    return titleMatch || authorMatch || venueMatch || notesMatch || tagMatch || uniMatch || profMatch || hookMatch;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'dateAdded-desc') {
                    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
                }
                if (sortBy === 'dateAdded-asc') {
                    return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
                }
                if (sortBy === 'priority') {
                    const weight = { high: 3, medium: 2, low: 1 };
                    return (weight[b.priority] || 2) - (weight[a.priority] || 2);
                }
                if (sortBy === 'year-desc') {
                    return Number(b.year || 0) - Number(a.year || 0);
                }
                if (sortBy === 'title') {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            });
    }, [papers, statusFilter, priorityFilter, selectedTag, selectedUniversity, searchQuery, sortBy]);

    // Toggle Read / Pending status
    const handleToggleReadStatus = useCallback((paper: ResearchPaperItem) => {
        const nextStatus: ReadingStatus = paper.status === 'read' ? 'pending' : 'read';
        const updated: ResearchPaperItem = {
            ...paper,
            status: nextStatus,
            dateRead: nextStatus === 'read' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
        };
        onSavePaper(updated);
    }, [onSavePaper]);

    // Copy Citation handler
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    // Quick save notes
    const handleSaveInlineNotes = (paper: ResearchPaperItem) => {
        onSavePaper({
            ...paper,
            notes: activeNotesText,
            updatedAt: new Date().toISOString()
        });
        setActiveNotesId(null);
    };

    // Export formats
    const handleExportBibTeX = () => {
        if (papers.length === 0) return;
        const bibtexEntries = papers
            .map(p => {
                if (p.bibtex) return p.bibtex;
                const cleanKey = ((p.authors?.[0] || 'Paper').split(' ')[0] + String(p.year || '2025')).replace(/[^a-zA-Z0-9]/g, '');
                return `@article{${cleanKey},\n  title={${p.title}},\n  author={${(p.authors || []).join(' and ')}},\n  journal={${p.journalOrVenue || 'Preprint'}},\n  year={${p.year || 2025}},\n  url={${p.scholarUrl || p.pdfUrl || ''}}\n}`;
            })
            .join('\n\n');

        const blob = new Blob([bibtexEntries], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `academic_research_papers_${new Date().toISOString().slice(0, 10)}.bib`;
        link.click();
        URL.revokeObjectURL(url);
        setExportNotice('Exported BibTeX bibliography file!');
        setTimeout(() => setExportNotice(null), 3000);
    };

    const handleExportAPA = () => {
        if (papers.length === 0) return;
        const apaList = papers
            .map((p, idx) => {
                if (p.apaCitation) return `${idx + 1}. ${p.apaCitation}`;
                const authorsStr = (p.authors || []).join(', ');
                return `${idx + 1}. ${authorsStr} (${p.year || 'n.d.'}). ${p.title}. ${p.journalOrVenue || ''}. ${p.doi ? `https://doi.org/${p.doi}` : p.scholarUrl || ''}`;
            })
            .join('\n\n');

        const blob = new Blob([apaList], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `academic_citations_apa_${new Date().toISOString().slice(0, 10)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        setExportNotice('Exported APA citations list!');
        setTimeout(() => setExportNotice(null), 3000);
    };

    // Load sample papers for immediate exploration
    const handleLoadSamplePapers = () => {
        const samples: ResearchPaperItem[] = [
            {
                id: 'sample-paper-1',
                title: 'Attention Is All You Need',
                authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
                journalOrVenue: 'NeurIPS 2017 (Advances in Neural Information Processing Systems)',
                year: '2017',
                citationCount: 142000,
                abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism.',
                scholarUrl: 'https://scholar.google.com/scholar?q=Attention+Is+All+You+Need',
                pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
                doi: '10.48550/arXiv.1706.03762',
                status: 'read',
                priority: 'high',
                targetUniversity: 'Stanford University',
                targetProfessor: 'Christopher Manning',
                tags: ['Transformer', 'Deep Learning', 'NLP', 'Foundational Architecture'],
                notes: 'Crucial paper for modern generative AI applications. Note multi-head self-attention mechanics vs recurrent gates. Great hook for discussions on computational efficiency in sequence modeling.',
                sopHookSentence: 'My proposed research builds upon the foundational multi-head self-attention principles established by Vaswani et al. to eliminate linear recurrence constraints in multi-agent scientific reasoning.',
                apaCitation: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., ... & Polosukhin, I. (2017). Attention is all you need. Advances in neural information processing systems, 30.',
                dateAdded: new Date(Date.now() - 86400000 * 5).toISOString(),
                dateRead: new Date(Date.now() - 86400000 * 2).toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'sample-paper-2',
                title: 'CRISPR-Cas9-mediated gene knockout in human embryonic stem cells',
                authors: ['Le Cong', 'F. Ann Ran', 'David Cox', 'Shuailin Lin', 'Robert Barretto', 'Feng Zhang'],
                journalOrVenue: 'Science / Broad Institute',
                year: '2013',
                citationCount: 18400,
                abstract: 'Functional genomic approaches in human cells have been hampered by the lack of facile tools for targeted genome perturbation. We demonstrate that RNA-guided Cas9 nucleases from microbial adaptive immune systems can be adapted to induce targeted double-strand breaks in mammalian cells.',
                scholarUrl: 'https://scholar.google.com/scholar?q=CRISPR-Cas9-mediated+gene+knockout+human+embryonic+stem+cells',
                pdfUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3715547/',
                doi: '10.1126/science.1232033',
                status: 'pending',
                priority: 'high',
                targetUniversity: 'MIT / Harvard',
                targetProfessor: 'Feng Zhang',
                tags: ['CRISPR', 'Gene Editing', 'Bioengineering', 'Synthetic Biology'],
                notes: 'Review PAM sequence requirements (NGG) and non-homologous end joining (NHEJ) repair dynamics before cold emailing molecular biology labs.',
                sopHookSentence: 'Inspired by the high-precision genome-scale editing pioneered by Cong et al., I aim to develop epigenetic transcriptional repressors with minimal off-target cleavage.',
                apaCitation: 'Cong, L., Ran, F. A., Cox, D., Lin, S., Barretto, R., Habib, N., ... & Zhang, F. (2013). Multiplex genome engineering using CRISPR/Cas systems. Science, 339(6121), 819-823.',
                dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'sample-paper-3',
                title: '3D Gaussian Splatting for Real-Time Radiance Field Rendering',
                authors: ['Bernhard Kerbl', 'Georgios Kopanas', 'Thomas Leimkühler', 'George Drettakis'],
                journalOrVenue: 'ACM Transactions on Graphics (SIGGRAPH 2023)',
                year: '2023',
                citationCount: 2150,
                abstract: 'Radiance Field methods have revolutionized novel-view synthesis of scenes captured with multiple photos or videos. We introduce 3D Gaussian Splatting, which uses 3D Gaussians as a flexible and expressive scene representation while achieving real-time rendering speeds.',
                scholarUrl: 'https://scholar.google.com/scholar?q=3D+Gaussian+Splatting+Real-Time+Radiance+Field+Rendering',
                pdfUrl: 'https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/3d_gaussian_splatting_low.pdf',
                doi: '10.1145/3592433',
                status: 'pending',
                priority: 'medium',
                targetUniversity: 'ETH Zurich',
                targetProfessor: 'Marc Pollefeys',
                tags: ['Computer Vision', '3D Reconstruction', 'Graphics', 'Real-Time Rendering'],
                notes: 'Key comparison between continuous neural implicit fields (NeRF) and explicit rasterized Gaussians. Check tile-based rasterizer CUDA kernels.',
                sopHookSentence: 'My proposed research extends the real-time rasterization efficiency of 3D Gaussian Splatting (Kerbl et al.) to dynamic deformable surgical environments.',
                apaCitation: 'Kerbl, B., Kopanas, G., Leimkühler, T., & Drettakis, G. (2023). 3d gaussian splatting for real-time radiance field rendering. ACM Transactions on Graphics, 42(4), 1-14.',
                dateAdded: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ];

        samples.forEach(s => onSavePaper(s));
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Overview & Metric Telemetry Ribbon */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                <BookOpen className="w-5 h-5" />
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Research Paper Tracker
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                            Catalog seminal academic papers, organize candidate literature notes, and toggle reading progress to craft authoritative SOPs and cold email outreach.
                        </p>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => onOpenScholarModal()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                            <GraduationCap className="w-4 h-4 text-[#4285F4]" />
                            <span>Scholar Search</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingPaper(null);
                                setIsAddModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Paper</span>
                        </button>

                        {/* Export Menu */}
                        <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={handleExportBibTeX}
                                disabled={papers.length === 0}
                                title="Download BibTeX (.bib) file"
                                className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 disabled:opacity-40 transition-colors"
                            >
                                BibTeX
                            </button>
                            <button
                                type="button"
                                onClick={handleExportAPA}
                                disabled={papers.length === 0}
                                title="Download APA Citations text file"
                                className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 disabled:opacity-40 transition-colors"
                            >
                                APA
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quantitative Metric Telemetry Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
                    <div className="space-y-1">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                            Total Tracked
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                                {stats.total}
                            </span>
                            <span className="text-xs text-slate-500">papers</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Read Completed
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                                {stats.read}
                            </span>
                            <span className="text-xs text-slate-500">({stats.percentage}%)</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Pending Review
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                                {stats.pending}
                            </span>
                            <span className="text-xs text-slate-500">to read</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            High Priority
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                                {stats.highPriority}
                            </span>
                            <span className="text-xs text-slate-500">targets</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                {stats.total > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                            <span>Reading Completion</span>
                            <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                                {stats.read} of {stats.total} papers finished
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                                style={{ width: `${stats.percentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Export Notification Toast */}
            {exportNotice && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{exportNotice}</span>
                </div>
            )}

            {/* Analytics Summary Card: Distribution by Status, Priority Level, & Target University */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-all">
                {/* Header of Analytics Summary Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                    Analytics & Literature Distribution
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                    Distribution Intelligence
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Real-time breakdown of literature by reading status, strategic priority, and target university applications. Click any segment to filter.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {/* Clear Analytics Filters button if any are active */}
                        {(statusFilter !== 'all' || priorityFilter !== 'all' || selectedUniversity !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                    setSelectedUniversity('all');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/60 transition-colors cursor-pointer"
                                title="Reset all status, priority, and university filters"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filters</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsAnalyticsExpanded(prev => !prev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                            {isAnalyticsExpanded ? (
                                <>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                    <span>Collapse</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    <span>Expand</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Collapsed State Summary Bar */}
                {!isAnalyticsExpanded && (
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center flex-wrap gap-2 text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Summary:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono">
                                <CheckCircle2 className="w-3 h-3" /> {statusDistribution.read} Read ({statusDistribution.readPct}%)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-mono">
                                <Clock className="w-3 h-3" /> {statusDistribution.pending} Pending
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-mono">
                                <Flame className="w-3 h-3" /> {priorityDistribution.high} High Priority
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono">
                                <School className="w-3 h-3" /> {universityDistribution.uniqueCount} Universities
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAnalyticsExpanded(true)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs cursor-pointer"
                        >
                            View Visual Distributions →
                        </button>
                    </div>
                )}

                {/* Expanded State: 3 Detailed Distribution Columns */}
                {isAnalyticsExpanded && (
                    <div className="pt-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* SECTION 1: Status Distribution */}
                            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                            By Reading Status
                                        </h4>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                                        {statusDistribution.readPct}% Read
                                    </span>
                                </div>

                                {/* Segmented Progress Bar for Status */}
                                <div className="space-y-1">
                                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                                        {statusDistribution.total > 0 ? (
                                            <>
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-500"
                                                    style={{ width: `${statusDistribution.readPct}%` }}
                                                    title={`Read: ${statusDistribution.read} (${statusDistribution.readPct}%)`}
                                                />
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-500"
                                                    style={{ width: `${statusDistribution.pendingPct}%` }}
                                                    title={`Pending: ${statusDistribution.pending} (${statusDistribution.pendingPct}%)`}
                                                />
                                            </>
                                        ) : (
                                            <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                        <span>Read ({statusDistribution.readPct}%)</span>
                                        <span>Pending ({statusDistribution.pendingPct}%)</span>
                                    </div>
                                </div>

                                {/* Clickable Status Cards */}
                                <div className="grid grid-cols-2 gap-2.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter(statusFilter === 'read' ? 'all' : 'read')}
                                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            statusFilter === 'read'
                                                ? 'bg-emerald-100/60 dark:bg-emerald-900/40 border-emerald-500 ring-2 ring-emerald-500/20'
                                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                                            <span className="text-[11px] font-semibold">Completed</span>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                                            {statusDistribution.read}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-0.5">
                                            <span>Fully read</span>
                                            <span className="font-mono font-medium">{statusDistribution.readPct}%</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            statusFilter === 'pending'
                                                ? 'bg-amber-100/60 dark:bg-amber-900/40 border-amber-500 ring-2 ring-amber-500/20'
                                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                                            <span className="text-[11px] font-semibold">Pending</span>
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                                            {statusDistribution.pending}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-0.5">
                                            <span>To review</span>
                                            <span className="font-mono font-medium">{statusDistribution.pendingPct}%</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* SECTION 2: Priority Level Distribution */}
                            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-rose-100/70 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                            By Priority Level
                                        </h4>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                                        {priorityDistribution.high} High Impact
                                    </span>
                                </div>

                                {/* Tri-color Segmented Progress Bar for Priority */}
                                <div className="space-y-1">
                                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                                        {priorityDistribution.total > 0 ? (
                                            <>
                                                <div
                                                    className="h-full bg-rose-500 transition-all duration-500"
                                                    style={{ width: `${priorityDistribution.highPct}%` }}
                                                    title={`High: ${priorityDistribution.high} (${priorityDistribution.highPct}%)`}
                                                />
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-500"
                                                    style={{ width: `${priorityDistribution.mediumPct}%` }}
                                                    title={`Medium: ${priorityDistribution.medium} (${priorityDistribution.mediumPct}%)`}
                                                />
                                                <div
                                                    className="h-full bg-sky-500 transition-all duration-500"
                                                    style={{ width: `${priorityDistribution.lowPct}%` }}
                                                    title={`Low: ${priorityDistribution.low} (${priorityDistribution.lowPct}%)`}
                                                />
                                            </>
                                        ) : (
                                            <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                        <span className="text-rose-600 dark:text-rose-400">High ({priorityDistribution.highPct}%)</span>
                                        <span className="text-amber-600 dark:text-amber-400">Med ({priorityDistribution.mediumPct}%)</span>
                                        <span className="text-sky-600 dark:text-sky-400">Low ({priorityDistribution.lowPct}%)</span>
                                    </div>
                                </div>

                                {/* Clickable Priority Cards */}
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
                                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                            priorityFilter === 'high'
                                                ? 'bg-rose-100/70 dark:bg-rose-900/40 border-rose-500 ring-2 ring-rose-500/20'
                                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700'
                                        }`}
                                    >
                                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tight">High</div>
                                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white my-0.5">
                                            {priorityDistribution.high}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">{priorityDistribution.highPct}%</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPriorityFilter(priorityFilter === 'medium' ? 'all' : 'medium')}
                                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                            priorityFilter === 'medium'
                                                ? 'bg-amber-100/70 dark:bg-amber-900/40 border-amber-500 ring-2 ring-amber-500/20'
                                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700'
                                        }`}
                                    >
                                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">Medium</div>
                                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white my-0.5">
                                            {priorityDistribution.medium}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">{priorityDistribution.mediumPct}%</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPriorityFilter(priorityFilter === 'low' ? 'all' : 'low')}
                                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                            priorityFilter === 'low'
                                                ? 'bg-sky-100/70 dark:bg-sky-900/40 border-sky-500 ring-2 ring-sky-500/20'
                                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700'
                                        }`}
                                    >
                                        <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-tight">Low</div>
                                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white my-0.5">
                                            {priorityDistribution.low}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">{priorityDistribution.lowPct}%</div>
                                    </button>
                                </div>
                            </div>

                            {/* SECTION 3: Target University Distribution */}
                            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                                            <School className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                            By Target University
                                        </h4>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                                        {universityDistribution.uniqueCount} Targets
                                    </span>
                                </div>

                                {/* List of University Distribution Bars */}
                                {universityDistribution.items.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                                        <School className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                                        <p>No universities linked yet.</p>
                                        <p className="text-[11px] mt-0.5 text-slate-400">Add or edit a paper to set target institutions.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[148px] overflow-y-auto pr-1">
                                        {universityDistribution.items.map((item) => {
                                            const isSelected = selectedUniversity === item.name;
                                            return (
                                                <button
                                                    key={item.name}
                                                    type="button"
                                                    onClick={() => setSelectedUniversity(isSelected ? 'all' : item.name)}
                                                    className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                                                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                                                            {item.count} {item.count === 1 ? 'paper' : 'papers'} ({item.pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.max(item.pct, 6)}%` }}
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Analytics Filter Status Footer Banner */}
                        {(statusFilter !== 'all' || priorityFilter !== 'all' || selectedUniversity !== 'all') && (
                            <div className="flex items-center justify-between flex-wrap gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                                <div className="flex items-center gap-2 flex-wrap text-blue-900 dark:text-blue-200 font-medium">
                                    <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Active Filters:</span>
                                    {statusFilter !== 'all' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 font-semibold text-[11px]">
                                            Status: {statusFilter.toUpperCase()}
                                            <button
                                                type="button"
                                                onClick={() => setStatusFilter('all')}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5 cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {priorityFilter !== 'all' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 font-semibold text-[11px]">
                                            Priority: {priorityFilter.toUpperCase()}
                                            <button
                                                type="button"
                                                onClick={() => setPriorityFilter('all')}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5 cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedUniversity !== 'all' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 font-semibold text-[11px]">
                                            Target: {selectedUniversity}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedUniversity('all')}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5 cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                                        (Showing {filteredPapers.length} of {papers.length} papers)
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setPriorityFilter('all');
                                        setSelectedUniversity('all');
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs cursor-pointer ml-auto"
                                >
                                    Clear all analytics filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-xs">
                {/* Row 1: Search Input & Sort Selector */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search papers by title, author, topic, notes, venue, or university target..."
                            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={sortBy}
                            onChange={(e: any) => setSortBy(e.target.value)}
                            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                        >
                            <option value="dateAdded-desc">Newest Added First</option>
                            <option value="dateAdded-asc">Oldest Added First</option>
                            <option value="priority">Priority (High to Low)</option>
                            <option value="year-desc">Publication Year (Recent)</option>
                            <option value="title">Alphabetical (Title A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: Status Tabs & Detailed Filters */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Status Segmented Buttons */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('pending')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === 'pending'
                                    ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending ({stats.pending})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('read')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === 'read'
                                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Read ({stats.read})</span>
                        </button>
                    </div>

                    {/* Secondary Dropdown Filters */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        {/* Priority Selector */}
                        <select
                            value={priorityFilter}
                            onChange={(e: any) => setPriorityFilter(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                            <option value="all">All Priorities</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>

                        {/* Target University Selector */}
                        {allUniversities.length > 0 && (
                            <select
                                value={selectedUniversity}
                                onChange={(e) => setSelectedUniversity(e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 max-w-[170px] truncate cursor-pointer"
                            >
                                <option value="all">All Universities</option>
                                {allUniversities.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        )}

                        {/* Tag Selector */}
                        {allTags.length > 0 && (
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 max-w-[150px] truncate cursor-pointer"
                            >
                                <option value="all">All Tags</option>
                                {allTags.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        )}

                        {/* Reset Filters */}
                        {(statusFilter !== 'all' || priorityFilter !== 'all' || selectedTag !== 'all' || selectedUniversity !== 'all' || searchQuery) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                    setSelectedTag('all');
                                    setSelectedUniversity('all');
                                    setSearchQuery('');
                                }}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-lg text-xs"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Papers List */}
            {filteredPapers.length > 0 ? (
                <div className="space-y-4">
                    {filteredPapers.map(paper => {
                        const isRead = paper.status === 'read';
                        const isEditingNotes = activeNotesId === paper.id;

                        return (
                            <div
                                key={paper.id}
                                className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                                    isRead 
                                        ? 'border-slate-200 dark:border-slate-800 opacity-95' 
                                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 shadow-xs'
                                }`}
                            >
                                {/* Card Header: Status Toggle, Title, Priority */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                        {/* Status Toggle Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleReadStatus(paper)}
                                            title={isRead ? "Mark as Pending" : "Mark as Read"}
                                            className={`mt-1 p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                                                isRead
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            {isRead ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Clock className="w-5 h-5" />
                                            )}
                                        </button>

                                        {/* Title & Metadata */}
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-baseline flex-wrap gap-2">
                                                {paper.scholarUrl ? (
                                                    <a
                                                        href={paper.scholarUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`text-base sm:text-lg font-bold hover:underline transition-colors leading-snug flex items-center gap-1.5 ${
                                                            isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                                                        }`}
                                                    >
                                                        <span>{paper.title}</span>
                                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    </a>
                                                ) : (
                                                    <h3 className={`text-base sm:text-lg font-bold leading-snug ${
                                                        isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                                                    }`}>
                                                        {paper.title}
                                                    </h3>
                                                )}
                                            </div>

                                            {/* Unboxed Metadata Line with middle-dot separators (Zero-Pill Discipline) */}
                                            <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                <span>{(paper.authors || []).join(', ')}</span>
                                                <span aria-hidden="true">·</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{paper.journalOrVenue}</span>
                                                <span aria-hidden="true">·</span>
                                                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">{paper.year}</span>
                                                {typeof paper.citationCount === 'number' && paper.citationCount > 0 && (
                                                    <>
                                                        <span aria-hidden="true">·</span>
                                                        <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                                                            {paper.citationCount.toLocaleString()} citations
                                                        </span>
                                                    </>
                                                )}
                                                {paper.doi && (
                                                    <>
                                                        <span aria-hidden="true">·</span>
                                                        <span className="font-mono text-slate-400 truncate max-w-[200px]">
                                                            DOI: {paper.doi}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Priority Indicator & Status Label */}
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                            paper.priority === 'high' 
                                                ? 'text-rose-600 dark:text-rose-400' 
                                                : paper.priority === 'medium'
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {paper.priority} Priority
                                        </span>
                                        <span className={`text-xs font-semibold ${
                                            isRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {isRead ? 'Read' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Target University & Professor Association */}
                                {(paper.targetUniversity || paper.targetProfessor) && (
                                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        {paper.targetUniversity && (
                                            <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                                                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                                <span>Target: {paper.targetUniversity}</span>
                                            </div>
                                        )}
                                        {paper.targetProfessor && (
                                            <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                                                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>PI: {paper.targetProfessor}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Abstract preview if available */}
                                {paper.abstract && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-3 line-clamp-3">
                                        {paper.abstract}
                                    </p>
                                )}

                                {/* Tags (Unboxed with Tag icon or quiet tokens) */}
                                {Array.isArray(paper.tags) && paper.tags.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-1.5 mt-3">
                                        <Tag className="w-3 h-3 text-slate-400 mr-0.5" />
                                        {paper.tags.map((tag, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                                                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                                                    selectedTag === tag
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600'
                                                }`}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* SOP / Cold Email Hook Sentence */}
                                {paper.sopHookSentence && (
                                    <div className="mt-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 space-y-1">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                            <span className="flex items-center gap-1">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                SOP & Cold Email Outreach Hook:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(paper.sopHookSentence!, `hook-${paper.id}`)}
                                                className="text-xs lowercase tracking-normal font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                {copiedId === `hook-${paper.id}` ? (
                                                    <>
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                        <span>Copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic">
                                            "{paper.sopHookSentence}"
                                        </p>
                                    </div>
                                )}

                                {/* Candidate Notes Editor / Display */}
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    {isEditingNotes ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                                <span>Author Notes & Literature Takeaways:</span>
                                                <span className="text-[11px] font-normal text-slate-400">Save notes to preserve takeaways</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={activeNotesText}
                                                onChange={(e) => setActiveNotesText(e.target.value)}
                                                placeholder="Key methodology findings, limitations, relevance to your proposed PhD/Master thesis..."
                                                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveNotesId(null)}
                                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveInlineNotes(paper)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                    <span>Save Notes</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-3 group">
                                            <div className="text-xs text-slate-600 dark:text-slate-400 flex-1">
                                                {paper.notes ? (
                                                    <div className="space-y-0.5">
                                                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                            Your Notes:
                                                        </span>
                                                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                            {paper.notes}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveNotesId(paper.id);
                                                            setActiveNotesText(paper.notes || '');
                                                        }}
                                                        className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>Add reading notes & key takeaways...</span>
                                                    </button>
                                                )}
                                            </div>

                                            {paper.notes && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveNotesId(paper.id);
                                                        setActiveNotesText(paper.notes || '');
                                                    }}
                                                    title="Edit notes"
                                                    className="text-slate-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer Action Controls */}
                                <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    {/* Links */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {paper.pdfUrl && (
                                            <a
                                                href={paper.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:underline"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Open PDF</span>
                                            </a>
                                        )}
                                        {paper.scholarUrl && (
                                            <a
                                                href={paper.scholarUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                            >
                                                <GraduationCap className="w-3.5 h-3.5 text-[#4285F4]" />
                                                <span>Google Scholar</span>
                                            </a>
                                        )}
                                    </div>

                                    {/* Utility Actions: Copy APA, Edit, Delete */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const citation = paper.apaCitation || `${(paper.authors || []).join(', ')} (${paper.year}). ${paper.title}. ${paper.journalOrVenue}.`;
                                                handleCopy(citation, `apa-${paper.id}`);
                                            }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            {copiedId === `apa-${paper.id}` ? (
                                                <>
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                    <span>Copied APA</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>APA</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingPaper(paper);
                                                setIsAddModalOpen(true);
                                            }}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Edit paper details"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm(`Delete "${paper.title}" from your research tracker?`)) {
                                                    onDeletePaper(paper.id);
                                                }
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                            title="Remove from tracker"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty state */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <BookOpen className="w-7 h-7" />
                    </div>

                    {papers.length === 0 ? (
                        <div className="space-y-2 max-w-md mx-auto">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Your Research Paper Tracker is Empty
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Save foundational papers from Google Scholar or add publications manually to track reading progress and literature hooks for your academic applications.
                            </p>
                            <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => onOpenScholarModal()}
                                    className="px-4 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                                >
                                    Search Google Scholar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPaper(null);
                                        setIsAddModalOpen(true);
                                    }}
                                    className="px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
                                >
                                    Add Paper Manually
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLoadSamplePapers}
                                    className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                    Load 3 Sample Papers
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-w-md mx-auto">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                No papers match your active filters
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Try clearing your search query or loosening the status/tag filters.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                    setSelectedTag('all');
                                    setSelectedUniversity('all');
                                    setSearchQuery('');
                                }}
                                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Paper Entry / Edit Modal */}
            {isAddModalOpen && (
                <PaperEditModal
                    paperToEdit={editingPaper}
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingPaper(null);
                    }}
                    onSave={(saved) => {
                        onSavePaper(saved);
                        setIsAddModalOpen(false);
                        setEditingPaper(null);
                    }}
                    universitySuggestions={allUniversities}
                />
            )}
        </div>
    );
};

// Modal for adding or editing a research paper manually
interface PaperEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paper: ResearchPaperItem) => void;
    paperToEdit?: ResearchPaperItem | null;
    universitySuggestions: string[];
}

const PaperEditModal: React.FC<PaperEditModalProps> = ({
    isOpen,
    onClose,
    onSave,
    paperToEdit,
    universitySuggestions
}) => {
    const isEditing = Boolean(paperToEdit);

    const [title, setTitle] = useState(paperToEdit?.title || '');
    const [authorsStr, setAuthorsStr] = useState((paperToEdit?.authors || []).join(', '));
    const [journalOrVenue, setJournalOrVenue] = useState(paperToEdit?.journalOrVenue || '');
    const [year, setYear] = useState(String(paperToEdit?.year || new Date().getFullYear()));
    const [scholarUrl, setScholarUrl] = useState(paperToEdit?.scholarUrl || '');
    const [pdfUrl, setPdfUrl] = useState(paperToEdit?.pdfUrl || '');
    const [doi, setDoi] = useState(paperToEdit?.doi || '');
    const [status, setStatus] = useState<ReadingStatus>(paperToEdit?.status || 'pending');
    const [priority, setPriority] = useState<PaperPriority>(paperToEdit?.priority || 'medium');
    const [targetUniversity, setTargetUniversity] = useState(paperToEdit?.targetUniversity || '');
    const [targetProfessor, setTargetProfessor] = useState(paperToEdit?.targetProfessor || '');
    const [tagsStr, setTagsStr] = useState((paperToEdit?.tags || []).join(', '));
    const [notes, setNotes] = useState(paperToEdit?.notes || '');
    const [sopHookSentence, setSopHookSentence] = useState(paperToEdit?.sopHookSentence || '');
    const [citationCount, setCitationCount] = useState<string>(paperToEdit?.citationCount ? String(paperToEdit.citationCount) : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !authorsStr.trim()) return;

        const authors = authorsStr
            .split(',')
            .map(a => a.trim())
            .filter(Boolean);

        const tags = tagsStr
            .split(',')
            .map(t => t.trim().replace(/^#/, ''))
            .filter(Boolean);

        const id = paperToEdit?.id || `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Auto-generate APA citation if not present
        const apaCitation = paperToEdit?.apaCitation || `${authors.join(', ')} (${year}). ${title}. ${journalOrVenue}.`;

        const savedItem: ResearchPaperItem = {
            id,
            title: title.trim(),
            authors,
            journalOrVenue: journalOrVenue.trim() || 'Academic Preprint',
            year: year.trim() || String(new Date().getFullYear()),
            citationCount: citationCount ? parseInt(citationCount, 10) : undefined,
            scholarUrl: scholarUrl.trim() || undefined,
            pdfUrl: pdfUrl.trim() || undefined,
            doi: doi.trim() || undefined,
            status,
            priority,
            targetUniversity: targetUniversity.trim() || undefined,
            targetProfessor: targetProfessor.trim() || undefined,
            tags,
            notes: notes.trim() || undefined,
            sopHookSentence: sopHookSentence.trim() || undefined,
            apaCitation,
            dateAdded: paperToEdit?.dateAdded || new Date().toISOString(),
            dateRead: status === 'read' ? (paperToEdit?.dateRead || new Date().toISOString()) : undefined,
            updatedAt: new Date().toISOString()
        };

        onSave(savedItem);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isEditing ? 'Edit Research Paper' : 'Add Research Paper to Tracker'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Paper Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Deep Residual Learning for Image Recognition"
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Authors & Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Authors (comma-separated) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={authorsStr}
                                onChange={(e) => setAuthorsStr(e.target.value)}
                                placeholder="e.g., Kaiming He, Xiangyu Zhang, Shaoqing Ren"
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Year
                            </label>
                            <input
                                type="text"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="2024"
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Journal/Venue & DOI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Journal / Venue / Conference
                            </label>
                            <input
                                type="text"
                                value={journalOrVenue}
                                onChange={(e) => setJournalOrVenue(e.target.value)}
                                placeholder="e.g., CVPR, Nature, arXiv preprint"
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                DOI (optional)
                            </label>
                            <input
                                type="text"
                                value={doi}
                                onChange={(e) => setDoi(e.target.value)}
                                placeholder="e.g., 10.1109/CVPR.2016.90"
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* URLs: Scholar Link & PDF Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Paper or Scholar URL
                            </label>
                            <input
                                type="url"
                                value={scholarUrl}
                                onChange={(e) => setScholarUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Direct PDF URL
                            </label>
                            <input
                                type="url"
                                value={pdfUrl}
                                onChange={(e) => setPdfUrl(e.target.value)}
                                placeholder="https://.../paper.pdf"
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Reading Status
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStatus('pending')}
                                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                        status === 'pending'
                                            ? 'bg-amber-500 text-white shadow-xs'
                                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                                    }`}
                                >
                                    Pending
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('read')}
                                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                        status === 'read'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                                    }`}
                                >
                                    Read
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Priority Level
                            </label>
                            <select
                                value={priority}
                                onChange={(e: any) => setPriority(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                            >
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                        </div>
                    </div>

                    {/* Target University & Professor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Target University
                            </label>
                            <input
                                type="text"
                                list="uni-suggestions"
                                value={targetUniversity}
                                onChange={(e) => setTargetUniversity(e.target.value)}
                                placeholder="e.g., Stanford University"
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                            <datalist id="uni-suggestions">
                                {universitySuggestions.map(u => (
                                    <option key={u} value={u} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Target Professor / PI
                            </label>
                            <input
                                type="text"
                                value={targetProfessor}
                                onChange={(e) => setTargetProfessor(e.target.value)}
                                placeholder="e.g., Prof. Andrew Ng"
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={tagsStr}
                            onChange={(e) => setTagsStr(e.target.value)}
                            placeholder="e.g., Computer Vision, ResNet, ImageNet, Benchmark"
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Candidate Reading Notes */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Author Notes & Methodology Takeaways
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Summarize key takeaways, strengths, limitations, or potential extensions for your application statement..."
                            className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* SOP Hook Sentence */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Statement of Purpose / Cold Email Literature Hook</span>
                        </label>
                        <textarea
                            rows={2}
                            value={sopHookSentence}
                            onChange={(e) => setSopHookSentence(e.target.value)}
                            placeholder="e.g., Having studied your 2024 work on deformable neural splats, I am excited to explore..."
                            className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Submit & Cancel */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                        >
                            {isEditing ? 'Save Changes' : 'Add to Tracker'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
