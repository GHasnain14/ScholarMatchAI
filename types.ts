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

export interface CvAnalysis {
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendations?: string[];
    readinessScore?: number; // e.g. 88 / 100
    topResearchFields?: string[];
    suggestedKeywords?: string[];
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
    DraftDocuments = "draft-documents",
    Deadlines = "deadlines",
    ApplicationTracker = "application-tracker",
    CvInsights = "cv-insights",
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
