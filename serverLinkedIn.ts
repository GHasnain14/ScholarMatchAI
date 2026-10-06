import { Type } from "@google/genai";
import { generateLinkedInContentFromProfile } from "./utils/linkedInFormatter";
import { CvProfile, LinkedInProfileData } from "./types";

export const linkedInSchema = {
    type: Type.OBJECT,
    properties: {
        headlineIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 high-converting, professional LinkedIn headlines (each under 220 characters) with keywords and domain specializations."
        },
        aboutAcademic: {
            type: Type.STRING,
            description: "Formatted LinkedIn 'About' section for academic / research audience (< 2,200 chars), with hook, research focus, methodologies, publication highlights, and collaboration call-to-action."
        },
        aboutIndustry: {
            type: Type.STRING,
            description: "Formatted LinkedIn 'About' section for industry R&D & tech audience (< 2,000 chars), highlighting applied engineering, technical stack, problem solving, and open-to-opportunities message."
        },
        aboutConcise: {
            type: Type.STRING,
            description: "Concise, punchy LinkedIn 'About' summary under 1,200 characters, ideal for quick mobile scanning."
        },
        experienceEntries: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    roleTitle: { type: Type.STRING },
                    organization: { type: Type.STRING },
                    period: { type: Type.STRING },
                    location: { type: Type.STRING },
                    bulletPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 to 4 impact-driven bullet points using strong action verbs (Spearheaded, Engineered, Formulated, Published)."
                    },
                    skills: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 to 5 core skill tags relevant to this role."
                    },
                    formattedBlock: {
                        type: Type.STRING,
                        description: "Complete text block ready to copy and paste directly into LinkedIn Experience description."
                    }
                },
                required: ["roleTitle", "organization", "period", "bulletPoints", "skills", "formattedBlock"]
            }
        },
        experienceFormattedAll: {
            type: Type.STRING,
            description: "All experience entries combined into a single formatted text block with dividers for one-click bulk copying."
        },
        topSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Top 6 to 8 pinned LinkedIn skills matching the profile."
        }
    },
    required: [
        "headlineIdeas",
        "aboutAcademic",
        "aboutIndustry",
        "aboutConcise",
        "experienceEntries",
        "experienceFormattedAll",
        "topSkills"
    ]
};

export function synthesizeLinkedInFallback(
    cvText: string,
    profileName: string = "Academic Profile",
    targetField: string = "Academic Research & Technology",
    targetInstitutions?: string,
    useEmojis: boolean = true
): LinkedInProfileData {
    const mockProfile: CvProfile = {
        id: "mock_profile",
        name: profileName,
        targetField,
        targetInstitutions,
        text: cvText,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return generateLinkedInContentFromProfile(mockProfile, cvText, null, { useEmojis });
}
