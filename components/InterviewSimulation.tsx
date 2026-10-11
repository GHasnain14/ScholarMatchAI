import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Mic,
    MicOff,
    Play,
    Pause,
    RotateCcw,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    GraduationCap,
    Clock,
    Award,
    BookOpen,
    Send,
    RefreshCw,
    Download,
    HelpCircle,
    FileText,
    Flame,
    Check,
    Cpu,
    Target,
    Layers,
    ChevronDown,
    ChevronUp,
    BookmarkCheck,
    ShieldCheck,
    Search,
    MessageSquare,
    Lightbulb,
    BarChart3,
    Volume2,
    VolumeX
} from 'lucide-react';
import {
    Scholarship,
    MasterProgram,
    InterviewQuestion,
    InterviewQuestionFeedback,
    InterviewUserResponse,
    InterviewApplicationTarget,
    InterviewSessionSummary
} from '../types';
import { generateInterviewQuestions, evaluateInterviewResponse } from '../services/geminiService';
import { exportDocumentToPdf } from '../utils/pdfExport';
import confetti from 'canvas-confetti';

interface InterviewSimulationProps {
    scholarships: Scholarship[];
    masterPrograms?: MasterProgram[];
    activeCvText?: string;
    preselectedApplication?: Scholarship | null;
    onClearPreselectedApplication?: () => void;
}

export const CURATED_FLAGSHIP_LABS: (InterviewApplicationTarget & { sourceCategory: string })[] = [
    {
        id: 'curated-bair-abbeel',
        professorName: 'Prof. Pieter Abbeel',
        institution: 'UC Berkeley (BAIR & Robot Learning Lab)',
        researchArea: 'Deep Reinforcement Learning & Autonomous Robot Manipulation',
        universityTier: 'Top-Tier',
        country: 'USA',
        degreeLevel: "Ph.D. / Research Master's Candidate",
        keyKeywords: ['Reinforcement Learning', 'Robotics', 'Policy Gradients', 'Sim-to-Real Transfer'],
        reasonForMatch: 'Pioneering work in foundation models for robot learning and robotic manipulation.',
        sourceCategory: 'Flagship Lab'
    },
    {
        id: 'curated-tum-mirmi',
        professorName: 'Prof. Dr. Sami Haddadin',
        institution: 'Technical University of Munich (MIRMI)',
        researchArea: 'Intelligent Robotics, Cobots & Physical Human-Robot Interaction',
        universityTier: 'Top-Tier',
        country: 'Germany',
        degreeLevel: "M.Sc. / Doctoral Researcher (Tuition-Free)",
        keyKeywords: ['Human-Robot Collaboration', 'Impedance Control', 'Tactile Sensing', 'Safety Standards'],
        reasonForMatch: 'German Excellence Cluster focusing on next-gen tactile robotics and medical autonomy.',
        sourceCategory: 'Flagship Lab'
    },
    {
        id: 'curated-kaist-lee',
        professorName: 'Prof. Sang Yup Lee',
        institution: 'KAIST (Metabolic and Biomolecular Engineering Lab)',
        researchArea: 'Systems Metabolic Engineering & Computational Synthetic Biology',
        universityTier: 'Top-Tier',
        country: 'South Korea',
        degreeLevel: 'BK21+ Fully Funded Graduate Fellow',
        keyKeywords: ['Metabolic Engineering', 'CRISPR Tools', 'Flux Balance Analysis', 'Microbial Cell Factories'],
        reasonForMatch: 'Global authority on microbial cell factory engineering with full BK21+ stipend.',
        sourceCategory: 'Flagship Lab'
    },
    {
        id: 'curated-oxford-vgg',
        professorName: 'Prof. Andrew Zisserman',
        institution: 'University of Oxford (Visual Geometry Group - VGG)',
        researchArea: 'Computer Vision, Video Perception & Multimodal Foundation Models',
        universityTier: 'Top-Tier',
        country: 'United Kingdom',
        degreeLevel: 'DPhil / Advanced M.Sc. by Research',
        keyKeywords: ['Vision Transformers', 'Self-Supervised Learning', 'Video Representation', '3D Scene Understanding'],
        reasonForMatch: 'World-renowned laboratory for foundational computer vision representations.',
        sourceCategory: 'Flagship Lab'
    },
    {
        id: 'curated-mila-bengio',
        professorName: 'Prof. Yoshua Bengio',
        institution: 'University of Montreal / Mila - Quebec AI Institute',
        researchArea: 'Deep Generative Models, GFlowNets & AI for Drug Discovery',
        universityTier: 'Top-Tier',
        country: 'Canada',
        degreeLevel: "M.Sc. / Ph.D. Research Trainee",
        keyKeywords: ['Generative Flow Networks', 'Causal Representation', 'Drug Discovery', 'Scientific ML'],
        reasonForMatch: 'Leading global center for deep learning foundations and scientific discovery.',
        sourceCategory: 'Flagship Lab'
    },
    {
        id: 'curated-eth-cs',
        professorName: 'ETH Zurich Admissions Committee',
        institution: 'ETH Zurich (Department of Computer Science)',
        researchArea: 'M.Sc. in Computer Science (Machine Intelligence Major)',
        universityTier: 'Top-Tier',
        country: 'Switzerland',
        degreeLevel: 'Master of Science (M.Sc.)',
        keyKeywords: ['Machine Learning Systems', 'Algorithms & Complexity', 'Distributed Systems', 'Computer Systems'],
        reasonForMatch: 'Top European technical university offering subsidized tuition and world-class faculty.',
        sourceCategory: 'Flagship Lab'
    },
];

