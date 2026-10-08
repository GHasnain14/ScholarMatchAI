export interface Scholarship {
    id?: string;
    professorName: string;
    institution: string;
    researchArea: string;
    link: string;
    reasonForMatch: string;
    universityTier: 'Top-Tier' | 'Mid-Tier' | 'Low-Rank' | 'Emerging' | string;
    country?: string;
    matchScore?: number; // 0-100
    fundingType?: 'Fully Funded' | 'Partial Tuition' | 'Research Assistantship' | 'Fellowship' | 'Varies' | string;
    keyKeywords?: string[];
    // Extended fields
    tuitionFees?: string;
    ranking?: string;
    applicationRequirements?: string[];
    deadline?: string;
    // Client-side tracking
    feedback?: 'good' | 'poor';
    bookmarked?: boolean;
    stage?: 'Discovered' | 'Email Sent' | 'Interview Scheduled' | 'Application Submitted' | 'Offer Received';
    notes?: string;
}

export interface MasterProgram {
    id?: string;
    programTitle: string; // e.g. "M.Sc. in Data Engineering and Analytics"
    degreeType: string; // e.g. "M.Sc.", "M.Eng.", "M.Res.", "Joint M.Sc."
    universityName: string; // e.g. "Technical University of Munich (TUM)"
    department: string; // e.g. "Department of Informatics & Computer Engineering"
    country: string; // e.g. "Germany"
    city?: string; // e.g. "Munich / Garching"
    ranking: {
        qsRank?: string; // e.g. "QS World #28"
        theRank?: string; // e.g. "THE #30"
        nationalRank?: string; // e.g. "German Excellence University / #1 in Germany for CS"
    };
    applicationWay: {
        portalName: string; // e.g. "Uni-Assist (VPD) + TUMonline"
        portalType: 'Uni-Assist' | 'Direct University Portal' | 'Campus France' | 'DAAD Portal' | 'StudyLink' | 'Central Service' | string;
        applicationUrl: string;
        keySteps: string[];
    };
    languageOfInstruction: string; // e.g. "100% English"
    languageRequirements: string; // e.g. "IELTS 6.5+ or TOEFL 88+"
    durationAndCredits: string; // e.g. "2 Years (4 Semesters) / 120 ECTS"
    tuitionAndFees: {
        isTuitionFree: boolean;
        tuitionText: string; // e.g. "Tuition-Free (Administrative fee ~€152/semester)"
        livingCostEstimate?: string; // e.g. "€934/month Blocked Account (Sperrkonto)"
    };
    curriculumHighlights: {
        coreModules: string[]; // e.g. ["Distributed Systems", "Advanced Machine Learning", "Cloud Computing Architectures"]
        electivesAndTracks: string[]; // e.g. ["Deep Generative Models", "Big Data Analytics", "High Performance Computing"]
        masterThesisDetails: string; // e.g. "6-month research thesis with university lab or Max Planck Institute"
        departmentWebsiteUrl?: string;
    };
    admissionPrerequisites: {
        bachelorDegreeRequired: string; // e.g. "Bachelor's in Computer Science, Software Engineering, or related"
        minEctsCredits?: string; // e.g. "Min. 18 ECTS Mathematics, 24 ECTS Theoretical CS"
        greGmatRequirement?: string; // e.g. "Not required for EU; GRE Q164+ recommended for non-EU"
        gpaRecommendation?: string; // e.g. "German grade 2.5 or better (approx. 3.0/4.0 GPA)"
    };
    deadlines: {
        winterSemester?: string; // e.g. "May 31 (Winter Intake)"
        summerSemester?: string; // e.g. "Nov 30 (Summer Intake)"
        isUpcoming?: boolean;
    };
    matchScore: number; // 70-99
    matchRationale: string; // Detailed alignment between candidate's CV courses/skills and the curriculum
    curriculumOverlapKeywords: string[]; // e.g. ["Python", "Neural Networks", "Distributed Computing"]
    officialProgramUrl: string;

    // Client tracking
    bookmarked?: boolean;
    stage?: 'Discovered' | 'Drafting SOP' | 'Documents Ready' | 'Uni-Assist / Portal Submitted' | 'Admitted';
    notes?: string;
}

export interface CurriculumMotivationLetterRequest {
    cvText: string;
    program: MasterProgram;
    tone?: string;
    englishLevel?: number;
    specificFocusArea?: string;
}

export interface CurriculumMotivationLetterResponse {
    motivationLetter: string;
    matchedModulesAnalysis: {
        targetModule: string;
        candidateBackgroundMatch: string;
    }[];
    facultyChairsToMention: string[];
    admissionReadinessChecklist: {
        category: string;
        status: 'ready' | 'action_needed' | 'verified';
        detail: string;
    }[];
    uniAssistOrPortalGuide: string;
}

