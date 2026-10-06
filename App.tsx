import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CVUploader } from './components/CVUploader';
import { GeneratedContent } from './components/GeneratedContent';
import { Spinner } from './components/Spinner';
import { ScholarshipCard } from './components/ScholarshipCard';
import { CvSummaryCard } from './components/CvSummaryCard';
import { CvRadarChart } from './components/CvRadarChart';
import { ApplicationTracker } from './components/ApplicationTracker';
import { WatermarkRemover } from './components/WatermarkRemover';
import { MasterProgramsExplorer } from './components/MasterProgramsExplorer';
import { DeadlineNotificationCenter } from './components/DeadlineNotificationCenter';
import { LinkedInFormatterModal, LinkedInIcon } from './components/LinkedInFormatterModal';
import { GoogleScholarModal, GoogleScholarIcon } from './components/GoogleScholarModal';
import { 
    checkAndTrigger3DayNotifications, 
    requestBrowserNotificationPermission, 
    getNotificationPermission, 
    calculateDaysRemaining 
} from './services/deadlineNotificationService';
import { 
    findPositions, 
    findPositionsInKorea, 
    findPositionsInFrance, 
    findErasmusMundusPositions, 
    findPositionsInUSA, 
    findPositionsInCanada, 
    findPositionsInUK,
    findPositionsInGermany,
    findPositionsInJapan,
    findPositionsInAustralia,
    findPositionsInSingapore,
    findPositionsInPoland, 
    findPositionsInBelgium, 
    draftDocument, 
    analyzeCv 
} from './services/geminiService';
import { Scholarship, DocumentType, Tab, CvAnalysis, PositionSearchType, CvProfile } from './types';
import { 
    signInWithGoogle, 
    signOutUser, 
    subscribeToAuthChanges, 
    subscribeToCvProfiles, 
    saveCvProfileToFirestore, 
    deleteCvProfileFromFirestore, 
    testConnection 
} from './services/firebaseService';
import { 
    loadLocalProfiles, 
    saveLocalProfiles, 
    getActiveProfileId, 
    setActiveProfileId, 
    mergeLocalAndCloudProfiles 
} from './utils/cvProfileManager';
import { CvVersionSwitcher } from './components/CvVersionSwitcher';
import { User } from 'firebase/auth';
import { 
    FileText, 
    Search, 
    Mail, 
    FileType, 
    Bell, 
    Calendar, 
    Download, 
    Sparkles, 
    SlidersHorizontal, 
    Star, 
    Award, 
    Layers, 
    CheckCircle2, 
    ArrowRight,
    Compass,
    BookmarkCheck,
    BarChart2,
    RefreshCw,
    Filter,
    Flame,
    ShieldCheck,
    GraduationCap,
    Clock
} from 'lucide-react';
import { exportAllDocumentsDossierToPdf } from './utils/pdfExport';
import confetti from 'canvas-confetti';

