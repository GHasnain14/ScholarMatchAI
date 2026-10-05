import React, { useState, useRef } from 'react';
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
    Download,
    Upload,
    FileJson,
    Copy,
    AlertCircle,
    FileSpreadsheet,
    Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateDaysRemaining } from '../services/deadlineNotificationService';

interface ApplicationTrackerProps {
    scholarships: Scholarship[];
    onUpdateStage: (id: string, stage: Scholarship['stage']) => void;
    onUpdateNotes: (id: string, notes: string) => void;
    onToggleBookmark: (id: string) => void;
    onDraft: (scholarship: Scholarship, docType: DocumentType) => void;
    onUpdateDeadline: (id: string, deadline: string) => void;
    onImportApplications?: (imported: Scholarship[]) => void;
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
    onImportApplications,
}) => {
    const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
    const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
    const [noteDraft, setNoteDraft] = useState<string>('');
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
    const [isCopiedJson, setIsCopiedJson] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    /**
     * Export all tracked application and scholarship data as structured JSON backup
     */
    const handleExportJSON = () => {
        if (trackedItems.length === 0) return;

        const backupData = {
            exportDate: new Date().toISOString(),
            formatVersion: '1.0',
            appName: 'ScholarMatch AI',
            totalApplications: trackedItems.length,
            stageBreakdown: STAGES.reduce((acc, stg) => {
                acc[stg.id] = trackedItems.filter(i => (i.stage || 'Discovered') === stg.id).length;
                return acc;
            }, {} as Record<string, number>),
            applications: trackedItems.map(item => ({
                id: item.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                professorName: item.professorName,
                institution: item.institution,
                researchArea: item.researchArea,
                country: item.country || 'Global',
                universityTier: item.universityTier || 'Mid-Tier',
                stage: item.stage || 'Discovered',
                deadline: item.deadline || null,
                notes: item.notes || '',
                link: item.link,
                reasonForMatch: item.reasonForMatch,
                matchScore: item.matchScore,
                fundingType: item.fundingType,
                keyKeywords: item.keyKeywords || [],
                tuitionFees: item.tuitionFees,
                ranking: item.ranking,
                applicationRequirements: item.applicationRequirements || [],
                feedback: item.feedback,
                bookmarked: Boolean(item.bookmarked),
            })),
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        const dateStr = new Date().toISOString().slice(0, 10);
        downloadAnchor.setAttribute('download', `scholarmatch_applications_backup_${dateStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setNotificationMessage(`Successfully exported ${trackedItems.length} application records to JSON!`);
        setTimeout(() => setNotificationMessage(null), 3500);
    };

    /**
     * Copy JSON backup payload directly to clipboard
     */
    const handleCopyJSON = async () => {
        if (trackedItems.length === 0) return;

        const backupData = {
            exportDate: new Date().toISOString(),
            formatVersion: '1.0',
            totalApplications: trackedItems.length,
            applications: trackedItems,
        };

        try {
            await navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
            setIsCopiedJson(true);
            setNotificationMessage('Backup JSON copied to clipboard!');
            setTimeout(() => {
                setIsCopiedJson(false);
                setNotificationMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Failed to copy JSON:', err);
        }
    };

    /**
     * Import scholarship and application data from a previous JSON backup
     */
    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                let listToImport: Scholarship[] = [];

                if (Array.isArray(parsed)) {
                    listToImport = parsed;
                } else if (parsed && Array.isArray(parsed.applications)) {
                    listToImport = parsed.applications;
                } else if (parsed && Array.isArray(parsed.scholarships)) {
                    listToImport = parsed.scholarships;
                }

                if (listToImport.length > 0 && onImportApplications) {
                    onImportApplications(listToImport);
                    setNotificationMessage(`Successfully restored ${listToImport.length} applications from JSON backup!`);
                    setTimeout(() => setNotificationMessage(null), 4000);
                } else {
                    setNotificationMessage('No valid application records found in this JSON file.');
                    setTimeout(() => setNotificationMessage(null), 3000);
                }
            } catch (err) {
                console.error('Failed to parse import JSON:', err);
                setNotificationMessage('Invalid JSON backup file. Please select a valid backup.');
                setTimeout(() => setNotificationMessage(null), 3000);
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
        link.setAttribute('download', `scholarship_application_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredItems = selectedStageFilter === 'all' 
        ? trackedItems 
        : trackedItems.filter(item => (item.stage || 'Discovered') === selectedStageFilter);

    return (
        <div className="space-y-6">
            {/* Top Pipeline Stats & Backup Banner */}
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
                        Track outreach emails, faculty interviews, deadlines, and acceptance letters with offline JSON backups.
                    </p>
                </div>

                {/* Export & Import Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Primary JSON Export Button */}
                    <button
                        type="button"
                        onClick={handleExportJSON}
                        disabled={trackedItems.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-blue-50 transition-all shadow-md active:scale-95 disabled:opacity-50 group"
                        title="Download complete JSON backup file with all stages, notes, and professor records"
                    >
                        <FileJson className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span>Export JSON Backup</span>
                    </button>

                    {/* Copy JSON Button */}
                    <button
                        type="button"
                        onClick={handleCopyJSON}
                        disabled={trackedItems.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition-all border border-white/20 active:scale-95 disabled:opacity-50"
                        title="Copy backup JSON to clipboard"
                    >
                        {isCopiedJson ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">Copy JSON</span>
                    </button>

                    {/* Import JSON Backup */}
                    {onImportApplications && (
                        <label
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition-all border border-white/20 active:scale-95 cursor-pointer"
                            title="Restore application pipeline from a previously exported JSON backup"
                        >
                            <Upload className="w-4 h-4 text-blue-200" />
                            <span>Restore Backup</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleImportFile}
                            />
                        </label>
                    )}

                    {/* CSV Export Button */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={trackedItems.length === 0}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition-all border border-white/20 active:scale-95 disabled:opacity-50"
                        title="Export as CSV for Excel / Google Sheets"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-blue-200" />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                </div>
            </div>

            {/* Notification alert banner */}
            {notificationMessage && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{notificationMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotificationMessage(null)}
                        className="text-xs text-indigo-500 hover:text-indigo-800 dark:hover:text-white font-bold"
                    >
                        Dismiss
                    </button>
                </div>
            )}

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
                                    ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                                    : 'bg-white/80 dark:bg-slate-850/80 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stg.bg} border`}>
                                    <Icon className={`w-4 h-4 ${stg.color}`} />
                                </div>
                                <span className="text-lg font-black text-slate-900 dark:text-white">
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

            {/* Stage Filter Pills Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setSelectedStageFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            selectedStageFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        All Applications ({trackedItems.length})
                    </button>
                    {STAGES.map((stg) => {
                        const count = trackedItems.filter(i => (i.stage || 'Discovered') === stg.id).length;
                        const isSelected = selectedStageFilter === stg.id;
                        return (
                            <button
                                key={stg.id}
                                type="button"
                                onClick={() => setSelectedStageFilter(stg.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                <span>{stg.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Showing {filteredItems.length} of {trackedItems.length} applications
                </div>
            </div>

            {/* Items List */}
            {filteredItems.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <BookmarkCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        No applications in this stage yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Search for Master's programs or professor openings and click "Bookmark / Track" to add them to your Kanban pipeline.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => {
                        const currentStage = STAGES.find(s => s.id === (item.stage || 'Discovered')) || STAGES[0];
                        const isEditingNotes = editingNotesId === item.id;

                        return (
                            <div
                                key={item.id || item.link}
                                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    {/* Header & Stage Badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                                {item.professorName}
                                            </h3>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                {item.institution} • {item.country || 'Global'}
                                            </p>
                                        </div>

                                        {/* Stage selector dropdown */}
                                        <select
                                            value={item.stage || 'Discovered'}
                                            onChange={(e) => handleStageChange(item.id!, e.target.value as Scholarship['stage'])}
                                            className="text-[11px] font-bold py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                        >
                                            {STAGES.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Research area & match info */}
                                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                        <p className="line-clamp-2">
                                            <strong>Focus:</strong> {item.researchArea}
                                        </p>
                                        {item.reasonForMatch && (
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                                "{item.reasonForMatch}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Deadline field */}
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            <span className="text-slate-500 font-medium">Deadline:</span>
                                            <input
                                                type="date"
                                                value={item.deadline || ''}
                                                onChange={(e) => onUpdateDeadline(item.id!, e.target.value)}
                                                className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                                            />
                                        </div>
                                        {item.deadline && (() => {
                                            const days = calculateDaysRemaining(item.deadline);
                                            if (days === 3) {
                                                return (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 animate-pulse">
                                                        <Bell className="w-3 h-3 text-amber-600" />
                                                        3 Days Left (Push Alert Active)
                                                    </span>
                                                );
                                            } else if (days !== null && days <= 3 && days >= 0) {
                                                return (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-300">
                                                        🚨 {days === 0 ? 'Due Today' : `${days} Days Left`}
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>

                                    {/* Notes area */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        {isEditingNotes ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={noteDraft}
                                                    onChange={(e) => setNoteDraft(e.target.value)}
                                                    placeholder="Add personal notes (e.g. 'Emailed Prof on Monday', 'Submitted transcripts via Uni-Assist')..."
                                                    rows={2}
                                                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                                                />
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingNotesId(null)}
                                                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveNote(item.id!)}
                                                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => { setEditingNotesId(item.id!); setNoteDraft(item.notes || ''); }}
                                                className="group cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 text-xs text-slate-600 dark:text-slate-300 flex items-start justify-between gap-2"
                                            >
                                                <p className="italic text-[11px] line-clamp-2">
                                                    {item.notes ? item.notes : 'Click to add personal notes or contact details...'}
                                                </p>
                                                <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom card actions */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onDraft(item, DocumentType.Email)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                                        >
                                            <FileEdit className="w-3 h-3" />
                                            Draft Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDraft(item, DocumentType.MotivationLetter)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                                        >
                                            <FileEdit className="w-3 h-3" />
                                            Draft SOP
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.link && (
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                                                title="Open Lab / Portal Link"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => onToggleBookmark(item.id!)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                            title="Remove from pipeline"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
