import { InterviewQuestion, InterviewQuestionFeedback, InterviewApplicationTarget } from '../types';

/**
 * Intelligent fallback generator for interview questions tailored to any academic lab / program
 */
export function synthesizeInterviewQuestionsFallback(
    target: InterviewApplicationTarget,
    cvText: string = '',
    focus: 'balanced' | 'technical' | 'behavioral' | 'fit' = 'balanced',
    count: number = 5
): InterviewQuestion[] {
    const prof = target.professorName || 'Principal Investigator';
    const inst = target.institution || 'University Research Lab';
    const area = target.researchArea || 'Advanced Computational & Empirical Research';
    const degree = target.degreeLevel || 'Graduate Degree (Master\'s / PhD)';
    const keywords = (target.keyKeywords && target.keyKeywords.length > 0)
        ? target.keyKeywords.join(', ')
        : 'methodological rigor, experimental validation, state-of-the-art modeling';

    const technicalPool: InterviewQuestion[] = [
        {
            id: 'tech-1',
            question: `In our lab at ${inst}, we focus heavily on ${area}. Looking at your research background, how would you design an experimental baseline to validate novel hypotheses in this space, and how do you prevent overfitting or measurement bias?`,
            category: 'technical',
            interviewerContext: `${prof} probing your foundational experimental methodology and scientific hygiene in ${area}.`,
            evaluationCriteria: [
                'Defines clear independent and dependent variables',
                'Specifies concrete baseline models or control benchmarks',
                'Explains validation strategies (k-fold cross-validation, ablation studies, blind controls)',
                'Demonstrates deep understanding of metric choice and statistical significance'
            ],
            suggestedFramework: 'Hypothesis -> Baseline Setup -> Validation Controls -> Metrics & Statistical Rigor',
            keyPointsToCover: ['Choice of benchmark datasets or lab controls', 'Ablation study design', 'p-value or confidence intervals', 'Trade-offs between computational cost and accuracy']
        },
        {
            id: 'tech-2',
            question: `A significant challenge in our ongoing projects involves scaling models or assays when dealing with noisy, incomplete, or high-dimensional data. Walk me through a project from your CV where you tackled dirty or missing data, and what mathematical or practical trade-offs you made.`,
            category: 'technical',
            interviewerContext: `Faculty committee assessing your hands-on problem-solving and mathematical maturity when real-world data deviates from textbook examples.`,
            evaluationCriteria: [
                'Details specific data sanitization / normalization pipelines',
                'Justifies algorithmic or mathematical choice over simpler heuristics',
                'Addresses edge cases and failure modes transparently',
                'Reflects on what could have been done with additional compute or sample size'
            ],
            suggestedFramework: 'Problem Context -> Data Imperfections -> Methodological Decision -> Quantified Outcome',
            keyPointsToCover: ['Specific data dimensions/noise rates', 'Choice of regularization or imputation', 'Resulting performance delta']
        },
        {
            id: 'tech-3',
            question: `If you were admitted to our team to spearhead a new initiative touching on ${keywords}, what is the first open question in the recent literature (past 1-2 years) that you would prioritize investigating, and what literature gaps exist?`,
            category: 'research-vision',
            interviewerContext: `${prof} checking whether you read top conference/journal literature independently or merely follow instructions.`,
            evaluationCriteria: [
                'References recent paradigms or high-impact papers',
                'Articulates a clear unresolved scientific bottleneck',
                'Proposes a plausible pilot study achievable within 6 months',
                'Shows direct alignment with this lab\'s published papers'
            ],
            suggestedFramework: 'Current Literature Paradigm -> Critical Bottleneck -> Proposed Pilot Study -> Anticipated Contribution',
            keyPointsToCover: ['Mention 1-2 recognized literature themes', 'Identify why current approaches plateau', 'Propose a testable hypothesis']
        }
    ];

    const behavioralPool: InterviewQuestion[] = [
        {
            id: 'behav-1',
            question: `Research in ${inst} can be unpredictable. Tell me about a time in your academic or professional work where an experiment or major project completely failed after weeks of effort. How did you diagnose the failure, and what did you learn?`,
            category: 'behavioral',
            interviewerContext: `Professor evaluating resilience, intellectual honesty, and debugging tenacity under scientific pressure.`,
            evaluationCriteria: [
                'Uses the STAR framework (Situation, Task, Action, Result)',
                'Takes ownership rather than blaming teammates or tooling',
                'Details a systematic root-cause diagnosis process',
                'Demonstrates positive resilience and pivot mindset'
            ],
            suggestedFramework: 'STAR Method (Situation, Task, Action, Result & Reflection)',
            keyPointsToCover: ['Clear description of the dead-end', 'Root cause analysis steps taken', 'Constructive pivot or lesson implemented']
        },
        {
            id: 'behav-2',
            question: `In our research group, junior researchers frequently collaborate with senior postdocs and interdisciplinary partner labs whose timelines and priorities may clash. How do you handle disagreement over research direction or authorship attribution?`,
            category: 'behavioral',
            interviewerContext: `Assessing collaborative maturity, conflict de-escalation, and professional academic ethics.`,
            evaluationCriteria: [
                'Demonstrates empathetic, professional communication',
                'Prioritizes objective empirical evidence over ego',
                'Knows when and how to escalate constructively to the PI',
                'Values interdisciplinary perspectives and mutual credit'
            ],
            suggestedFramework: 'Context -> Conflicting Perspectives -> Objective Mediation -> Collaborative Resolution',
            keyPointsToCover: ['Open dialogue and listening', 'Using empirical data to settle disputes', 'Clear documentation of contributions']
        },
        {
            id: 'fit-1',
            question: `You are applying to work with our group at ${inst} specifically for ${degree}. Out of all the institutions conducting research in ${area}, why is our lab the single best home for your academic aspirations, and what unique perspective will you bring to our lab meetings?`,
            category: 'fit',
            interviewerContext: `${prof} verifying authentic interest versus mass generic applications.`,
            evaluationCriteria: [
                'Demonstrates specific knowledge of the lab\'s niche and recent publications',
                'Connects candidate\'s unique background to complementary skills needed in the lab',
                'Shows genuine enthusiasm for the university and institutional culture',
                'Articulates mutual value rather than one-sided career gains'
            ],
            suggestedFramework: 'Specific Lab Differentiator -> Unique Candidate Asset -> Mutual Synergy -> Long-term Goal',
            keyPointsToCover: ['Specific research papers or tools from this lab', 'What unique skill you bring', 'Where you see this collaboration leading']
        }
    ];

    let combined: InterviewQuestion[] = [];
    if (focus === 'technical') {
        combined = [...technicalPool, behavioralPool[0], behavioralPool[2]];
    } else if (focus === 'behavioral') {
        combined = [...behavioralPool, technicalPool[0], technicalPool[1]];
    } else {
        // Balanced
        combined = [technicalPool[0], behavioralPool[0], technicalPool[1], behavioralPool[1], technicalPool[2], behavioralPool[2]];
    }

    return combined.slice(0, count);
}

