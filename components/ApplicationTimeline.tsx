import React, { useState, useMemo } from 'react';
import {
    Scholarship,
    ScholarshipStage,
    TimelineMilestone,
    DocumentType
} from '../types';
import {
    TIMELINE_STAGE_CONFIGS,
    getScholarshipMilestones,
    calculateTimelineProgress,
    getCurrentActiveMilestone,
    getNextStage,
    getPreviousStage,
    getStageRank
} from '../utils/timelineHelper';
import {
    CheckCircle2,
    Clock,
    Calendar,
    Send,
    FileText,
    Mic,
    Trophy,
    Sparkles,
    Search,
    ArrowRight,
    ArrowLeft,
    Check,
    Edit3,
    ExternalLink,
    Download,
    X,
    AlertCircle,
    BookmarkCheck,
    Layers,
    ChevronRight,
    Filter,
    Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportDocumentToPdf } from '../utils/pdfExport';
import { calculateDaysRemaining } from '../services/deadlineNotificationService';

interface ApplicationTimelineProps {
    scholarships: Scholarship[];
    onUpdateStage: (id: string, stage: ScholarshipStage) => void;
    onUpdateNotes?: (id: string, notes: string) => void;
    onUpdateDeadline?: (id: string, deadline: string) => void;
    onDraftDocument: (scholarship: Scholarship, docType: DocumentType) => void;
    onStartInterview?: (scholarship: Scholarship) => void;
    onUpdateTimelineMilestones?: (id: string, milestones: TimelineMilestone[]) => void;
    onToggleBookmark?: (id: string) => void;
    onNavigateToFindPositions?: () => void;
    onLoadSampleApplications?: () => void;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
    scholarships,
    onUpdateStage,
    onUpdateNotes,
    onUpdateDeadline,
    onDraftDocument,
    onStartInterview,
    onUpdateTimelineMilestones,
    onToggleBookmark,
    onNavigateToFindPositions,
    onLoadSampleApplications,
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'progress' | 'deadline' | 'name'>('progress');
    const [selectedScholarshipForModal, setSelectedScholarshipForModal] = useState<Scholarship | null>(null);

    // Modal state for editing notes/dates per milestone
    const [modalMilestones, setModalMilestones] = useState<TimelineMilestone[]>([]);
    const [modalGeneralNotes, setModalGeneralNotes] = useState<string>('');
    const [modalSavedSuccess, setModalSavedSuccess] = useState<boolean>(false);

    // Only consider tracked or bookmarked scholarships
    const trackedScholarships = useMemo(() => {
        return scholarships.filter(s => s.bookmarked || s.stage);
    }, [scholarships]);

    // Compute metrics across all tracked scholarships
    const timelineStats = useMemo(() => {
        const total = trackedScholarships.length;
        if (total === 0) return { total: 0, avgProgress: 0, stageCounts: {}, upcomingSoonCount: 0 };

        let totalProgress = 0;
        let upcomingSoonCount = 0;
        const stageCounts: Record<string, number> = {};

        trackedScholarships.forEach(s => {
            const milestones = getScholarshipMilestones(s);
            const progress = calculateTimelineProgress(milestones);
            totalProgress += progress;

            const stg = s.stage || 'Discovered';
            stageCounts[stg] = (stageCounts[stg] || 0) + 1;

            if (s.deadline) {
                const days = calculateDaysRemaining(s.deadline);
                if (days !== null && days >= 0 && days <= 14) {
                    upcomingSoonCount += 1;
                }
            }
        });

        return {
            total,
            avgProgress: Math.round(totalProgress / total),
            stageCounts,
            upcomingSoonCount,
        };
    }, [trackedScholarships]);

    // Filter & Sort scholarships
    const filteredScholarships = useMemo(() => {
        let list = trackedScholarships;

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                s =>
                    s.professorName.toLowerCase().includes(q) ||
                    s.institution.toLowerCase().includes(q) ||
                    s.researchArea.toLowerCase().includes(q) ||
                    (s.country && s.country.toLowerCase().includes(q))
            );
        }

        // Stage filter
        if (selectedStageFilter !== 'all') {
            list = list.filter(s => (s.stage || 'Discovered') === selectedStageFilter);
        }

