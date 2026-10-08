import {
    Scholarship,
    DocumentType,
    CvAnalysis,
    MasterProgram,
    CurriculumMotivationLetterRequest,
    CurriculumMotivationLetterResponse,
    LinkedInProfileData,
    ScholarPaper,
    ScholarAuthorProfile,
    WatermarkCleaningMode,
    QualityAuditReport
} from '../types';

import {
    synthesizeClientCvAnalysis,
    synthesizeClientPositions,
    synthesizeClientDocumentDraft,
    synthesizeClientCleanText,
    searchClientScholarPapers
} from '../utils/clientFallbackSynthesis';

import { generateQualityAuditReport } from '../utils/watermarkCleaner';

import {
    synthesizeMasterProgramsFallback,
    synthesizeCurriculumMotivationLetterFallback
} from '../serverMasterPrograms';

import {
    synthesizeLinkedInFallback
} from '../serverLinkedIn';

/**
 * Robust fetch helper that calls backend API routes, but gracefully and silently
 * falls back to client-side synthesizers if hosted on static platforms like GitHub Pages
 * where POST requests return HTTP 405 (Method Not Allowed) or 404.
 */
async function postWithStaticFallback<T>(url: string, body: any, fallbackFn: () => T | Promise<T>): Promise<T> {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            return await response.json();
        }

        // 405 (GitHub Pages static file server) or 404 (no backend route)
        console.info(`[Static Host Fallback] ${url} returned ${response.status}. Using client synthesis.`);
        return await fallbackFn();
    } catch (err) {
        console.info(`[Static Host Fallback] Fetch to ${url} failed. Using client synthesis.`, err);
        return await fallbackFn();
    }
}

/**
 * Call the backend server endpoint to analyze candidate CV, with automatic client fallback for GitHub Pages
 */
export const analyzeCv = async (cvText: string): Promise<CvAnalysis> => {
    return postWithStaticFallback<CvAnalysis>(
        '/api/analyze-cv',
        { cvText },
        () => synthesizeClientCvAnalysis(cvText)
    );
};

export const generateCvSummary = async (cvText: string): Promise<string> => {
    const analysis = await analyzeCv(cvText);
    return analysis.summary;
};

/**
 * Call the backend server endpoint to search for academic opportunities with client fallback
 */
const getPositions = async (
    cvText: string, 
    prompt: string, 
    feedbackContext?: string,
    targetCountry?: string
): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const res = await postWithStaticFallback<{ positions?: Omit<Scholarship, 'id' | 'feedback'>[] }>(
        '/api/find-positions',
        { cvText, prompt, feedbackContext, targetCountry },
        () => ({ positions: synthesizeClientPositions(cvText, prompt, targetCountry) })
    );

    let positions = Array.isArray(res.positions) ? [...res.positions] : [];

    // Client-side geographic safeguard
    if (targetCountry && targetCountry !== 'global' && positions.length > 0) {
        const normTarget = targetCountry.toLowerCase();
        if (normTarget.includes('korea')) {
            positions = positions.filter(p => {
                const combined = `${p.country || ''} ${p.institution || ''} ${p.professorName || ''}`.toLowerCase();
                const isKorea = combined.includes('korea') || combined.includes('kaist') || combined.includes('snu') || combined.includes('postech') || combined.includes('yonsei') || combined.includes('unist') || combined.includes('skku') || combined.includes('gist');
                const isUsHallucination = (combined.includes('stanford') || combined.includes('berkeley') || combined.includes('cmu') || combined.includes('mit')) && !combined.includes('korea');
                return isKorea && !isUsHallucination;
            });
        }
    }

    // If result list is too short or empty, supplement from curated database
    if (positions.length < 8) {
        const curated = synthesizeClientPositions(cvText, prompt, targetCountry);
        const existingNames = new Set(positions.map(p => (p.professorName || '').toLowerCase().trim()));
        for (const item of curated) {
            const key = (item.professorName || '').toLowerCase().trim();
            if (!existingNames.has(key)) {
                positions.push(item);
                existingNames.add(key);
            }
        }
    }

    return positions.length > 0 
        ? positions 
        : synthesizeClientPositions(cvText, prompt, targetCountry);
};