/**
 * Intelligent heuristic fallback for evaluating student's interview answers
 */
export function synthesizeInterviewFeedbackFallback(
    question: InterviewQuestion,
    userAnswer: string,
    target: InterviewApplicationTarget
): InterviewQuestionFeedback {
    const text = userAnswer.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const lower = text.toLowerCase();

    // Check key structural markers
    const hasStructureWords = /first|second|specifically|for example|as a result|ultimately|in my previous|situation|outcome/i.test(lower);
    const hasTechnicalKeywords = /data|model|experiment|metric|accuracy|benchmark|hypothesis|analysis|method|baseline|performance|algorithm|result/i.test(lower);
    const hasPersonalOwnership = /i led|i designed|i implemented|my responsibility|i analyzed|i decided|we discovered/i.test(lower);
    const mentionsLabOrProf = target.institution && lower.includes(target.institution.toLowerCase().split(' ')[0]);

    let technicalScore = 70;
    let structureScore = 70;
    let fitScore = 70;
    let maturityScore = 72;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const tips: string[] = [];

    // Length evaluation
    if (wordCount < 40) {
        technicalScore -= 20;
        structureScore -= 25;
        weaknesses.push('Answer is too brief (< 40 words). Faculty interviewers expect 1.5 to 2 minutes of substantive response (~120–200 words).');
        tips.push('Expand on the context, your specific technical role, and the measurable outcome.');
    } else if (wordCount >= 100 && wordCount <= 280) {
        structureScore += 15;
        strengths.push(`Ideal response length (${wordCount} words) providing sufficient academic depth without rambling.`);
    } else if (wordCount > 350) {
        structureScore -= 8;
        weaknesses.push('Slightly verbose. In live spoken interviews, keep answers under 2.5 minutes to allow the PI to ask follow-up questions.');
    }

    // Technical grounding
    if (hasTechnicalKeywords) {
        technicalScore += 16;
        strengths.push('Grounds response in concrete methodology, metrics, and empirical reasoning.');
    } else {
        technicalScore -= 12;
        weaknesses.push('Lacks concrete technical terminology or quantitative metrics.');
        tips.push('Cite specific quantitative results (e.g. "improved inference throughput by 34%" or "p < 0.01").');
    }

    // Structure
    if (hasStructureWords) {
        structureScore += 14;
        strengths.push('Clear logical signposting and progression from premise to conclusion.');
    } else {
        tips.push('Use clear signposts ("To address this, I took three steps: First... Second... Finally...").');
    }

    // Ownership
    if (hasPersonalOwnership) {
        maturityScore += 14;
        strengths.push('Articulates personal initiative and direct individual contributions clearly.');
    } else {
        weaknesses.push('Too passive or generic. Clarify what YOU personally implemented versus what was done by the broader group.');
    }

    // Lab Alignment
    if (mentionsLabOrProf) {
        fitScore += 18;
        strengths.push(`Directly connects back to ${target.institution || 'the host lab\'s work'}.`);
    } else {
        tips.push(`Explicitly bridge your experience back to how it applies to ${target.professorName || 'the professor\'s'} current research.`);
    }

    const overallScore = Math.min(96, Math.max(45, Math.round((technicalScore * 0.35) + (structureScore * 0.25) + (fitScore * 0.2) + (maturityScore * 0.2))));

    let rating: InterviewQuestionFeedback['rating'] = 'Adequate';
    if (overallScore >= 88) rating = 'Exceptional';
    else if (overallScore >= 78) rating = 'Strong Candidate';
    else if (overallScore >= 62) rating = 'Adequate';
    else rating = 'Needs Preparation';

    // Model answer synthesis
    const modelAnswer = question.category === 'behavioral'
        ? `In my previous project, we encountered a significant setback when our initial model failed to converge on the validation set after three weeks of training. 

First, I isolated the root cause by inspecting gradient norms and discovered severe vanishing gradients in the attention layers due to improper weight initialization. 

Second, I conducted a systematic ablation study comparing three initialization schemes while implementing layer normalization before the residual joins. 

As a result, the revised architecture converged reliably within 48 hours and achieved an 8.4% improvement in F1-score over our baseline. 

This experience taught me to decouple debugging into isolated unit validations before launching compute-heavy jobs—a discipline I will directly apply to our experiments at ${target.institution || 'your lab'}.`
        : `To tackle this research problem in ${target.researchArea || 'your domain'}, I would approach it systematically in three phases. 

First, establish a rigorous baseline using the standardized benchmarks established in your lab's recent publications, ensuring identical evaluation splits to prevent data leakage. 

Second, formulate an explicit hypothesis testing the trade-off between architectural complexity and sample efficiency, using statistical significance tests (e.g., paired t-tests with Bonferroni correction) rather than relying on single-checkpoint scores. 

Third, conduct comprehensive error analysis to categorize where the model fails on edge distributions. 

By combining rigorous ablation controls with continuous validation against real-world constraints, we can deliver reproducible, publication-ready findings for ${target.institution || 'the department'}.`;

    return {
        score: overallScore,
        rating,
        metrics: {
            technicalAccuracy: Math.min(98, Math.max(40, technicalScore)),
            structureAndClarity: Math.min(98, Math.max(40, structureScore)),
            fitAndMotivation: Math.min(98, Math.max(40, fitScore)),
            academicMaturity: Math.min(98, Math.max(40, maturityScore))
        },
        strengths,
        weaknesses,
        actionableTips: tips,
        modelAnswer
    };
}
