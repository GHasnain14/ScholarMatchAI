import React, { useState, useMemo } from 'react';
import { 
    Layers, 
    Check, 
    ChevronDown, 
    Plus, 
    Copy, 
    Trash2, 
    Edit3, 
    FileText, 
    Sparkles, 
    Cloud, 
    CloudOff, 
    HardDrive, 
    ExternalLink, 
    Download, 
    Upload, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Tag, 
    Building2,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { CvProfile } from '../types';
import { STARTER_CV_TEMPLATES, generateProfileId } from '../utils/cvProfileManager';

interface CvVersionSwitcherProps {
    profiles: CvProfile[];
    activeProfileId: string | null;
    onSelectProfile: (profileId: string) => void;
    onCreateProfile: (newProfile: CvProfile) => void;
    onUpdateProfile: (updatedProfile: CvProfile) => void;
    onDeleteProfile: (profileId: string) => void;
    currentCvText: string;
    onSaveCurrentTextToActiveProfile: () => void;
    isCloudSynced: boolean;
    userEmail?: string | null;
    onSignInPrompt?: () => void;
}

export const CvVersionSwitcher: React.FC<CvVersionSwitcherProps> = ({
    profiles,
    activeProfileId,
    onSelectProfile,
    onCreateProfile,
    onUpdateProfile,
    onDeleteProfile,
    currentCvText,
    onSaveCurrentTextToActiveProfile,
    isCloudSynced,
    userEmail,
    onSignInPrompt,
}) => {
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<CvProfile | null>(null);
    const [previewProfile, setPreviewProfile] = useState<CvProfile | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Form state for creating/editing
    const [formName, setFormName] = useState('');
    const [formTargetField, setFormTargetField] = useState('');
    const [formInstitutions, setFormInstitutions] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formText, setFormText] = useState('');
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

    // Active profile
    const activeProfile = useMemo(() => {
        return profiles.find(p => p.id === activeProfileId) || profiles[0] || null;
    }, [profiles, activeProfileId]);

    // Check if the current editor text differs from the active profile's stored text
    const hasUnsavedChanges = useMemo(() => {
        if (!activeProfile) return false;
        return currentCvText.trim() !== activeProfile.text.trim();
    }, [activeProfile, currentCvText]);

    const openCreateModal = (presetTemplate?: typeof STARTER_CV_TEMPLATES[0]) => {
        if (presetTemplate) {
            setFormName(presetTemplate.name);
            setFormTargetField(presetTemplate.targetField);
            setFormInstitutions(presetTemplate.targetInstitutions || '');
            setFormNotes(presetTemplate.notes || '');
            setFormText(presetTemplate.text);
        } else {
            setFormName(`Tailored CV (${profiles.length + 1})`);
            setFormTargetField(activeProfile?.targetField || 'General Academic');
            setFormInstitutions('');
            setFormNotes('');
            // Default to current CV text so they can customize it
            setFormText(currentCvText || activeProfile?.text || '');
        }
        setSelectedTemplateIndex(null);
        setIsCreateModalOpen(true);
    };

    const handleSaveNewProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim() || !formText.trim()) return;

        const newProfile: CvProfile = {
            id: generateProfileId(),
            name: formName.trim().slice(0, 100),
            targetField: (formTargetField.trim() || 'General Academic').slice(0, 100),
            targetInstitutions: formInstitutions.trim().slice(0, 200),
            notes: formNotes.trim().slice(0, 1000),
            text: formText.trim().slice(0, 20000),
            isDefault: profiles.length === 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onCreateProfile(newProfile);
        setIsCreateModalOpen(false);
    };

    const handleDuplicate = (profile: CvProfile) => {
        const copy: CvProfile = {
            ...profile,
            id: generateProfileId(),
            name: `${profile.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: false,
        };
        onCreateProfile(copy);
    };

    const handleStartEdit = (profile: CvProfile) => {
        setEditingProfile(profile);
        setFormName(profile.name);
        setFormTargetField(profile.targetField);
        setFormInstitutions(profile.targetInstitutions || '');
        setFormNotes(profile.notes || '');
        setFormText(profile.text);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProfile || !formName.trim()) return;

        const updated: CvProfile = {
            ...editingProfile,
            name: formName.trim().slice(0, 100),
            targetField: (formTargetField.trim() || 'General Academic').slice(0, 100),
            targetInstitutions: formInstitutions.trim().slice(0, 200),
            notes: formNotes.trim().slice(0, 1000),
            text: formText.trim().slice(0, 20000),
            updatedAt: new Date().toISOString(),
        };

        onUpdateProfile(updated);
        setEditingProfile(null);
    };

    const handleExportJson = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `scholarmatch_cv_versions_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    parsed.forEach((item) => {
                        if (item.name && item.text) {
                            onCreateProfile({
                                id: generateProfileId(),
                                name: item.name.slice(0, 100),
                                targetField: (item.targetField || 'Imported').slice(0, 100),
                                targetInstitutions: (item.targetInstitutions || '').slice(0, 200),
                                notes: (item.notes || '').slice(0, 1000),
                                text: item.text.slice(0, 20000),
                                isDefault: false,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            });
                        }
                    });
                }
            } catch (err) {
                console.error('Failed to parse imported CV JSON:', err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 transition-colors">
            {/* Top Bar: Active CV & Quick Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Active CV Version:
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                {activeProfile?.name || 'No CV Version Selected'}
                            </span>
                            {activeProfile?.targetField && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                                    <Tag className="w-2.5 h-2.5" />
                                    {activeProfile.targetField}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {profiles.length} version{profiles.length === 1 ? '' : 's'} saved in local storage
                            {isCloudSynced ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1.5 inline-flex items-center gap-1">
                                    • <Cloud className="w-3 h-3" /> Cloud-synced with Firestore
                                </span>
                            ) : (
                                <span className="text-slate-400 dark:text-slate-500 font-medium ml-1.5 inline-flex items-center gap-1">
                                    • <HardDrive className="w-3 h-3" /> Local Storage only
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Unsaved changes alert / quick update button */}
                    {hasUnsavedChanges && (
                        <button
                            type="button"
                            onClick={onSaveCurrentTextToActiveProfile}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 rounded-xl transition-all shadow-2xs"
                            title="Save text edits directly to this CV version"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Update Version
                        </button>
                    )}

                    {/* Quick Switcher Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs"
                        >
                            <span>Switch CV</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setDropdownOpen(false)} 
                                />
                                <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 max-h-80 overflow-y-auto">
                                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                        Tailored Versions
                                    </div>
                                    {profiles.map((profile) => {
                                        const isSelected = profile.id === activeProfile?.id;
                                        return (
                                            <button
                                                key={profile.id}
                                                type="button"
                                                onClick={() => {
                                                    onSelectProfile(profile.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ${
                                                    isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                <div className="truncate">
                                                    <div className="truncate">{profile.name}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                                        {profile.targetField}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                openCreateModal();
                                            }}
                                            className="w-full text-left px-2 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Create New Tailored Version...
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Manage Library Button */}
                    <button
                        type="button"
                        onClick={() => setIsLibraryOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-xs"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>CV Library ({profiles.length})</span>
                    </button>
                </div>
            </div>

            {/* Quick Switcher Pills Horizontal List */}
            {profiles.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                        Quick Switch:
                    </span>
                    {profiles.map((profile) => {
                        const isSelected = profile.id === activeProfile?.id;
                        return (
                            <button
                                key={profile.id}
                                type="button"
                                onClick={() => onSelectProfile(profile.id)}
                                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                                }`}
                            >
                                <span className="truncate max-w-[150px]">{profile.name}</span>
                                <span className={`text-[10px] px-1 rounded ${
                                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {profile.targetField.split(' ')[0]}
                                </span>
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => openCreateModal()}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg transition-colors"
                        title="Add tailored version"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Add Field</span>
                    </button>
                </div>
            )}

            {/* Modal: Full CV Library & Manager */}
            {isLibraryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Tailored CV Versions Library
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                                            {profiles.length} Available
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Switch between different CV versions tailored for specific research fields, faculties, or scholarships.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLibraryOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cloud Sync Status Banner */}
                        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                {isCloudSynced ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>
                                            Signed in as <strong>{userEmail}</strong> • Auto-synced across devices via Firebase Firestore
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <HardDrive className="w-4 h-4 text-blue-600" />
                                        <span>
                                            Persisted in your browser's Local Storage. Sign in with Google to sync across all your devices.
                                        </span>
                                    </>
                                )}
                            </div>
                            {!isCloudSynced && onSignInPrompt && (
                                <button
                                    type="button"
                                    onClick={onSignInPrompt}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                                >
                                    Sign In with Google →
                                </button>
                            )}
                        </div>

                        {/* Body - Grid of Versions */}
                        <div className="p-5 overflow-y-auto space-y-4 flex-1">
                            {/* Actions toolbar */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openCreateModal()}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create New Version
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={handleExportJson}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
                                        title="Export all CV versions as JSON backup"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Export JSON
                                    </button>
                                    <label
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors cursor-pointer"
                                        title="Import CV versions from JSON"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Import JSON
                                        <input
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={handleImportJson}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Cards list */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {profiles.map((profile) => {
                                    const isSelected = profile.id === activeProfile?.id;
                                    const wordCount = profile.text.split(/\s+/).filter(Boolean).length;
                                    return (
                                        <div
                                            key={profile.id}
                                            className={`rounded-xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                                                isSelected
                                                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm ring-1 ring-indigo-500/30'
                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                                {profile.name}
                                                            </h4>
                                                            {isSelected && (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white shadow-2xs">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                                <Tag className="w-2.5 h-2.5 text-indigo-500" />
                                                                {profile.targetField}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400">
                                                                {wordCount} words
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Card top action */}
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartEdit(profile)}
                                                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            title="Edit Details"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDuplicate(profile)}
                                                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            title="Duplicate & Tailor"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                        {profiles.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (window.confirm(`Delete version "${profile.name}"?`)) {
                                                                        onDeleteProfile(profile.id);
                                                                    }
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                                title="Delete version"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {profile.targetInstitutions && (
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span>Target: {profile.targetInstitutions}</span>
                                                    </p>
                                                )}

                                                {profile.notes && (
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                                        "{profile.notes}"
                                                    </p>
                                                )}

                                                <p className="text-[11px] font-mono text-slate-400 line-clamp-2">
                                                    {profile.text.slice(0, 140)}...
                                                </p>
                                            </div>

                                            {/* Bottom actions */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewProfile(profile)}
                                                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    View Text
                                                </button>

                                                {!isSelected ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onSelectProfile(profile.id);
                                                            setIsLibraryOpen(false);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                                                    >
                                                        <span>Select Active</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                        <Check className="w-3.5 h-3.5" /> Currently Applied
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Starter templates box */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 mt-4">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    Starter Templates for Different Disciplines
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Need a tailored version for another field? Clone one of our field-proven templates:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                    {STARTER_CV_TEMPLATES.map((tpl, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => openCreateModal(tpl)}
                                            className="text-left p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 rounded-lg transition-all group"
                                        >
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                                {tpl.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate">
                                                {tpl.targetField}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsLibraryOpen(false)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
                            >
                                Close Library
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create or Edit Version */}
            {(isCreateModalOpen || editingProfile) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-600" />
                                {editingProfile ? 'Edit CV Version Profile' : 'Create Tailored CV Version'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setEditingProfile(null);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={editingProfile ? handleSaveEdit : handleSaveNewProfile} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Version Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. AI & Machine Learning Focus, Germany TU9 Application"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Target Field / Discipline *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={formTargetField}
                                        onChange={(e) => setFormTargetField(e.target.value)}
                                        placeholder="e.g. Artificial Intelligence, Bioengineering"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Target Universities / Labs (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={formInstitutions}
                                        onChange={(e) => setFormInstitutions(e.target.value)}
                                        placeholder="e.g. TUM, KAIST, Max Planck Institute"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Notes & Tailoring Strategy (Optional)
                                </label>
                                <input
                                    type="text"
                                    maxLength={1000}
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    placeholder="e.g. Emphasize PyTorch, GPU clustering, and undergrad thesis awards"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">
                                        CV Content (Raw Text) *
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        {formText.length}/20000 characters
                                    </span>
                                </div>
                                <textarea
                                    required
                                    maxLength={20000}
                                    rows={10}
                                    value={formText}
                                    onChange={(e) => setFormText(e.target.value)}
                                    placeholder="Paste or write the tailored academic CV here..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-mono text-[11px] leading-relaxed"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setEditingProfile(null);
                                    }}
                                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                                >
                                    {editingProfile ? 'Save Changes' : 'Save Version'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Preview Profile Text */}
            {previewProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {previewProfile.name}
                                </h4>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400">
                                    {previewProfile.targetField}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewProfile(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950">
                            {previewProfile.text}
                        </div>
                        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-[11px] text-slate-400">
                                {previewProfile.text.split(/\s+/).filter(Boolean).length} words
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectProfile(previewProfile.id);
                                        setPreviewProfile(null);
                                        setIsLibraryOpen(false);
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                                >
                                    Apply as Active CV
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewProfile(null)}
                                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
