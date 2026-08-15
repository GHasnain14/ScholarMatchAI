import { Scholarship, DocumentType, CvAnalysis } from '../types';

/**
 * Call the backend server endpoint to analyze candidate CV
 */
export const analyzeCv = async (cvText: string): Promise<CvAnalysis> => {
    const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status}): Failed to analyze CV.`);
    }

    const data = await response.json();
    return {
        summary: data.summary || '',
        readinessScore: data.readinessScore || 85,
        topResearchFields: Array.isArray(data.topResearchFields) ? data.topResearchFields : [],
        suggestedKeywords: Array.isArray(data.suggestedKeywords) ? data.suggestedKeywords : [],
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        gaps: Array.isArray(data.gaps) ? data.gaps : [],
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    };
};

export const generateCvSummary = async (cvText: string): Promise<string> => {
    const analysis = await analyzeCv(cvText);
    return analysis.summary;
};

/**
 * Call the backend server endpoint to search for academic opportunities
 */
const getPositions = async (
    cvText: string, 
    prompt: string, 
    feedbackContext?: string
): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const response = await fetch('/api/find-positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cvText,
            prompt,
            feedbackContext,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status}): Failed to find positions.`);
    }

    const data = await response.json();
    return Array.isArray(data.positions) ? data.positions : [];
};

export const findPositions = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and identify at least 15 funded Master’s or PhD research positions, laboratories, and active professor openings worldwide. Focus on high compatibility with the candidate's background. For each position provide: professor/lab name, institution, research subfield, direct URL, reason for match, university tier ('Top-Tier', 'Mid-Tier', 'Low-Rank'), country name, estimated matchScore (75-99), funding status (e.g. 'Fully Funded', 'Research Assistantship', 'Fellowship'), and 3-4 key subfield keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInUSA = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 Master’s/PhD research assistantships (RA/TA) and funded lab positions in the United States (e.g. NSF/NIH funded labs, R1/R2 universities). Include professor names, institution, research focus, direct URL, match reason, tier ('Top-Tier', 'Mid-Tier', 'Low-Rank'), matchScore (75-99), country: 'USA', fundingType, and key keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInCanada = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research positions across Canadian universities (U15 group and regional centers, NSERC/SSHRC labs). Include professor names, institution, research focus, direct lab link, tier, matchScore, country: 'Canada', fundingType, and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInUK = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research opportunities and studentships in the United Kingdom (Russell Group, UKRI, EPSRC/BBSRC funded labs). Include professor names, institution, research subfields, direct URL, tier, matchScore, country: 'UK', fundingType, and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInGermany = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research positions in Germany (Max Planck, Helmholtz, Fraunhofer, TU9, and German Universities with DFG/DAAD funding). Include professor/group name, institution, research area, direct link, tier, matchScore, country: 'Germany', fundingType (e.g. TV-L E13 / DAAD), and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInKorea = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research lab positions in South Korea (KAIST, Seoul National Univ, POSTECH, UNIST, Yonsei, Korea Univ, GIST, etc. with BK21+ or lab stipend). Include professor names, institution, research focus, direct lab link, tier, matchScore, country: 'South Korea', fundingType, and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInJapan = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 Master’s/PhD research opportunities and labs in Japan (Univ of Tokyo, Kyoto, Tokyo Tech, Osaka, Tohoku, RIKEN, with MEXT/JSPS scholarship compatibility). Include professor names, institution, research focus, direct URL, tier, matchScore, country: 'Japan', fundingType, and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInFrance = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 suitable Master’s/PhD lab opportunities in France (CNRS, INRIA, Institut Polytechnique de Paris, Sorbonne, PSL, Université Paris-Saclay). Include professor names, institution, research areas, direct link, tier, matchScore, country: 'France', fundingType, and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findErasmusMundusPositions = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 premier Erasmus Mundus Joint Master’s Degree (EMJMD) programmes funded by the European Commission. Provide the full programme name in 'professorName', coordinating university in 'institution', specialization track in 'researchArea', direct website URL, match rationale, tier, country: 'European Union (EMJMD)', matchScore (80-99), and fundingType: 'Fully Funded (EU Scholarship)'.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInAustralia = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s by Research and PhD positions in Australia (Group of Eight universities: Melbourne, ANU, Sydney, UNSW, UQ, Monash, etc. with RTP/RPS stipends). Include supervisor name, institution, research field, link, tier, matchScore, country: 'Australia', fundingType, and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInSingapore = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 12 funded graduate research lab positions in Singapore (NUS, NTU, SMU, A*STAR institutes). Include professor names, institution, research focus, direct lab link, tier, matchScore, country: 'Singapore', fundingType (e.g. SINGA / Research Scholarship), and keywords.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInPoland = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 12 suitable Master’s/PhD research opportunities in Poland (University of Warsaw, Jagiellonian Univ, Warsaw Univ of Technology, NAWA/NCN grants). Provide professor/program name, institution, research area, link, match rationale, tier, country: 'Poland', matchScore, tuitionFees, ranking, and application requirements.`;
    return getPositions(cvText, prompt, feedbackContext);
};