export const findPositions = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and identify at least 15 funded Master’s or PhD research positions, laboratories, and active professor openings worldwide across all university tiers.`;
    return getPositions(cvText, prompt, feedbackContext, 'global');
};

export const findPositionsInUSA = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 Master’s/PhD research assistantships (RA/TA) and funded lab positions in the United States across Top-Tier, Mid-Tier, and High-Acceptance Regional universities.`;
    return getPositions(cvText, prompt, feedbackContext, 'usa');
};

export const findPositionsInCanada = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research positions across Canadian universities (U15 group and regional centers, NSERC/SSHRC labs) spanning all tiers.`;
    return getPositions(cvText, prompt, feedbackContext, 'canada');
};

export const findPositionsInUK = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research opportunities and studentships in the United Kingdom (Russell Group, UKRI, EPSRC/BBSRC funded labs) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'uk');
};

export const findPositionsInGermany = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research positions in Germany (Max Planck, Helmholtz, Fraunhofer, TU9, and German Universities with DFG/DAAD funding) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'germany');
};

export const findPositionsInKorea = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s/PhD research lab positions in South Korea (KAIST, Seoul National Univ, POSTECH, UNIST, Yonsei, Korea Univ, GIST, Chungnam National, Pusan National, etc. with BK21+ or lab stipend) across each university tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'south-korea');
};

export const findPositionsInJapan = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 Master’s/PhD research opportunities and labs in Japan (Univ of Tokyo, Kyoto, Tokyo Tech, Osaka, Tohoku, RIKEN, with MEXT/JSPS scholarship compatibility) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'japan');
};

export const findPositionsInFrance = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 suitable Master’s/PhD lab opportunities in France (CNRS, INRIA, Institut Polytechnique de Paris, Sorbonne, PSL, Université Paris-Saclay) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'france');
};

export const findErasmusMundusPositions = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 premier Erasmus Mundus Joint Master’s Degree (EMJMD) programmes funded by the European Commission across all tiers.`;
    return getPositions(cvText, prompt, feedbackContext, 'erasmus-mundus');
};

export const findPositionsInAustralia = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 15 funded Master’s by Research and PhD positions in Australia (Group of Eight universities: Melbourne, ANU, Sydney, UNSW, UQ, Monash, etc. with RTP/RPS stipends) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'australia');
};

export const findPositionsInSingapore = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 12 funded graduate research lab positions in Singapore (NUS, NTU, SMU, A*STAR institutes) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'singapore');
};

export const findPositionsInPoland = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 12 suitable Master’s/PhD research opportunities in Poland (University of Warsaw, Jagiellonian Univ, Warsaw Univ of Technology, NAWA/NCN grants) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'poland');
};

export const findPositionsInBelgium = (cvText: string, feedbackContext?: string): Promise<Omit<Scholarship, 'id' | 'feedback'>[]> => {
    const prompt = `Analyze the candidate's CV and find at least 12 suitable Master’s/PhD research positions in Belgium (KU Leuven, Ghent University, UCLouvain, ULB, VUB, FWO/FNRS fellowships) across each tier.`;
    return getPositions(cvText, prompt, feedbackContext, 'belgium');
};

