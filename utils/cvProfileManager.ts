import { CvProfile } from '../types';

export const LOCAL_STORAGE_KEY_PROFILES = 'scholar_cv_profiles';
export const LOCAL_STORAGE_KEY_ACTIVE_ID = 'scholar_active_cv_id';
export const LOCAL_STORAGE_LEGACY_CV_TEXT = 'scholar_cv_text';

export const STARTER_CV_TEMPLATES: Omit<CvProfile, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>[] = [
    {
        name: 'AI & Computer Vision Specialist',
        targetField: 'Artificial Intelligence & Robotics',
        targetInstitutions: 'TUM, KAIST, CMU, Oxford, EPFL',
        notes: 'Tailored with emphasis on PyTorch, 3D point clouds, real-time perception, and CVPR workshop publication.',
        text: `NAME: Alex Chen
DEGREE: B.S. in Computer Science & Artificial Intelligence (GPA: 3.89/4.0)
INSTITUTION: University of Science and Technology
RESEARCH INTERESTS: Deep Learning, Generative Models, Autonomous Robotics, Real-time Computer Vision, Neural Radiance Fields (NeRF).

PUBLICATIONS & WORKSHOPS:
- Chen, A., et al. "Efficient Spatial Attention for Real-time Robotic Perception." Under review at CVPR Workshop, 2024.

HONORS & AWARDS:
- National Dean's Academic Excellence Award (Top 2%)
- 1st Place, National AI Hackathon (Medical Imaging Challenge)

RESEARCH & ACADEMIC EXPERIENCE:
- Undergraduate Researcher, Visual Perception Lab (2022 - 2024): Developed PyTorch-based neural architectures for 3D point cloud segmentation; optimized model inference using TensorRT yielding a 4.2x speedup on edge devices.
- Machine Learning Engineering Intern at Robotics Corp (Summer 2023): Designed LiDAR-camera fusion algorithms for autonomous obstacle navigation.

TECHNICAL PROFICIENCIES:
- Languages: Python, C++, CUDA, PyTorch, TensorFlow, OpenCV, ROS2, Linux.
- Standardized Tests: TOEFL iBT: 108 (R: 29, L: 28, S: 25, W: 26), GRE: Q: 168, V: 158, AW: 4.5.`,
    },
    {
        name: 'Bioinformatics & Molecular Therapeutics',
        targetField: 'Biomedical Engineering & Genomics',
        targetInstitutions: 'Karolinska Institute, KU Leuven, Heidelberg, Johns Hopkins',
        notes: 'Tailored for molecular oncology labs and gene-editing groups with wet/dry lab synthesis.',
        text: `NAME: Maya Lin
DEGREE: B.S. in Biomedical Engineering (GPA: 3.92/4.0)
INSTITUTION: State University of Bioengineering
RESEARCH INTERESTS: Synthetic Biology, CRISPR Gene Editing, Single-cell RNA Sequencing, Biomaterials for Targeted Drug Delivery.

RESEARCH EXPERIENCE:
- Research Assistant, Molecular Therapeutics Laboratory (2022 - Present): Investigated polymeric nanoparticle vectors for mRNA delivery in oncology models; quantified cellular uptake via flow cytometry and confocal microscopy.
- Co-author on manuscript: "Lipid Nanoparticle Formulations for Targeted Hepatic Delivery," Journal of Nanomedicine (2023).

SKILLS & PROFICIENCIES:
- Wet Lab: Cell culture, CRISPR-Cas9, PCR, Western Blot, Flow Cytometry, ELISA, Microfluidics.
- Dry Lab: R (Bioconductor), Python (scikit-learn), NGS Bioinformatics pipelines.
- Standardized Tests: IELTS Academic 8.0, GRE: Q: 165, V: 161.`,
    },
    {
        name: 'Sustainable Materials & Solid-State Batteries',
        targetField: 'Materials Science & Renewable Energy',
        targetInstitutions: 'TU Delft, Chalmers, Tokyo Tech, Nanyang Technological (NTU)',
        notes: 'Focused on electrochemistry, solid-state electrolyte development, and SEM/EIS analytics.',
        text: `NAME: Lucas Morales
DEGREE: B.Eng. in Chemical & Materials Engineering (First Class Honours)
INSTITUTION: Technical University of Engineering
RESEARCH INTERESTS: Next-generation Lithium-Sulfur Batteries, Solid-State Electrolytes, Perovskite Solar Cells, Electrocatalysis.

RESEARCH & LAB PROJECTS:
- Thesis Project: "Synthesis of High-Conductivity Composite Polymer Electrolytes for Solid-State Lithium Batteries."
- Laboratory Technician, Clean Energy Center: Operated SEM, XRD, XPS, and Electrochemical Impedance Spectroscopy (EIS).

AWARDS & DISTINCTIONS:
- University Research Fellowship for Outstanding Undergraduates
- Best Undergraduate Poster Presentation, National Renewable Energy Symposium.
- Standardized Tests: TOEFL iBT: 105, GRE: Q: 167, V: 156.`,
    },
];

