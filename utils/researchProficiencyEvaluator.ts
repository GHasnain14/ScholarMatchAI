import { ResearchProficiency } from '../types';

interface AreaConfig {
    area: string;
    shortName: string;
    benchmarkScore: number;
    keywords: string[];
    weightTerms: { term: string; bonus: number }[];
    fallbackEvidence: string;
    fallbackRecommendation: string;
}

const RESEARCH_AREA_CONFIGS: AreaConfig[] = [
    {
        area: 'Data Analysis',
        shortName: 'Data Analysis',
        benchmarkScore: 80,
        keywords: [
            'data analysis', 'statistics', 'statistical', 'pandas', 'numpy', 'scipy', 'rstudio',
            'python', 'machine learning', 'deep learning', 'regression', 'hypothesis testing',
            'anova', 'biostatistics', 'matlab', 'sql', 'big data', 'visualization', 'tableau',
            'excel', 'quantitative', 'dataset', 'time series', 'clustering', 'data cleaning'
        ],
        weightTerms: [
            { term: 'deep learning', bonus: 15 },
            { term: 'machine learning', bonus: 12 },
            { term: 'statistical modeling', bonus: 10 },
            { term: 'python', bonus: 8 },
            { term: 'pytorch', bonus: 10 },
            { term: 'tensorflow', bonus: 10 },
            { term: 'r', bonus: 6 },
            { term: 'data pipeline', bonus: 8 },
            { term: 'publication', bonus: 5 }
        ],
        fallbackEvidence: 'Basic computational analysis and scripting referenced in academic background.',
        fallbackRecommendation: 'Showcase end-to-end data pipelines, statistical validation (p-values, effect sizes), and reproducible Jupyter/R notebooks.'
    },
    {
        area: 'Writing',
        shortName: 'Writing',
        benchmarkScore: 75,
        keywords: [
            'publication', 'published', 'paper', 'manuscript', 'journal', 'conference',
            'thesis', 'dissertation', 'ieee', 'acm', 'springer', 'elsevier', 'nature', 'arxiv',
            'peer-reviewed', 'co-author', 'first-author', 'literature review', 'technical report',
            'statement of purpose', 'grant proposal', 'scientific writing', 'abstract', 'poster presentation'
        ],
        weightTerms: [
            { term: 'first-author', bonus: 20 },
            { term: 'peer-reviewed', bonus: 18 },
            { term: 'journal', bonus: 14 },
            { term: 'ieee', bonus: 12 },
            { term: 'conference', bonus: 10 },
            { term: 'thesis', bonus: 10 },
            { term: 'arxiv', bonus: 8 },
            { term: 'manuscript under review', bonus: 8 }
        ],
        fallbackEvidence: 'Academic coursework reports and structured thesis documentation noted.',
        fallbackRecommendation: 'Highlight preprint manuscripts (arXiv/bioRxiv), conference workshop papers, or senior theses with DOI links.'
    },
    {
        area: 'Lab Tech',
        shortName: 'Lab Tech',
        benchmarkScore: 70,
        keywords: [
            'laboratory', 'lab', 'experiment', 'experimental', 'protocol', 'assay', 'hardware',
            'equipment', 'benchwork', 'spectroscopy', 'microscopy', 'pcr', 'cell culture',
            'cleanroom', 'robotics', 'ros', 'sensors', 'actuator', 'microcontroller', 'arduino',
            'raspberry pi', 'fpga', 'oscilloscope', 'circuit', 'instrumentation', 'testing',
            'calibration', 'benchmarking', 'fabrication', 'simulation', 'cad', 'solidworks'
        ],
        weightTerms: [
            { term: 'lab technician', bonus: 15 },
            { term: 'experimental design', bonus: 14 },
            { term: 'ros2', bonus: 12 },
            { term: 'ros', bonus: 10 },
            { term: 'hardware', bonus: 8 },
            { term: 'microscopy', bonus: 10 },
            { term: 'spectroscopy', bonus: 10 },
            { term: 'sensor fusion', bonus: 12 },
            { term: 'benchwork', bonus: 10 }
        ],
        fallbackEvidence: 'Familiarity with lab environments and empirical engineering workflows.',
        fallbackRecommendation: 'Explicitly enumerate specific instrumentation models, safety certifications, and standardized operating procedures (SOPs).'
    },
    {
        area: 'Theoretical Physics',
        shortName: 'Theoretical Physics',
        benchmarkScore: 75,
        keywords: [
            'physics', 'theoretical', 'mechanics', 'quantum', 'electromagnetism', 'thermodynamics',
            'calculus', 'linear algebra', 'differential equations', 'mathematical modeling',
            'analytical', 'formal proof', 'derivation', 'first principles', 'hamiltonian',
            'statistical mechanics', 'dynamical systems', 'simulation', 'finite element',
            'computational physics', 'numerical methods', 'optimization theory', 'algorithms', 'discrete math'
        ],
        weightTerms: [
            { term: 'quantum', bonus: 16 },
            { term: 'theoretical physics', bonus: 18 },
            { term: 'mathematical modeling', bonus: 14 },
            { term: 'differential equations', bonus: 10 },
            { term: 'linear algebra', bonus: 8 },
            { term: 'numerical simulation', bonus: 10 },
            { term: 'optimization', bonus: 8 },
            { term: 'first-principles', bonus: 12 }
        ],
        fallbackEvidence: 'Quantitative STEM coursework covering core mathematical foundations.',
        fallbackRecommendation: 'Detail mathematical formalisms, computational simulations (e.g. Monte Carlo, PDE solvers), and theoretical problem formulations.'
    },
    {
        area: 'Literature Synthesis',
        shortName: 'Literature Review',
        benchmarkScore: 75,
        keywords: [
            'literature', 'state-of-the-art', 'sota', 'benchmarking', 'survey', 'meta-analysis',
            'citation', 'citations', 'comparative study', 'domain analysis', 'prior work',
            'bibliographic', 'taxonomy', 'related work', 'systematic review', 'reproducibility'
        ],
        weightTerms: [
            { term: 'survey paper', bonus: 18 },
            { term: 'state-of-the-art', bonus: 14 },
            { term: 'meta-analysis', bonus: 14 },
            { term: 'systematic literature review', bonus: 16 },
            { term: 'comparative benchmark', bonus: 12 },
            { term: 'related work', bonus: 8 }
        ],
        fallbackEvidence: 'Background research and references cited across past projects.',
        fallbackRecommendation: 'Cite landmark 2024-2026 papers by target professors to prove comprehensive familiarity with contemporary state-of-the-art.'
    },
    {
        area: 'Project Execution',
        shortName: 'Project Execution',
        benchmarkScore: 80,
        keywords: [
            'project', 'lead', 'management', 'grant', 'funded', 'nsf', 'nih', 'collaborative',
            'team', 'git', 'github', 'version control', 'ci/cd', 'docker', 'milestones',
            'deliverable', 'scrum', 'agile', 'research assistant', 'teaching assistant', 'mentorship',
            'budget', 'timeline', 'cross-functional', 'open-source'
        ],
        weightTerms: [
            { term: 'grant', bonus: 16 },
            { term: 'research assistant', bonus: 14 },
            { term: 'teaching assistant', bonus: 10 },
            { term: 'project lead', bonus: 12 },
            { term: 'open-source', bonus: 10 },
            { term: 'docker', bonus: 8 },
            { term: 'git', bonus: 6 },
            { term: 'collaboration', bonus: 8 }
        ],
        fallbackEvidence: 'Project milestones completed in university degree and team assignments.',
        fallbackRecommendation: 'Document public GitHub repositories with continuous integration, reproducible setups, and clear contribution guidelines.'
    }
];

