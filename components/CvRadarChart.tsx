import React, { useState, useMemo } from 'react';
import { 
    ResponsiveContainer, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    Radar, 
    Tooltip, 
    Legend 
} from 'recharts';
import { ResearchProficiency } from '../types';
import { evaluateResearchProficiencies } from '../utils/researchProficiencyEvaluator';
import { 
    Radar as RadarIcon, 
    TrendingUp, 
    Award, 
    Zap, 
    Info, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    Copy, 
    Check, 
    Eye,
    Target,
    Compass
} from 'lucide-react';

interface CvRadarChartProps {
    cvText: string;
    proficiencies?: ResearchProficiency[];
    isLoading?: boolean;
    onAreaClick?: (area: string) => void;
}

export const CvRadarChart: React.FC<CvRadarChartProps> = ({
    cvText,
    proficiencies: initialProficiencies,
    isLoading = false,
    onAreaClick
}) => {
    const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    // Compute proficiencies from prop or evaluate dynamically from cvText
    const data: ResearchProficiency[] = useMemo(() => {
        if (initialProficiencies && initialProficiencies.length >= 4) {
            return initialProficiencies;
        }
        return evaluateResearchProficiencies(cvText);
    }, [initialProficiencies, cvText]);

    // Derived statistics
    const stats = useMemo(() => {
        if (!data || data.length === 0) return { avg: 0, top: null, growth: null };
        const total = data.reduce((acc, curr) => acc + curr.score, 0);
        const avg = Math.round(total / data.length);
        
        const sorted = [...data].sort((a, b) => b.score - a.score);
        const top = sorted[0];
        const growth = sorted[sorted.length - 1];

        return { avg, top, growth };
    }, [data]);

    // Active highlighted item for detailed inspection card
    const activeItem = useMemo(() => {
        if (selectedArea) {
            const found = data.find(d => d.area.toLowerCase() === selectedArea.toLowerCase());
            if (found) return found;
        }
        return stats.top || data[0];
    }, [selectedArea, data, stats.top]);

    const handleCopyProficiencies = async () => {
        const text = `ACADEMIC RESEARCH PROFICIENCY RADAR REPORT\n` +
            `Overall Research Readiness Index: ${stats.avg}/100\n\n` +
            data.map(p => `• ${p.area}: ${p.score}/100 (${p.level}) [Benchmark: ${p.benchmarkScore}/100]\n  Evidence: ${p.evidence}\n  Recommendation: ${p.recommendation}\n`).join('\n');
        
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const getLevelBadgeClass = (level: string) => {
        switch (level) {
            case 'Expert':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800';
            case 'Advanced':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
            case 'Proficient':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
            case 'Intermediate':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
            default:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
        }
    };

    // Custom Tooltip for Recharts Radar
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload as ResearchProficiency;
            return (
                <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 backdrop-blur-md text-xs space-y-1.5 max-w-xs z-50">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5">
                        <span className="font-bold text-white text-sm">{item.area}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getLevelBadgeClass(item.level)}`}>
                            {item.level}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 pt-0.5">
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Your Score:
                        </span>
                        <span className="font-bold text-indigo-300 text-sm">{item.score} / 100</span>
                    </div>
                    {showBenchmark && (
                        <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Top-Tier Benchmark:
                            </span>
                            <span className="font-bold text-emerald-300 text-sm">{item.benchmarkScore} / 100</span>
                        </div>
                    )}
                    <p className="text-[11px] text-slate-400 pt-1 leading-snug">
                        {item.evidence}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div id="cv-research-radar-section" className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/70 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 dark:from-slate-850 dark:via-slate-800 dark:to-slate-900 p-5 sm:p-7 shadow-xl shadow-indigo-500/5 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-slate-700/80">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <RadarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Research Area Proficiency Radar
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                                Recharts Visual Mapping
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Competency mapping across core academic domains (Data Analysis, Writing, Lab Tech, Theoretical Physics) based on your CV
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setShowBenchmark(!showBenchmark)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            showBenchmark 
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                        title="Toggle Top-Tier Graduate Admissions Benchmark overlay"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{showBenchmark ? 'Benchmark Visible' : 'Show Benchmark'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleCopyProficiencies}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Data</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Overall Research Index
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                                {stats.avg}
                            </span>
                            <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                    </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Top Proficiency Area
                        </span>
                        <div className="truncate font-bold text-sm text-slate-900 dark:text-white">
                            {stats.top ? `${stats.top.area} (${stats.top.score}/100)` : 'None'}
                        </div>
                    </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Prime Growth Frontier
                        </span>
                        <div className="truncate font-bold text-sm text-slate-900 dark:text-white">
                            {stats.growth ? `${stats.growth.area} (${stats.growth.score}/100)` : 'None'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Radar Chart & Active Area Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visual Radar Chart */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700 p-4 shadow-sm flex flex-col items-center justify-center relative min-h-[380px]">
                    <div className="w-full h-[340px] sm:h-[370px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart 
                                cx="50%" 
                                cy="50%" 
                                outerRadius="72%" 
                                data={data}
                                onClick={(e: any) => {
                                    if (e && e.activeLabel) {
                                        setSelectedArea(e.activeLabel);
                                        onAreaClick?.(e.activeLabel);
                                    }
                                }}
                            >
                                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" opacity={0.6} />
                                <PolarAngleAxis 
                                    dataKey="area" 
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                />
                                <PolarRadiusAxis 
                                    angle={30} 
                                    domain={[0, 100]} 
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {value}
                                        </span>
                                    )}
                                />
                                <Radar 
                                    name="Your CV Proficiency" 
                                    dataKey="score" 
                                    stroke="#6366f1" 
                                    fill="#6366f1" 
                                    fillOpacity={0.45} 
                                    strokeWidth={2.5}
                                />
                                {showBenchmark && (
                                    <Radar 
                                        name="Top-Tier Benchmark" 
                                        dataKey="benchmarkScore" 
                                        stroke="#10b981" 
                                        fill="#10b981" 
                                        fillOpacity={0.12} 
                                        strokeWidth={2}
                                        strokeDasharray="4 4"
                                    />
                                )}
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <p className="text-[11px] text-slate-400 text-center mt-1">
                        💡 Click any radar axis node or category card below to inspect extracted CV evidence and targeted tips.
                    </p>
                </div>

                {/* In-depth Active Area Focus Card */}
                {activeItem && (
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-800/80 shadow-md flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    Selected Research Area
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getLevelBadgeClass(activeItem.level)}`}>
                                    {activeItem.level} ({activeItem.score}/100)
                                </span>
                            </div>

                            <div>
                                <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    {activeItem.area}
                                </h4>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <span>Candidate Score: <strong>{activeItem.score}/100</strong></span>
                                        <span>Top-Tier Benchmark: <strong>{activeItem.benchmarkScore}/100</strong></span>
                                    </div>
                                    {/* Comparative Bar */}
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                        <div 
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-700" 
                                            style={{ width: `${Math.min(activeItem.score, 100)}%` }} 
                                        />
                                        <div 
                                            className="absolute top-0 bottom-0 w-1 bg-emerald-500 shadow-sm"
                                            style={{ left: `${activeItem.benchmarkScore}%` }}
                                            title={`Benchmark: ${activeItem.benchmarkScore}%`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Extracted Evidence */}
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Evidence Detected in Current CV:
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                                    {activeItem.evidence}
                                </p>
                            </div>

                            {/* Improvement Recommendation */}
                            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Recommendation to Elevate Applications:
                                </span>
                                <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                                    {activeItem.recommendation}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Status: {activeItem.score >= activeItem.benchmarkScore ? '✅ Meets or Exceeds Benchmark' : '⚠️ Below Top-Tier Target Baseline'}</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {activeItem.score >= activeItem.benchmarkScore ? `+${activeItem.score - activeItem.benchmarkScore} pts advantage` : `${activeItem.benchmarkScore - activeItem.score} pts to target`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid of All Research Areas */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Detailed Research Dimension Scorecards ({data.length} Areas)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                        Click card to highlight in radar
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.map((item, idx) => {
                        const isSelected = activeItem?.area === item.area;
                        const isAboveBenchmark = item.score >= item.benchmarkScore;

                        return (
                            <div
                                key={idx}
                                onClick={() => {
                                    setSelectedArea(item.area);
                                    onAreaClick?.(item.area);
                                }}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                    isSelected 
                                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-md ring-2 ring-indigo-500/20' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-indigo-200 dark:hover:border-slate-600 shadow-2xs'
                                } flex flex-col justify-between space-y-3`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                            {item.area}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${getLevelBadgeClass(item.level)}`}>
                                            {item.level}
                                        </span>
                                    </div>

                                    {/* Progress track */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Score: <strong className="text-slate-900 dark:text-white">{item.score}</strong>/100</span>
                                            <span className={isAboveBenchmark ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                                Target: {item.benchmarkScore}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isAboveBenchmark ? 'bg-emerald-500' : 'bg-indigo-600'
                                                }`} 
                                                style={{ width: `${Math.min(item.score, 100)}%` }} 
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                        {item.evidence}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-[10px]">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                                        <Target className="w-3 h-3" /> Tip available
                                    </span>
                                    <span className="text-slate-400">
                                        {isSelected ? 'Active Selection' : 'Click to inspect'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