export const InterviewSimulation: React.FC<InterviewSimulationProps> = ({
    scholarships,
    masterPrograms = [],
    activeCvText = '',
    preselectedApplication,
    onClearPreselectedApplication,
}) => {
    // Stage 1: Target Selection & Setup
    const [selectedTarget, setSelectedTarget] = useState<InterviewApplicationTarget | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [targetCategoryFilter, setTargetCategoryFilter] = useState<'all' | 'tracked' | 'curated'>('all');
    const [customLabMode, setCustomLabMode] = useState<boolean>(false);
    const [customProfessor, setCustomProfessor] = useState<string>('');
    const [customInstitution, setCustomInstitution] = useState<string>('');
    const [customResearchArea, setCustomResearchArea] = useState<string>('');
    const [customDegreeLevel, setCustomDegreeLevel] = useState<string>("Master's / PhD");
    const [interviewFocus, setInterviewFocus] = useState<'balanced' | 'technical' | 'behavioral' | 'fit'>('balanced');
    const [questionCount, setQuestionCount] = useState<number>(5);

    // Stage 2: Interview Room State
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [interviewerProfile, setInterviewerProfile] = useState<{
        name: string;
        role: string;
        labName: string;
        interviewTone: string;
    } | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [responses, setResponses] = useState<Record<string, InterviewUserResponse>>({});
    const [currentAnswerText, setCurrentAnswerText] = useState<string>('');
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'setup' | 'room' | 'summary'>('setup');
    const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);

    // Timer / Stopwatch
    const [timerSeconds, setTimerSeconds] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const timerRef = useRef<any>(null);

    // Audio Dictation / Speech Recognition
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [speechSupported, setSpeechSupported] = useState<boolean>(false);
    const recognitionRef = useRef<any>(null);

    // Available target applications list
    const candidateApplications = useMemo(() => {
        const list: (InterviewApplicationTarget & { sourceCategory?: string })[] = [];

        // 1. User's tracked scholarships/applications
        scholarships.forEach((s, idx) => {
            list.push({
                id: s.id || `app-${idx}`,
                professorName: s.professorName,
                institution: s.institution,
                researchArea: s.researchArea,
                universityTier: s.universityTier,
                country: s.country,
                keyKeywords: s.keyKeywords,
                reasonForMatch: s.reasonForMatch,
                notes: s.notes,
                degreeLevel: "Master's / PhD Research Candidate",
                sourceCategory: 'My Tracked Opportunity',
            });
        });

        // 2. User's master programs if any
        masterPrograms.forEach((mp, idx) => {
            list.push({
                id: mp.id || `mp-${idx}`,
                professorName: `${mp.universityName} Admissions Committee`,
                institution: mp.universityName,
                researchArea: mp.programTitle,
                universityTier: mp.ranking?.nationalRank || 'Top-Tier',
                country: mp.country,
                degreeLevel: mp.degreeType || "Master's Degree",
                sourceCategory: 'Master Program',
            });
        });

        // 3. Curated Flagship Labs
        CURATED_FLAGSHIP_LABS.forEach(cl => {
            list.push(cl);
        });

        return list;
    }, [scholarships, masterPrograms]);

    // Handle preselected application if passed from ApplicationTracker or elsewhere
    useEffect(() => {
        if (preselectedApplication) {
            const target: InterviewApplicationTarget = {
                id: preselectedApplication.id || `pre-${Date.now()}`,
                professorName: preselectedApplication.professorName,
                institution: preselectedApplication.institution,
                researchArea: preselectedApplication.researchArea,
                universityTier: preselectedApplication.universityTier,
                country: preselectedApplication.country,
                keyKeywords: preselectedApplication.keyKeywords,
                reasonForMatch: preselectedApplication.reasonForMatch,
                degreeLevel: "Graduate Student (Master's / PhD)",
            };
            setSelectedTarget(target);
            if (onClearPreselectedApplication) {
                onClearPreselectedApplication();
            }
        } else if (!selectedTarget && candidateApplications.length > 0) {
            setSelectedTarget(candidateApplications[0]);
        }
    }, [preselectedApplication, candidateApplications]);

    // Check Web Speech API support on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRec) {
                setSpeechSupported(true);
            }
        }
    }, []);

    // Timer Effect
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning]);

    // Sync current answer when switching question
    useEffect(() => {
        if (questions[currentQuestionIndex]) {
            const qId = questions[currentQuestionIndex].id;
            setCurrentAnswerText(responses[qId]?.answerText || '');
            setShowModelAnswer(false);
            setTimerSeconds(0);
            setIsTimerRunning(false);
            if (isRecording) {
                stopSpeechRecognition();
            }
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeakingQuestion(false);
            }
        }
    }, [currentQuestionIndex, questions]);

    // Speech Synthesis Question Speaker
    const handleToggleSpeakQuestion = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (isSpeakingQuestion) {
            window.speechSynthesis.cancel();
            setIsSpeakingQuestion(false);
            return;
        }
        window.speechSynthesis.cancel();
        if (!questions[currentQuestionIndex]) return;
        const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex].question);
        utterance.rate = 0.95;
        utterance.onend = () => setIsSpeakingQuestion(false);
        utterance.onerror = () => setIsSpeakingQuestion(false);
        setIsSpeakingQuestion(true);
        window.speechSynthesis.speak(utterance);
    };

    // Speech Recognition Helpers
    const toggleSpeechRecognition = () => {
        if (isRecording) {
            stopSpeechRecognition();
        } else {
            startSpeechRecognition();
        }
    };

    const startSpeechRecognition = () => {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRec) return;

        try {
            const recognition = new SpeechRec();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsRecording(true);
                if (!isTimerRunning) {
                    setIsTimerRunning(true);
                }
            };

            recognition.onresult = (event: any) => {
                let interim = '';
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript + ' ';
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                if (final) {
                    setCurrentAnswerText(prev => (prev ? prev.trim() + ' ' + final.trim() : final.trim()));
                }
            };

            recognition.onerror = (err: any) => {
                console.warn('Speech recognition error:', err);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognition.start();
            recognitionRef.current = recognition;
        } catch (e) {
            console.warn('Failed to start speech recognition:', e);
            setIsRecording(false);
        }
    };

    const stopSpeechRecognition = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {}
            recognitionRef.current = null;
        }
        setIsRecording(false);
    };

    // Generate Interview Questions
    const handleStartSimulation = async () => {
        let activeTarget = selectedTarget;
        if (customLabMode) {
            if (!customInstitution.trim() && !customProfessor.trim()) {
                alert('Please enter at least an Institution or Professor name for the custom lab.');
                return;
            }
            activeTarget = {
                id: `custom-${Date.now()}`,
                professorName: customProfessor.trim() || 'Principal Investigator',
                institution: customInstitution.trim() || 'University Lab',
                researchArea: customResearchArea.trim() || 'Academic Research Focus',
                degreeLevel: customDegreeLevel,
            };
            setSelectedTarget(activeTarget);
        }

        if (!activeTarget) return;

        setIsGenerating(true);
        try {
            const result = await generateInterviewQuestions({
                application: activeTarget,
                cvText: activeCvText,
                focus: interviewFocus,
                count: questionCount,
            });

            if (result.questions && result.questions.length > 0) {
                setQuestions(result.questions);
                setInterviewerProfile(result.interviewerProfile || {
                    name: activeTarget.professorName,
                    role: 'Principal Investigator',
                    labName: `${activeTarget.institution} Research Group`,
                    interviewTone: 'Rigorous & Methodologically Focused'
                });
                setResponses({});
                setCurrentQuestionIndex(0);
                setViewMode('room');
            }
        } catch (err) {
            console.error('Failed to generate interview questions:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    // Evaluate Current Answer
    const handleEvaluateAnswer = async () => {
        const currentQ = questions[currentQuestionIndex];
        if (!currentQ || !selectedTarget || !currentAnswerText.trim()) return;

        setIsEvaluating(true);
        if (isRecording) stopSpeechRecognition();
        setIsTimerRunning(false);

        try {
            const feedback = await evaluateInterviewResponse({
                question: currentQ,
                userAnswer: currentAnswerText.trim(),
                application: selectedTarget,
                cvText: activeCvText,
            });

            const updatedResponse: InterviewUserResponse = {
                questionId: currentQ.id,
                answerText: currentAnswerText.trim(),
                timeSpentSeconds: timerSeconds,
                audioRecorded: isRecording,
                feedback,
                isEvaluated: true,
            };

            setResponses(prev => ({
                ...prev,
                [currentQ.id]: updatedResponse,
            }));

            // High score celebratory confetti!
            if (feedback.score >= 88) {
                try {
                    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
                } catch (e) {}
            }
        } catch (err) {
            console.error('Failed to evaluate interview response:', err);
        } finally {
            setIsEvaluating(false);
        }
    };

    // Current question and its response/feedback
    const currentQuestion = questions[currentQuestionIndex];
    const currentResponse = currentQuestion ? responses[currentQuestion.id] : null;

    // Filtered candidate applications for picker
    const filteredApplications = useMemo(() => {
        let list = candidateApplications;
        if (targetCategoryFilter === 'tracked') {
            list = list.filter(app => (app as any).sourceCategory === 'My Tracked Opportunity' || (app as any).sourceCategory === 'Master Program');
        } else if (targetCategoryFilter === 'curated') {
            list = list.filter(app => (app as any).sourceCategory === 'Flagship Lab');
        }

        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            app =>
                app.professorName.toLowerCase().includes(q) ||
                app.institution.toLowerCase().includes(q) ||
                app.researchArea.toLowerCase().includes(q) ||
                (app.country && app.country.toLowerCase().includes(q))
        );
    }, [candidateApplications, searchQuery, targetCategoryFilter]);

    // Format stopwatch seconds
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate Summary Stats
    const summaryStats = useMemo(() => {
        const evaluatedResponses = Object.values(responses).filter(r => r.isEvaluated && r.feedback);
        if (evaluatedResponses.length === 0) return null;

        const totalScore = evaluatedResponses.reduce((sum, r) => sum + (r.feedback?.score || 0), 0);
        const avgScore = Math.round(totalScore / evaluatedResponses.length);

        const techAvg = Math.round(
            evaluatedResponses.reduce((sum, r) => sum + (r.feedback?.metrics.technicalAccuracy || 70), 0) /
                evaluatedResponses.length
        );
        const structAvg = Math.round(
            evaluatedResponses.reduce((sum, r) => sum + (r.feedback?.metrics.structureAndClarity || 70), 0) /
                evaluatedResponses.length
        );
        const fitAvg = Math.round(
            evaluatedResponses.reduce((sum, r) => sum + (r.feedback?.metrics.fitAndMotivation || 70), 0) /
                evaluatedResponses.length
        );
        const maturityAvg = Math.round(
            evaluatedResponses.reduce((sum, r) => sum + (r.feedback?.metrics.academicMaturity || 70), 0) /
                evaluatedResponses.length
        );

        let readiness: InterviewSessionSummary['readinessTier'] = 'Solid with Minor Polish';
        if (avgScore >= 88) readiness = 'Interview Ready (Top 5%)';
        else if (avgScore >= 78) readiness = 'Strongly Competitive';
        else if (avgScore >= 65) readiness = 'Solid with Minor Polish';
        else readiness = 'Needs Targeted Preparation';

        return {
            avgScore,
            evaluatedCount: evaluatedResponses.length,
            totalCount: questions.length,
            readiness,
            techAvg,
            structAvg,
            fitAvg,
            maturityAvg,
        };
    }, [responses, questions]);

    // Export PDF Dossier
    const handleExportSummaryPdf = () => {
        if (!selectedTarget || questions.length === 0) return;

        let content = `# Faculty Mock Interview Evaluation Report\n`;
        content += `Target: ${selectedTarget.professorName} • ${selectedTarget.institution}\n`;
        content += `Research Field: ${selectedTarget.researchArea}\n`;
        content += `Overall Readiness Score: ${summaryStats?.avgScore || 85}/100 (${summaryStats?.readiness || 'Competitive'})\n\n`;
        content += `---\n\n`;

        questions.forEach((q, idx) => {
            const resp = responses[q.id];
            content += `### Question ${idx + 1} (${q.category.toUpperCase()}): ${q.question}\n`;
            content += `**Your Answer:** ${resp?.answerText || 'Not attempted'}\n\n`;
            if (resp?.feedback) {
                content += `**Score:** ${resp.feedback.score}/100 (${resp.feedback.rating})\n`;
                content += `**Strengths:** ${resp.feedback.strengths.join('; ')}\n`;
                content += `**Areas for Improvement:** ${resp.feedback.weaknesses.join('; ')}\n`;
                content += `**Model Faculty Answer:**\n${resp.feedback.modelAnswer}\n\n`;
            }
            content += `---\n\n`;
        });

        exportDocumentToPdf({
            title: `Mock Interview Dossier - ${selectedTarget.professorName}`,
            subtitle: `${selectedTarget.institution} • ${selectedTarget.researchArea}`,
            content,
        });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white p-6 sm:p-8 border border-indigo-900/40 shadow-xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <GraduationCap className="w-4 h-4 text-indigo-400" />
                            <span>Academic Faculty Interview Simulator • Voice & Technical AI Coach</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Interview Simulation & AI Feedback Studio
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Practice realistic technical and behavioral interview rounds tailored to your target lab, professor, or Master's/PhD program. Speak or type your answers to receive instant multi-dimensional evaluation, STAR-method audits, and faculty-grade model answers.
                        </p>
                    </div>

                    {/* Quick navigation modes */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {viewMode !== 'setup' && (
                            <button
                                onClick={() => setViewMode('setup')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-xs"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Change Lab / Setup</span>
                            </button>
                        )}
                        {questions.length > 0 && viewMode !== 'summary' && (
                            <button
                                onClick={() => setViewMode('summary')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30 transition-all shadow-xs"
                            >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>View Full Scorecard ({Object.values(responses).filter(r => r.isEvaluated).length}/{questions.length})</span>
                            </button>
                        )}
                        {viewMode === 'summary' && (
                            <button
                                onClick={() => setViewMode('room')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-400/30 transition-all shadow-xs"
                            >
                                <Play className="w-3.5 h-3.5" />
                                <span>Return to Interview Room</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* STAGE 1: Target Application Selection & Setup */}
            {viewMode === 'setup' && (
                <div className="space-y-6">
                    {/* Setup Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Select Target Application or Laboratory</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Questions will be rigorously tailored to this specific institution, PI, and research domain.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => { setCustomLabMode(false); setTargetCategoryFilter('all'); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        !customLabMode && targetCategoryFilter === 'all'
                                            ? 'bg-indigo-600 text-white shadow-2xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    All Labs ({candidateApplications.length})
                                </button>
                                {scholarships.length > 0 && (
                                    <button
                                        onClick={() => { setCustomLabMode(false); setTargetCategoryFilter('tracked'); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            !customLabMode && targetCategoryFilter === 'tracked'
                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                        }`}
                                    >
                                        My Tracked ({scholarships.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => { setCustomLabMode(false); setTargetCategoryFilter('curated'); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        !customLabMode && targetCategoryFilter === 'curated'
                                            ? 'bg-indigo-600 text-white shadow-2xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    Flagship Labs ({CURATED_FLAGSHIP_LABS.length})
                                </button>
                                <button
                                    onClick={() => setCustomLabMode(true)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        customLabMode
                                            ? 'bg-indigo-600 text-white shadow-2xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    + Custom Lab / PI
                                </button>
                            </div>
                        </div>

                        {/* Mode A: Tracked Application Selector */}
                        {!customLabMode ? (
                            <div className="space-y-4">
                                {candidateApplications.length > 0 && (
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search by Professor, Institution, or Field..."
                                            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                )}

                                {filteredApplications.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                                        {filteredApplications.map(app => {
                                            const isSelected = selectedTarget?.id === app.id;
                                            return (
                                                <button
                                                    key={app.id}
                                                    onClick={() => setSelectedTarget(app)}
                                                    className={`p-4 rounded-xl border text-left transition-all relative ${
                                                        isSelected
                                                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/40 shadow-xs'
                                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                                    (app as any).sourceCategory === 'Flagship Lab'
                                                                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                                                        : (app as any).sourceCategory === 'Master Program'
                                                                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                                                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                                                }`}>
                                                                    {(app as any).sourceCategory || 'Target Application'}
                                                                </span>
                                                                {app.country && (
                                                                    <span className="text-[10px] text-slate-500 font-semibold">
                                                                        {app.country}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 pt-1">
                                                                {app.professorName}
                                                            </h4>
                                                        </div>
                                                        {isSelected && (
                                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                                                <Check className="w-2.5 h-2.5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 truncate">
                                                        {app.institution}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                        Field: {app.researchArea}
                                                    </p>
                                                    {app.universityTier && (
                                                        <span className="inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            {app.universityTier} {app.country ? `• ${app.country}` : ''}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                                        <BookmarkCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            No tracked applications found yet
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                            You can bookmark opportunities from the <strong>Find Opportunities</strong> tab, or click <strong>+ Custom Lab / PI</strong> above to practice for any institution!
                                        </p>
                                        <button
                                            onClick={() => setCustomLabMode(true)}
                                            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs"
                                        >
                                            Practice Custom Lab or PI
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Mode B: Custom Lab or PI Form */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Professor / PI / Program Chair Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={customProfessor}
                                        onChange={e => setCustomProfessor(e.target.value)}
                                        placeholder="e.g. Prof. Dr. Trevor Darrell"
                                        className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Institution / Research University *
                                    </label>
                                    <input
                                        type="text"
                                        value={customInstitution}
                                        onChange={e => setCustomInstitution(e.target.value)}
                                        placeholder="e.g. UC Berkeley (BAIR Lab) or Max Planck Institute"
                                        className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Research Domain / Lab Topic *
                                    </label>
                                    <input
                                        type="text"
                                        value={customResearchArea}
                                        onChange={e => setCustomResearchArea(e.target.value)}
                                        placeholder="e.g. Computer Vision, Multimodal Learning, Robotics"
                                        className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Target Degree / Position
                                    </label>
                                    <select
                                        value={customDegreeLevel}
                                        onChange={e => setCustomDegreeLevel(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="Ph.D. Student / Doctoral Candidate">Ph.D. Student / Doctoral Candidate</option>
                                        <option value="Master's (Thesis / Research Track)">Master's (Thesis / Research Track)</option>
                                        <option value="Postdoctoral Scholar">Postdoctoral Scholar</option>
                                        <option value="Graduate Research Assistant (GRA)">Graduate Research Assistant (GRA)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Interview Parameters Configuration */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Interview Focus & Parameters
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    {
                                        id: 'balanced',
                                        title: 'Comprehensive Mock Round',
                                        desc: 'Balanced mix of deep technical methodology, research vision, and lab behavioral fit.',
                                        icon: Cpu,
                                    },
                                    {
                                        id: 'technical',
                                        title: 'Deep Technical & Methodology',
                                        desc: 'Probes experimental controls, algorithms, error analysis, and quantitative trade-offs.',
                                        icon: Flame,
                                    },
                                    {
                                        id: 'behavioral',
                                        title: 'Behavioral & Lab Culture Fit',
                                        desc: 'Evaluates resilience with failed experiments, postdoc collaboration, and scientific ethics.',
                                        icon: BookOpen,
                                    },
                                ].map(f => {
                                    const Icon = f.icon;
                                    const isSelected = interviewFocus === f.id;
                                    return (
                                        <button
                                            key={f.id}
                                            onClick={() => setInterviewFocus(f.id as any)}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/50 shadow-xs'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                                <span className="font-bold text-xs text-slate-900 dark:text-white">{f.title}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{f.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Number of Interview Questions:
                                    </span>
                                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-800">
                                        {[3, 5, 6].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setQuestionCount(num)}
                                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                                    questionCount === num
                                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                {num} Questions
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartSimulation}
                                    disabled={isGenerating || (!customLabMode && !selectedTarget)}
                                    className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Generating Personalized Questions with Faculty AI...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-amber-300" />
                                            <span>Generate Interview Questions & Enter Room</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 2: Interactive Interview Room */}
            {viewMode === 'room' && currentQuestion && (
                <div className="space-y-6">
                    {/* Top Room Banner: Progress & Question Navigation */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {interviewerProfile?.name || selectedTarget?.professorName}
                                        </h3>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                                            {selectedTarget?.institution}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Field: {selectedTarget?.researchArea} • Round: {interviewFocus.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <div className="w-28 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Question Switcher Stepper */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {questions.map((q, idx) => {
                                const resp = responses[q.id];
                                const isEvaluated = resp?.isEvaluated;
                                const isCurrent = currentQuestionIndex === idx;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                            isCurrent
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : isEvaluated
                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span>Q{idx + 1}</span>
                                        {isEvaluated && (
                                            <span className="text-[10px] font-bold font-mono">
                                                ({resp.feedback?.score}%)
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                        currentQuestion.category === 'technical'
                                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300'
                                            : currentQuestion.category === 'behavioral'
                                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                    }`}
                                >
                                    {currentQuestion.category.toUpperCase()} ROUND
                                </span>

                                <button
                                    type="button"
                                    onClick={handleToggleSpeakQuestion}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                                        isSpeakingQuestion
                                            ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                                    }`}
                                    title={isSpeakingQuestion ? 'Stop Audio' : 'Listen to Faculty Interviewer speak this question out loud'}
                                >
                                    {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-500" />}
                                    <span>{isSpeakingQuestion ? 'Speaking...' : 'Listen to Question'}</span>
                                </button>
                            </div>

                            {currentQuestion.suggestedFramework && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Framework: <strong>{currentQuestion.suggestedFramework}</strong></span>
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                                "{currentQuestion.question}"
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                Context: {currentQuestion.interviewerContext}
                            </p>
                        </div>

                        {/* Evaluation Criteria Hints */}
                        {currentQuestion.evaluationCriteria && currentQuestion.evaluationCriteria.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>What the faculty interviewer is looking for in your answer:</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                                    {currentQuestion.evaluationCriteria.map((c, cIdx) => (
                                        <div key={cIdx} className="flex items-start gap-1.5">
                                            <span className="text-indigo-500 font-bold shrink-0">•</span>
                                            <span>{c}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Candidate Response Studio */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-indigo-600" />
                                <span>Your Spoken or Written Response</span>
                            </h4>

                            <div className="flex items-center gap-3">
                                {/* Timer */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="font-bold text-slate-900 dark:text-white">{formatTime(timerSeconds)}</span>
                                    <button
                                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                        title={isTimerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
                                    >
                                        {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    </button>
                                </div>

                                {/* Speech Dictation Toggle */}
                                {speechSupported && (
                                    <button
                                        onClick={toggleSpeechRecognition}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                                            isRecording
                                                ? 'bg-rose-600 text-white animate-pulse'
                                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                                        }`}
                                        title="Speak out loud to automatically transcribe your answer via Speech-to-Text"
                                    >
                                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                        <span>{isRecording ? 'Listening (Speaking...)' : 'Voice Dictation'}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className="space-y-1.5">
                            <textarea
                                value={currentAnswerText}
                                onChange={e => setCurrentAnswerText(e.target.value)}
                                rows={6}
                                placeholder="Type or speak your answer here. Provide specific technical examples, your individual ownership, concrete metrics, and lessons learned..."
                                className="w-full p-4 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white leading-relaxed resize-y"
                            />

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <span>
                                    {currentAnswerText.trim() ? currentAnswerText.trim().split(/\s+/).filter(Boolean).length : 0} words (~1.5–2 mins = 140–220 words)
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    Tip: Use STAR method for behavioral and hypothesis-to-results for technical.
                                </span>
                            </div>
                        </div>

                        {/* Response Action Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setCurrentAnswerText('');
                                        setTimerSeconds(0);
                                        setIsTimerRunning(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
                                >
                                    Clear
                                </button>
                                {currentResponse?.isEvaluated && (
                                    <button
                                        onClick={() => setShowModelAnswer(!showModelAnswer)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                                    >
                                        <Award className="w-3.5 h-3.5" />
                                        <span>{showModelAnswer ? 'Hide Model Answer' : 'View Gold Standard Model Answer'}</span>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleEvaluateAnswer}
                                disabled={isEvaluating || !currentAnswerText.trim()}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isEvaluating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Faculty AI Evaluating Response...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>{currentResponse?.isEvaluated ? 'Re-Evaluate Updated Answer' : 'Submit & Get AI Feedback'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* AI Feedback & Scorecard Display */}
                    {currentResponse?.feedback && (
                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-500/30 shadow-lg space-y-5 animate-fade-in">
                            {/* Score & Rating Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-black text-xl text-emerald-400">
                                        {currentResponse.feedback.score}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                                {currentResponse.feedback.rating}
                                            </span>
                                            <h4 className="text-sm font-bold text-white">
                                                Interview Performance Assessment
                                            </h4>
                                        </div>
                                        <p className="text-xs text-indigo-200 mt-0.5">
                                            Score: {currentResponse.feedback.score}/100 • Evaluated against {selectedTarget?.institution} standards
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowModelAnswer(!showModelAnswer)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1"
                                    >
                                        <Award className="w-3.5 h-3.5 text-amber-300" />
                                        <span>{showModelAnswer ? 'Hide Model Answer' : 'See Gold Standard Answer'}</span>
                                    </button>

                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition-all flex items-center gap-1.5 shadow-xs"
                                        >
                                            <span>Next Question</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setViewMode('summary')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-xs font-mono"
                                        >
                                            <span>View Complete Scorecard</span>
                                            <BarChart3 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 4 Multi-Metric Radar Progress Bars */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Technical Depth', val: currentResponse.feedback.metrics.technicalAccuracy, color: 'bg-blue-400' },
                                    { label: 'Structure (STAR)', val: currentResponse.feedback.metrics.structureAndClarity, color: 'bg-indigo-400' },
                                    { label: 'Lab/PI Fit', val: currentResponse.feedback.metrics.fitAndMotivation, color: 'bg-purple-400' },
                                    { label: 'Academic Maturity', val: currentResponse.feedback.metrics.academicMaturity, color: 'bg-emerald-400' },
                                ].map((m, mIdx) => (
                                    <div key={mIdx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span>{m.label}</span>
                                            <span className="font-bold text-white font-mono">{m.val}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div className={`${m.color} h-full rounded-full transition-all duration-500`} style={{ width: `${m.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Strengths & Weaknesses 2-Column Split */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* Strengths */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-900/40 space-y-2">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        <span>Key Strengths Observed:</span>
                                    </div>
                                    <ul className="space-y-1.5 text-slate-300">
                                        {currentResponse.feedback.strengths.map((str, sIdx) => (
                                            <li key={sIdx} className="flex items-start gap-1.5 leading-relaxed">
                                                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                                <span>{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Areas for Improvement */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/40 space-y-2">
                                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>Gaps & Areas to Refine:</span>
                                    </div>
                                    <ul className="space-y-1.5 text-slate-300">
                                        {currentResponse.feedback.weaknesses.map((w, wIdx) => (
                                            <li key={wIdx} className="flex items-start gap-1.5 leading-relaxed">
                                                <span className="text-amber-400 font-bold shrink-0">⚠</span>
                                                <span>{w}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Actionable Tips */}
                            {currentResponse.feedback.actionableTips && currentResponse.feedback.actionableTips.length > 0 && (
                                <div className="p-3.5 rounded-xl bg-indigo-900/40 border border-indigo-700/40 flex items-start gap-2.5 text-xs text-indigo-200">
                                    <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <strong className="text-white">Coach's Interview Day Takeaway: </strong>
                                        <span>{currentResponse.feedback.actionableTips.join(' ')}</span>
                                    </div>
                                </div>
                            )}

                            {/* Exemplary Model Answer Expandable Accordion */}
                            {showModelAnswer && (
                                <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2 animate-fade-in">
                                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                                        <span className="flex items-center gap-1.5">
                                            <Award className="w-4 h-4 text-amber-400" />
                                            <span>Gold Standard Faculty Model Answer (~150 words)</span>
                                        </span>
                                        <button
                                            onClick={() => setShowModelAnswer(false)}
                                            className="text-slate-400 hover:text-white text-[11px]"
                                        >
                                            Collapse
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-serif italic border-l-2 border-amber-500/50 pl-3 py-1">
                                        "{currentResponse.feedback.modelAnswer}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* STAGE 3: Complete Mock Interview Scorecard / Dossier */}
            {viewMode === 'summary' && summaryStats && selectedTarget && (
                <div className="space-y-6">
                    {/* Overall Score Banner */}
                    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-800/40 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                                    <Award className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                            {summaryStats.readiness}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {summaryStats.evaluatedCount} of {summaryStats.totalCount} Questions Evaluated
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mt-1">
                                        Overall Readiness Score: {summaryStats.avgScore}/100
                                    </h3>
                                    <p className="text-xs text-indigo-200">
                                        Candidate profile assessed for {selectedTarget.professorName} at {selectedTarget.institution}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    onClick={handleExportSummaryPdf}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 shadow-xs"
                                >
                                    <Download className="w-4 h-4 text-emerald-300" />
                                    <span>Download PDF Interview Dossier</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('setup')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 shadow-xs"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Practice Another Lab</span>
                                </button>
                            </div>
                        </div>

                        {/* 4 Domain Averages */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                                <div className="text-xs text-slate-400 mb-1">Technical Depth</div>
                                <div className="text-2xl font-black text-blue-400 font-mono">{summaryStats.techAvg}%</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                                <div className="text-xs text-slate-400 mb-1">Structure (STAR)</div>
                                <div className="text-2xl font-black text-indigo-400 font-mono">{summaryStats.structAvg}%</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                                <div className="text-xs text-slate-400 mb-1">Lab / PI Alignment</div>
                                <div className="text-2xl font-black text-purple-400 font-mono">{summaryStats.fitAvg}%</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                                <div className="text-xs text-slate-400 mb-1">Academic Maturity</div>
                                <div className="text-2xl font-black text-emerald-400 font-mono">{summaryStats.maturityAvg}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Question-by-Question Detailed Breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            <span>Question-by-Question Performance Breakdown</span>
                        </h4>

                        <div className="space-y-4">
                            {questions.map((q, idx) => {
                                const resp = responses[q.id];
                                return (
                                    <div
                                        key={q.id}
                                        className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                                    Q{idx + 1} • {q.category.toUpperCase()}
                                                </span>
                                                <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                                    {q.question}
                                                </h5>
                                            </div>

                                            {resp?.feedback ? (
                                                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                                                    Score: {resp.feedback.score}/100 ({resp.feedback.rating})
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Not attempted</span>
                                            )}
                                        </div>

                                        {resp?.answerText && (
                                            <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed italic">
                                                "{resp.answerText}"
                                            </div>
                                        )}

                                        {resp?.feedback && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                                <div className="text-emerald-700 dark:text-emerald-300">
                                                    <strong>Strengths: </strong>
                                                    <span>{resp.feedback.strengths.join(' ')}</span>
                                                </div>
                                                <div className="text-amber-700 dark:text-amber-300">
                                                    <strong>To Polish: </strong>
                                                    <span>{resp.feedback.weaknesses.join(' ')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