export const findPositionsInBelgium = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 12 suitable Master’s/PhD research positions in Belgium (KU Leuven, Ghent University, UCLouvain, ULB, VUB, FWO/FNRS fellowships). Provide professor name, institution, research field, link, match reason, tier, country: 'Belgium', matchScore, tuitionFees, ranking, and application requirements.`;
    return getPositions(cvText, prompt, feedbackContext);
};

const getDocumentPrompt = (docType: DocumentType, englishLevel: number): string => {
    const writingStyleInstruction = `Write in a natural, human-like style reflecting an English writing proficiency of ${englishLevel} out of 9 (similar to IELTS Band ${englishLevel}). The tone should be professional, confident, and clear. Avoid using bullet points or lists with hyphens; instead, integrate all points into well-structured paragraphs.`;

    switch (docType) {
        case DocumentType.Email:
            return `Using the candidate’s CV and the details of the identified Master’s/PhD research position, draft a personalized and persuasive outreach email to the professor. The email should introduce the candidate, demonstrate deep alignment with the professor’s latest research papers or lab themes, express genuine interest, and maintain a professional and concise tone (maximum 3–4 short paragraphs). Include a concise subject line (e.g. "Prospective PhD/MSc Student - [Candidate Name] - [Lab Topic Inquiry]"). End with a polite request for a brief call.
${writingStyleInstruction}`;
        case DocumentType.FollowUpEmail:
            return `Draft a polite, professional 2-week follow-up email to the professor inquiring on the previous outreach. It should be concise (2 brief paragraphs), re-affirming strong interest in their recent work, mentioning one new development or paper read, and asking if they have 10 minutes to connect.
${writingStyleInstruction}`;
        case DocumentType.MotivationLetter:
            return `Using the candidate’s CV and the details of the identified research position, draft a tailored motivation letter. The letter should introduce the candidate, summarize their background, demonstrate a strong alignment with the professor’s work, highlight their research motivation, and explain how they will contribute to lab objectives. Keep length to 1–1.5 pages.
${writingStyleInstruction}`;
        case DocumentType.CoverLetter:
            return `Using the candidate's CV and the details of the identified research position, draft a formal Cover Letter tailored for the specific university scholarship or advertised position. Detail qualifications, technical tools, lab methods, and project accomplishments matching the role.
${writingStyleInstruction}`;
        case DocumentType.ResearchProposal:
            return `Based on the candidate's CV and the provided details for the professor/lab, draft a concise 1-page research proposal. Formulate an academic research question, hypothesis, concise literature background, proposed methodology/computational stack, and expected contribution to the lab's ongoing agenda.
${writingStyleInstruction}`;
        case DocumentType.StatementOfPurpose:
            return `Based on the candidate's CV and the provided details for the professor/lab, draft a compelling Statement of Purpose (SOP). Narrate the candidate's academic and intellectual trajectory, connect past milestones to future goals, articulate specific reasons for choosing this university and mentor, and convey future career vision.
${writingStyleInstruction}`;
        case DocumentType.InterviewPrep:
            return `Create a high-impact Interview Q&A Preparation Cheat Sheet for this candidate interviewing with this professor/lab. Include 5 anticipated technical/behavioral interview questions (e.g., about methodology, research setbacks, literature familiarity) with tailored suggested talking points based on their CV and the lab's core work.
${writingStyleInstruction}`;
        default:
            return '';
    }
};

/**
 * Call the backend server endpoint to draft academic documents
 */
export const draftDocument = async (
    cvText: string, 
    positionDetails: string, 
    docType: DocumentType, 
    englishLevel: number,
    initialDraft?: string,
    feedback?: string,
    tone?: string
): Promise<string> => {
    const docPrompt = getDocumentPrompt(docType, englishLevel);

    const response = await fetch('/api/draft-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cvText,
            positionDetails,
            docPrompt,
            initialDraft,
            feedback,
            tone,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status}): Failed to draft document.`);
    }

    const data = await response.json();
    return data.content || '';
};

/**
 * Call the backend server endpoint to clean AI watermarks and humanize academic text
 */
export const cleanAndHumanizeText = async (params: {
    text: string;
    mode?: 'stealth-clean' | 'academic-humanize' | 'executive-polish' | 'concise-scholarly';
    preserveCitations?: boolean;
}): Promise<string> => {
    const { text, mode = 'academic-humanize', preserveCitations = true } = params;

    const response = await fetch('/api/humanize-clean-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text,
            mode,
            preserveCitations,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status}): Failed to clean text.`);
    }

    const data = await response.json();
    return data.cleanedText || '';
};

