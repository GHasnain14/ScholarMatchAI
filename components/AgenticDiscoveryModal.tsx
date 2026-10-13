import React from 'react';
import { StemDiscipline, AgenticDiscoveryStep } from '../types';
import { 
    Cpu, 
    CheckCircle2, 
    Loader2, 
    ShieldCheck, 
    BookOpen, 
    GraduationCap, 
    X, 
    Sparkles, 
    Search,
    Globe,
    Layers,
    ArrowRight
} from 'lucide-react';

export const STEM_DISCIPLINE_LIST: Array<{ id: StemDiscipline; label: string; icon: string; desc: string }> = [
    { id: 'all', label: 'All STEM Disciplines', icon: '🔬', desc: 'Universal exploration across all branches of science, technology & engineering' },
    { id: 'biological_biomedical', label: 'Biomedical & Life Sciences', icon: '🧬', desc: 'Genomics, Molecular Biology, Immunology, Pharmacology, Bioengineering' },
    { id: 'chemical_materials', label: 'Chemical Sciences & Materials', icon: '🧪', desc: 'Polymer Chemistry, Nanomaterials, Catalysis, Battery Electrochemistry' },
    { id: 'physics_quantum', label: 'Physics & Quantum Sciences', icon: '⚛️', desc: 'Condensed Matter, Quantum Optics, Astrophysics, High-Energy Physics' },
    { id: 'mechanical_aerospace', label: 'Mechanical & Aerospace', icon: '🚀', desc: 'Robotics, Fluid Dynamics, Thermal Systems, Propulsion, CAD/FEA Modeling' },
    { id: 'electrical_electronics', label: 'Electrical & Semiconductors', icon: '⚡', desc: 'VLSI, Circuit Design, Microelectronics, Signal Processing, Hardware Prototyping' },
    { id: 'civil_environmental', label: 'Civil & Environmental', icon: '🌍', desc: 'Structural Resilience, Hydrology, Climate Systems, Sustainable Infrastructure' },
    { id: 'computing_data_ai', label: 'Computing, Data & AI', icon: '💻', desc: 'Machine Learning, Computer Vision, Algorithms, Cloud Systems, Cybersecurity' },
    { id: 'mathematics_quantitative', label: 'Mathematics & Statistics', icon: '📐', desc: 'Applied Mathematics, Optimization, Probability, Quantitative Modeling' },
];

interface AgenticDiscoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    isRunning: boolean;
    steps: AgenticDiscoveryStep[];
    selectedDiscipline: StemDiscipline;
    onSelectDiscipline: (d: StemDiscipline) => void;
    onStartDiscovery: () => void;
    hasCv: boolean;
}