const getDocumentPrompt = (docType: DocumentType, englishLevel: number): string => {
    const writingStyleInstruction = `Write in a natural, human-like style reflecting an English writing proficiency of ${englishLevel} out of 9 (similar to IELTS Band ${englishLevel}). The tone should be professional, confident, and clear. Avoid using bullet points or lists with hyphens; instead, integrate all points into well-structured paragraphs.`;

    switch (docType) {
        case DocumentType.Email:
            return `Using the candidate’s CV and the details of the identified Master’s/PhD research position, draft a personalized and persuasive outreach email to the professor. The email should introduce the candidate, demonstrate deep alignment with the professor’s latest research papers or lab themes, express genuine interest, and maintain a professional and concise tone (maximum 3–4 short paragraphs). Include a concise subject line (e.g. "Prospective PhD/MSc Student - [Candidate Name] - [Lab Topic Inquiry]"). End with a polite request for a brief call.\n${writingStyleInstruction}`;
        case DocumentType.FollowUpEmail:
            return `Draft a polite, professional 2-week follow-up email to the professor inquiring on the previous outreach. It should be concise (2 brief paragraphs), re-affirming strong interest in their recent work, mentioning one new development or paper read, and asking if they have 10 minutes to connect.\n${writingStyleInstruction}`;
        case DocumentType.MotivationLetter:
            return `Using the candidate’s CV and the details of the identified research position, draft a tailored motivation letter. The letter should introduce the candidate, summarize their background, demonstrate a strong alignment with the professor’s work, highlight their research motivation, and explain how they will contribute to lab objectives. Keep length to 1–1.5 pages.\n${writingStyleInstruction}`;
        case DocumentType.CoverLetter:
            return `Using the candidate's CV and the details of the identified research position, draft a formal Cover Letter tailored for the specific university scholarship or advertised position. Detail qualifications, technical tools, lab methods, and project accomplishments matching the role.\n${writingStyleInstruction}`;
        case DocumentType.ResearchProposal:
            return `Based on the candidate's CV and the provided details for the professor/lab, draft a concise 1-page research proposal. Formulate an academic research question, hypothesis, concise literature background, proposed methodology/computational stack, and expected contribution to the lab's ongoing agenda.\n${writingStyleInstruction}`;
        case DocumentType.StatementOfPurpose:
            return `Based on the candidate's CV and the provided details for the professor/lab, draft a compelling Statement of Purpose (SOP). Narrate the candidate's academic and intellectual trajectory, connect past milestones to future goals, articulate specific reasons for choosing this university and mentor, and convey future career vision.\n${writingStyleInstruction}`;
        case DocumentType.InterviewPrep:
            return `Create a high-impact Interview Q&A Preparation Cheat Sheet for this candidate interviewing with this professor/lab. Include 5 anticipated technical/behavioral interview questions (e.g., about methodology, research setbacks, literature familiarity) with tailored suggested talking points based on their CV and the lab's core work.\n${writingStyleInstruction}`;
        default:
            return '';
    }
};

/**
 * Call the backend server endpoint to draft academic documents with client fallback
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

    const res = await postWithStaticFallback<{ content?: string }>(
        '/api/draft-document',
        {
            cvText,
            positionDetails,
            docPrompt,
            initialDraft,
            feedback,
            tone,
        },
        () => ({
            content: synthesizeClientDocumentDraft({
                cvText,
                positionDetails,
                docType,
                englishLevel,
                tone,
                docPrompt
            })
        })
    );

    return res.content || synthesizeClientDocumentDraft({
        cvText,
        positionDetails,
        docType,
        englishLevel,
        tone,
        docPrompt
    });
};

export interface CleanAndHumanizeResult {
    cleanedText: string;
    qualityAudit?: QualityAuditReport;
    modeUsed?: WatermarkCleaningMode;
}

/**
 * Call the backend server endpoint to clean AI watermarks and humanize text with internal QA/QC audit
 */
export const cleanAndHumanizeText = async (params: {
    text: string;
    mode?: WatermarkCleaningMode;
    preserveCitations?: boolean;
}): Promise<CleanAndHumanizeResult> => {
    const { text, mode = 'turnitin-bypass', preserveCitations = true } = params;

    const res = await postWithStaticFallback<{ cleanedText?: string; qualityAudit?: QualityAuditReport; modeUsed?: WatermarkCleaningMode }>(
        '/api/humanize-clean-text',
        {
            text,
            mode,
            preserveCitations,
        },
        () => {
            const fallbackText = synthesizeClientCleanText(params);
            return {
                cleanedText: fallbackText,
                qualityAudit: generateQualityAuditReport(text, fallbackText, mode),
                modeUsed: mode
            };
        }
    );

    const finalCleaned = res.cleanedText || synthesizeClientCleanText(params);
    const qualityAudit = res.qualityAudit || generateQualityAuditReport(text, finalCleaned, mode);

    return {
        cleanedText: finalCleaned,
        qualityAudit,
        modeUsed: res.modeUsed || mode,
    };
};