export function generateProfileId(): string {
    return 'cv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

export function loadLocalProfiles(): CvProfile[] {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }

        // Migrate legacy single CV if present
        const legacyCvText = localStorage.getItem(LOCAL_STORAGE_LEGACY_CV_TEXT);
        const legacyAnalysisRaw = localStorage.getItem('scholar_cv_analysis');
        let legacyAnalysis = null;
        if (legacyAnalysisRaw) {
            try {
                legacyAnalysis = JSON.parse(legacyAnalysisRaw);
            } catch {
                // ignore
            }
        }

        const initialProfiles: CvProfile[] = [];

        if (legacyCvText && legacyCvText.trim().length > 30) {
            initialProfiles.push({
                id: generateProfileId(),
                name: 'Primary Academic CV',
                targetField: 'General / Current Research',
                text: legacyCvText.trim(),
                isDefault: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                analysis: legacyAnalysis,
            });
        }

        // Add starter templates
        STARTER_CV_TEMPLATES.forEach((tpl, idx) => {
            initialProfiles.push({
                id: generateProfileId(),
                name: tpl.name,
                targetField: tpl.targetField,
                targetInstitutions: tpl.targetInstitutions,
                notes: tpl.notes,
                text: tpl.text,
                isDefault: initialProfiles.length === 0 && idx === 0,
                createdAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
                updatedAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
            });
        });

        saveLocalProfiles(initialProfiles);
        return initialProfiles;
    } catch (e) {
        console.warn('Failed to load local CV profiles:', e);
        return [];
    }
}

export function saveLocalProfiles(profiles: CvProfile[]): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    } catch (e) {
        console.error('Failed to save CV profiles to local storage:', e);
    }
}

export function getActiveProfileId(): string | null {
    try {
        return localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_ID);
    } catch {
        return null;
    }
}

export function setActiveProfileId(id: string): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_ID, id);
    } catch (e) {
        console.error('Failed to set active CV profile id:', e);
    }
}

export function mergeLocalAndCloudProfiles(local: CvProfile[], cloud: CvProfile[]): CvProfile[] {
    const map = new Map<string, CvProfile>();
    
    // Put cloud items
    cloud.forEach((p) => map.set(p.id, p));

    // For each local item, keep it if not in cloud, or take newer updatedAt
    local.forEach((loc) => {
        const existing = map.get(loc.id);
        if (!existing) {
            map.set(loc.id, loc);
        } else {
            const locTime = new Date(loc.updatedAt || 0).getTime();
            const cloudTime = new Date(existing.updatedAt || 0).getTime();
            if (locTime > cloudTime) {
                map.set(loc.id, { ...existing, ...loc });
            }
        }
    });

    const result = Array.from(map.values());
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return result;
}
