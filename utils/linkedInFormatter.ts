import { CvProfile, CvAnalysis, LinkedInProfileData, LinkedInExperienceItem } from '../types';

export interface LinkedInFormatOptions {
    useEmojis?: boolean;
    style?: 'academic' | 'industry' | 'concise';
    includeContact?: boolean;
    customContactNote?: string;
}

/**
 * Helper to clean and normalize text
 */
function cleanLine(line: string): string {
    return line.replace(/^[-*•–—\d.)\s]+/, '').trim();
}

/**
 * Parse structured entities from raw academic CV text
 */
export function extractProfileDetails(cvText: string, profile?: CvProfile) {
    const lines = cvText.split('\n').map(l => l.trim()).filter(Boolean);

    // Candidate Name
    let name = profile?.name?.replace(/^(Tailored CV|Academic Profile|Default CV|CV)\s*(\(\d+\))?/i, '').trim() || '';
    const nameMatch = cvText.match(/NAME\s*:\s*([^\n\r]+)/i);
    if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
    } else if (!name || name.length < 2) {
        for (const line of lines.slice(0, 4)) {
            if (!line.includes(':') && line.length < 40 && !line.toLowerCase().includes('curriculum') && !line.toLowerCase().includes('resume')) {
                name = line.replace(/^(Mr\.|Ms\.|Dr\.|Prof\.)\s*/i, '').trim();
                break;
            }
        }
    }
    if (!name) name = 'Academic Candidate';

    // Degree & Field
    let degree = '';
    const degreeMatch = cvText.match(/(?:DEGREE|EDUCATION|QUALIFICATION)\s*:\s*([^\n\r]+)/i);
    if (degreeMatch && degreeMatch[1]) {
        degree = degreeMatch[1].trim();
    } else {
        const degLine = lines.find(l => /(?:b\.s\.|b\.sc\.|bachelor|m\.s\.|m\.sc\.|master|ph\.d\.|phd|b\.eng\.|doctorate)/i.test(l));
        if (degLine) {
            degree = cleanLine(degLine);
        }
    }
    if (!degree) degree = 'Graduate Researcher & Scholar';

    // Target Field
    let targetField = profile?.targetField || '';
    if (!targetField || targetField === 'General Academic') {
        const fieldMatch = cvText.match(/(?:RESEARCH INTERESTS|RESEARCH AREA|FIELD|SPECIALIZATION)\s*:\s*([^\n\r]+)/i);
        if (fieldMatch && fieldMatch[1]) {
            targetField = fieldMatch[1].trim();
        } else {
            targetField = 'Academic Research & Technology';
        }
    }

    // Institution
    let institution = '';
    const instMatch = cvText.match(/(?:INSTITUTION|UNIVERSITY|COLLEGE)\s*:\s*([^\n\r]+)/i);
    if (instMatch && instMatch[1]) {
        institution = instMatch[1].trim();
    }

    // Research Interests
    const interests: string[] = [];
    const interestsMatch = cvText.match(/(?:RESEARCH INTERESTS|AREAS OF INTEREST|CORE COMPETENCIES)\s*:\s*([^\n\r]+(?:\n\s*[-*•][^\n\r]+)*)/i);
    if (interestsMatch && interestsMatch[1]) {
        const rawInterests = interestsMatch[1].replace(/^(?:RESEARCH INTERESTS|AREAS OF INTEREST|CORE COMPETENCIES)\s*:\s*/i, '');
        rawInterests.split(/[,;\n•*]/).forEach(item => {
            const trimmed = item.trim();
            if (trimmed && trimmed.length > 2 && trimmed.length < 50) {
                interests.push(trimmed);
            }
        });
    }

    // Publications
    const publications: string[] = [];
    const pubBlock = cvText.match(/(?:PUBLICATIONS|WORKSHOPS|PAPERS|CONFERENCES)([\s\S]*?)(?=(?:HONORS|AWARDS|EXPERIENCE|PROFICIENCIES|SKILLS|PROJECTS|REFERENCES|\n\s*[A-Z\s]{4,}:|$))/i);
    if (pubBlock && pubBlock[1]) {
        const pubLines = pubBlock[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*') || /^\d+\./.test(l) || l.includes('et al'));
        pubLines.forEach(l => {
            const cleaned = cleanLine(l);
            if (cleaned.length > 10) publications.push(cleaned);
        });
    }

    // Awards & Honors
    const awards: string[] = [];
    const awardBlock = cvText.match(/(?:HONORS|AWARDS|FELLOWSHIPS|SCHOLARSHIPS)([\s\S]*?)(?=(?:PUBLICATIONS|EXPERIENCE|PROFICIENCIES|SKILLS|PROJECTS|REFERENCES|\n\s*[A-Z\s]{4,}:|$))/i);
    if (awardBlock && awardBlock[1]) {
        awardBlock[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*') || /^\d+\./.test(l)).forEach(l => {
            const cleaned = cleanLine(l);
            if (cleaned.length > 5) awards.push(cleaned);
        });
    }

    // Skills & Proficiencies
    const skillsList: string[] = [];
    const skillsBlock = cvText.match(/(?:TECHNICAL PROFICIENCIES|SKILLS & PROFICIENCIES|SKILLS|LABORATORY SKILLS|TOOLS)([\s\S]*?)(?=(?:PUBLICATIONS|AWARDS|EXPERIENCE|REFERENCES|\n\s*[A-Z\s]{4,}:|$))/i);
    if (skillsBlock && skillsBlock[1]) {
        const skillText = skillsBlock[1].replace(/(?:Languages|Wet Lab|Dry Lab|Tools|Frameworks|Hardware|Standardized Tests)\s*:/gi, ',');
        skillText.split(/[,;\n•*]/).forEach(s => {
            const cleaned = cleanLine(s).replace(/\([^)]*\)/g, '').trim();
            if (cleaned.length >= 2 && cleaned.length <= 35 && !cleaned.toLowerCase().includes('toefl') && !cleaned.toLowerCase().includes('gre') && !cleaned.toLowerCase().includes('ielts')) {
                skillsList.push(cleaned);
            }
        });
    }

    // Experience Items
    const experienceItems: { role: string; org: string; dates: string; location?: string; bullets: string[] }[] = [];
    const expBlock = cvText.match(/(?:RESEARCH & ACADEMIC EXPERIENCE|RESEARCH EXPERIENCE|EXPERIENCE|PROJECTS|RESEARCH & LAB PROJECTS)([\s\S]*?)(?=(?:PUBLICATIONS|AWARDS|HONORS|TECHNICAL PROFICIENCIES|SKILLS|STANDARDIZED TESTS|\n\s*[A-Z\s]{4,}:|$))/i);
    
    if (expBlock && expBlock[1]) {
        const expLines = expBlock[1].split('\n').map(l => l.trim()).filter(Boolean);
        let currentItem: { role: string; org: string; dates: string; location?: string; bullets: string[] } | null = null;

        for (const line of expLines) {
            if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                const cleaned = cleanLine(line);
                // Check if this bullet is actually a role heading like "- Undergraduate Researcher, Visual Perception Lab (2022 - 2024): Developed..."
                const roleMatch = cleaned.match(/^([^,]+),\s*([^(:]+)(?:\(([^)]+)\))?\s*:\s*(.*)$/);
                if (roleMatch) {
                    if (currentItem) experienceItems.push(currentItem);
                    currentItem = {
                        role: roleMatch[1].trim(),
                        org: roleMatch[2].trim(),
                        dates: roleMatch[3]?.trim() || 'Recent',
                        bullets: roleMatch[4]?.trim() ? [roleMatch[4].trim()] : [],
                    };
                } else if (currentItem) {
                    currentItem.bullets.push(cleaned);
                } else {
                    // Start an item
                    currentItem = {
                        role: 'Research Project / Assistantship',
                        org: institution || 'Academic Laboratory',
                        dates: 'Recent',
                        bullets: [cleaned],
                    };
                }
            } else if (line.includes(':') && !line.toLowerCase().startsWith('note')) {
                // Header style role: "Undergraduate Researcher: Lab Name"
                if (currentItem) experienceItems.push(currentItem);
                const parts = line.split(':');
                currentItem = {
                    role: parts[0].trim(),
                    org: institution || 'Academic Laboratory',
                    dates: 'Recent',
                    bullets: parts[1]?.trim() ? [parts[1].trim()] : [],
                };
            } else if (currentItem) {
                currentItem.bullets.push(line);
            }
        }
        if (currentItem) experienceItems.push(currentItem);
    }

    // Default experience item if none parsed cleanly
    if (experienceItems.length === 0) {
        experienceItems.push({
            role: 'Graduate Researcher & Scholar',
            org: institution || 'Research Group',
            dates: '2023 - Present',
            bullets: [
                `Conducted investigative research in ${targetField}, synthesizing empirical datasets and validating theoretical hypotheses.`,
                'Applied rigorous quantitative methodologies and modern computational tooling to analyze complex experimental results.',
                'Collaborated with interdisciplinary teams to prepare reproducible code, technical documentation, and academic manuscripts.'
            ],
        });
    }

    return {
        name,
        degree,
        targetField,
        institution,
        interests,
        publications,
        awards,
        skillsList: Array.from(new Set(skillsList)),
        experienceItems,
    };
}

