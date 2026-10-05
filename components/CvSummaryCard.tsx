import React, { useState } from 'react';
import { CvAnalysis } from '../types';
import { 
    Sparkles, 
    RefreshCw, 
    CheckCircle2, 
    AlertTriangle, 
    Lightbulb, 
    Copy, 
    Check, 
    TrendingUp, 
    Award, 
    Target, 
    Tag,
    ChevronDown,
    ChevronUp,
    Zap,
    BookOpen,
    Code2,
    ShieldAlert,
    Radar
} from 'lucide-react';

interface CvSummaryCardProps {
    analysis: CvAnalysis | null;
    summary?: string;
    isLoading: boolean;
    error: string | null;
    onRegenerate: () => void;
    onExploreField?: (field: string) => void;
    onNavigateToRadar?: () => void;
    compact?: boolean;
}

type ViewFilter = 'all' | 'suggestions' | 'strengths' | 'gaps';

export const CvSummaryCard: React.FC<CvSummaryCardProps> = ({
    analysis,
    summary: rawSummary,
    isLoading,
    error,
    onRegenerate,
    onExploreField,
    onNavigateToRadar,
    compact = false,
}) => {
    const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
    const [showRecommendations, setShowRecommendations] = useState<boolean>(true);
    const [copied, setCopied] = useState<boolean>(false);

    const summaryText = analysis?.summary || rawSummary || '';
    const strengths = analysis?.strengths || [];
    const gaps = analysis?.gaps || [];
    const rawRecommendations = analysis?.recommendations || [];
    const readinessScore = analysis?.readinessScore ?? 88;
    const topResearchFields = analysis?.topResearchFields || [];
    const suggestedKeywords = analysis?.suggestedKeywords || [];

    // Ensure we have at least 3 structured, high-impact suggestions tailored to missing keywords, skill gaps, and packaging
    const structuredSuggestions = React.useMemo(() => {
        if (rawRecommendations.length >= 3) {
            return rawRecommendations.slice(0, 3).map((rec, i) => {
                const category = i === 0 
                    ? 'Missing Research Keywords & Concepts'
                    : i === 1 
                    ? 'Technical Tools & Methodological Gaps'
                    : 'Portfolio & Research Packaging';
                return { category, text: rec };
            });
        }

        // Formulate 3 distinct suggestions from keywords, gaps, and recommendations
        const suggestions = [];

        // 1. Keyword gap
        if (suggestedKeywords.length > 0) {
            suggestions.push({
                category: 'Missing Research Keywords & Terminology',
                text: `Incorporate high-impact academic keywords in your CV and outreach: ${suggestedKeywords.slice(0, 4).join(', ')}. Mentioning these specific paradigms demonstrates immediate familiarity with recent literature.`
            });
        } else {
            suggestions.push({
                category: 'Missing Research Keywords & Terminology',
                text: 'Highlight emerging disciplinary subfields (e.g., self-supervised learning, cross-modal perception, or automated pipelines) in your research statement and project descriptions.'
            });
        }

        // 2. Skill gap
        if (gaps.length > 0) {
            suggestions.push({
                category: 'Technical & Methodological Skill Gap',
                text: `Address potential qualification gaps: ${gaps[0]}. Highlight self-directed learning, coursework projects, or open-source implementations to show competence.`
            });
        } else {
            suggestions.push({
                category: 'Technical & Methodological Skill Gap',
                text: 'Detail quantitative benchmarks, experimental protocols, or hardware tooling (e.g. cluster execution, GPU profiling, or lab assays) to demonstrate rigorous research readiness.'
            });
        }

        // 3. Packaging
        if (rawRecommendations.length > 0) {
            suggestions.push({
                category: 'Portfolio & Research Evidence Packaging',
                text: rawRecommendations[0]
            });
        } else {
            suggestions.push({
                category: 'Portfolio & Research Evidence Packaging',
                text: 'Link to GitHub repositories with well-documented READMEs, reproducible code, or preprint write-ups to provide concrete evidence of academic rigor.'
            });
        }

        return suggestions;
    }, [rawRecommendations, suggestedKeywords, gaps]);

    if (!summaryText && !isLoading && !error && strengths.length === 0 && gaps.length === 0) {
        return null;
    }

    const handleCopyAll = async () => {
        if (!summaryText) return;

        let textToCopy = `ACADEMIC PROFILE SUMMARY:\n${summaryText}\n\n`;
        textToCopy += `APPLICATION READINESS SCORE: ${readinessScore} / 100\n\n`;
        if (topResearchFields.length > 0) textToCopy += `TOP RESEARCH SPECIALIZATIONS: ${topResearchFields.join(', ')}\n\n`;
        textToCopy += `3 STRATEGIC SUGGESTIONS TO STRENGTHEN PROFILE:\n${structuredSuggestions.map((s, idx) => `${idx + 1}. [${s.category}] ${s.text}`).join('\n\n')}\n\n`;
        if (strengths.length > 0) textToCopy += `KEY STRENGTHS:\n${strengths.map(s => `• ${s}`).join('\n')}\n\n`;
        if (gaps.length > 0) textToCopy += `IDENTIFIED GAPS:\n${gaps.map(g => `• ${g}`).join('\n')}\n\n`;
        if (suggestedKeywords.length > 0) textToCopy += `KEYWORDS TO HIGHLIGHT:\n${suggestedKeywords.join(', ')}\n`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard', err);
        }
    };

    // Color tier for readiness score
    const scoreColor = readinessScore >= 85 
        ? { ring: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800' }
        : readinessScore >= 70
        ? { ring: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800' }
        : { ring: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800' };

    return (
        <div id="cv-candidate-summary-card" className="overflow-hidden rounded-3xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 dark:from-slate-850 dark:via-slate-800 dark:to-slate-900 p-5 sm:p-7 shadow-xl shadow-blue-500/5 transition-all space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-blue-100 dark:border-slate-700/80">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Academic Profile Evaluation & Readiness
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreColor.badge} shadow-2xs`}>
                                <Award className="w-3.5 h-3.5" /> Score: {readinessScore}/100
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Evaluated against international Master's/PhD scholarship and funded lab benchmarks
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onNavigateToRadar && (
                        <button
                            type="button"
                            onClick={onNavigateToRadar}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all shadow-2xs"
                        >
                            <Radar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Research Radar</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleCopyAll}
                        disabled={isLoading || !summaryText}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-650 transition-all shadow-2xs disabled:opacity-50"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-700 dark:text-emerald-300">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Report</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onRegenerate}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-800 transition-all shadow-2xs disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{isLoading ? 'Analyzing...' : 'Re-analyze'}</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="space-y-4 py-6">
                    <div className="flex items-center gap-3 text-sm font-semibold text-blue-700 dark:text-blue-300 animate-pulse">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Analyzing CV competencies, extracting missing research keywords, and calculating readiness score...
                    </div>
                    <div className="h-4 bg-blue-100/70 dark:bg-slate-700 rounded-full w-full animate-pulse" />
                    <div className="h-4 bg-blue-100/70 dark:bg-slate-700 rounded-full w-5/6 animate-pulse" />
                    <div className="h-4 bg-blue-100/70 dark:bg-slate-700 rounded-full w-4/6 animate-pulse" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onRegenerate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-2xs"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Visual Score & Key Metrics Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                        {/* Circular Score Gauge Card */}
                        <div className="md:col-span-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                            <div className="relative flex items-center justify-center mb-3">
                                {/* Circular SVG Progress Ring */}
                                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="48"
                                        className="text-slate-100 dark:text-slate-700 stroke-current"
                                        strokeWidth="10"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="48"
                                        className={`${scoreColor.ring} stroke-current transition-all duration-1000 ease-out`}
                                        strokeWidth="10"
                                        strokeDasharray={2 * Math.PI * 48}
                                        strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(readinessScore, 100) / 100)}
                                        strokeLinecap="round"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                                        {readinessScore}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        out of 100
                                    </span>
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {readinessScore >= 85 ? 'Highly Competitive Profile' : readinessScore >= 70 ? 'Strong Foundation' : 'Developing Profile'}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {readinessScore >= 85 
                                    ? 'High likelihood of securing research interviews & scholarship offers.' 
                                    : 'Address key research gaps below to maximize admission odds.'}
                            </p>
                        </div>

                        {/* Executive Summary & Keywords */}
                        <div className="md:col-span-8 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 block">
                                    Executive Profile Synthesis
                                </span>
                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                                    {summaryText}
                                </p>
                            </div>

                            {/* Top Research Domains & Suggested Keywords */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                                        <Target className="w-3 h-3 text-blue-500" /> Best Matched Fields:
                                    </span>
                                    {(topResearchFields.length > 0 ? topResearchFields : ['Machine Learning & AI', 'Computer Vision', 'Robotics']).map((field, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => onExploreField?.(field)}
                                            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform"
                                        >
                                            {field}
                                        </button>
                                    ))}
                                </div>

                                {suggestedKeywords.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                                            <Tag className="w-3 h-3 text-indigo-500" /> High-Impact Keywords:
                                        </span>
                                        {suggestedKeywords.slice(0, 6).map((kw, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300">
                                                #{kw}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3 SPECIFIC STRATEGIC SUGGESTIONS SECTION (Highlighted) */}
                    <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-850 dark:to-purple-950/30 p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        3 Specific Suggestions to Strengthen Your Profile
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Targeted adjustments to eliminate keyword and skill gaps before sending applications
                                    </p>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-600 text-white shadow-2xs">
                                Action Items
                            </span>
                        </div>

                        {/* 3 Suggestion Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                            {structuredSuggestions.map((item, idx) => {
                                const icons = [
                                    <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
                                    <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
                                    <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ];
                                const badgeColors = [
                                    'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-200 dark:border-blue-800',
                                    'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-purple-200 dark:border-purple-800',
                                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                                ];

                                return (
                                    <div 
                                        key={idx} 
                                        className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs flex flex-col justify-between space-y-3"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeColors[idx]}`}>
                                                    {icons[idx]}
                                                    Suggestion #{idx + 1}
                                                </span>
                                            </div>
                                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                {item.category}
                                            </h5>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detailed Strengths & Gaps Tabs */}
                    {!compact && (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => setViewFilter('all')}
                                        className={`px-3 py-1 rounded-lg transition-colors ${
                                            viewFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500'
                                        }`}
                                    >
                                        Detailed Breakdown
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewFilter('strengths')}
                                        className={`px-3 py-1 rounded-lg transition-colors ${
                                            viewFilter === 'strengths' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'
                                        }`}
                                    >
                                        Key Strengths ({strengths.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewFilter('gaps')}
                                        className={`px-3 py-1 rounded-lg transition-colors ${
                                            viewFilter === 'gaps' ? 'bg-amber-600 text-white font-bold' : 'text-slate-500'
                                        }`}
                                    >
                                        Identified Gaps ({gaps.length})
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(viewFilter === 'all' || viewFilter === 'strengths') && (
                                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 space-y-2.5">
                                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            Demonstrated Strengths
                                        </h4>
                                        <div className="space-y-2">
                                            {strengths.map((str, idx) => (
                                                <div key={idx} className="flex items-start gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-200">
                                                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                                                    <span>{str}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(viewFilter === 'all' || viewFilter === 'gaps') && (
                                    <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 p-4 space-y-2.5">
                                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            Items Requiring Attention or Clarification
                                        </h4>
                                        <div className="space-y-2">
                                            {gaps.map((gap, idx) => (
                                                <div key={idx} className="flex items-start gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-200">
                                                    <span className="text-amber-600 font-bold shrink-0">!</span>
                                                    <span>{gap}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