export const AgenticDiscoveryModal: React.FC<AgenticDiscoveryModalProps> = ({
    isOpen,
    onClose,
    isRunning,
    steps,
    selectedDiscipline,
    onSelectDiscipline,
    onStartDiscovery,
    hasCv,
}) => {
    if (!isOpen) return null;

    const defaultSteps: AgenticDiscoveryStep[] = [
        {
            stepNumber: 1,
            title: 'CV Profiling & Domain Extraction',
            agentName: 'Agent 1: Academic CV Profiler',
            status: steps.find(s => s.stepNumber === 1)?.status || 'pending',
            details: steps.find(s => s.stepNumber === 1)?.details || 'Extracts candidate coursework, laboratory methods, software tools, and research trajectory.',
            findingsCount: steps.find(s => s.stepNumber === 1)?.findingsCount
        },
        {
            stepNumber: 2,
            title: 'OpenAlex Graph & Global Registries Crawler',
            agentName: 'Agent 2: OpenAlex Scholarly Crawler',
            status: steps.find(s => s.stepNumber === 2)?.status || 'pending',
            details: steps.find(s => s.stepNumber === 2)?.details || 'Queries 250M+ scientific records for active principal investigators with recent 2021-2026 works.',
            findingsCount: steps.find(s => s.stepNumber === 2)?.findingsCount
        },
        {
            stepNumber: 3,
            title: 'Multi-Tier Institutional Compilation',
            agentName: 'Agent 3: Global University Registry Synthesizer',
            status: steps.find(s => s.stepNumber === 3)?.status || 'pending',
            details: steps.find(s => s.stepNumber === 3)?.details || 'Balances institutional representation across Top-Tier, Mid-Tier, and High-Acceptance Regional universities.',
            findingsCount: steps.find(s => s.stepNumber === 3)?.findingsCount
        },
        {
            stepNumber: 4,
            title: '4-Gate QA/QC Verification Audit',
            agentName: 'Agent 4: Quality Control & Ethics Auditor',
            status: steps.find(s => s.stepNumber === 4)?.status || 'pending',
            details: steps.find(s => s.stepNumber === 4)?.details || 'Audits active departmental URLs, bibliometric citations, empirical CV alignment, and assistantship funding.',
            findingsCount: steps.find(s => s.stepNumber === 4)?.findingsCount
        }
    ];

    const currentSteps = defaultSteps.map(ds => {
        const live = steps.find(s => s.stepNumber === ds.stepNumber);
        return live ? { ...ds, ...live } : ds;
    });

    const isAllCompleted = currentSteps.every(s => s.status === 'completed' || s.status === 'verified');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-b border-indigo-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                            <Cpu className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black tracking-tight">
                                    Agentic STEM Faculty & University Discovery Engine
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    Zero Hit-and-Trial
                                </span>
                            </div>
                            <p className="text-xs text-indigo-200/80">
                                Autonomous 4-agent pipeline backed by OpenAlex 250M+ scholarly graph and 4-gate QA/QC certification
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* STEM Discipline Filter Tabs */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            Target Science & Engineering Discipline:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {STEM_DISCIPLINE_LIST.map((d) => {
                                const isSelected = selectedDiscipline === d.id;
                                return (
                                    <button
                                        key={d.id}
                                        type="button"
                                        disabled={isRunning}
                                        onClick={() => onSelectDiscipline(d.id)}
                                        className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-start gap-2 ${
                                            isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-xs'
                                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <span className="text-base shrink-0 mt-0.5">{d.icon}</span>
                                        <div className="min-w-0">
                                            <div className="truncate font-semibold">{d.label}</div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                                {d.desc}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Agent Pipeline Progress Stepper */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                                Autonomous Execution Pipeline:
                            </span>
                            {isRunning && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Agents actively coordinating...
                                </span>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            {currentSteps.map((s) => {
                                const isRunningStep = s.status === 'running';
                                const isCompletedStep = s.status === 'completed' || s.status === 'verified';
                                return (
                                    <div
                                        key={s.stepNumber}
                                        className={`p-3.5 rounded-2xl border transition-all ${
                                            isRunningStep
                                                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/20'
                                                : isCompletedStep
                                                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80'
                                                : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                                    isRunningStep
                                                        ? 'bg-blue-600 text-white animate-spin'
                                                        : isCompletedStep
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                }`}>
                                                    {isCompletedStep ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : isRunningStep ? (
                                                        <Loader2 className="w-4 h-4" />
                                                    ) : (
                                                        s.stepNumber
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {s.agentName}
                                                        </span>
                                                        {s.findingsCount !== undefined && s.findingsCount > 0 && (
                                                            <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                                                +{s.findingsCount} verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                                        {s.details}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                                isRunningStep
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 animate-pulse'
                                                    : isCompletedStep
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* QA/QC Guarantee Notice */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-slate-900 dark:text-white block">Strict QA/QC Quality & Diversity Guarantee:</strong>
                            Every professor returned is verified against real OpenAlex publication bibliometrics (2021–2026), official active departmental URLs, and calibrated CV readiness evidence. Opportunities span Top-Tier, Mid-Tier, and High-Acceptance Regional institutions to optimize your admissions success.
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {hasCv ? 'CV loaded & ready for agentic analysis' : 'Upload CV to calibrate readiness scores'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {isAllCompleted ? 'View Discovered Positions' : 'Close'}
                        </button>
                        <button
                            type="button"
                            disabled={isRunning || !hasCv}
                            onClick={onStartDiscovery}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Agents Running...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Run Multi-Agent STEM Discovery</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