/**
 * Generate formatted text block for LinkedIn About and Experience sections
 */
export function generateLinkedInContentFromProfile(
    profile: CvProfile,
    cvText: string = profile.text,
    analysis?: CvAnalysis | null,
    options: LinkedInFormatOptions = {}
): LinkedInProfileData {
    const { useEmojis = true, includeContact = true, customContactNote } = options;
    const details = extractProfileDetails(cvText, profile);

    const b = (emoji: string, fallback: string = '•') => useEmojis ? `${emoji} ` : `${fallback} `;
    const h = (emoji: string, title: string) => useEmojis ? `${emoji} ${title}` : title.toUpperCase();

    // Top skills selection
    const rawSkills = [
        ...details.skillsList,
        ...(analysis?.suggestedKeywords || []),
        ...(details.interests || [])
    ].filter(s => s && s.length > 2 && s.length < 35);
    
    const uniqueSkills = Array.from(new Set(rawSkills)).slice(0, 12);
    const topSkills = uniqueSkills.slice(0, 8);

    // 1. LINKEDIN 'ABOUT' - ACADEMIC & RESEARCHER FOCUS
    const academicHook = `${b('🔬')}Researcher & Scholar in ${details.targetField} | ${details.degree}`;
    const academicMission = `I am driven by pushing scientific boundaries in ${details.targetField}. My research explores fundamental mechanisms, reproducible methodologies, and computational frameworks to solve complex challenges in contemporary science.`;
    
    const academicCoreCompetencies = [
        `${b('🎯')}Core Research Focus: ${details.interests.length > 0 ? details.interests.slice(0, 4).join(', ') : details.targetField}`,
        `${b('🛠️')}Methodologies & Tooling: ${topSkills.slice(0, 6).join(' · ')}`,
        details.institution ? `${b('🏛️')}Affiliation & Background: ${details.degree} from ${details.institution}` : '',
    ].filter(Boolean).join('\n');

    const academicOutput = [];
    if (details.publications.length > 0) {
        academicOutput.push(`${b('📄')}Selected Publications & Preprints:\n${details.publications.slice(0, 2).map(p => `   • "${p}"`).join('\n')}`);
    }
    if (details.awards.length > 0) {
        academicOutput.push(`${b('🏆')}Honors & Distinctions:\n${details.awards.slice(0, 2).map(a => `   • ${a}`).join('\n')}`);
    }
    if (analysis?.strengths && analysis.strengths.length > 0) {
        academicOutput.push(`${b('💡')}Key Strengths: ${analysis.strengths.slice(0, 2).join('; ')}`);
    }

    const academicContact = includeContact
        ? `\n${h('📬', 'Let\'s Connect')}\n${customContactNote || 'Always eager to discuss collaborative research, PhD/postdoctoral fellowships, academic symposiums, and interdisciplinary inquiries. Feel free to connect or message me directly on LinkedIn!'}`
        : '';

    const aboutAcademic = [
        academicHook,
        '',
        academicMission,
        '',
        `${h('📌', 'Research Areas & Technical Expertise')}:`,
        academicCoreCompetencies,
        '',
        academicOutput.length > 0 ? `${h('✨', 'Scholarly Highlights')}:\n${academicOutput.join('\n\n')}\n` : '',
        academicContact
    ].filter(l => l !== undefined).join('\n').trim();

    // 2. LINKEDIN 'ABOUT' - INDUSTRY & APPLIED R&D FOCUS
    const industryHook = `${b('🚀')}Translating cutting-edge research in ${details.targetField} into scalable real-world solutions.`;
    const industrySummary = `With a rigorous foundation in ${details.degree}, I specialize in bridging advanced academic research with production-grade engineering and data-driven problem solving. I focus on developing robust algorithms, reproducible pipelines, and measurable outcomes.`;
    
    const industryHighlights = [
        `${b('⚡')}Applied Expertise: ${details.interests.slice(0, 3).join(', ') || details.targetField}`,
        `${b('💻')}Tech Stack: ${topSkills.join(' · ')}`,
        `${b('📈')}Impact Philosophy: Combining experimental rigor with agile engineering to deliver tangible advancements.`,
    ].join('\n');

    const industryContact = includeContact
        ? `\n${h('🤝', 'Open to Opportunities')}\n${customContactNote || 'Exploring R&D Scientist, Research Engineering, and Applied Science positions where deep domain expertise drives technological innovation. Reach out to connect!'}`
        : '';

    const aboutIndustry = [
        industryHook,
        '',
        industrySummary,
        '',
        `${h('🛠️', 'Core Technical Proficiencies')}:`,
        industryHighlights,
        '',
        details.publications.length > 0 ? `${b('📊')}Authored contributions featured at: ${details.publications[0]}` : '',
        industryContact
    ].filter(Boolean).join('\n').trim();

    // 3. LINKEDIN 'ABOUT' - CONCISE & PUNCHY (< 1,200 chars)
    const aboutConcise = [
        `${details.name} | ${details.targetField} Researcher | ${details.degree}`,
        '',
        `Passionate about scientific discovery, computational rigor, and empirical breakthroughs in ${details.targetField}.`,
        '',
        `${b('✨')}Specialties: ${details.interests.slice(0, 4).join(' • ') || details.targetField}`,
        `${b('🛠️')}Tools: ${topSkills.slice(0, 6).join(' · ')}`,
        details.publications.length > 0 ? `${b('📄')}Publication: ${details.publications[0]}` : '',
        '',
        includeContact ? `${b('📬')}Open to research collaborations, conference discussions, and high-impact scientific opportunities.` : ''
    ].filter(Boolean).join('\n').trim();

    // 4. LINKEDIN 'EXPERIENCE' ENTRIES
    const experienceEntries: LinkedInExperienceItem[] = details.experienceItems.map((item, idx) => {
        const skillsSnippet = topSkills.slice(idx * 2, (idx * 2) + 4);
        const skillsString = skillsSnippet.length > 0 
            ? `Skills: ${skillsSnippet.join(' · ')}` 
            : `Skills: ${details.targetField} · Academic Research`;

        // Format bullet points with strong verbs if not already starting with one
        const formattedBullets = item.bullets.map(bullet => {
            const cleaned = cleanLine(bullet);
            return `${useEmojis ? '• ' : '- '}${cleaned}`;
        });

        const formattedBlock = [
            `Role: ${item.role}`,
            `Company / Lab: ${item.org}`,
            `Dates: ${item.dates}`,
            item.location ? `Location: ${item.location}` : null,
            '',
            'Description:',
            ...formattedBullets,
            '',
            skillsString,
        ].filter(Boolean).join('\n');

        return {
            id: `exp_${idx}_${Date.now()}`,
            roleTitle: item.role,
            organization: item.org,
            period: item.dates,
            location: item.location,
            bulletPoints: formattedBullets,
            skills: skillsSnippet,
            formattedBlock,
        };
    });

    const experienceFormattedAll = experienceEntries
        .map((entry, idx) => `[EXPERIENCE ENTRY ${idx + 1}: ${entry.roleTitle.toUpperCase()} @ ${entry.organization.toUpperCase()}]\n\n${entry.formattedBlock}`)
        .join('\n\n═══════════════════════════════════════════════════════\n\n');

    // 5. LINKEDIN HEADLINES (< 220 characters)
    const headlineIdeas = [
        `${details.targetField} Researcher | ${details.degree} | Exploring ${details.interests[0] || 'Scientific Innovation'} | Open to Fellowships & Collaborations`,
        `Doctoral Scholar & Researcher @ ${details.institution || 'Academic Lab'} | ${topSkills.slice(0, 3).join(' · ')} | ${details.targetField}`,
        `${details.targetField} | Applied Research & Engineering | ${details.degree} | Published in ${details.publications[0]?.substring(0, 30) || 'Peer-Reviewed Venues'}`,
    ].map(h => h.length > 220 ? h.substring(0, 217) + '...' : h);

    return {
        headlineIdeas,
        aboutAcademic,
        aboutIndustry,
        aboutConcise,
        experienceEntries,
        experienceFormattedAll,
        topSkills,
    };
}
