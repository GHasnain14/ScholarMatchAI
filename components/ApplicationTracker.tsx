import React, { useState } from 'react';
import { Scholarship, DocumentType } from '../types';
import { 
    BookmarkCheck, 
    Sparkles, 
    Send, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Trophy, 
    ExternalLink, 
    Trash2, 
    FileEdit, 
    Plus,
    Edit3,
    Check,
    Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationTrackerProps {
    scholarships: Scholarship[];
    onUpdateStage: (id: string, stage: Scholarship['stage']) => void;
    onUpdateNotes: (id: string, notes: string) => void;
    onToggleBookmark: (id: string) => void;
    onDraft: (scholarship: Scholarship, docType: DocumentType) => void;
    onUpdateDeadline: (id: string, deadline: string) => void;
}

const STAGES: { id: Scholarship['stage']; label: string; icon: any; color: string; bg: string }[] = [
    { id: 'Discovered', label: 'Discovered', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200' },
    { id: 'Email Sent', label: 'Outreach Sent', icon: Send, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200' },
    { id: 'Interview Scheduled', label: 'Interview Scheduled', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200' },
    { id: 'Application Submitted', label: 'Applied / Submitted', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200' },
    { id: 'Offer Received', label: 'Offer Received 🎉', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200' },
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
    scholarships,
    onUpdateStage,
    onUpdateNotes,
    onToggleBookmark,
    onDraft,
    onUpdateDeadline,
}) => {
    const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
    const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
    const [noteDraft, setNoteDraft] = useState<string>('');

    // Filter bookmarked or active opportunities
    const trackedItems = scholarships.filter(s => s.bookmarked || s.stage);

    const handleSaveNote = (id: string) => {
        onUpdateNotes(id, noteDraft);
        setEditingNotesId(null);
    };

    const handleStageChange = (id: string, stage: Scholarship['stage']) => {
        if (stage === 'Offer Received') {
            try {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
        }
        onUpdateStage(id, stage);
    };

    const handleExportCSV = () => {
        if (trackedItems.length === 0) return;
        const headers = ['Professor / Programme', 'Institution', 'Country', 'Tier', 'Stage', 'Deadline', 'Link', 'Notes'];
        const rows = trackedItems.map(item => [
            `"${item.professorName.replace(/"/g, '""')}"`,
            `"${item.institution.replace(/"/g, '""')}"`,
            `"${(item.country || 'Global').replace(/"/g, '""')}"`,
            `"${(item.universityTier || 'Mid-Tier').replace(/"/g, '""')}"`,
            `"${(item.stage || 'Discovered').replace(/"/g, '""')}"`,
            `"${(item.deadline || 'N/A').replace(/"/g, '""')}"`,
            `"${(item.link || '').replace(/"/g, '""')}"`,
            `"${(item.notes || '').replace(/"/g, '""')}"`,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'scholarship_application_pipeline.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredItems = selectedStageFilter === 'all' 
        ? trackedItems 
        : trackedItems.filter(item => (item.stage || 'Discovered') === selectedStageFilter);

    return (
        <div className="space-y-6">
            {/* Top Pipeline Stats Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                            Kanban Pipeline
                        </span>
                        <span className="text-xs text-blue-100 font-medium">
                            {trackedItems.length} Opportunities Tracked
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Academic Application Pipeline
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl font-normal">
                        Track outreach emails, faculty interviews, deadlines, and acceptance letters all in one central dashboard.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={trackedItems.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-blue-50 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4 text-indigo-600" />
                        Export Pipeline (CSV)
                    </button>
                </div>
            </div>

            {/* Stages Visual Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {STAGES.map((stg) => {
                    const Icon = stg.icon;
                    const count = trackedItems.filter(i => (i.stage || 'Discovered') === stg.id).length;
                    const isSelected = selectedStageFilter === stg.id;
                    return (
                        <button
                            key={stg.id}
                            type="button"
                            onClick={() => setSelectedStageFilter(isSelected ? 'all' : stg.id)}
                            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                                isSelected
                                    ? 'border-indigo-500 ring-2 ring-indigo-400 bg-white dark:bg-slate-800 shadow-md scale-[1.02]'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-8 h-8 rounded-xl ${stg.bg} flex items-center justify-center font-bold`}>
                                    <Icon className={`w-4 h-4 ${stg.color}`} />
                                </div>
                                <span className="text-xl font-black text-slate-800 dark:text-white">
                                    {count}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {stg.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Opportunities List / Cards in Pipeline */}
            {trackedItems.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                        <BookmarkCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                        No Opportunities Saved to Pipeline Yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Click the star icon ⭐ or choose an application stage on any scholarship card in the "Find Opportunities" tab to track it here.
                    </p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500">
                        No positions currently in the "{selectedStageFilter}" stage.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSelectedStageFilter('all')}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                        View all stages ({trackedItems.length})
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id || item.professorName}
                            className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                        >
                            {/* Header */}
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                                        {item.country || 'Global'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={item.stage || 'Discovered'}
                                            onChange={(e) => handleStageChange(item.id!, e.target.value as any)}
                                            className="text-xs font-bold bg-slate-100 dark:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1 border border-slate-200 dark:border-slate-650 focus:ring-1 focus:ring-blue-500"
                                        >
                                            {STAGES.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => onToggleBookmark(item.id!)}
                                            className="text-slate-400 hover:text-rose-500 p-1"
                                            title="Remove from saved"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {item.professorName}
                                </h4>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {item.institution}
                                </p>
                                <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 line-clamp-2">
                                    {item.researchArea}
                                </p>
                            </div>

                            {/* Deadline & Quick Notes */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-750">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Deadline:
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'None set'}
                                    </span>
                                </div>

                                {/* Custom Note Box */}
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                                    {editingNotesId === item.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={noteDraft}
                                                onChange={(e) => setNoteDraft(e.target.value)}
                                                rows={2}
                                                placeholder="Add application note (e.g. outreach date, interview questions)..."
                                                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveNote(item.id!)}
                                                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white"
                                                >
                                                    Save Note
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingNotesId(null)}
                                                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-200 text-slate-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                                                {item.notes || 'No custom notes added yet.'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingNotesId(item.id!);
                                                    setNoteDraft(item.notes || '');
                                                }}
                                                className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                                            >
                                                {item.notes ? 'Edit' : '+ Note'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between gap-2 pt-2">
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1"
                                >
                                    <span>Lab Page</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>

                                <button
                                    type="button"
                                    onClick={() => onDraft(item, DocumentType.Email)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                                >
                                    <FileEdit className="w-3.5 h-3.5" />
                                    <span>Draft Email</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
