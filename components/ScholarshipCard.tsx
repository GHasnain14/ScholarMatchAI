import React, { useState, useRef, useEffect } from 'react';
import { Scholarship, DocumentType } from '../types';
import { 
    Star, 
    ExternalLink, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    Sparkles, 
    ThumbsUp, 
    ThumbsDown, 
    FileText, 
    Send, 
    ChevronDown, 
    Award, 
    GraduationCap, 
    Clock, 
    CheckCircle,
    Check,
    Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateDaysRemaining } from '../services/deadlineNotificationService';

interface ScholarshipCardProps {
    scholarship: Scholarship;
    onDraft: (scholarship: Scholarship, docType: DocumentType) => void;
    onFeedback: (feedback: 'good' | 'poor') => void;
    onUpdateDeadline: (deadline: string) => void;
    onToggleBookmark?: (scholarshipId: string) => void;
    onUpdateStage?: (scholarshipId: string, stage: Scholarship['stage']) => void;
    onUpdateNotes?: (scholarshipId: string, notes: string) => void;
}

const countryFlags: { [key: string]: { flag: string; color: string; bg: string } } = {
    'USA': { flag: '🇺🇸', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
    'United States': { flag: '🇺🇸', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
    'Canada': { flag: '🇨🇦', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800' },
    'UK': { flag: '🇬🇧', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
    'United Kingdom': { flag: '🇬🇧', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
    'Germany': { flag: '🇩🇪', color: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
    'South Korea': { flag: '🇰🇷', color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800' },
    'Korea': { flag: '🇰🇷', color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800' },
    'Japan': { flag: '🇯🇵', color: 'text-red-800 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800' },
    'France': { flag: '🇫🇷', color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' },
    'European Union (EMJMD)': { flag: '🇪🇺', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800' },
    'Australia': { flag: '🇦🇺', color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800' },
    'Singapore': { flag: '🇸🇬', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
    'Poland': { flag: '🇵🇱', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800' },
    'Belgium': { flag: '🇧🇪', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800' },
};

const tierStyles: { [key: string]: { badge: string; border: string } } = {
    'Top-Tier': {
        badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-bold shadow-xs',
        border: 'border-amber-300/80 dark:border-amber-600/40',
    },
    'Mid-Tier': {
        badge: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-xs',
        border: 'border-blue-200 dark:border-blue-800',
    },
    'Low-Rank': {
        badge: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold',
        border: 'border-slate-200 dark:border-slate-700',
    },
    'Emerging': {
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-semibold',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
};

const STAGES: Scholarship['stage'][] = [
    'Discovered',
    'Email Sent',
    'Interview Scheduled',
    'Application Submitted',
    'Offer Received',
];

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
    scholarship,
    onDraft,
    onFeedback,
    onUpdateDeadline,
    onToggleBookmark,
    onUpdateStage,
    onUpdateNotes,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notesText, setNotesText] = useState(scholarship.notes || '');
    const menuRef = useRef<HTMLDivElement>(null);

    const getFullUrl = (url: string): string => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDraftClick = (docType: DocumentType) => {
        onDraft(scholarship, docType);
        setIsMenuOpen(false);
    };

    const handleStageSelect = (stage: Scholarship['stage']) => {
        if (stage === 'Offer Received') {
            try {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            } catch (e) {
                // Ignore confetti error
            }
        }
        if (scholarship.id && onUpdateStage) {
            onUpdateStage(scholarship.id, stage);
        }
    };

    const documentOptions = [
        { type: DocumentType.Email, label: '✉️ Outreach Email to Professor' },
        { type: DocumentType.FollowUpEmail, label: '📬 2-Week Follow-up Email' },
        { type: DocumentType.StatementOfPurpose, label: '📜 Statement of Purpose (SOP)' },
        { type: DocumentType.MotivationLetter, label: '✍️ Letter of Motivation' },
        { type: DocumentType.CoverLetter, label: '📄 Formal Cover Letter' },
        { type: DocumentType.ResearchProposal, label: '🔬 1-Page Research Proposal' },
        { type: DocumentType.InterviewPrep, label: '🎯 Interview Q&A Cheat Sheet' },
    ];

    const tier = scholarship.universityTier || 'Mid-Tier';
    const tierMeta = tierStyles[tier] || tierStyles['Mid-Tier'];
    const matchScore = scholarship.matchScore || (tier === 'Top-Tier' ? 94 : tier === 'Mid-Tier' ? 88 : 82);

    const countryInfo = scholarship.country ? countryFlags[scholarship.country] || { flag: '🌐', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' } : null;

    const daysRemaining = calculateDaysRemaining(scholarship.deadline);
    const isThreeDaysRemaining = daysRemaining === 3;
    const isCriticalDeadline = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;
    const isDeadlinePassed = daysRemaining !== null && daysRemaining < 0;
    const isDeadlineSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

    const handleSetThreeDaysFromNow = () => {
        const target = new Date();
        target.setDate(target.getDate() + 3);
        const yyyy = target.getFullYear();
        const mm = String(target.getMonth() + 1).padStart(2, '0');
        const dd = String(target.getDate()).padStart(2, '0');
        onUpdateDeadline(`${yyyy}-${mm}-${dd}`);
    };

    return (
        <div 
            id={`scholarship-card-${scholarship.id || scholarship.professorName.toLowerCase().replace(/\s+/g, '-')}`}
            className={`group relative rounded-3xl bg-white dark:bg-slate-800/90 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${
                scholarship.feedback === 'good'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/5'
                    : scholarship.feedback === 'poor'
                    ? 'border-rose-400/80 opacity-75'
                    : scholarship.bookmarked
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : 'border-slate-200/80 dark:border-slate-700/80 shadow-md'
            }`}
        >
            {/* Top Accent Strip with matchScore */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="p-5 sm:p-6 flex-grow flex flex-col space-y-4">
                {/* Header Row: Country, Tier, Star Bookmark */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {countryInfo && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${countryInfo.bg} ${countryInfo.color}`}>
                                <span>{countryInfo.flag}</span>
                                <span>{scholarship.country}</span>
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${tierMeta.badge}`}>
                            <Award className="w-3 h-3" />
                            {tier}
                        </span>
                        {scholarship.fundingType && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                💰 {scholarship.fundingType}
                            </span>
                        )}
                    </div>

                    {/* Match Score & Bookmark Star */}
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs">
                            <Sparkles className="w-3 h-3" />
                            {matchScore}% Match
                        </span>
                        {onToggleBookmark && scholarship.id && (
                            <button
                                type="button"
                                onClick={() => onToggleBookmark(scholarship.id!)}
                                title={scholarship.bookmarked ? 'Remove from saved' : 'Save opportunity'}
                                className={`p-1.5 rounded-xl transition-all ${
                                    scholarship.bookmarked
                                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-1 ring-amber-400'
                                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <Star className={`w-4 h-4 ${scholarship.bookmarked ? 'fill-amber-400' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Professor / Lab Title & Institution */}
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {scholarship.professorName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{scholarship.institution}</span>
                    </div>
                </div>

                {/* Research Focus Area */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/40 dark:from-slate-750 dark:via-slate-750 dark:to-slate-800 border border-blue-100/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
                        Research Subfield & Lab Focus
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                        {scholarship.researchArea}
                    </p>
                </div>

                {/* Match Rationale */}
                <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Why You're a Strong Match:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal bg-slate-50 dark:bg-slate-750 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                        {scholarship.reasonForMatch}
                    </p>
                </div>

                {/* Subfield Keywords */}
                {scholarship.keyKeywords && scholarship.keyKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {scholarship.keyKeywords.map((kw, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                #{kw}
                            </span>
                        ))}
                    </div>
                )}

                {/* Extra Stats (Tuition/Ranking/Requirements) if available */}
                {(scholarship.tuitionFees || scholarship.ranking || (scholarship.applicationRequirements && scholarship.applicationRequirements.length > 0)) && (
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        {scholarship.tuitionFees && (
                            <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Tuition
                                </span>
                                <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                                    {scholarship.tuitionFees}
                                </p>
                            </div>
                        )}
                        {scholarship.ranking && (
                            <div className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                                <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Ranking
                                </span>
                                <p className="text-[11px] font-semibold text-purple-900 dark:text-purple-200 truncate">
                                    {scholarship.ranking}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pipeline Stage Tracker */}
                <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Application Pipeline Stage:
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {scholarship.stage || 'Discovered'}
                        </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                        {STAGES.map((stg, i) => {
                            const isCurrent = (scholarship.stage || 'Discovered') === stg;
                            const isPassed = STAGES.indexOf(scholarship.stage || 'Discovered') >= i;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleStageSelect(stg)}
                                    title={stg}
                                    className={`h-2 rounded-full transition-all ${
                                        isCurrent
                                            ? 'bg-blue-600 ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-slate-900'
                                            : isPassed
                                            ? 'bg-blue-400 dark:bg-blue-500'
                                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Deadline Selector */}
                <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                    isThreeDaysRemaining
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-400/50'
                        : isCriticalDeadline
                        ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/80'
                        : 'bg-slate-50 dark:bg-slate-750 border-slate-200/80 dark:border-slate-700'
                }`}>
                    <div className="flex items-center gap-2">
                        {isThreeDaysRemaining ? (
                            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce shrink-0" />
                        ) : (
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase flex items-center gap-1">
                                Deadline {isThreeDaysRemaining && <span className="text-amber-600 font-extrabold">• 3-Day Alert Active</span>}
                            </span>
                            {isEditingDeadline ? (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="date"
                                        value={scholarship.deadline || ''}
                                        onChange={(e) => onUpdateDeadline(e.target.value)}
                                        className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-0.5 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSetThreeDaysFromNow}
                                        className="text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300"
                                        title="Quickly set deadline to exactly 3 days from today"
                                    >
                                        +3 Days
                                    </button>
                                </div>
                            ) : (
                                <span className={`text-xs font-bold ${
                                    isThreeDaysRemaining 
                                        ? 'text-amber-700 dark:text-amber-300 font-extrabold animate-pulse'
                                        : isCriticalDeadline 
                                        ? 'text-rose-600 dark:text-rose-400' 
                                        : isDeadlinePassed 
                                        ? 'text-slate-400 line-through' 
                                        : 'text-slate-700 dark:text-slate-200'
                                }`}>
                                    {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline set'}
                                    {isThreeDaysRemaining && ' ⏰ (3 Days Left!)'}
                                    {!isThreeDaysRemaining && isCriticalDeadline && ` 🚨 (${daysRemaining === 0 ? 'Due Today' : `${daysRemaining}d Left`})`}
                                    {!isCriticalDeadline && isDeadlineSoon && ' ⚠️ (Urgent!)'}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsEditingDeadline(!isEditingDeadline)}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                    >
                        {isEditingDeadline ? 'Done' : scholarship.deadline ? 'Edit' : 'Set Date'}
                    </button>
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-5 py-4 bg-slate-50/80 dark:bg-slate-750/80 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                {/* Direct Link */}
                <a
                    href={getFullUrl(scholarship.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <span>Lab Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Feedback & Draft Menu */}
                <div className="flex items-center gap-2">
                    {/* Thumbs Feedback */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => onFeedback('good')}
                            title="Good match (refine search like this)"
                            className={`p-1.5 rounded-lg transition-colors ${
                                scholarship.feedback === 'good'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-400 hover:text-emerald-600'
                            }`}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onFeedback('poor')}
                            title="Poor match (avoid similar)"
                            className={`p-1.5 rounded-lg transition-colors ${
                                scholarship.feedback === 'poor'
                                    ? 'bg-rose-500 text-white'
                                    : 'text-slate-400 hover:text-rose-600'
                            }`}
                        >
                            <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Draft Document Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Draft Document</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-64 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Select Document to Generate
                                </div>
                                {documentOptions.map((opt) => (
                                    <button
                                        key={opt.type}
                                        type="button"
                                        onClick={() => handleDraftClick(opt.type)}
                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-between"
                                    >
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
