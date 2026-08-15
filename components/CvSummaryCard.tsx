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
    ChevronUp
} from 'lucide-react';

interface CvSummaryCardProps {
    analysis: CvAnalysis | null;
    summary?: string;
    isLoading: boolean;
    error: string | null;
    onRegenerate: () => void;
    onExploreField?: (field: string) => void;
}

type ViewFilter = 'all' | 'strengths' | 'gaps' | 'recommendations';

export const CvSummaryCard: React.FC<CvSummaryCardProps> = ({
    analysis,
    summary: rawSummary,
    isLoading,
    error,
    onRegenerate,
    onExploreField,
}) => {
    const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
    const [showRecommendations, setShowRecommendations] = useState<boolean>(true);
    const [copied, setCopied] = useState<boolean>(false);

    const summaryText = analysis?.summary || rawSummary || '';
    const strengths = analysis?.strengths || [];
    const gaps = analysis?.gaps || [];
    const recommendations = analysis?.recommendations || [];
    const readinessScore = analysis?.readinessScore || 88;
    const topResearchFields = analysis?.topResearchFields || [];
    const suggestedKeywords = analysis?.suggestedKeywords || [];

    if (!summaryText && !isLoading && !error && strengths.length === 0 && gaps.length === 0) {
        return null;
    }

    const handleCopyAll = async () => {
        if (!summaryText) return;

        let textToCopy = `ACADEMIC PROFILE SUMMARY:\n${summaryText}\n\n`;
        if (readinessScore) textToCopy += `APPLICATION READINESS SCORE: ${readinessScore}%\n\n`;
        if (topResearchFields.length > 0) textToCopy += `TOP RESEARCH SPECIALIZATIONS: ${topResearchFields.join(', ')}\n\n`;
        if (strengths.length > 0) textToCopy += `KEY STRENGTHS:\n${strengths.map(s => `• ${s}`).join('\n')}\n\n`;
        if (gaps.length > 0) textToCopy += `AREAS TO ADDRESS / GAPS:\n${gaps.map(g => `• ${g}`).join('\n')}\n\n`;
        if (recommendations.length > 0) textToCopy += `RECOMMENDED STRATEGIES:\n${recommendations.map(r => `• ${r}`).join('\n')}\n`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard', err);
        }
    };

    return (
        <div id="cv-candidate-summary-card" className="mb-8 overflow-hidden rounded-3xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 dark:from-slate-850 dark:via-slate-800 dark:to-slate-900 p-5 sm:p-7 shadow-xl shadow-blue-500/5 transition-all">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-blue-100 dark:border-slate-700/80">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                AI Candidate Profile & Application Readiness
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xs">
                                <Award className="w-3 h-3" /> Readiness {readinessScore}%
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Synthesized for international Master's/PhD scholarship selection committees
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                                <span>Copy Analysis</span>
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

            {/* Main Content */}
            <div className="pt-5 space-y-6">
                {isLoading ? (
                    <div className="space-y-4 py-3">
                        <div className="flex items-center gap-3 text-sm font-semibold text-blue-700 dark:text-blue-300 animate-pulse">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            Evaluating candidate academic standing, research alignment, and opportunity readiness...
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
                    <>
                        {/* Executive Academic Summary */}
                        {summaryText && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                                    Profile Synthesis
                                </span>
                                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                                    {summaryText}
                                </p>
                            </div>
                        )}

                        {/* Visual Readiness Progress & Top Research Domains */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Readiness Gauge Card */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            Scholarship Competitiveness
                                        </span>
                                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                            {readinessScore}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-emerald-200/60 dark:bg-emerald-950 rounded-full h-2.5 overflow-hidden mb-2">
                                        <div 
                                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700" 
                                            style={{ width: `${Math.min(readinessScore, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium mt-1">
                                    Strong academic alignment for Top & Mid-tier funded graduate labs.
                                </p>
                            </div>

                            {/* Top Research Domains */}
                            <div className="md:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
                                    <Target className="w-3.5 h-3.5 text-blue-500" />
                                    Recommended Specializations & Research Focus
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {(topResearchFields.length > 0 ? topResearchFields : ['Machine Learning & AI', 'Computer Vision & Robotics', 'Applied Data Science', 'Computational Systems']).map((field, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => onExploreField?.(field)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 text-blue-800 dark:text-blue-200 border border-blue-200/80 dark:border-blue-800/60 hover:scale-105 transition-transform shadow-2xs"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {field}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs (All / Strengths / Gaps / Strategy) */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-850 p-1 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setViewFilter('all')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        viewFilter === 'all'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    All Insights ({strengths.length + gaps.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewFilter('strengths')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        viewFilter === 'strengths'
                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                            : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    }`}
                                >
                                    ✓ Strengths ({strengths.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewFilter('gaps')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        viewFilter === 'gaps'
                                            ? 'bg-amber-600 text-white shadow-2xs'
                                            : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                    }`}
                                >
                                    ⚠ Gaps ({gaps.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewFilter('recommendations')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        viewFilter === 'recommendations'
                                            ? 'bg-indigo-600 text-white shadow-2xs'
                                            : 'text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                                    }`}
                                >
                                    💡 Action Strategies ({recommendations.length})
                                </button>
                            </div>
                        </div>

                        {/* Strengths & Gaps Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Strengths */}
                            {(viewFilter === 'all' || viewFilter === 'strengths') && (
                                <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-b from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-slate-800 p-5 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900/50">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            Key Competitive Strengths
                                        </h4>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                            {strengths.length} Found
                                        </span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {strengths.map((strength, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-100/80 dark:border-emerald-900/40 shadow-2xs">
                                                <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                                    {strength}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Gaps */}
                            {(viewFilter === 'all' || viewFilter === 'gaps') && (
                                <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/30 dark:to-slate-800 p-5 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-amber-100 dark:border-amber-900/50">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            Areas Requiring Clarification / Gaps
                                        </h4>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                                            {gaps.length} Identified
                                        </span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {gaps.map((gap, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-amber-100/80 dark:border-amber-900/40 shadow-2xs">
                                                <span className="w-5 h-5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    !
                                                </span>
                                                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                                    {gap}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actionable Strategies & Recommendations */}
                        {(viewFilter === 'all' || viewFilter === 'recommendations') && recommendations.length > 0 && (
                            <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-blue-50/60 dark:from-indigo-950/40 dark:via-slate-800 dark:to-blue-950/30 p-5 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                                        <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        Application Strategy & How to Bridge Gaps
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowRecommendations(!showRecommendations)}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        {showRecommendations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                {showRecommendations && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        {recommendations.map((rec, idx) => (
                                            <div key={idx} className="p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
                                                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">#{idx + 1}</span>
                                                    {rec}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Academic Keywords to Emphasize */}
                        {suggestedKeywords.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Keywords to Highlight:
                                </span>
                                {suggestedKeywords.map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
