import { Scholarship, ScholarshipStage, TimelineMilestone, DocumentType } from '../types';

export const TIMELINE_STAGE_CONFIGS: {
    key: TimelineMilestone['key'];
    stage: ScholarshipStage;
    label: string;
    title: string;
    description: string;
    actionLabel: string;
    actionDocType?: DocumentType;
    stepNumber: number;
}[] = [
    {
        key: 'discovered',
        stage: 'Discovered',
        label: 'Discovered',
        title: 'Lab Shortlisted',
        description: 'Faculty research and eligibility criteria reviewed',
        actionLabel: 'View Professor Profile',
        stepNumber: 1,
    },
    {
        key: 'professors_contacted',
        stage: 'Professors Contacted',
        label: 'Professors Contacted',
        title: 'Outreach Sent to PI',
        description: 'Initial cold email or 2-week follow-up sent to professor',
        actionLabel: 'Draft Outreach Email',
        actionDocType: DocumentType.Email,
        stepNumber: 2,
    },
    {
        key: 'sop_drafted',
        stage: 'SOP Drafted',
        label: 'SOP Drafted',
        title: 'Statement of Purpose Ready',
        description: 'Tailored SOP, motivation letter, or 1-page proposal finalized',
        actionLabel: 'Draft Statement of Purpose',
        actionDocType: DocumentType.StatementOfPurpose,
        stepNumber: 3,
    },
    {
        key: 'interview_scheduled',
        stage: 'Interview Scheduled',
        label: 'Interview Scheduled',
        title: 'Faculty Interview & Mock Prep',
        description: 'Practice mock interview completed or live faculty round scheduled',
        actionLabel: 'Practice Mock Interview',
        actionDocType: DocumentType.InterviewPrep,
        stepNumber: 4,
    },
    {
        key: 'application_submitted',
        stage: 'Application Submitted',
        label: 'Application Submitted',
        title: 'Official Application Submitted',
        description: 'University portal / scholarship submission packet finalized',
        actionLabel: 'Track Deadline',
        stepNumber: 5,
    },
    {
        key: 'offer_received',
        stage: 'Offer Received',
        label: 'Offer Received 🎉',
        title: 'Funded Offer / Decision',
        description: 'Scholarship grant or faculty admission offer received',
        actionLabel: 'Celebrate Offer 🎉',
        stepNumber: 6,
    },
];

/**
 * Maps a ScholarshipStage to its zero-based stage rank (0 to 5)
 */
export function getStageRank(stage?: ScholarshipStage): number {
    switch (stage) {
        case 'Offer Received':
            return 5;
        case 'Application Submitted':
            return 4;
        case 'Interview Scheduled':
            return 3;
        case 'SOP Drafted':
            return 2;
        case 'Professors Contacted':
        case 'Email Sent':
            return 1;
        case 'Discovered':
        default:
            return 0;
    }
}

/**
 * Returns complete array of 6 TimelineMilestones for a given scholarship,
 * respecting any custom dates/notes saved on the scholarship.
 */
export function getScholarshipMilestones(scholarship: Scholarship): TimelineMilestone[] {
    const currentRank = getStageRank(scholarship.stage);
    const existingMap = new Map<string, TimelineMilestone>();

    if (scholarship.timelineMilestones && Array.isArray(scholarship.timelineMilestones)) {
        scholarship.timelineMilestones.forEach(m => existingMap.set(m.key, m));
    }

    return TIMELINE_STAGE_CONFIGS.map((cfg, idx) => {
        const saved = existingMap.get(cfg.key);
        // By default, a stage is considered completed if the scholarship's current stage rank is >= its step index
        // Or if the user explicitly marked it as completed in saved milestones
        const isCompleted = saved?.completed !== undefined 
            ? saved.completed 
            : idx <= currentRank;

        return {
            key: cfg.key,
            label: cfg.label,
            title: cfg.title,
            description: cfg.description,
            completed: isCompleted,
            date: saved?.date || (idx === currentRank && scholarship.deadline ? scholarship.deadline : undefined),
            notes: saved?.notes || (idx === currentRank ? scholarship.notes : undefined),
            actionLabel: cfg.actionLabel,
            actionDocType: cfg.actionDocType,
        };
    });
}

/**
 * Calculate completion percentage across 6 stages (0% - 100%)
 */
export function calculateTimelineProgress(milestones: TimelineMilestone[]): number {
    if (!milestones || milestones.length === 0) return 0;
    const completedCount = milestones.filter(m => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
}

/**
 * Find the current active or next pending milestone
 */
export function getCurrentActiveMilestone(milestones: TimelineMilestone[]): TimelineMilestone {
    // Find the first uncompleted milestone, or the last one if all are completed
    const pending = milestones.find(m => !m.completed);
    return pending || milestones[milestones.length - 1];
}

/**
 * Advance scholarship to the next stage in the lifecycle
 */
export function getNextStage(currentStage?: ScholarshipStage): ScholarshipStage {
    const rank = getStageRank(currentStage);
    const nextRank = Math.min(rank + 1, TIMELINE_STAGE_CONFIGS.length - 1);
    return TIMELINE_STAGE_CONFIGS[nextRank].stage;
}

/**
 * Regress scholarship to previous stage
 */
export function getPreviousStage(currentStage?: ScholarshipStage): ScholarshipStage {
    const rank = getStageRank(currentStage);
    const prevRank = Math.max(rank - 1, 0);
    return TIMELINE_STAGE_CONFIGS[prevRank].stage;
}