function getProficiencyLevel(score: number): 'Foundational' | 'Intermediate' | 'Proficient' | 'Advanced' | 'Expert' {
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Advanced';
    if (score >= 68) return 'Proficient';
    if (score >= 52) return 'Intermediate';
    return 'Foundational';
}

/**
 * Evaluates CV text to map proficiencies across research areas.
 * Guarantees rich, evidence-based metrics even offline or before API response.
 */
export function evaluateResearchProficiencies(cvText: string): ResearchProficiency[] {
    if (!cvText || cvText.trim().length === 0) {
        return RESEARCH_AREA_CONFIGS.map(cfg => ({
            area: cfg.area,
            score: 50,
            benchmarkScore: cfg.benchmarkScore,
            level: 'Foundational',
            evidence: 'Upload or paste your CV to analyze specific research evidence.',
            recommendation: cfg.fallbackRecommendation
        }));
    }

    const lower = cvText.toLowerCase();

    return RESEARCH_AREA_CONFIGS.map(cfg => {
        let baseScore = 48; // baseline for STEM university student CV
        const detectedKeywords: string[] = [];

        // Match general keywords
        for (const kw of cfg.keywords) {
            if (lower.includes(kw)) {
                baseScore += 3;
                if (detectedKeywords.length < 4 && !detectedKeywords.includes(kw)) {
                    detectedKeywords.push(kw);
                }
            }
        }

        // Match weighted bonus terms
        for (const wt of cfg.weightTerms) {
            if (lower.includes(wt.term)) {
                baseScore += wt.bonus;
                if (!detectedKeywords.includes(wt.term)) {
                    detectedKeywords.unshift(wt.term);
                }
            }
        }

        // Clamp score between 35 and 98
        const finalScore = Math.min(98, Math.max(35, Math.round(baseScore)));
        const level = getProficiencyLevel(finalScore);

        const evidence = detectedKeywords.length > 0
            ? `Demonstrated evidence found: ${detectedKeywords.slice(0, 4).join(', ')}.`
            : cfg.fallbackEvidence;

        return {
            area: cfg.area,
            score: finalScore,
            benchmarkScore: cfg.benchmarkScore,
            level,
            evidence,
            recommendation: cfg.fallbackRecommendation
        };
    });
}