const COUNTRY_OPTIONS = [
    { type: PositionSearchType.Global, label: 'Global (All Countries)', flag: '🌐', color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { type: PositionSearchType.ErasmusMundus, label: 'Erasmus Mundus (EU)', flag: '🇪🇺', color: 'from-violet-600 to-purple-600', shadow: 'shadow-purple-500/20' },
    { type: PositionSearchType.USA, label: 'United States (R1/NSF)', flag: '🇺🇸', color: 'from-rose-600 to-red-600', shadow: 'shadow-rose-500/20' },
    { type: PositionSearchType.Canada, label: 'Canada (U15/NSERC)', flag: '🇨🇦', color: 'from-red-600 to-orange-600', shadow: 'shadow-red-500/20' },
    { type: PositionSearchType.UK, label: 'United Kingdom (Russell)', flag: '🇬🇧', color: 'from-blue-700 to-sky-700', shadow: 'shadow-blue-500/20' },
    { type: PositionSearchType.Germany, label: 'Germany (Max Planck/TU9)', flag: '🇩🇪', color: 'from-amber-600 to-yellow-600', shadow: 'shadow-amber-500/20' },
    { type: PositionSearchType.SouthKorea, label: 'South Korea (KAIST/SNU)', flag: '🇰🇷', color: 'from-pink-600 to-rose-600', shadow: 'shadow-pink-500/20' },
    { type: PositionSearchType.Japan, label: 'Japan (Tokyo/Kyoto/MEXT)', flag: '🇯🇵', color: 'from-red-700 to-rose-700', shadow: 'shadow-red-500/20' },
    { type: PositionSearchType.France, label: 'France (CNRS/Saclay)', flag: '🇫🇷', color: 'from-indigo-600 to-blue-600', shadow: 'shadow-indigo-500/20' },
    { type: PositionSearchType.Australia, label: 'Australia (Group of 8)', flag: '🇦🇺', color: 'from-teal-600 to-emerald-600', shadow: 'shadow-teal-500/20' },
    { type: PositionSearchType.Singapore, label: 'Singapore (NUS/NTU)', flag: '🇸🇬', color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { type: PositionSearchType.Poland, label: 'Poland (Warsaw/NAWA)', flag: '🇵🇱', color: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/20' },
    { type: PositionSearchType.Belgium, label: 'Belgium (KU Leuven/FWO)', flag: '🇧🇪', color: 'from-orange-600 to-amber-600', shadow: 'shadow-orange-500/20' },
];

const TONES = [
    'Formal & Academic',
    'Passionate & Visionary',
    'Direct & Concise',
    'Collaborative & Inquisitive',
];

const IELTS_LEVELS = [
    { level: 6, label: 'Band 6.5 - Competent' },
    { level: 7, label: 'Band 7.5 - Good' },
    { level: 8, label: 'Band 8.5 - Very Good (Recommended)' },
    { level: 9, label: 'Band 9.0 - Expert Native' },
];

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.FindPositions);
    const [activeTheme, setActiveTheme] = useState<string>('vibrant');

    // Firebase Auth State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

    // CV Profiles (Local Storage & Cloud persistence)
    const [profiles, setProfiles] = useState<CvProfile[]>(() => loadLocalProfiles());
    const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => {
        const saved = getActiveProfileId();
        const initial = loadLocalProfiles();
        if (saved && initial.some(p => p.id === saved)) {
            return saved;
        }
        return initial[0]?.id || null;
    });

    const [cvText, setCvText] = useState<string>(() => {
        const initial = loadLocalProfiles();
        const saved = getActiveProfileId();
        const active = initial.find(p => p.id === saved) || initial[0];
        return active ? active.text : (localStorage.getItem('scholar_cv_text') || '');
    });

    const [cvAnalysis, setCvAnalysis] = useState<CvAnalysis | null>(() => {
        const initial = loadLocalProfiles();
        const saved = getActiveProfileId();
        const active = initial.find(p => p.id === saved) || initial[0];
        if (active?.analysis) return active.analysis;
        try {
            const legacy = localStorage.getItem('scholar_cv_analysis');
            return legacy ? JSON.parse(legacy) : null;
        } catch {
            return null;
        }
    });

    const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [englishLevel, setEnglishLevel] = useState<number>(8);
    const [selectedTone, setSelectedTone] = useState<string>('Formal & Academic');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
        try {
            const saved = localStorage.getItem('scholar_opportunities');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [generatedDocuments, setGeneratedDocuments] = useState<Partial<Record<DocumentType, string>>>({});
    const [activeGeneratedDoc, setActiveGeneratedDoc] = useState<DocumentType | null>(null);
    const [positionDetails, setPositionDetails] = useState<string>('');
    const [draftFeedback, setDraftFeedback] = useState<string>('');
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
    const [watermarkInitialText, setWatermarkInitialText] = useState<string>('');
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState<boolean>(false);

    // Google Scholar Search & Paper Explorer State
    const [isGoogleScholarModalOpen, setIsGoogleScholarModalOpen] = useState<boolean>(false);
    const [scholarModalQuery, setScholarModalQuery] = useState<string>('');
    const [scholarModalAuthor, setScholarModalAuthor] = useState<string>('');
    const [scholarModalInstitution, setScholarModalInstitution] = useState<string>('');

    // Deadlines Tab sorting state
    const [deadlineSortOrder, setDeadlineSortOrder] = useState<'soonest' | 'farthest'>('soonest');

    // Active CV Profile memo
    const activeProfile = useMemo(() => {
        return profiles.find(p => p.id === activeProfileId) || profiles[0] || null;
    }, [profiles, activeProfileId]);

    // Search and Filtering State
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
    const [minMatchScore, setMinMatchScore] = useState<number>(75);
    const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

    // 1. Initialize Firebase & test connection on mount
    useEffect(() => {
        testConnection();

        const unsubscribeAuth = subscribeToAuthChanges(async (user) => {
            setCurrentUser(user);
            setIsAuthLoading(false);

            if (user) {
                // Sync current local profiles to Firestore under the user's account
                try {
                    const localProfiles = loadLocalProfiles();
                    for (const p of localProfiles) {
                        await saveCvProfileToFirestore(user.uid, p);
                    }
                } catch (e) {
                    console.debug('Initial local-to-cloud sync notice:', e);
                }
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // 2. Real-time Firestore sync when authenticated
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribeFirestore = subscribeToCvProfiles(
            currentUser.uid,
            (cloudProfiles) => {
                if (cloudProfiles && cloudProfiles.length > 0) {
                    setProfiles((prev) => {
                        const merged = mergeLocalAndCloudProfiles(prev, cloudProfiles);
                        saveLocalProfiles(merged);
                        return merged;
                    });
                }
            },
            (err) => {
                console.warn('Live CV profiles sync notice:', err);
            }
        );

        return () => unsubscribeFirestore();
    }, [currentUser]);

    const handleNavigateToWatermarkCleaner = useCallback((initialText?: string) => {
        if (initialText) {
            setWatermarkInitialText(initialText);
        }
        setActiveTab(Tab.WatermarkRemover);
    }, []);

    const handleSendCleanedToDocumentStudio = useCallback((text: string) => {
        const docToUpdate = activeGeneratedDoc || DocumentType.StatementOfPurpose;
        setGeneratedDocuments(prev => ({
            ...prev,
            [docToUpdate]: text,
        }));
        if (!activeGeneratedDoc) {
            setActiveGeneratedDoc(docToUpdate);
        }
        setActiveTab(Tab.DraftDocuments);
    }, [activeGeneratedDoc]);

    // Save to local storage on changes
    useEffect(() => {
        try {
            if (cvText) localStorage.setItem('scholar_cv_text', cvText);
            if (cvAnalysis) localStorage.setItem('scholar_cv_analysis', JSON.stringify(cvAnalysis));
            if (scholarships.length > 0) localStorage.setItem('scholar_opportunities', JSON.stringify(scholarships));
        } catch (e) {
            console.debug('LocalStorage write error:', e);
        }
    }, [cvText, cvAnalysis, scholarships]);

    // Automatic 3-Day Deadline Push Notification Monitor
    useEffect(() => {
        // Initial permission check
        const perm = getNotificationPermission();
        setNotificationsEnabled(perm === 'granted');

        // Check stored scholarship deadlines and trigger notifications specifically 3 days prior
        if (scholarships.length > 0) {
            checkAndTrigger3DayNotifications(scholarships);
        }

        // Check when tab returns to focus / visibility
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && scholarships.length > 0) {
                checkAndTrigger3DayNotifications(scholarships);
            }
        };

        // Listen for notification click event to navigate to Deadlines tab
        const handleNotificationClick = () => {
            setActiveTab(Tab.Deadlines);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('scholarship-notification-click', handleNotificationClick);

        // Periodic background interval check every 30 minutes
        const intervalId = setInterval(() => {
            if (scholarships.length > 0) {
                checkAndTrigger3DayNotifications(scholarships);
            }
        }, 30 * 60 * 1000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('scholarship-notification-click', handleNotificationClick);
            clearInterval(intervalId);
        };
    }, [scholarships]);

    const generateSummaryForCv = useCallback(async (text: string) => {
        if (!text || !text.trim()) {
            setCvAnalysis(null);
            return;
        }
        setIsGeneratingSummary(true);
        setSummaryError(null);
        try {
            const analysis = await analyzeCv(text);
            setCvAnalysis(analysis);

            // Cache analysis onto the active profile
            setProfiles((prev) => {
                const updated = prev.map((p) => {
                    if (p.id === activeProfileId) {
                        return { ...p, analysis, updatedAt: new Date().toISOString() };
                    }
                    return p;
                });
                saveLocalProfiles(updated);
                return updated;
            });
        } catch (err: any) {
            console.error('Failed to generate CV analysis:', err);
            setSummaryError(err?.message || 'Unable to generate candidate review. You can still search for positions or click Try Again.');
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [activeProfileId]);

    // Profile Management Handlers
    const handleSelectProfile = useCallback((profileId: string) => {
        const target = profiles.find(p => p.id === profileId);
        if (!target) return;
        setActiveProfileIdState(profileId);
        setActiveProfileId(profileId);
        setCvText(target.text);
        if (target.analysis) {
            setCvAnalysis(target.analysis);
        } else {
            generateSummaryForCv(target.text);
        }
    }, [profiles, generateSummaryForCv]);

    const handleCreateProfile = useCallback(async (newProfile: CvProfile) => {
        const updated = [newProfile, ...profiles];
        setProfiles(updated);
        saveLocalProfiles(updated);
        setActiveProfileIdState(newProfile.id);
        setActiveProfileId(newProfile.id);
        setCvText(newProfile.text);
        generateSummaryForCv(newProfile.text);

        if (currentUser) {
            try {
                await saveCvProfileToFirestore(currentUser.uid, newProfile);
            } catch (e) {
                console.error('Failed to save new profile to Firestore:', e);
            }
        }
    }, [profiles, currentUser, generateSummaryForCv]);

    const handleUpdateProfile = useCallback(async (updatedProfile: CvProfile) => {
        const updated = profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
        setProfiles(updated);
        saveLocalProfiles(updated);

        if (activeProfileId === updatedProfile.id) {
            setCvText(updatedProfile.text);
        }

        if (currentUser) {
            try {
                await saveCvProfileToFirestore(currentUser.uid, updatedProfile);
            } catch (e) {
                console.error('Failed to update profile in Firestore:', e);
            }
        }
    }, [profiles, activeProfileId, currentUser]);

    const handleDeleteProfile = useCallback(async (profileId: string) => {
        if (profiles.length <= 1) return;
        const remaining = profiles.filter(p => p.id !== profileId);
        setProfiles(remaining);
        saveLocalProfiles(remaining);

        if (activeProfileId === profileId) {
            const next = remaining[0];
            setActiveProfileIdState(next.id);
            setActiveProfileId(next.id);
            setCvText(next.text);
            if (next.analysis) {
                setCvAnalysis(next.analysis);
            } else {
                generateSummaryForCv(next.text);
            }
        }

        if (currentUser) {
            try {
                await deleteCvProfileFromFirestore(currentUser.uid, profileId);
            } catch (e) {
                console.error('Failed to delete profile from Firestore:', e);
            }
        }
    }, [profiles, activeProfileId, currentUser, generateSummaryForCv]);

    const handleSaveCurrentTextToActiveProfile = useCallback(async () => {
        if (!activeProfileId) return;
        const active = profiles.find(p => p.id === activeProfileId);
        if (!active) return;

        const updated: CvProfile = {
            ...active,
            text: cvText,
            analysis: cvAnalysis,
            updatedAt: new Date().toISOString(),
        };

        await handleUpdateProfile(updated);
    }, [activeProfileId, profiles, cvText, cvAnalysis, handleUpdateProfile]);

    const handleSignIn = async () => {
        try {
            setIsAuthLoading(true);
            const user = await signInWithGoogle();
            setCurrentUser(user);
            const localProfiles = loadLocalProfiles();
            for (const p of localProfiles) {
                await saveCvProfileToFirestore(user.uid, p);
            }
        } catch (e) {
            console.error('Sign-in failed:', e);
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOutUser();
            setCurrentUser(null);
        } catch (e) {
            console.error('Sign-out failed:', e);
        }
    };

    const handleCvUpload = (text: string) => {
        setCvText(text);
        setGeneratedDocuments({});
        setActiveGeneratedDoc(null);
        setError(null);
        generateSummaryForCv(text);

        // Also update active profile text
        if (activeProfileId) {
            setProfiles((prev) => {
                const updated = prev.map((p) => {
                    if (p.id === activeProfileId) {
                        return { ...p, text, updatedAt: new Date().toISOString() };
                    }
                    return p;
                });
                saveLocalProfiles(updated);
                return updated;
            });

            if (currentUser) {
                const active = profiles.find(p => p.id === activeProfileId);
                if (active) {
                    saveCvProfileToFirestore(currentUser.uid, { ...active, text, updatedAt: new Date().toISOString() })
                        .catch(err => console.debug('Auto-sync CV text failed:', err));
                }
            }
        }
    };

    const handleUpdateCvFromCleaner = (newCvText: string) => {
        handleCvUpload(newCvText);
    };

    const handleRegenerateSummary = () => {
        if (cvText) {
            generateSummaryForCv(cvText);
        }
    };

    const handleScholarshipFeedback = (scholarshipId: string, feedback: 'good' | 'poor') => {
        setScholarships(prev =>
            prev.map(s => (s.id === scholarshipId ? { ...s, feedback } : s))
        );
    };

    const handleUpdateDeadline = (scholarshipId: string, deadline: string) => {
        setScholarships(prev =>
            prev.map(s => (s.id === scholarshipId ? { ...s, deadline } : s))
        );
    };

    const handleToggleBookmark = (scholarshipId: string) => {
        setScholarships(prev =>
            prev.map(s => (s.id === scholarshipId ? { ...s, bookmarked: !s.bookmarked } : s))
        );
    };

    const handleUpdateStage = (scholarshipId: string, stage: Scholarship['stage']) => {
        setScholarships(prev =>
            prev.map(s => (s.id === scholarshipId ? { ...s, stage } : s))
        );
    };

    const handleUpdateNotes = (scholarshipId: string, notes: string) => {
        setScholarships(prev =>
            prev.map(s => (s.id === scholarshipId ? { ...s, notes } : s))
        );
    };

    const handleImportApplications = useCallback((imported: Scholarship[]) => {
        setScholarships((prev) => {
            const map = new Map<string, Scholarship>();
            prev.forEach(s => map.set(s.id || s.link, s));
            imported.forEach((imp, idx) => {
                const key = imp.id || imp.link || `imported-${Date.now()}-${idx}`;
                map.set(key, { ...map.get(key), ...imp, id: key, bookmarked: true });
            });
            const updated = Array.from(map.values());
            try {
                localStorage.setItem('scholar_opportunities', JSON.stringify(updated));
            } catch (e) {
                console.debug('LocalStorage write notice:', e);
            }
            return updated;
        });
    }, []);

    const requestNotificationPermission = async () => {
        try {
            const granted = await requestBrowserNotificationPermission();
            setNotificationsEnabled(granted);
            if (granted && scholarships.length > 0) {
                checkAndTrigger3DayNotifications(scholarships);
            }
        } catch (e) {
            console.debug('Notification permission request error:', e);
        }
    };

    const handleFindPositions = useCallback(async (searchType: PositionSearchType) => {
        if (!cvText) {
            setError('Please upload or select a sample CV first.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const goodMatches = scholarships.filter(s => s.feedback === 'good');
        const poorMatches = scholarships.filter(s => s.feedback === 'poor');
        let feedbackContext = '';
        if (goodMatches.length > 0 || poorMatches.length > 0) {
            feedbackContext = "Based on previous candidate feedback, refine the recommendations:\n";
            if (goodMatches.length > 0) {
                feedbackContext += "--- EXCELLENT MATCHES (prioritize labs with similar themes) ---\n" +
                    goodMatches.map(s => `- ${s.professorName} at ${s.institution} (${s.researchArea})`).join('\n') + '\n\n';
            }
            if (poorMatches.length > 0) {
                feedbackContext += "--- POOR MATCHES (avoid similar ones) ---\n" +
                    poorMatches.map(s => `- ${s.professorName} at ${s.institution} (${s.researchArea})`).join('\n');
            }
        }

        try {
            let results: Omit<Scholarship, 'id' | 'feedback'>[];
            switch (searchType) {
                case PositionSearchType.Global:
                    results = await findPositions(cvText, feedbackContext);
                    break;
                case PositionSearchType.ErasmusMundus:
                    results = await findErasmusMundusPositions(cvText, feedbackContext);
                    break;
                case PositionSearchType.USA:
                    results = await findPositionsInUSA(cvText, feedbackContext);
                    break;
                case PositionSearchType.Canada:
                    results = await findPositionsInCanada(cvText, feedbackContext);
                    break;
                case PositionSearchType.UK:
                    results = await findPositionsInUK(cvText, feedbackContext);
                    break;
                case PositionSearchType.Germany:
                    results = await findPositionsInGermany(cvText, feedbackContext);
                    break;
                case PositionSearchType.SouthKorea:
                    results = await findPositionsInKorea(cvText, feedbackContext);
                    break;
                case PositionSearchType.Japan:
                    results = await findPositionsInJapan(cvText, feedbackContext);
                    break;
                case PositionSearchType.France:
                    results = await findPositionsInFrance(cvText, feedbackContext);
                    break;
                case PositionSearchType.Australia:
                    results = await findPositionsInAustralia(cvText, feedbackContext);
                    break;
                case PositionSearchType.Singapore:
                    results = await findPositionsInSingapore(cvText, feedbackContext);
                    break;
                case PositionSearchType.Poland:
                    results = await findPositionsInPoland(cvText, feedbackContext);
                    break;
                case PositionSearchType.Belgium:
                    results = await findPositionsInBelgium(cvText, feedbackContext);
                    break;
                default:
                    results = [];
                    break;
            }

            const newScholarships: Scholarship[] = results.map((s, index) => ({
                ...s,
                id: `${s.professorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${index}`,
                bookmarked: false,
                stage: 'Discovered',
            }));

            setScholarships(newScholarships);

            try {
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                });
            } catch (e) {}
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Failed to find positions. Please check your network and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [cvText, scholarships]);

    const handleDraftDocument = useCallback(async (docType: DocumentType, detailsOverride?: string) => {
        if (!cvText) {
            setError('Please upload your CV first.');
            return;
        }

        const detailsToUse = detailsOverride ?? positionDetails;
        if (!detailsToUse) {
            setError('Please provide details about the professor, lab, or university.');
            return;
        }

        setGeneratedDocuments({});
        setDraftFeedback('');
        setActiveGeneratedDoc(null);
        setIsLoading(true);
        setError(null);

        try {
            const result = await draftDocument(
                cvText, 
                detailsToUse, 
                docType, 
                englishLevel,
                undefined,
                undefined,
                selectedTone
            );
            setGeneratedDocuments({ [docType]: result });
            setActiveGeneratedDoc(docType);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || `Failed to draft the ${docType}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    }, [cvText, positionDetails, englishLevel, selectedTone]);

    const handleDraftAllDocuments = useCallback(async () => {
        if (!cvText) {
            setError('Please upload your CV first.');
            return;
        }
        if (!positionDetails) {
            setError('Please provide details about the professor, lab, or university.');
            return;
        }

        setGeneratedDocuments({});
        setDraftFeedback('');
        setActiveGeneratedDoc(null);
        setIsLoading(true);
        setError(null);

        try {
            const docTypes = Object.values(DocumentType);
            const promises = docTypes.map(docType => 
                draftDocument(cvText, positionDetails, docType, englishLevel, undefined, undefined, selectedTone)
            );
            const results = await Promise.all(promises);

            const newDocs: Partial<Record<DocumentType, string>> = {};
            docTypes.forEach((docType, index) => {
                newDocs[docType] = results[index];
            });

            setGeneratedDocuments(newDocs);
            setActiveGeneratedDoc(docTypes[0]);

            try {
                confetti({
                    particleCount: 70,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            } catch (e) {}
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Failed to draft all documents. Some may have failed.');
        } finally {
            setIsLoading(false);
        }
    }, [cvText, positionDetails, englishLevel, selectedTone]);

    const handleRefineDraft = useCallback(async () => {
        if (!cvText || !activeGeneratedDoc || !generatedDocuments[activeGeneratedDoc] || !draftFeedback || !positionDetails) {
            setError('Cannot refine draft without all the required information.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await draftDocument(
                cvText,
                positionDetails,
                activeGeneratedDoc,
                englishLevel,
                generatedDocuments[activeGeneratedDoc],
                draftFeedback,
                selectedTone
            );
            setGeneratedDocuments(prev => ({
                ...prev,
                [activeGeneratedDoc]: result,
            }));
            setDraftFeedback('');
        } catch (e: any) {
            console.error(e);
            setError(e?.message || `Failed to refine the ${activeGeneratedDoc}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    }, [cvText, activeGeneratedDoc, generatedDocuments, draftFeedback, positionDetails, englishLevel, selectedTone]);

    const getFullUrl = (url: string): string => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const handleDraftDocumentFromCard = useCallback((scholarship: Scholarship, docType: DocumentType) => {
        setActiveTab(Tab.DraftDocuments);
        const details = `Professor/Program: ${scholarship.professorName}\nInstitution: ${scholarship.institution}\nResearch Area: ${scholarship.researchArea}\nCountry: ${scholarship.country || 'Global'}\nTier: ${scholarship.universityTier}\nLink: ${getFullUrl(scholarship.link)}\nReason for Match: ${scholarship.reasonForMatch}`;
        setPositionDetails(details);
        handleDraftDocument(docType, details);
    }, [handleDraftDocument]);

    // Google Scholar Explorer Handlers
    const handleOpenGoogleScholar = useCallback((query: string = '', author: string = '', inst: string = '') => {
        setScholarModalQuery(query);
        setScholarModalAuthor(author);
        setScholarModalInstitution(inst);
        setIsGoogleScholarModalOpen(true);
    }, []);

    const handleInsertScholarCitationIntoDraft = useCallback((citationText: string) => {
        setPositionDetails(prev => {
            const addition = `\n\n[RELEVANT PUBLICATION CITED]:\n${citationText}`;
            return prev ? `${prev}${addition}` : citationText;
        });
        setActiveTab(Tab.DraftDocuments);
        setIsGoogleScholarModalOpen(false);
    }, []);

    // Filter scholarships based on search query, tier, score, and bookmarked
    const filteredScholarships = useMemo(() => {
        return scholarships.filter(s => {
            const matchesQuery = !searchQuery.trim() || 
                s.professorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.researchArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.country && s.country.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTier = selectedTierFilter === 'all' || s.universityTier === selectedTierFilter;
            const matchesScore = (s.matchScore || 85) >= minMatchScore;
            const matchesBookmark = !onlyBookmarked || s.bookmarked;

            return matchesQuery && matchesTier && matchesScore && matchesBookmark;
        });
    }, [scholarships, searchQuery, selectedTierFilter, minMatchScore, onlyBookmarked]);

    const bookmarkedCount = scholarships.filter(s => s.bookmarked).length;

    // Upcoming deadlines sorted by user preference (Soonest First vs Farthest First)
    const upcomingDeadlines = useMemo(() => {
        const withDeadlines = scholarships.filter(s => Boolean(s.deadline));
        return [...withDeadlines].sort((a, b) => {
            const timeA = new Date(a.deadline!).getTime();
            const timeB = new Date(b.deadline!).getTime();
            if (isNaN(timeA) && isNaN(timeB)) return 0;
            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;
            return deadlineSortOrder === 'soonest' ? timeA - timeB : timeB - timeA;
        });
    }, [scholarships, deadlineSortOrder]);

    // Grouping by Tier
    const groupedScholarships = useMemo(() => {
        return filteredScholarships.reduce((acc, scholarship) => {
            const tier = scholarship.universityTier || 'Mid-Tier';
            if (!acc[tier]) acc[tier] = [];
            acc[tier].push(scholarship);
            return acc;
        }, {} as Record<string, Scholarship[]>);
    }, [filteredScholarships]);

    const tierOrder = ['Top-Tier', 'Mid-Tier', 'Low-Rank', 'Emerging'];
    const sortedTiers = Object.keys(groupedScholarships).sort((a, b) => {
        const indexA = tierOrder.indexOf(a);
        const indexB = tierOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const themeGradients: Record<string, { orb1: string; orb2: string; orb3: string; accent: string }> = {
        vibrant: {
            orb1: 'from-blue-600/25 via-indigo-500/20 to-pink-500/0',
            orb2: 'from-purple-600/25 via-pink-500/20 to-blue-500/0',
            orb3: 'from-emerald-500/20 via-cyan-500/15 to-indigo-500/0',
            accent: 'from-blue-600 to-indigo-600'
        },
        emerald: {
            orb1: 'from-emerald-600/30 via-teal-500/20 to-lime-500/0',
            orb2: 'from-teal-600/25 via-cyan-500/20 to-emerald-500/0',
            orb3: 'from-green-500/20 via-emerald-400/15 to-cyan-500/0',
            accent: 'from-emerald-600 to-teal-600'
        },
        purple: {
            orb1: 'from-purple-600/30 via-fuchsia-500/20 to-indigo-500/0',
            orb2: 'from-violet-600/25 via-pink-500/20 to-purple-500/0',
            orb3: 'from-indigo-500/20 via-purple-400/15 to-pink-500/0',
            accent: 'from-purple-600 to-fuchsia-600'
        },
        rose: {
            orb1: 'from-rose-600/30 via-red-500/20 to-amber-500/0',
            orb2: 'from-amber-600/25 via-orange-500/20 to-rose-500/0',
            orb3: 'from-orange-500/20 via-rose-400/15 to-amber-500/0',
            accent: 'from-rose-600 to-orange-600'
        }
    };

    const currentThemeStyle = themeGradients[activeTheme] || themeGradients.vibrant;

    return (
        <div className={`min-h-screen text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative overflow-x-hidden ${activeTheme === 'dark' ? 'dark' : ''}`}>
            {/* Vivid Multi-layered Academic Backdrop Illustration & Animated Meshes */}
            <div className="academic-mesh-backdrop fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
                {/* Mesh Orbs */}
                <div className={`mesh-orb-1 bg-gradient-to-tr ${currentThemeStyle.orb1}`} />
                <div className={`mesh-orb-2 bg-gradient-to-bl ${currentThemeStyle.orb2}`} />
                <div className={`mesh-orb-3 bg-gradient-to-r ${currentThemeStyle.orb3}`} />

                {/* Subtle Geometric Pattern Overlay */}
                <div className="academic-grid-pattern" />

                {/* Academic Graphic Elements / Floating Constellation SVG */}
                <svg className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="academicLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                        </linearGradient>
                        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Constellation Nodes & Connecting Research Vectors */}
                    <g className="animate-pulse" style={{ animationDuration: '6s' }}>
                        <circle cx="12%" cy="18%" r="4" fill="#3b82f6" opacity="0.6" />
                        <circle cx="28%" cy="12%" r="6" fill="#8b5cf6" opacity="0.5" />
                        <circle cx="45%" cy="22%" r="5" fill="#ec4899" opacity="0.6" />
                        <circle cx="78%" cy="15%" r="7" fill="#6366f1" opacity="0.5" />
                        <circle cx="88%" cy="28%" r="4" fill="#10b981" opacity="0.6" />
                        <circle cx="65%" cy="38%" r="5" fill="#f59e0b" opacity="0.5" />
                        <circle cx="20%" cy="45%" r="6" fill="#06b6d4" opacity="0.5" />
                        <circle cx="82%" cy="65%" r="5" fill="#a855f7" opacity="0.6" />
                        <circle cx="35%" cy="75%" r="7" fill="#3b82f6" opacity="0.5" />
                        <circle cx="15%" cy="85%" r="4" fill="#ec4899" opacity="0.6" />

                        {/* Connecting Constellation Vectors */}
                        <line x1="12%" y1="18%" x2="28%" y2="12%" stroke="url(#academicLineGrad)" strokeWidth="1.2" strokeDasharray="3 3" />
                        <line x1="28%" y1="12%" x2="45%" y2="22%" stroke="url(#academicLineGrad)" strokeWidth="1.2" />
                        <line x1="45%" y1="22%" x2="78%" y2="15%" stroke="url(#academicLineGrad)" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="78%" y1="15%" x2="88%" y2="28%" stroke="url(#academicLineGrad)" strokeWidth="1.2" />
                        <line x1="88%" y1="28%" x2="65%" y2="38%" stroke="url(#academicLineGrad)" strokeWidth="1" />
                        <line x1="65%" y1="38%" x2="82%" y2="65%" stroke="url(#academicLineGrad)" strokeWidth="1.2" strokeDasharray="3 3" />
                        <line x1="20%" y1="45%" x2="35%" y2="75%" stroke="url(#academicLineGrad)" strokeWidth="1.2" />
                        <line x1="35%" y1="75%" x2="15%" y2="85%" stroke="url(#academicLineGrad)" strokeWidth="1" />
                    </g>
                </svg>
            </div>

            <div className="relative z-10">
                <Header 
                    activeTab={activeTab}
                    onSelectTab={setActiveTab}
                    savedCount={bookmarkedCount}
                    deadlinesCount={upcomingDeadlines.length}
                    activeTheme={activeTheme}
                    onChangeTheme={setActiveTheme}
                    currentUser={currentUser}
                    isAuthLoading={isAuthLoading}
                    onSignIn={handleSignIn}
                    onSignOut={handleSignOut}
                    cvVersionsCount={profiles.length}
                    onOpenGoogleScholar={() => handleOpenGoogleScholar(searchQuery || 'Academic Research', '', '')}
                />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
                {/* Step 1: Candidate CV & Profile Section */}
                <section id="cv-section" className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-500/5 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                                1
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Candidate Profile & Academic CV
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Save, switch, and tailor multiple CV versions for different fields or universities with automatic cloud persistence.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsLinkedInModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0A66C2] hover:bg-[#084e96] transition-all shadow-md shadow-[#0A66C2]/20 active:scale-95 cursor-pointer"
                            title="Generate formatted text block for LinkedIn About & Experience"
                        >
                            <LinkedInIcon className="w-4 h-4" />
                            <span>LinkedIn Profile Optimizer</span>
                        </button>
                    </div>

                    {/* CV Version Switcher & Multi-field Library */}
                    <CvVersionSwitcher
                        profiles={profiles}
                        activeProfileId={activeProfileId}
                        onSelectProfile={handleSelectProfile}
                        onCreateProfile={handleCreateProfile}
                        onUpdateProfile={handleUpdateProfile}
                        onDeleteProfile={handleDeleteProfile}
                        currentCvText={cvText}
                        onSaveCurrentTextToActiveProfile={handleSaveCurrentTextToActiveProfile}
                        isCloudSynced={Boolean(currentUser)}
                        userEmail={currentUser?.email}
                        onSignInPrompt={handleSignIn}
                        onOpenLinkedIn={() => setIsLinkedInModalOpen(true)}
                    />

                    <CVUploader 
                        onCvUpload={handleCvUpload} 
                        currentCvText={cvText}
                        onCleanWatermarks={handleNavigateToWatermarkCleaner}
                    />

                    {/* Visual Academic Score (0-100) & 3 Specific Profile Strengthening Suggestions */}
                    {(cvText || isGeneratingSummary) && (
                        <div className="pt-2">
                            <CvSummaryCard
                                analysis={cvAnalysis}
                                isLoading={isGeneratingSummary}
                                error={summaryError}
                                onRegenerate={handleRegenerateSummary}
                                onExploreField={(field) => {
                                    setSearchQuery(field);
                                    setActiveTab(Tab.FindPositions);
                                }}
                                onNavigateToRadar={() => setActiveTab(Tab.CvInsights)}
                                onOpenLinkedIn={() => setIsLinkedInModalOpen(true)}
                                compact={true}
                            />
                        </div>
                    )}

                    {/* Writing Level & Tone Selector */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English Level */}
                        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                    Writing Proficiency Level (IELTS Scale)
                                </label>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                    Band {englishLevel}.0
                                </span>
                            </div>
                            <input
                                type="range"
                                min="6"
                                max="9"
                                step="1"
                                value={englishLevel}
                                onChange={(e) => setEnglishLevel(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                                {IELTS_LEVELS.map(l => (
                                    <span key={l.level} className={englishLevel === l.level ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>
                                        {l.level}.0 ({l.level === 8 ? 'Recommended' : l.level === 9 ? 'Expert' : 'Standard'})
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tone Selector */}
                        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
                                Outreach & Application Tone
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {TONES.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setSelectedTone(t)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                            selectedTone === t
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-600'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Dynamic View Content */}
                <section id="main-view-content" className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-center justify-between gap-3 shadow-md">
                            <span className="font-semibold">{error}</span>
                            <button onClick={() => setError(null)} className="text-xs underline font-bold">Dismiss</button>
                        </div>
                    )}

                    {/* TAB: MASTER'S DEGREE & CURRICULUM EXPLORER */}
                    {activeTab === Tab.MasterPrograms && (
                        <MasterProgramsExplorer
                            cvText={cvText}
                            onNavigateToTab={(tab) => setActiveTab(tab as Tab)}
                            onSendToWatermarkRemover={(text) => {
                                handleNavigateToWatermarkCleaner(text);
                            }}
                            onSendToDocumentStudio={(text, title) => {
                                setPositionDetails(title || 'Target Master Program');
                                setGeneratedDocuments((prev) => ({
                                    ...prev,
                                    [DocumentType.MotivationLetter]: text,
                                }));
                                setActiveGeneratedDoc(DocumentType.MotivationLetter);
                                setActiveTab(Tab.DraftDocuments);
                            }}
                        />
                    )}

                    {/* TAB 1: FIND POSITIONS */}
                    {activeTab === Tab.FindPositions && (
                        <div className="space-y-8">
                            {/* Callout Banner to Master's Programs */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-500/30">
                                <div className="space-y-1 text-center sm:text-left">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        NEW: Master's Degree Engine
                                    </div>
                                    <h4 className="text-base sm:text-lg font-black tracking-tight">
                                        Looking for Master's Programs in Germany & Worldwide?
                                    </h4>
                                    <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                                        Browse accredited universities by country, inspect official department curricula, Uni-Assist / VPD steps, tuition-free rankings, and craft tailored Motivation Letters.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(Tab.MasterPrograms)}
                                    className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-blue-50 font-black text-xs shrink-0 shadow-md transition-all flex items-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                                >
                                    <span>Explore Master's Programs</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* CV Review Banner Card */}
                            <CvSummaryCard
                                analysis={cvAnalysis}
                                isLoading={isGeneratingSummary}
                                error={summaryError}
                                onRegenerate={handleRegenerateSummary}
                                onExploreField={(field) => {
                                    setSearchQuery(field);
                                }}
                            />

                            {/* Vibrant Multi-Country Search Grid */}
                            <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <Compass className="w-5 h-5 text-blue-600" />
                                            Explore Funded Lab Positions & Fellowships
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Select a target region to run an AI match against current active lab openings.
                                        </p>
                                    </div>
                                    {scholarships.length > 0 && (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                                            {scholarships.length} Positions Discovered
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {COUNTRY_OPTIONS.map((c) => (
                                        <button
                                            key={c.type}
                                            type="button"
                                            onClick={() => handleFindPositions(c.type)}
                                            disabled={isLoading || !cvText}
                                            className={`p-3.5 rounded-2xl bg-gradient-to-r ${c.color} text-white font-bold text-xs flex flex-col items-start justify-between min-h-[78px] shadow-md ${c.shadow} hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all group`}
                                        >
                                            <span className="text-xl mb-1 group-hover:scale-125 transition-transform">{c.flag}</span>
                                            <span className="leading-tight text-left">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search, Filter & Sorter Toolbar */}
                            {scholarships.length > 0 && (
                                <div className="rounded-2xl bg-white dark:bg-slate-850 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
                                    {/* Search Input */}
                                    <div className="flex-1 min-w-[240px] relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by professor, university, or keyword (e.g. Robotics, KAIST)..."
                                            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                                        />
                                    </div>

                                    {/* Tier Filters */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto">
                                        {['all', 'Top-Tier', 'Mid-Tier', 'Low-Rank'].map((tier) => (
                                            <button
                                                key={tier}
                                                type="button"
                                                onClick={() => setSelectedTierFilter(tier)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                                    selectedTierFilter === tier
                                                        ? 'bg-blue-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                                }`}
                                            >
                                                {tier === 'all' ? 'All Tiers' : tier}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Bookmarked Only Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                            onlyBookmarked
                                                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Star className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-white' : ''}`} />
                                        <span>Saved ({bookmarkedCount})</span>
                                    </button>
                                </div>
                            )}

                            {isLoading && (
                                <div className="py-12 text-center space-y-4">
                                    <Spinner />
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                                        Searching faculty rosters, funded lab grants, and top research opportunities matching your CV...
                                    </p>
                                </div>
                            )}

                            {/* Opportunities Render by Tier Group */}
                            {filteredScholarships.length > 0 ? (
                                <div className="space-y-10">
                                    {sortedTiers.map(tier => (
                                        <div key={tier} className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                                        {tier.replace(/-/g, ' ')} Institutions
                                                    </h3>
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                                                        {groupedScholarships[tier]?.length || 0} Matches
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {groupedScholarships[tier]?.map((scholarship) => (
                                                    <ScholarshipCard 
                                                        key={scholarship.id!} 
                                                        scholarship={scholarship} 
                                                        onDraft={handleDraftDocumentFromCard}
                                                        onFeedback={(feedback) => handleScholarshipFeedback(scholarship.id!, feedback)}
                                                        onUpdateDeadline={(deadline) => handleUpdateDeadline(scholarship.id!, deadline)}
                                                        onToggleBookmark={handleToggleBookmark}
                                                        onUpdateStage={handleUpdateStage}
                                                        onUpdateNotes={handleUpdateNotes}
                                                        onOpenGoogleScholar={(s) => handleOpenGoogleScholar('', s.professorName, s.institution)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : scholarships.length > 0 ? (
                                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        No opportunities matched your current filter criteria.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setSearchQuery(''); setSelectedTierFilter('all'); setOnlyBookmarked(false); }}
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* TAB 2: CV INSIGHTS & RADAR */}
                    {activeTab === Tab.CvInsights && (
                        <div className="space-y-8">
                            {/* Recharts Visual Radar Chart Mapping Research Proficiency */}
                            <CvRadarChart
                                cvText={cvText}
                                proficiencies={cvAnalysis?.researchProficiencies}
                                isLoading={isGeneratingSummary}
                            />

                            <CvSummaryCard
                                analysis={cvAnalysis}
                                isLoading={isGeneratingSummary}
                                error={summaryError}
                                onRegenerate={handleRegenerateSummary}
                                onOpenLinkedIn={() => setIsLinkedInModalOpen(true)}
                            />
                        </div>
                    )}

                    {/* TAB 3: DRAFT DOCUMENTS STUDIO */}
                    {activeTab === Tab.DraftDocuments && (
                        <div className="space-y-6">
                            <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
                                <div>
                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                        <label htmlFor="positionDetails" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            Target Professor, Lab, or University Details
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenGoogleScholar(positionDetails || 'Academic Research', '', '')}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-[#1a73e8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-900 transition-colors shadow-2xs cursor-pointer"
                                            title="Search Google Scholar to find papers and insert citations into your letter"
                                        >
                                            <GraduationCap className="w-3.5 h-3.5 text-[#4285F4]" />
                                            <span>Find & Cite Scholar Papers</span>
                                        </button>
                                    </div>
                                    <textarea
                                        id="positionDetails"
                                        value={positionDetails}
                                        onChange={(e) => setPositionDetails(e.target.value)}
                                        placeholder="e.g., Dr. Jane Doe's AI & Robotics Lab at Seoul National University, focusing on LiDAR sensor fusion and autonomous perception..."
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-mono leading-relaxed"
                                        rows={4}
                                    />
                                </div>

                                {/* Action Buttons Grid */}
                                <div className="space-y-4">
                                    {/* Primary Dossier Button */}
                                    <button
                                        type="button"
                                        onClick={handleDraftAllDocuments}
                                        disabled={isLoading || !cvText || !positionDetails}
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Draft Complete Application Dossier (All Documents)
                                    </button>

                                    {/* Individual Generator Buttons */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                        {[
                                            { type: DocumentType.Email, label: '✉️ Outreach Email' },
                                            { type: DocumentType.FollowUpEmail, label: '📬 2-Week Follow-up' },
                                            { type: DocumentType.StatementOfPurpose, label: '📜 Statement of Purpose' },
                                            { type: DocumentType.MotivationLetter, label: '✍️ Motivation Letter' },
                                            { type: DocumentType.CoverLetter, label: '📄 Cover Letter' },
                                            { type: DocumentType.ResearchProposal, label: '🔬 Research Proposal' },
                                            { type: DocumentType.InterviewPrep, label: '🎯 Interview Q&A Prep' },
                                        ].map((item) => (
                                            <button
                                                key={item.type}
                                                type="button"
                                                onClick={() => handleDraftDocument(item.type)}
                                                disabled={isLoading || !cvText || !positionDetails}
                                                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all text-left shadow-2xs"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {isLoading && (
                                <div className="py-10 text-center space-y-3">
                                    <Spinner />
                                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400 animate-pulse">
                                        Synthesizing academic drafts with custom tone and IELTS {englishLevel}.0 style...
                                    </p>
                                </div>
                            )}

                            {/* Rendered Generated Content */}
                            {Object.keys(generatedDocuments).length > 0 && !isLoading && (
                                <div className="space-y-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                                        <div className="flex items-center gap-2 overflow-x-auto">
                                            {(Object.keys(generatedDocuments) as DocumentType[]).map((docType) => (
                                                <button
                                                    key={docType}
                                                    type="button"
                                                    onClick={() => setActiveGeneratedDoc(docType)}
                                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                                        activeGeneratedDoc === docType
                                                            ? 'bg-blue-600 text-white shadow-2xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {docType}
                                                </button>
                                            ))}
                                        </div>

                                        {Object.keys(generatedDocuments).length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => exportAllDocumentsDossierToPdf(generatedDocuments, positionDetails)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Download All as Unified PDF Dossier</span>
                                            </button>
                                        )}
                                    </div>

                                    {activeGeneratedDoc && generatedDocuments[activeGeneratedDoc] && (
                                        <GeneratedContent 
                                            content={generatedDocuments[activeGeneratedDoc]!}
                                            docType={activeGeneratedDoc}
                                            positionDetails={positionDetails}
                                            tone={selectedTone}
                                            onCleanWatermarks={handleNavigateToWatermarkCleaner}
                                        />
                                    )}

                                    {/* Refine Draft Section */}
                                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-emerald-500" />
                                            Refine & Perfect Draft ({activeGeneratedDoc})
                                        </h3>
                                        <textarea
                                            value={draftFeedback}
                                            onChange={(e) => setDraftFeedback(e.target.value)}
                                            placeholder="e.g., 'Emphasize my Python and PyTorch thesis results more', 'Make the introductory paragraph punchier'..."
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                                            rows={3}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRefineDraft}
                                            disabled={isLoading || !draftFeedback}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-500/20 transition-all"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Apply Refinements
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: AI WATERMARK REMOVER & HUMANIZER */}
                    {activeTab === Tab.WatermarkRemover && (
                        <WatermarkRemover 
                            initialText={watermarkInitialText}
                            currentCvText={cvText}
                            onSendToDocumentStudio={handleSendCleanedToDocumentStudio}
                            onUpdateCvText={handleUpdateCvFromCleaner}
                        />
                    )}

                    {/* TAB 5: APPLICATION TRACKER / KANBAN */}
                    {activeTab === Tab.ApplicationTracker && (
                        <ApplicationTracker 
                            scholarships={scholarships}
                            onUpdateStage={handleUpdateStage}
                            onUpdateNotes={handleUpdateNotes}
                            onToggleBookmark={handleToggleBookmark}
                            onDraft={handleDraftDocumentFromCard}
                            onUpdateDeadline={handleUpdateDeadline}
                            onImportApplications={handleImportApplications}
                        />
                    )}

                    {/* TAB 6: DEADLINES */}
                    {activeTab === Tab.Deadlines && (
                        <div className="space-y-6">
                            {/* Browser Push Notification & 3-Day Trigger Management Center */}
                            <DeadlineNotificationCenter
                                scholarships={scholarships}
                                onUpdateDeadline={handleUpdateDeadline}
                                onSelectScholarship={(s) => handleDraftDocumentFromCard(s, DocumentType.StatementOfPurpose)}
                                onPermissionsChanged={setNotificationsEnabled}
                            />

                            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>Scheduled Application Deadlines</span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                                            {upcomingDeadlines.length} Scheduled
                                        </span>
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Calendar countdowns and funding submission deadlines with active 3-day browser push alerts.
                                    </p>
                                </div>

                                {/* Sorting Toggle: Soonest First vs Farthest First */}
                                {upcomingDeadlines.length > 0 && (
                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                                            Order:
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setDeadlineSortOrder('soonest')}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                deadlineSortOrder === 'soonest'
                                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200/90 dark:ring-slate-600'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                            title="Order deadlines with soonest upcoming dates first"
                                        >
                                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                                            <span>Soonest First</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeadlineSortOrder('farthest')}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                deadlineSortOrder === 'farthest'
                                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200/90 dark:ring-slate-600'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                            title="Order deadlines with farthest dates first"
                                        >
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>Farthest First</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {upcomingDeadlines.length === 0 ? (
                                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        No deadlines scheduled yet.
                                    </p>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Go to the "Find Opportunities" tab and click "Set Date" on any scholarship card to track deadlines.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingDeadlines.map((scholarship) => (
                                        <ScholarshipCard 
                                            key={scholarship.id!} 
                                            scholarship={scholarship} 
                                            onDraft={handleDraftDocumentFromCard}
                                            onFeedback={(feedback) => handleScholarshipFeedback(scholarship.id!, feedback)}
                                            onUpdateDeadline={(deadline) => handleUpdateDeadline(scholarship.id!, deadline)}
                                            onToggleBookmark={handleToggleBookmark}
                                            onUpdateStage={handleUpdateStage}
                                            onUpdateNotes={handleUpdateNotes}
                                            onOpenGoogleScholar={(s) => handleOpenGoogleScholar('', s.professorName, s.institution)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
            </div>

            {/* LinkedIn Profile Text Optimizer Modal */}
            <LinkedInFormatterModal
                isOpen={isLinkedInModalOpen}
                onClose={() => setIsLinkedInModalOpen(false)}
                activeProfile={activeProfile}
                cvText={cvText}
                cvAnalysis={cvAnalysis}
            />

            {/* Google Scholar Paper & Citation Explorer Modal */}
            <GoogleScholarModal
                isOpen={isGoogleScholarModalOpen}
                onClose={() => setIsGoogleScholarModalOpen(false)}
                initialQuery={scholarModalQuery}
                initialAuthor={scholarModalAuthor}
                initialInstitution={scholarModalInstitution}
                onInsertCitationIntoDraft={handleInsertScholarCitationIntoDraft}
            />
        </div>
    );
};

export default App;
