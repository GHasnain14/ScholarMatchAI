import React, { useState, useEffect } from 'react';
import {
    Search,
    Sparkles,
    Building2,
    Globe2,
    BookOpen,
    GraduationCap,
    Award,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Clock,
    Copy,
    Check,
    Download,
    ShieldCheck,
    FileText,
    ChevronDown,
    ChevronUp,
    Bookmark,
    BookmarkCheck,
    RefreshCw,
    Layers,
    X,
    Send,
    Briefcase
} from 'lucide-react';
import jsPDF from 'jspdf';
import { MasterProgram, CurriculumMotivationLetterResponse } from '../types';
import { findMasterPrograms, craftCurriculumMotivationLetter } from '../services/geminiService';
import { Spinner } from './Spinner';

interface MasterProgramsExplorerProps {
    cvText: string;
    onNavigateToTab?: (tab: string) => void;
    onSendToWatermarkRemover?: (text: string) => void;
    onSendToDocumentStudio?: (text: string, title?: string) => void;
}

const COUNTRIES = [
    { name: 'Germany', flag: '🇩🇪', badge: 'Tuition-Free & Uni-Assist', desc: 'TUM, RWTH Aachen, LMU, KIT, TU Berlin' },
    { name: 'South Korea', flag: '🇰🇷', badge: 'BK21+ Full Funding', desc: 'KAIST, SNU, POSTECH, Korea Univ' },
    { name: 'France', flag: '🇫🇷', badge: 'Campus France & Elite Grandes Écoles', desc: 'IP Paris, Sorbonne, Paris-Saclay, PSL' },
    { name: 'Switzerland', flag: '🇨🇭', badge: 'Low Subsidized Tuition', desc: 'ETH Zurich, EPFL' },
    { name: 'Sweden', flag: '🇸🇪', badge: 'UniversityAdmissions.se', desc: 'KTH, Chalmers, Lund University' },
    { name: 'Netherlands', flag: '🇳🇱', badge: 'Studielink & High Tech', desc: 'TU Delft, TU Eindhoven, Univ of Amsterdam' },
    { name: 'Canada', flag: '🇨🇦', badge: 'Mila AI Hub & Research M.Sc.', desc: 'U of Toronto, UBC, Waterloo, McGill' },
    { name: 'United States', flag: '🇺🇸', badge: 'RA / TA Assistantships', desc: 'CMU, Georgia Tech, UIUC, Purdue' },
    { name: 'United Kingdom', flag: '🇬🇧', badge: 'Russell Group Excellence', desc: 'Imperial, UCL, Edinburgh, Manchester' },
    { name: 'Japan', flag: '🇯🇵', badge: 'MEXT Scholarships', desc: 'Univ of Tokyo, Kyoto, Tokyo Tech' },
    { name: 'Australia', flag: '🇦🇺', badge: 'Go8 & RTP Fellowships', desc: 'Univ of Melbourne, Sydney, ANU, UNSW' },
    { name: 'Singapore', flag: '🇸🇬', badge: 'SINGA Award', desc: 'NUS, NTU Singapore' },
    { name: 'European Union (EMJMD)', flag: '🇪🇺', badge: 'Erasmus Mundus Full Scholarship', desc: 'BDMA, EMCL++, Multi-Country Consortium' },
];