export interface CvProfile {
    id: string;
    userId?: string;
    name: string;
    targetField: string;
    text: string;
    targetInstitutions?: string;
    notes?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    analysis?: CvAnalysis | null;
}

export interface ResearchProficiency {
    area: string;
    score: number; // 0 - 100
    benchmarkScore: number; // Target benchmark (e.g. 75)
    level: string; // 'Foundational' | 'Intermediate' | 'Proficient' | 'Advanced' | 'Expert'
    evidence: string;
    recommendation: string;
}

export interface CvAnalysis {
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendations?: string[];
    readinessScore?: number; // e.g. 88 / 100
    topResearchFields?: string[];
    suggestedKeywords?: string[];
    researchProficiencies?: ResearchProficiency[];
}

export enum DocumentType {
    Email = "Email to Professor",
    FollowUpEmail = "Follow-up Outreach Email",
    MotivationLetter = "Letter of Motivation",
    CoverLetter = "Cover Letter",
    ResearchProposal = "Research Proposal (1-Page)",
    StatementOfPurpose = "Statement of Purpose (SOP)",
    InterviewPrep = "Interview Q&A Cheat Sheet",
}

export enum Tab {
    FindPositions = "find-positions",
    MasterPrograms = "master-programs",
    CvInsights = "cv-insights",
    WatermarkRemover = "watermark-remover",
    DraftDocuments = "draft-documents",
    ApplicationTracker = "application-tracker",
    Deadlines = "deadlines",
}

export type WatermarkCleaningMode = 'turnitin-bypass' | 'academic-humanize' | 'stealth-clean' | 'executive-polish' | 'concise-scholarly';

export interface WikipediaAiTellFinding {
    category: 'ai-vocabulary' | 'copula-avoidance' | 'negative-parallelism' | 'superficial-participle' | 'puffery-legacy' | 'didactic-hedging' | 'stego-metadata';
    title: string;
    wpShortcut: string;
    description: string;
    count: number;
    examples: string[];
}

export interface QualityAuditReport {
    passed: boolean;
    overallScore: number;
    passesCompleted: number;
    wikipediaAiTellsPurged: number;
    turnitinDetectionRisk: number;
    burstinessScore: number;
    semanticIntegrityScore: number;
    checks: {
        copulaNaturalness: 'PASSED' | 'FLAGGED';
        parallelismAvoidance: 'PASSED' | 'FLAGGED';
        superficialParticiples: 'PASSED' | 'FLAGGED';
        aiVocabularyPurge: 'PASSED' | 'FLAGGED';
        cadenceBurstiness: 'PASSED' | 'FLAGGED';
        factualFidelity: 'PASSED' | 'FLAGGED';
    };
    evaluatorNotes: string;
    revisionHistory?: { pass: number; description: string; score: number }[];
}

export interface WatermarkScanResult {
    cleanedText: string;
    originalText: string;
    hiddenWatermarksFound: number;
    hiddenWatermarkTypes: string[];
    aiClichesFound: { phrase: string; suggestion: string; index: number }[];
    wikipediaTellsFound?: WikipediaAiTellFinding[];
    qualityAudit?: QualityAuditReport;
    aiProbabilityOriginal: number;
    aiProbabilityCleaned: number;
    readabilityGrade: string;
    burstinessScoreOriginal: number;
    burstinessScoreCleaned: number;
    perplexityScore: number;
    removedCount: number;
    wordCount: number;
    modeUsed: WatermarkCleaningMode;
}

export enum PositionSearchType {
    Global = "global",
    USA = "usa",
    Canada = "canada",
    UK = "uk",
    Germany = "germany",
    SouthKorea = "south-korea",
    Japan = "japan",
    France = "france",
    ErasmusMundus = "erasmus-mundus",
    Australia = "australia",
    Singapore = "singapore",
    Poland = "poland",
    Belgium = "belgium",
}

export interface LinkedInExperienceItem {
    id: string;
    roleTitle: string;
    organization: string;
    period: string;
    location?: string;
    bulletPoints: string[];
    skills: string[];
    formattedBlock: string;
}

export interface LinkedInProfileData {
    headlineIdeas: string[];
    aboutAcademic: string;
    aboutIndustry: string;
    aboutConcise: string;
    experienceEntries: LinkedInExperienceItem[];
    experienceFormattedAll: string;
    topSkills: string[];
}

export interface ScholarPaper {
    id: string;
    title: string;
    authors: string[];
    journalOrVenue: string;
    year: number | string;
    citationCount: number;
    abstract?: string;
    scholarUrl: string;
    pdfUrl?: string;
    doi?: string;
    relevanceSnippet?: string;
    apaCitation?: string;
    bibtex?: string;
    sopHookSentence?: string;
}

export interface ScholarAuthorProfile {
    name: string;
    institution?: string;
    scholarProfileUrl: string;
    hIndex?: number;
    totalCitations?: number;
    interests?: string[];
    topPapers: ScholarPaper[];
}