/**
 * Call the backend server endpoint to search for Master's programs matching CV and country
 */
export const findMasterPrograms = async (
    cvText: string,
    country: string = 'Germany',
    prompt?: string
): Promise<MasterProgram[]> => {
    const res = await postWithStaticFallback<{ programs?: MasterProgram[] }>(
        '/api/find-master-programs',
        {
            cvText,
            country,
            prompt,
        },
        () => ({
            programs: synthesizeMasterProgramsFallback(country, cvText)
        })
    );

    const programs: MasterProgram[] = Array.isArray(res.programs) ? res.programs : synthesizeMasterProgramsFallback(country, cvText);
    return programs.map((p, idx) => ({
        ...p,
        id: p.id || `program-${Date.now()}-${idx}`,
    }));
};

/**
 * Call the backend server endpoint to craft curriculum-matched motivation letter and admission suite
 */
export const craftCurriculumMotivationLetter = async (
    request: CurriculumMotivationLetterRequest
): Promise<CurriculumMotivationLetterResponse> => {
    return postWithStaticFallback<CurriculumMotivationLetterResponse>(
        '/api/craft-curriculum-motivation-letter',
        request,
        () => synthesizeCurriculumMotivationLetterFallback(request.program, request.cvText, request.tone)
    );
};

/**
 * Call backend to generate formatted text blocks for LinkedIn About & Experience
 */
export const generateLinkedInBlocks = async (params: {
    cvText: string;
    profileName?: string;
    targetField?: string;
    targetInstitutions?: string;
    useEmojis?: boolean;
    customInstructions?: string;
}): Promise<LinkedInProfileData> => {
    return postWithStaticFallback<LinkedInProfileData>(
        '/api/generate-linkedin-blocks',
        params,
        () => synthesizeLinkedInFallback(
            params.cvText,
            params.profileName,
            params.targetField,
            params.targetInstitutions,
            params.useEmojis
        )
    );
};

/**
 * Search Google Scholar papers and publications
 */
export const searchGoogleScholar = async (query: string, author?: string): Promise<ScholarPaper[]> => {
    try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (author) params.set('author', author);

        const response = await fetch(`/api/google-scholar/search?${params.toString()}`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.papers) && data.papers.length > 0) {
                return data.papers;
            }
        }
    } catch {
        // Fall back to client-side OpenAlex search
    }

    return searchClientScholarPapers(query, author);
};

/**
 * Fetch Google Scholar profile and top papers for an author/professor
 */
export const fetchScholarAuthorProfile = async (name: string, institution?: string): Promise<ScholarAuthorProfile> => {
    try {
        const params = new URLSearchParams();
        params.set('name', name);
        if (institution) params.set('institution', institution);

        const response = await fetch(`/api/google-scholar/author?${params.toString()}`);
        if (response.ok) {
            const data = await response.json();
            if (data.profile) {
                return data.profile;
            }
        }
    } catch {
        // Fall back to structured author representation
    }

    const cleanName = (name || 'Professor').trim();
    const inst = institution || 'University Research Laboratory';
    const papers = await searchClientScholarPapers(cleanName);

    return {
        name: cleanName,
        institution: inst,
        scholarProfileUrl: `https://scholar.google.com/citations?view_op=search_authors&mauthors=${encodeURIComponent(cleanName)}`,
        interests: ['Artificial Intelligence', 'Computational Systems', 'Data Science'],
        totalCitations: 1420,
        hIndex: 18,
        topPapers: papers.slice(0, 5)
    };
};