        // Sorter
        return [...list].sort((a, b) => {
            if (sortOrder === 'progress') {
                const progA = calculateTimelineProgress(getScholarshipMilestones(a));
                const progB = calculateTimelineProgress(getScholarshipMilestones(b));
                return progB - progA;
            }
            if (sortOrder === 'deadline') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline.localeCompare(b.deadline);
            }
            if (sortOrder === 'name') {
                return a.professorName.localeCompare(b.professorName);
            }
            return 0;
        });
    }, [trackedScholarships, searchQuery, selectedStageFilter, sortOrder]);

    // Open detailed milestone modal
    const handleOpenDetailModal = (scholarship: Scholarship) => {
        setSelectedScholarshipForModal(scholarship);
        const milestones = getScholarshipMilestones(scholarship);
        setModalMilestones(milestones);
        setModalGeneralNotes(scholarship.notes || '');
        setModalSavedSuccess(false);
    };

    // Toggle specific milestone in modal
    const handleToggleModalMilestone = (key: TimelineMilestone['key']) => {
        setModalMilestones(prev =>
            prev.map(m => {
                if (m.key === key) {
                    const newCompleted = !m.completed;
                    return {
                        ...m,
                        completed: newCompleted,
                        date: newCompleted && !m.date ? new Date().toISOString().slice(0, 10) : m.date,
                    };
                }
                return m;
            })
        );
    };

    // Update date on specific milestone in modal
    const handleUpdateModalMilestoneDate = (key: TimelineMilestone['key'], date: string) => {
        setModalMilestones(prev =>
            prev.map(m => (m.key === key ? { ...m, date } : m))
        );
    };

    // Update note on specific milestone in modal
    const handleUpdateModalMilestoneNote = (key: TimelineMilestone['key'], notes: string) => {
        setModalMilestones(prev =>
            prev.map(m => (m.key === key ? { ...m, notes } : m))
        );
    };

    // Save modal changes
    const handleSaveModalChanges = () => {
        if (!selectedScholarshipForModal || !selectedScholarshipForModal.id) return;
        const id = selectedScholarshipForModal.id;

        // Determine highest completed stage
        let highestCompletedStage: ScholarshipStage = 'Discovered';
        TIMELINE_STAGE_CONFIGS.forEach(cfg => {
            const found = modalMilestones.find(m => m.key === cfg.key);
            if (found && found.completed) {
                highestCompletedStage = cfg.stage;
            }
        });

        // Trigger confetti if Offer Received is newly marked
        if ((highestCompletedStage as string) === 'Offer Received' && (selectedScholarshipForModal.stage as string) !== 'Offer Received') {
            try {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
        }

        onUpdateStage(id, highestCompletedStage);

        if (onUpdateNotes) {
            onUpdateNotes(id, modalGeneralNotes);
        }

        if (onUpdateTimelineMilestones) {
            onUpdateTimelineMilestones(id, modalMilestones);
        }

        // Update local object in modal view
        setSelectedScholarshipForModal(prev => prev ? {
            ...prev,
            stage: highestCompletedStage,
            notes: modalGeneralNotes,
            timelineMilestones: modalMilestones
        } : null);

        setModalSavedSuccess(true);
        setTimeout(() => setModalSavedSuccess(false), 2500);
    };

    // Advance scholarship directly from card
    const handleQuickAdvance = (scholarship: Scholarship) => {
        if (!scholarship.id) return;
        const next = getNextStage(scholarship.stage);
        if (next === 'Offer Received') {
            try {
                confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
            } catch (e) {}
        }
        onUpdateStage(scholarship.id, next);
    };

    // Helper for milestone icons
    const renderMilestoneIcon = (key: TimelineMilestone['key']) => {
        switch (key) {
            case 'discovered':
                return <Sparkles className="w-3.5 h-3.5" />;
            case 'professors_contacted':
                return <Send className="w-3.5 h-3.5" />;
            case 'sop_drafted':
                return <FileText className="w-3.5 h-3.5" />;
            case 'interview_scheduled':
                return <Mic className="w-3.5 h-3.5" />;
            case 'application_submitted':
                return <Clock className="w-3.5 h-3.5" />;
            case 'offer_received':
                return <Trophy className="w-3.5 h-3.5" />;
            default:
                return <Check className="w-3.5 h-3.5" />;
        }
    };

    // Export individual timeline dossier as PDF
    const handleExportScholarshipPdf = (scholarship: Scholarship) => {
        const milestones = getScholarshipMilestones(scholarship);
        const progress = calculateTimelineProgress(milestones);

        let content = `# Graduate Scholarship Application Timeline Dossier\n`;
        content += `Target Professor: ${scholarship.professorName}\n`;
        content += `Institution: ${scholarship.institution} (${scholarship.country || 'Global'})\n`;
        content += `Research Field: ${scholarship.researchArea}\n`;
        content += `Current Lifecycle Stage: ${scholarship.stage || 'Discovered'} (${progress}% Complete)\n`;
        if (scholarship.deadline) content += `Official Deadline: ${scholarship.deadline}\n`;
        if (scholarship.notes) content += `General Application Notes: ${scholarship.notes}\n`;
        content += `\n---\n\n## Lifecycle Milestones & Verification Trail\n\n`;

        milestones.forEach((m, idx) => {
            const status = m.completed ? 'COMPLETED [✓]' : 'PENDING [ ]';
            content += `### Milestone ${idx + 1}: ${m.label} - ${status}\n`;
            content += `*Description:* ${m.description}\n`;
            if (m.date) content += `*Recorded Date:* ${m.date}\n`;
            if (m.notes) content += `*Milestone Notes:* ${m.notes}\n`;
            content += `\n`;
        });

        exportDocumentToPdf({
            title: `Application Timeline - ${scholarship.professorName}`,
            subtitle: `${scholarship.institution} • ${scholarship.researchArea}`,
            content,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                            Application Roadmap
                        </span>
                        <span className="text-slate-500" aria-hidden="true">·</span>
                        <span className="text-xs text-indigo-200">
                            {trackedScholarships.length} Tracked Opportunities
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Application Lifecycle Timeline
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        Track each lab opportunity from initial shortlisting through outreach, tailored SOP drafting, mock interview rounds, and formal submission.
                    </p>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <div className="text-[11px] text-slate-400 font-medium">Avg Completion</div>
                        <div className="text-xl font-black text-indigo-400 font-mono mt-0.5">
                            {timelineStats.avgProgress}%
                        </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <div className="text-[11px] text-slate-400 font-medium">Interviews & Applied</div>
                        <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                            {(timelineStats.stageCounts['Interview Scheduled'] || 0) +
                                (timelineStats.stageCounts['Application Submitted'] || 0) +
                                (timelineStats.stageCounts['Offer Received'] || 0)}
                        </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
                        <div className="text-[11px] text-slate-400 font-medium">Soon Deadlines (&le;14d)</div>
                        <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                            {timelineStats.upcomingSoonCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Toolbar: Search, Filters, and Sorting */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by Professor, Institution, or Research Field..."
                        className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                    />
                </div>

                {/* Stage Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    <button
                        onClick={() => setSelectedStageFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            selectedStageFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        All ({trackedScholarships.length})
                    </button>
                    {TIMELINE_STAGE_CONFIGS.map(stg => (
                        <button
                            key={stg.stage}
                            onClick={() => setSelectedStageFilter(stg.stage)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                selectedStageFilter === stg.stage
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            {stg.label} ({timelineStats.stageCounts[stg.stage] || 0})
                        </button>
                    ))}
                </div>

                {/* Sorter */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Sort:
                    </span>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                    >
                        <option value="progress">Completion % (Highest First)</option>
                        <option value="deadline">Deadline (Soonest First)</option>
                        <option value="name">Professor Name (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Main Timelines List */}
            {filteredScholarships.length > 0 ? (
                <div className="space-y-4">
                    {filteredScholarships.map(scholarship => {
                        const milestones = getScholarshipMilestones(scholarship);
                        const progress = calculateTimelineProgress(milestones);
                        const currentMilestone = getCurrentActiveMilestone(milestones);
                        const daysLeft = scholarship.deadline ? calculateDaysRemaining(scholarship.deadline) : null;
                        const isOfferReceived = scholarship.stage === 'Offer Received';

                        return (
                            <div
                                key={scholarship.id || scholarship.professorName}
                                className={`rounded-2xl bg-white dark:bg-slate-900 border p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${
                                    isOfferReceived
                                        ? 'border-emerald-500/80 bg-emerald-50/10 dark:bg-emerald-950/20'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                                }`}
                            >
                                {/* Card Header Info */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                {scholarship.professorName}
                                            </h3>
                                            <span className="text-slate-400" aria-hidden="true">·</span>
                                            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                                {scholarship.institution}
                                            </span>
                                            {scholarship.country && (
                                                <>
                                                    <span className="text-slate-400" aria-hidden="true">·</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {scholarship.country}
                                                    </span>
                                                </>
                                            )}
                                            {scholarship.universityTier && (
                                                <>
                                                    <span className="text-slate-400" aria-hidden="true">·</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {scholarship.universityTier}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                                            Research Focus: {scholarship.researchArea}
                                        </p>
                                    </div>

                                    {/* Progress & Milestone Badge */}
                                    <div className="flex items-center gap-3">
                                        {scholarship.deadline && (
                                            <div className="text-right">
                                                <div className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                                                    Deadline: {scholarship.deadline}
                                                </div>
                                                {daysLeft !== null && (
                                                    <div
                                                        className={`text-[10px] font-bold ${
                                                            daysLeft < 0
                                                                ? 'text-rose-500'
                                                                : daysLeft <= 7
                                                                ? 'text-amber-500'
                                                                : 'text-emerald-500'
                                                        }`}
                                                    >
                                                        {daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Due Today' : `${daysLeft} days remaining`}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                                            <div className="text-right">
                                                <div className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                                                    {progress}%
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {milestones.filter(m => m.completed).length}/6 Done
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Horizontal Milestone Rail */}
                                <div className="py-5 overflow-x-auto">
                                    <div className="min-w-[680px] relative px-4">
                                        {/* Background connecting rail */}
                                        <div className="absolute top-4 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />

                                        {/* Completed colored fill rail */}
                                        <div
                                            className="absolute top-4 left-8 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full z-0 transition-all duration-500"
                                            style={{
                                                width: `${Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        (getStageRank(scholarship.stage) / (TIMELINE_STAGE_CONFIGS.length - 1)) * 90
                                                    )
                                                )}%`,
                                            }}
                                        />

                                        {/* Milestone Nodes */}
                                        <div className="relative z-10 flex items-start justify-between">
                                            {milestones.map((m, idx) => {
                                                const isCompleted = m.completed;
                                                const isCurrent = m.key === currentMilestone.key && !isCompleted;
                                                const rank = idx;

                                                return (
                                                    <div
                                                        key={m.key}
                                                        className="flex flex-col items-center text-center max-w-[100px] group cursor-pointer"
                                                        onClick={() => handleOpenDetailModal(scholarship)}
                                                        title={`Click to view details for ${m.label}`}
                                                    >
                                                        {/* Node Circle */}
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                                isCompleted
                                                                    ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-50 dark:ring-emerald-950/60'
                                                                    : isCurrent
                                                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/80 animate-pulse shadow-md'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                                                            }`}
                                                        >
                                                            {isCompleted ? (
                                                                <Check className="w-4 h-4 stroke-[3]" />
                                                            ) : (
                                                                renderMilestoneIcon(m.key)
                                                            )}
                                                        </div>

                                                        {/* Node Label */}
                                                        <div className="mt-2 text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                                            {m.label}
                                                        </div>

                                                        {/* Date / Status kicker */}
                                                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                                            {m.date ? m.date.slice(5) : isCompleted ? 'Done' : isCurrent ? 'Next Up' : `Step 0${rank + 1}`}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Quick Action Strip */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            Current Focus:
                                        </span>
                                        <span>{currentMilestone.title}</span>
                                        {scholarship.notes && (
                                            <>
                                                <span aria-hidden="true">·</span>
                                                <span className="italic line-clamp-1 max-w-xs">
                                                    "{scholarship.notes}"
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Outreach Email */}
                                        <button
                                            type="button"
                                            onClick={() => onDraftDocument(scholarship, DocumentType.Email)}
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                                            title="Draft customized outreach email to professor"
                                        >
                                            <Send className="w-3 h-3" />
                                            <span>Email PI</span>
                                        </button>

                                        {/* SOP / Motivation */}
                                        <button
                                            type="button"
                                            onClick={() => onDraftDocument(scholarship, DocumentType.StatementOfPurpose)}
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                                            title="Draft Statement of Purpose tailored to this lab"
                                        >
                                            <FileText className="w-3 h-3" />
                                            <span>Draft SOP</span>
                                        </button>

                                        {/* Mock Interview */}
                                        {onStartInterview && (
                                            <button
                                                type="button"
                                                onClick={() => onStartInterview(scholarship)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 border border-violet-200 dark:border-violet-800 transition-colors flex items-center gap-1 cursor-pointer"
                                                title="Practice mock interview with questions for this lab"
                                            >
                                                <Mic className="w-3 h-3" />
                                                <span>Mock Interview</span>
                                            </button>
                                        )}

                                        {/* Advance Next Stage */}
                                        {!isOfferReceived && (
                                            <button
                                                type="button"
                                                onClick={() => handleQuickAdvance(scholarship)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                                title="Advance scholarship to next stage"
                                            >
                                                <span>Advance Stage</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}

                                        {/* Open Full Timeline Drawer */}
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDetailModal(scholarship)}
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Timeline Details</span>
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            No Tracked Applications Found
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                            {searchQuery.trim() || selectedStageFilter !== 'all'
                                ? 'No applications matched your search or stage filters. Try clearing your filters.'
                                : 'Bookmark opportunities in the Find Opportunities tab to start mapping their lifecycle timeline milestones here.'}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {onNavigateToFindPositions && (
                            <button
                                type="button"
                                onClick={onNavigateToFindPositions}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
                            >
                                <Compass className="w-3.5 h-3.5" />
                                <span>Discover Funded Lab Openings</span>
                            </button>
                        )}
                        {onLoadSampleApplications && (
                            <button
                                type="button"
                                onClick={onLoadSampleApplications}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 transition-all shadow-xs cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Preview Sample Tracked Timeline (Demo)</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* DEEP-DIVE STAGE TIMELINE MODAL */}
            {selectedScholarshipForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
                    <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                                        Milestone Lifecycle Inspector
                                    </span>
                                    <span className="text-xs font-mono text-emerald-400 font-bold">
                                        {calculateTimelineProgress(modalMilestones)}% Complete
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white">
                                    {selectedScholarshipForModal.professorName} • {selectedScholarshipForModal.institution}
                                </h3>
                                <p className="text-xs text-indigo-200 line-clamp-1">
                                    Research Field: {selectedScholarshipForModal.researchArea}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleExportScholarshipPdf(selectedScholarshipForModal)}
                                    className="p-2 rounded-xl text-xs font-bold text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
                                    title="Download PDF Timeline Dossier"
                                >
                                    <Download className="w-4 h-4 text-emerald-300" />
                                    <span className="hidden sm:inline">Export PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedScholarshipForModal(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: Milestone Stepper and Notes */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {modalSavedSuccess && (
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Timeline milestones and stage successfully updated!</span>
                                </div>
                            )}

                            {/* Stepper Checklist */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Key Application Stages (Click to toggle completed)
                                </h4>

                                <div className="space-y-3">
                                    {modalMilestones.map((milestone, idx) => {
                                        return (
                                            <div
                                                key={milestone.key}
                                                className={`p-4 rounded-2xl border transition-all ${
                                                    milestone.completed
                                                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-emerald-300 dark:border-emerald-800/60'
                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    {/* Toggle Checkbox & Label */}
                                                    <div
                                                        className="flex items-start gap-3 cursor-pointer flex-1"
                                                        onClick={() => handleToggleModalMilestone(milestone.key)}
                                                    >
                                                        <div
                                                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                                                milestone.completed
                                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                                    : 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                                                            }`}
                                                        >
                                                            {milestone.completed && <Check className="w-4 h-4 stroke-[3]" />}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                    Stage 0{idx + 1}: {milestone.label}
                                                                </span>
                                                                {milestone.completed ? (
                                                                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                                                        Completed
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-mono text-slate-400">
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {milestone.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Date and Action Controls */}
                                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                                        {/* Date Input */}
                                                        <input
                                                            type="date"
                                                            value={milestone.date || ''}
                                                            onChange={e => handleUpdateModalMilestoneDate(milestone.key, e.target.value)}
                                                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300"
                                                            title="Milestone Completion or Scheduled Date"
                                                        />

                                                        {/* Specific Document or Interview Quick-Launch */}
                                                        {milestone.actionDocType && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (milestone.key === 'interview_scheduled' && onStartInterview) {
                                                                        onStartInterview(selectedScholarshipForModal);
                                                                    } else {
                                                                        onDraftDocument(selectedScholarshipForModal, milestone.actionDocType!);
                                                                    }
                                                                    setSelectedScholarshipForModal(null);
                                                                }}
                                                                className="px-2.5 py-1 text-xs font-bold rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                                                            >
                                                                {milestone.actionLabel || 'Draft'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stage-Specific Note Input */}
                                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                                                    <input
                                                        type="text"
                                                        value={milestone.notes || ''}
                                                        onChange={e => handleUpdateModalMilestoneNote(milestone.key, e.target.value)}
                                                        placeholder={`Optional milestone note (e.g. 'Prof requested 1-page summary', 'Interview with postdoc team on Zoom')...`}
                                                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Overall Application Notes */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Overall Application Notes & Strategy
                                </label>
                                <textarea
                                    value={modalGeneralNotes}
                                    onChange={e => setModalGeneralNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Enter application specific insights, reference letter contacts, portal links, or PI discussion points..."
                                    className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedScholarshipForModal(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                                Close
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleSaveModalChanges}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Save Timeline Changes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
