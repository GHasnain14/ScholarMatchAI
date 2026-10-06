import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    X, 
    Copy, 
    Check, 
    Sparkles, 
    RefreshCw, 
    Briefcase, 
    User, 
    Award, 
    BookOpen, 
    ExternalLink, 
    Smile, 
    CheckCircle2, 
    AlertCircle, 
    ChevronDown, 
    ChevronUp,
    FileText,
    Layers,
    Tag,
    Edit3,
    Eye,
    HelpCircle
} from 'lucide-react';
import { CvProfile, CvAnalysis, LinkedInProfileData, LinkedInExperienceItem } from '../types';
import { generateLinkedInContentFromProfile } from '../utils/linkedInFormatter';
import { generateLinkedInBlocks } from '../services/geminiService';

export const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className} 
        aria-hidden="true"
    >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37z" />
    </svg>
);

interface LinkedInFormatterModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeProfile: CvProfile | null;
    cvText: string;
    cvAnalysis: CvAnalysis | null;
}

type TabType = 'about' | 'experience' | 'headlines';
type AboutStyle = 'academic' | 'industry' | 'concise';

export const LinkedInFormatterModal: React.FC<LinkedInFormatterModalProps> = ({
    isOpen,
    onClose,
    activeProfile,
    cvText,
    cvAnalysis,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('about');
    const [aboutStyle, setAboutStyle] = useState<AboutStyle>('academic');
    const [useEmojis, setUseEmojis] = useState<boolean>(true);
    const [includeContact, setIncludeContact] = useState<boolean>(true);
    const [customContactNote, setCustomContactNote] = useState<string>('');
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [showTips, setShowTips] = useState<boolean>(false);

    // Initial deterministic data
    const initialData = useMemo(() => {
        if (!activeProfile && !cvText) return null;
        const profileToUse: CvProfile = activeProfile || {
            id: 'temp',
            name: 'Academic Profile',
            targetField: 'Academic Research & Technology',
            text: cvText,
            isDefault: true,
            createdAt: '',
            updatedAt: '',
        };
        return generateLinkedInContentFromProfile(profileToUse, cvText, cvAnalysis, {
            useEmojis,
            includeContact,
            customContactNote: customContactNote.trim() || undefined,
        });
    }, [activeProfile, cvText, cvAnalysis, useEmojis, includeContact, customContactNote]);

    // Active working data state
    const [linkedInData, setLinkedInData] = useState<LinkedInProfileData | null>(initialData);

    // Editable text buffers
    const [editedAboutAcademic, setEditedAboutAcademic] = useState<string>('');
    const [editedAboutIndustry, setEditedAboutIndustry] = useState<string>('');
    const [editedAboutConcise, setEditedAboutConcise] = useState<string>('');
    const [editedExperienceAll, setEditedExperienceAll] = useState<string>('');

    // Synchronize initial data into editable state
    useEffect(() => {
        if (initialData) {
            setLinkedInData(initialData);
            setEditedAboutAcademic(initialData.aboutAcademic);
            setEditedAboutIndustry(initialData.aboutIndustry);
            setEditedAboutConcise(initialData.aboutConcise);
            setEditedExperienceAll(initialData.experienceFormattedAll);
        }
    }, [initialData]);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Copy to clipboard helper
    const handleCopy = useCallback(async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2400);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    }, []);

    // Current active "About" text based on selected style
    const currentAboutText = useMemo(() => {
        if (aboutStyle === 'academic') return editedAboutAcademic;
        if (aboutStyle === 'industry') return editedAboutIndustry;
        return editedAboutConcise;
    }, [aboutStyle, editedAboutAcademic, editedAboutIndustry, editedAboutConcise]);

    const setAboutTextForCurrentStyle = (val: string) => {
        if (aboutStyle === 'academic') setEditedAboutAcademic(val);
        else if (aboutStyle === 'industry') setEditedAboutIndustry(val);
        else setEditedAboutConcise(val);
    };

    // AI Generation handler
    const handleGenerateWithAi = async () => {
        if (!cvText) return;
        setIsAiLoading(true);
        setAiError(null);
        try {
            const result = await generateLinkedInBlocks({
                cvText,
                profileName: activeProfile?.name || 'Academic Candidate',
                targetField: activeProfile?.targetField || 'Academic Research',
                targetInstitutions: activeProfile?.targetInstitutions || '',
                useEmojis,
                customInstructions: customPrompt.trim() || undefined,
            });

            setLinkedInData(result);
            setEditedAboutAcademic(result.aboutAcademic);
            setEditedAboutIndustry(result.aboutIndustry);
            setEditedAboutConcise(result.aboutConcise);
            setEditedExperienceAll(result.experienceFormattedAll);
        } catch (err: any) {
            console.error('AI generation error:', err);
            setAiError(err.message || 'Failed to generate with AI. Deterministic format remains available.');
        } finally {
            setIsAiLoading(false);
        }
    };

    if (!isOpen) return null;

    // Character count metrics for LinkedIn About section (2,600 character limit)
    const aboutCharCount = currentAboutText.length;
    const aboutMaxChars = 2600;
    const charPercentage = Math.min(100, Math.round((aboutCharCount / aboutMaxChars) * 100));

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-transparent dark:from-slate-850 dark:to-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md shadow-[#0A66C2]/25 shrink-0">
                            <LinkedInIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    LinkedIn Profile Text Optimizer
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-[#0A66C2] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                                    <Sparkles className="w-3 h-3" />
                                    Active CV Profile
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span>Profile: <strong className="text-slate-700 dark:text-slate-200">{activeProfile?.name || 'Default Academic Profile'}</strong></span>
                                <span>•</span>
                                <span>Field: <strong className="text-slate-700 dark:text-slate-200">{activeProfile?.targetField || 'Academic Research'}</strong></span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Tabs Navigation */}
                <div className="px-6 pt-3 pb-0 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('about')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                                activeTab === 'about'
                                    ? 'border-[#0A66C2] text-[#0A66C2] dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>LinkedIn "About" Section</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('experience')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                                activeTab === 'experience'
                                    ? 'border-[#0A66C2] text-[#0A66C2] dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>LinkedIn "Experience" Entries</span>
                            {linkedInData?.experienceEntries && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                                    {linkedInData.experienceEntries.length}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('headlines')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                                activeTab === 'headlines'
                                    ? 'border-[#0A66C2] text-[#0A66C2] dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Tag className="w-4 h-4" />
                            <span>Headlines & Skills</span>
                        </button>
                    </div>

                    {/* How to Paste Guide Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowTips(!showTips)}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#0A66C2] dark:hover:text-blue-400 flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-750 transition-colors"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Where to paste on LinkedIn?</span>
                        {showTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>

                {/* Collapsible Tips Banner */}
                {showTips && (
                    <div className="bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200/60 dark:border-blue-900/60 px-6 py-3 text-xs text-slate-700 dark:text-slate-300 animate-in slide-in-from-top-1 duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-[#0A66C2] bg-white dark:bg-blue-900 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-2xs">1. About</span>
                                <p>On your LinkedIn profile page, scroll to the <strong>About</strong> section and click the <strong>✏️ Edit pencil icon</strong>. Paste the generated text block directly into the text field and click <strong>Save</strong>.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-[#0A66C2] bg-white dark:bg-blue-900 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-2xs">2. Experience</span>
                                <p>Scroll to <strong>Experience</strong>, click <strong>➕ Add position</strong> or the ✏️ pencil on your role. Paste into the <strong>Description</strong> field, and copy the suggested skill tags into the <strong>Skills</strong> field.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Error Notice if any */}
                    {aiError && (
                        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3.5 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{aiError}</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setAiError(null)} 
                                className="font-bold text-amber-700 dark:text-amber-300 hover:underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* TAB 1: LINKEDIN ABOUT SECTION */}
                    {activeTab === 'about' && (
                        <div className="space-y-5">
                            {/* Style Selectors & Controls */}
                            <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
                                        Audience & Formatting Focus
                                    </label>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => setAboutStyle('academic')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                aboutStyle === 'academic'
                                                    ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-xs'
                                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                                            }`}
                                        >
                                            🎓 Academic & Scholar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAboutStyle('industry')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                aboutStyle === 'industry'
                                                    ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-xs'
                                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                                            }`}
                                        >
                                            🚀 Industry & Applied R&D
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAboutStyle('concise')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                aboutStyle === 'concise'
                                                    ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-xs'
                                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                                            }`}
                                        >
                                            ⚡ Concise & Punchy
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 flex-wrap">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={useEmojis}
                                            onChange={(e) => setUseEmojis(e.target.checked)}
                                            className="rounded text-[#0A66C2] focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                        />
                                        <span>Use LinkedIn Emojis</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={includeContact}
                                            onChange={(e) => setIncludeContact(e.target.checked)}
                                            className="rounded text-[#0A66C2] focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                        />
                                        <span>Include Networking CTA</span>
                                    </label>
                                </div>
                            </div>

                            {/* Textarea Header Bar with Character Counter */}
                            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-[#0A66C2]" />
                                        Formatted LinkedIn "About" Block
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                        aboutCharCount > 2500 
                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                            : aboutCharCount > 2000
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    }`}>
                                        {aboutCharCount.toLocaleString()} / 2,600 characters ({charPercentage}%)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>{isEditing ? 'Done Editing' : 'Customize Text'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Progress bar for character limit */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${
                                        charPercentage > 95 ? 'bg-rose-500' : charPercentage > 80 ? 'bg-amber-500' : 'bg-[#0A66C2]'
                                    }`}
                                    style={{ width: `${charPercentage}%` }}
                                />
                            </div>

                            {/* Text Area */}
                            <div className="relative">
                                <textarea
                                    value={currentAboutText}
                                    onChange={(e) => setAboutTextForCurrentStyle(e.target.value)}
                                    rows={14}
                                    className="w-full p-4 font-sans text-sm bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-slate-100 leading-relaxed shadow-inner"
                                    placeholder="LinkedIn About text block..."
                                />
                            </div>

                            {/* Action Bar for Copying */}
                            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    💡 <em>Tip:</em> LinkedIn's algorithm favors profiles with structured bullet points and relevant technical keywords.
                                </p>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(currentAboutText, 'about')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0A66C2] hover:bg-[#084e96] transition-all shadow-md shadow-[#0A66C2]/20 active:scale-95"
                                    >
                                        {copiedKey === 'about' ? (
                                            <>
                                                <Check className="w-4 h-4 text-emerald-300" />
                                                <span>Copied to Clipboard!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                <span>Copy "About" to Clipboard</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: LINKEDIN EXPERIENCE ENTRIES */}
                    {activeTab === 'experience' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#0A66C2]" />
                                        Extracted Experience & Project Entries
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                        Formatted with Google/Harvard action-verb frameworks and tagged with skills ready to paste into LinkedIn Experience.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleCopy(editedExperienceAll, 'exp-all')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0A66C2] hover:bg-[#084e96] transition-all shadow-xs"
                                >
                                    {copiedKey === 'exp-all' ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                                            <span>Copied All Entries!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy All Experience Entries</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* List of individual experience cards */}
                            {linkedInData?.experienceEntries && linkedInData.experienceEntries.length > 0 ? (
                                <div className="space-y-4">
                                    {linkedInData.experienceEntries.map((item, idx) => (
                                        <div 
                                            key={item.id || idx}
                                            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:shadow-md transition-shadow space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                                        {item.roleTitle}
                                                    </h5>
                                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                        {item.organization} • <span className="text-slate-500">{item.period}</span>
                                                        {item.location && <span> • {item.location}</span>}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(item.formattedBlock, `exp-${idx}`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0A66C2] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-900 transition-colors shadow-2xs"
                                                >
                                                    {copiedKey === `exp-${idx}` ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span>Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Copy Position</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Preformatted block preview */}
                                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                {item.formattedBlock}
                                            </div>

                                            {/* Skill tags */}
                                            {item.skills && item.skills.length > 0 && (
                                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                    <span className="text-[11px] font-bold text-slate-500">Skills to tag:</span>
                                                    {item.skills.map((skill, sIdx) => (
                                                        <span 
                                                            key={sIdx} 
                                                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-xs text-slate-500">
                                    No experience entries detected in CV text.
                                </div>
                            )}

                            {/* Bulk all-in-one raw text area */}
                            <div className="pt-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                                    All Experience Entries (Combined Copy Block)
                                </label>
                                <textarea
                                    value={editedExperienceAll}
                                    onChange={(e) => setEditedExperienceAll(e.target.value)}
                                    rows={8}
                                    className="w-full p-4 font-mono text-xs bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 leading-relaxed shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 3: HEADLINES & TOP SKILLS */}
                    {activeTab === 'headlines' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                                    <Tag className="w-4 h-4 text-[#0A66C2]" />
                                    Optimized LinkedIn Headlines (<span className="text-xs font-normal text-slate-500">Max 220 characters</span>)
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                                    Catchy, keyword-dense headlines designed to rank well in academic recruitment and industry talent searches.
                                </p>

                                <div className="space-y-3">
                                    {linkedInData?.headlineIdeas?.map((headline, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                                                    {headline}
                                                </p>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {headline.length} / 220 chars
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleCopy(headline, `hl-${idx}`)}
                                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0A66C2] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-900 transition-colors shadow-2xs"
                                            >
                                                {copiedKey === `hl-${idx}` ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span>Copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Skills to Pin */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            Top Skills to Pin on LinkedIn Profile
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Add these 5-8 verified skills to your LinkedIn skills assessment section.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleCopy(linkedInData?.topSkills?.join(', ') || '', 'skills-all')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        {copiedKey === 'skills-all' ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>Copied All!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Copy All as Tags</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {linkedInData?.topSkills?.map((skill, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleCopy(skill, `skill-${idx}`)}
                                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900 hover:border-indigo-400 transition-all cursor-pointer"
                                            title="Click to copy single skill"
                                        >
                                            <span>{skill}</span>
                                            {copiedKey === `skill-${idx}` ? (
                                                <Check className="w-3 h-3 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3 h-3 text-indigo-400 opacity-60 group-hover:opacity-100" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Polish / Custom Instructions Accordion */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#0A66C2]" />
                                AI Custom Refinement (Gemini)
                            </label>
                            <span className="text-[11px] text-slate-400">Optional custom instructions</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g., Emphasize my wet lab PCR skills, make tone more conversational, highlight German PhD ambitions..."
                                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateWithAi}
                                disabled={isAiLoading}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xs disabled:opacity-50 shrink-0"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                                <span>{isAiLoading ? 'Polishing...' : 'Polish with AI'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Formatted specifically for LinkedIn desktop & mobile layouts
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