export const MasterProgramsExplorer: React.FC<MasterProgramsExplorerProps> = ({
    cvText,
    onNavigateToTab,
    onSendToWatermarkRemover,
    onSendToDocumentStudio,
}) => {
    const [selectedCountry, setSelectedCountry] = useState<string>('Germany');
    const [programs, setPrograms] = useState<MasterProgram[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterTuitionFree, setFilterTuitionFree] = useState<boolean>(false);
    const [filterHighMatch, setFilterHighMatch] = useState<boolean>(false);
    const [savedProgramIds, setSavedProgramIds] = useState<Set<string>>(new Set());
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

    // Modal state for Curriculum Motivation Letter & Admission Suite
    const [activeProgramForModal, setActiveProgramForModal] = useState<MasterProgram | null>(null);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [admissionSuite, setAdmissionSuite] = useState<CurriculumMotivationLetterResponse | null>(null);
    const [modalActiveTab, setModalActiveTab] = useState<'letter' | 'curriculum' | 'chairs' | 'checklist'>('letter');
    const [letterTone, setLetterTone] = useState<string>('Academic & Persuasive');
    const [englishLevel, setEnglishLevel] = useState<number>(8);
    const [specificFocusArea, setSpecificFocusArea] = useState<string>('');
    const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
    const [copiedChecklist, setCopiedChecklist] = useState<boolean>(false);

    // Initial search when selectedCountry changes or on mount
    useEffect(() => {
        if (!cvText) return;
        fetchPrograms(selectedCountry);
    }, [selectedCountry]);

    const fetchPrograms = async (countryName: string) => {
        if (!cvText) return;
        setLoading(true);
        try {
            const result = await findMasterPrograms(cvText, countryName);
            setPrograms(result);
            if (result.length > 0) {
                setExpandedCardId(result[0].id || null);
            }
        } catch (err) {
            console.error('Failed to fetch master programs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdmissionSuite = async (program: MasterProgram) => {
        setActiveProgramForModal(program);
        setModalLoading(true);
        setAdmissionSuite(null);
        setModalActiveTab('letter');

        try {
            const response = await craftCurriculumMotivationLetter({
                cvText,
                program,
                tone: letterTone,
                englishLevel,
                specificFocusArea: specificFocusArea || undefined,
            });
            setAdmissionSuite(response);
        } catch (error) {
            console.error('Error generating admission suite:', error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleRefineLetter = async () => {
        if (!activeProgramForModal) return;
        setModalLoading(true);
        try {
            const response = await craftCurriculumMotivationLetter({
                cvText,
                program: activeProgramForModal,
                tone: letterTone,
                englishLevel,
                specificFocusArea: specificFocusArea || undefined,
            });
            setAdmissionSuite(response);
        } catch (error) {
            console.error('Error refining letter:', error);
        } finally {
            setModalLoading(false);
        }
    };

    const toggleSaveProgram = (progId: string) => {
        setSavedProgramIds((prev) => {
            const next = new Set(prev);
            if (next.has(progId)) next.delete(progId);
            else next.add(progId);
            return next;
        });
    };

    const copyToClipboard = (text: string, isChecklist = false) => {
        navigator.clipboard.writeText(text);
        if (isChecklist) {
            setCopiedChecklist(true);
            setTimeout(() => setCopiedChecklist(false), 2000);
        } else {
            setCopiedLetter(true);
            setTimeout(() => setCopiedLetter(false), 2000);
        }
    };

    const downloadLetterPdf = () => {
        if (!admissionSuite?.motivationLetter || !activeProgramForModal) return;
        const doc = new jsPDF({ unit: 'pt', format: 'letter' });
        const margin = 50;
        const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text(
            `Academic Motivation Letter - ${activeProgramForModal.programTitle}`,
            margin,
            50
        );

        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        doc.text(
            `${activeProgramForModal.universityName} | ${activeProgramForModal.department}`,
            margin,
            68
        );
        doc.text(
            `Application Portal: ${activeProgramForModal.applicationWay?.portalName || 'University Portal'}`,
            margin,
            82
        );

        doc.setLineWidth(0.5);
        doc.line(margin, 92, doc.internal.pageSize.getWidth() - margin, 92);

        const splitText = doc.splitTextToSize(admissionSuite.motivationLetter, pageWidth);
        doc.setFontSize(10.5);
        doc.text(splitText, margin, 115);

        doc.save(`${activeProgramForModal.universityName.replace(/\s+/g, '_')}_Motivation_Letter.pdf`);
    };

    // Filter programs
    const filteredPrograms = programs.filter((p) => {
        const matchesSearch =
            searchQuery === '' ||
            p.programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.curriculumHighlights.coreModules.some((m) =>
                m.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesTuition = !filterTuitionFree || p.tuitionAndFees.isTuitionFree;
        const matchesScore = !filterHighMatch || p.matchScore >= 90;

        return matchesSearch && matchesTuition && matchesScore;
    });

    return (
        <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-4xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                        <span>Curriculum Matching & Admission Engine</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Explore Master's Programs by Country & Match Curricula
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        Select a target country (like <strong>Germany 🇩🇪</strong> with tuition-free universities and Uni-Assist) to discover verified Master's degree programs aligned with your uploaded CV. Inspect <strong>exact department curricula</strong>, prerequisite <strong>ECTS credit requirements</strong>, and craft <strong>custom Motivation Letters / SOPs</strong> matching the university's specific course modules.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> State-Accredited Universities
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Uni-Assist (VPD) & Direct Portals
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% English-Taught Options
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Blocked Account & Tuition Free Status
                        </span>
                    </div>
                </div>
            </div>

            {/* Country Selector Carousel / Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-indigo-500" />
                        Select Destination Country
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {COUNTRIES.length} Countries Supported
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {COUNTRIES.map((c) => {
                        const isSelected = selectedCountry === c.name;
                        return (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => setSelectedCountry(c.name)}
                                className={`flex flex-col text-left p-3 rounded-xl border transition-all relative group cursor-pointer ${
                                    isSelected
                                        ? 'bg-gradient-to-b from-blue-50 to-indigo-50/70 dark:from-blue-950/70 dark:to-indigo-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-2xl" role="img" aria-label={c.name}>
                                        {c.flag}
                                    </span>
                                    {isSelected && (
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                                    )}
                                </div>
                                <span className={`text-sm font-bold ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {c.name}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {c.badge}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search program, university, module..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setFilterTuitionFree(!filterTuitionFree)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                            filterTuitionFree
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        💰 Tuition-Free Only
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilterHighMatch(!filterHighMatch)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                            filterHighMatch
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                : 'bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        🎯 High Match (90%+)
                    </button>

                    <button
                        type="button"
                        onClick={() => fetchPrograms(selectedCountry)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                        title="Re-fetch programs"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Spinner />
                    <div className="text-center space-y-1">
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                            Searching Accredited Master's Programs in {selectedCountry}...
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                            Analyzing official university department curricula, Uni-Assist / direct admission requirements, ECTS prerequisites, and calculating alignment with your CV.
                        </p>
                    </div>
                </div>
            ) : filteredPrograms.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        No Master's Programs Found
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        No programs matched your current search filters. Try clearing the search query or selecting another destination country.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setFilterTuitionFree(false);
                            setFilterHighMatch(false);
                        }}
                        className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                        <span>
                            Showing <strong>{filteredPrograms.length}</strong> Master's program{filteredPrograms.length !== 1 ? 's' : ''} in <strong>{selectedCountry}</strong>
                        </span>
                        <span>Click any program to craft a customized Motivation Letter</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredPrograms.map((program) => {
                            const progId = program.id || program.programTitle;
                            const isSaved = savedProgramIds.has(progId);
                            const isExpanded = expandedCardId === progId;

                            return (
                                <div
                                    key={progId}
                                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
                                        isExpanded
                                            ? 'border-blue-300 dark:border-blue-800 ring-1 ring-blue-400/20'
                                            : 'border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    {/* Main Card Header */}
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                        {program.degreeType || 'M.Sc.'}
                                                    </span>
                                                    {program.tuitionAndFees?.isTuitionFree ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                                            ✓ Tuition-Free
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                            State Regulated Tuition
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                        {program.languageOfInstruction || '100% English'}
                                                    </span>
                                                    {program.ranking?.qsRank && (
                                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 flex items-center gap-1">
                                                            <Award className="w-3 h-3" />
                                                            {program.ranking.qsRank}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                                    {program.programTitle}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                                                    <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                                                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                                        {program.universityName}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        {program.department}
                                                    </span>
                                                    {program.city && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-slate-500 dark:text-slate-400">
                                                                {program.city}, {program.country}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Match Score Badge & Bookmark */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                            CV Curriculum Match
                                                        </div>
                                                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                                                            {program.matchScore}%
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSaveProgram(progId)}
                                                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                                            isSaved
                                                                ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/60 dark:border-amber-700'
                                                                : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:text-slate-600'
                                                        }`}
                                                        title={isSaved ? 'Remove bookmark' : 'Bookmark program'}
                                                    >
                                                        {isSaved ? (
                                                            <BookmarkCheck className="w-4 h-4 text-amber-500" />
                                                        ) : (
                                                            <Bookmark className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Match Rationale Callout */}
                                        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed flex items-start gap-2.5">
                                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="font-semibold">Why this matches your CV: </strong>
                                                {program.matchRationale}
                                            </div>
                                        </div>

                                        {/* Core Curriculum Highlights Preview */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <span className="flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                                    Official Core Course Modules:
                                                </span>
                                                <span className="text-[11px] font-normal text-slate-500">
                                                    {program.durationAndCredits || '2 Years / 120 ECTS'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {program.curriculumHighlights.coreModules.map((mod, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1"
                                                    >
                                                        <Layers className="w-3 h-3 text-indigo-500" />
                                                        {mod}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Expandable Details Section */}
                                        {isExpanded && (
                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                                                {/* 3-Column Info Grid: Application Way, Prerequisites, Tuition */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {/* Column 1: Application Way / Portal */}
                                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                                            Application Way
                                                        </div>
                                                        <div className="text-blue-700 dark:text-blue-400 font-bold">
                                                            {program.applicationWay.portalName}
                                                        </div>
                                                        <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                                                            {program.applicationWay.keySteps.map((step, sIdx) => (
                                                                <li key={sIdx} className="flex items-start gap-1">
                                                                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                                                                    <span>{step}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Column 2: Admission Prerequisites & ECTS */}
                                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                                                            Admission Prerequisites
                                                        </div>
                                                        <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                                            <p>
                                                                <strong>Degree:</strong> {program.admissionPrerequisites.bachelorDegreeRequired}
                                                            </p>
                                                            {program.admissionPrerequisites.minEctsCredits && (
                                                                <p>
                                                                    <strong>ECTS:</strong> {program.admissionPrerequisites.minEctsCredits}
                                                                </p>
                                                            )}
                                                            <p>
                                                                <strong>Language:</strong> {program.languageRequirements}
                                                            </p>
                                                            {program.admissionPrerequisites.gpaRecommendation && (
                                                                <p>
                                                                    <strong>GPA:</strong> {program.admissionPrerequisites.gpaRecommendation}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Column 3: Tuition & Living Costs */}
                                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                            <Award className="w-3.5 h-3.5 text-emerald-500" />
                                                            Tuition & Blocked Account
                                                        </div>
                                                        <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                                            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                                {program.tuitionAndFees.tuitionText}
                                                            </p>
                                                            {program.tuitionAndFees.livingCostEstimate && (
                                                                <p className="text-slate-600 dark:text-slate-400">
                                                                    <strong>Living / Visa:</strong> {program.tuitionAndFees.livingCostEstimate}
                                                                </p>
                                                            )}
                                                            {program.deadlines.winterSemester && (
                                                                <p className="text-rose-600 dark:text-rose-400 font-medium">
                                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                                    Deadline: {program.deadlines.winterSemester}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Thesis & Department info */}
                                                {program.curriculumHighlights.masterThesisDetails && (
                                                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                                        <strong>Master's Thesis & Lab Collaboration: </strong>
                                                        {program.curriculumHighlights.masterThesisDetails}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons Footer */}
                                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedCardId(isExpanded ? null : progId)}
                                                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4" /> Less Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4" /> More Curricular Details & ECTS
                                                    </>
                                                )}
                                            </button>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {program.applicationWay.applicationUrl && (
                                                    <a
                                                        href={program.applicationWay.applicationUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <span>Application Portal</span>
                                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                                    </a>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenAdmissionSuite(program)}
                                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>Craft Curriculum Motivation Letter & Admission Suite</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* CURRICULUM MOTIVATION LETTER & ADMISSION SUITE MODAL */}
            {activeProgramForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-start justify-between gap-4 border-b border-slate-800">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold">
                                    <Sparkles className="w-3 h-3 text-blue-300" />
                                    Curriculum-Matched Admission Suite
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-white">
                                    {activeProgramForModal.programTitle}
                                </h3>
                                <p className="text-xs text-slate-300 flex items-center gap-2">
                                    <span>{activeProgramForModal.universityName}</span>
                                    <span>•</span>
                                    <span>{activeProgramForModal.department}</span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-semibold">{activeProgramForModal.tuitionAndFees?.tuitionText}</span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveProgramForModal(null)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Navigation Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-950 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setModalActiveTab('letter')}
                                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                    modalActiveTab === 'letter'
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>Tailored Motivation Letter (SOP)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setModalActiveTab('curriculum')}
                                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                    modalActiveTab === 'curriculum'
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <Layers className="w-4 h-4" />
                                <span>Curriculum Alignment Breakdown</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setModalActiveTab('chairs')}
                                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                    modalActiveTab === 'chairs'
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <GraduationCap className="w-4 h-4" />
                                <span>Faculty Chairs to Mention</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setModalActiveTab('checklist')}
                                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                    modalActiveTab === 'checklist'
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Uni-Assist & Portal Checklist</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {modalLoading ? (
                                <div className="py-16 text-center space-y-4">
                                    <Spinner />
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Analyzing {activeProgramForModal.universityName} Department Curriculum & Crafting Custom Letter...
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Cross-referencing your CV projects with official course modules in {activeProgramForModal.curriculumHighlights.coreModules.slice(0, 2).join(' and ')}.
                                    </p>
                                </div>
                            ) : admissionSuite ? (
                                <>
                                    {/* TAB 1: Motivation Letter */}
                                    {modalActiveTab === 'letter' && (
                                        <div className="space-y-4">
                                            {/* Customization controls */}
                                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                <div>
                                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                        Writing Cadence / Tone
                                                    </label>
                                                    <select
                                                        value={letterTone}
                                                        onChange={(e) => setLetterTone(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                                                    >
                                                        <option value="Academic & Persuasive">Academic & Persuasive</option>
                                                        <option value="Rigorous & Research-Intensive">Rigorous & Research-Intensive</option>
                                                        <option value="Confident & High-Impact">Confident & High-Impact</option>
                                                        <option value="Reflective & Scholarly">Reflective & Scholarly</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                        English Band
                                                    </label>
                                                    <select
                                                        value={englishLevel}
                                                        onChange={(e) => setEnglishLevel(Number(e.target.value))}
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                                                    >
                                                        <option value={9}>IELTS Band 9.0 (Native / Distinguished Academic)</option>
                                                        <option value={8}>IELTS Band 8.0 (Advanced Scholarly)</option>
                                                        <option value={7}>IELTS Band 7.5 (Competent Academic)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                        Highlight Focus
                                                    </label>
                                                    <div className="flex gap-1.5">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Distributed Systems"
                                                            value={specificFocusArea}
                                                            onChange={(e) => setSpecificFocusArea(e.target.value)}
                                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleRefineLetter}
                                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold shrink-0 cursor-pointer"
                                                            title="Regenerate Letter"
                                                        >
                                                            <RefreshCw className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action bar for letter */}
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                <div className="text-slate-500 font-medium">
                                                    Matched with: <strong>{activeProgramForModal.curriculumHighlights.coreModules.slice(0, 3).join(', ')}</strong>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(admissionSuite.motivationLetter)}
                                                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        {copiedLetter ? (
                                                            <>
                                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span>Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3.5 h-3.5" />
                                                                <span>Copy Letter</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={downloadLetterPdf}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 font-medium flex items-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-800"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Download PDF</span>
                                                    </button>

                                                    {onSendToWatermarkRemover && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                onSendToWatermarkRemover(admissionSuite.motivationLetter);
                                                                setActiveProgramForModal(null);
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 hover:bg-cyan-100 font-semibold flex items-center gap-1.5 cursor-pointer border border-cyan-200 dark:border-cyan-800"
                                                            title="Strip zero-width characters and AI watermarks"
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                                                            <span>Remove Watermarks</span>
                                                        </button>
                                                    )}

                                                    {onSendToDocumentStudio && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                onSendToDocumentStudio(
                                                                    admissionSuite.motivationLetter,
                                                                    `Motivation Letter - ${activeProgramForModal.universityName}`
                                                                );
                                                                setActiveProgramForModal(null);
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 font-semibold flex items-center gap-1.5 cursor-pointer border border-purple-200 dark:border-purple-800"
                                                        >
                                                            <Send className="w-3.5 h-3.5 text-purple-600" />
                                                            <span>Open in Studio</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Motivation Letter Prose View */}
                                            <div className="p-5 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm whitespace-pre-wrap shadow-inner max-h-[50vh] overflow-y-auto">
                                                {admissionSuite.motivationLetter}
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 2: Curriculum Alignment Radar */}
                                    {modalActiveTab === 'curriculum' && (
                                        <div className="space-y-4">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                This breakdown highlights how specific course modules from <strong>{activeProgramForModal.universityName}</strong> are matched against your verified CV projects and background.
                                            </p>

                                            <div className="space-y-3">
                                                {admissionSuite.matchedModulesAnalysis.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
                                                    >
                                                        <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                                            <BookOpen className="w-4 h-4" />
                                                            <span>Target University Module: {item.targetModule}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                                                            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                                Candidate Background Match:
                                                            </strong>{' '}
                                                            {item.candidateBackgroundMatch}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 3: Faculty Chairs */}
                                    {modalActiveTab === 'chairs' && (
                                        <div className="space-y-4">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Prominent research chairs and laboratories at <strong>{activeProgramForModal.department}</strong> relevant to your Master's thesis and lab assistantship inquiries:
                                            </p>

                                            <div className="grid grid-cols-1 gap-2.5">
                                                {admissionSuite.facultyChairsToMention.map((chair, cIdx) => (
                                                    <div
                                                        key={cIdx}
                                                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                                {cIdx + 1}
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                {chair}
                                                            </span>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                            Mention in SOP
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 4: Uni-Assist & Portal Checklist */}
                                    {modalActiveTab === 'checklist' && (
                                        <div className="space-y-4">
                                            {/* Guide banner */}
                                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
                                                <div className="font-bold mb-1 flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                                                    <Briefcase className="w-4 h-4" />
                                                    Official Application Guide:
                                                </div>
                                                {admissionSuite.uniAssistOrPortalGuide}
                                            </div>

                                            {/* Checklist items */}
                                            <div className="space-y-2.5">
                                                {admissionSuite.admissionReadinessChecklist.map((chk, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                                    >
                                                        <div className="space-y-0.5 flex-1">
                                                            <div className="font-bold text-slate-800 dark:text-slate-200">
                                                                {chk.category}
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                                                                {chk.detail}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                                                                chk.status === 'ready' || chk.status === 'verified'
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                            }`}
                                                        >
                                                            {chk.status === 'ready' || chk.status === 'verified'
                                                                ? '✓ Ready'
                                                                : '⚠ Action Needed'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Official Program URL:{' '}
                                <a
                                    href={activeProgramForModal.officialProgramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-semibold"
                                >
                                    Visit Department Website
                                </a>
                            </span>

                            <button
                                type="button"
                                onClick={() => setActiveProgramForModal(null)}
                                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-bold cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
