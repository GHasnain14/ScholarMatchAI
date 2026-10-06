import { Scholarship } from '../types';

export interface CuratedPositionTemplate {
    professorName: string;
    institution: string;
    researchArea: string;
    link: string;
    reasonForMatch: string;
    universityTier: 'Top-Tier' | 'Mid-Tier' | 'Low-Rank' | 'Emerging';
    country: string;
    baseMatchScore: number;
    fundingType: string;
    keyKeywords: string[];
    tuitionFees: string;
    ranking: string;
    applicationRequirements: string[];
    deadline?: string;
}

export const ACADEMIC_POSITIONS_BY_COUNTRY: Record<string, CuratedPositionTemplate[]> = {
    'south-korea': [
        // Top-Tier
        {
            professorName: "Prof. Sung Ju Hwang",
            institution: "KAIST - Graduate School of AI",
            researchArea: "Meta-Learning, Automated Machine Learning (AutoML) & Foundation Models",
            link: "https://gsai.kaist.ac.kr/people/sung-ju-hwang/",
            reasonForMatch: "Candidate's strong computational foundation, algorithmic rigor, and PyTorch prototyping background align directly with KAIST GSAI's top-tier global AI research milestones.",
            universityTier: "Top-Tier",
            country: "South Korea",
            baseMatchScore: 97,
            fundingType: "Fully Funded (KAIST International Scholarship + Lab Stipend ~1,850,000 KRW/mo)",
            keyKeywords: ["Meta-Learning", "AutoML", "Foundation Models", "KAIST"],
            tuitionFees: "100% Waived by KAIST Fellowship",
            ranking: "QS World #56, #1 Science & Tech University in South Korea",
            applicationRequirements: ["BSc in Computer Science or STEM", "IELTS 6.5+ / TOEFL 83+", "Transcripts & Study Plan", "2 Recommendation Letters"],
            deadline: "2026-09-25"
        },
        {
            professorName: "Prof. Gunhee Kim",
            institution: "Seoul National University (SNU) - Vision & Learning Lab",
            researchArea: "Video Generation, Multimodal Understanding & Vision-Language Pretraining",
            link: "https://vision.snu.ac.kr/people/gunhee-kim.html",
            reasonForMatch: "Candidate's background in visual computing, neural networks, and multimodal architectures provides an exceptional springboard for SNU's flagship vision projects.",
            universityTier: "Top-Tier",
            country: "South Korea",
            baseMatchScore: 96,
            fundingType: "Fully Funded (SNU Global Hope Fellowship + BK21+ ~2,000,000 KRW/mo)",
            keyKeywords: ["Video Generation", "Vision-Language", "Multimodal AI", "SNU AI"],
            tuitionFees: "100% Covered by University Grant",
            ranking: "QS World #41, #1 Comprehensive University in Korea",
            applicationRequirements: ["BSc/MSc in CS or EE", "English Proficiency Certificate", "Personal Statement", "Research Portfolio"],
            deadline: "2026-09-18"
        },
        {
            professorName: "Prof. Eunho Yang",
            institution: "POSTECH - Department of Artificial Intelligence",
            researchArea: "Statistical Machine Learning, Out-of-Distribution Generalization & Trustworthy AI",
            link: "https://ai.postech.ac.kr/faculty/",
            reasonForMatch: "Superb alignment with candidate's analytical skills, mathematical modeling, and empirical benchmarking capabilities.",
            universityTier: "Top-Tier",
            country: "South Korea",
            baseMatchScore: 95,
            fundingType: "Fully Funded (POSTECH Fellowship + Lab Research Assistantship ~1,750,000 KRW/mo)",
            keyKeywords: ["Statistical ML", "OOD Generalization", "Optimization", "POSTECH"],
            tuitionFees: "Zero Tuition (Full Fellowship Remission)",
            ranking: "Global Top 75, Top Elite Research Institute in Asia",
            applicationRequirements: ["STEM Degree with High GPA", "Statement of Purpose", "Transcripts", "Academic References"],
            deadline: "2026-09-30"
        },
        {
            professorName: "Prof. Sanghoon Lee",
            institution: "Yonsei University - Media Computing & Perception Lab",
            researchArea: "Deep Visual Processing, Generative Video Modeling & Perceptual Quality AI",
            link: "https://vilab.yonsei.ac.kr/",
            reasonForMatch: "Candidate's data engineering and visual perception experience synergizes with Yonsei's high-throughput video processing agenda.",
            universityTier: "Top-Tier",
            country: "South Korea",
            baseMatchScore: 94,
            fundingType: "Fully Funded (Yonsei Brain Korea 21 Plus Four + RA Contract ~1,700,000 KRW/mo)",
            keyKeywords: ["Media Computing", "Video Modeling", "Yonsei SKY", "Perception AI"],
            tuitionFees: "100% Waived by BK21+ Award",
            ranking: "QS World #76, Prestigious SKY Consortium University",
            applicationRequirements: ["Undergraduate Degree", "IELTS 6.0+ / TOEFL 80+", "CV & Statement of Research"],
            deadline: "2026-10-15"
        },
        {
            professorName: "Prof. Minhyuk Sung",
            institution: "KAIST - Visual AI & Geometry Lab",
            researchArea: "3D Deep Learning, Generative Shape Synthesis & Geometric Computer Vision",
            link: "https://mhsung.github.io/",
            reasonForMatch: "Direct match with candidate's programming proficiency in PyTorch/C++ and enthusiasm for cutting-edge geometric neural models.",
            universityTier: "Top-Tier",
            country: "South Korea",
            baseMatchScore: 95,
            fundingType: "Fully Funded (KAIST Presidential Fellowship + Laboratory Stipend)",
            keyKeywords: ["3D Vision", "Geometric Deep Learning", "NeRF", "KAIST Computing"],
            tuitionFees: "Zero Tuition",
            ranking: "World-Renowned 3D Computer Vision Lab",
            applicationRequirements: ["BSc in CS, Math or ECE", "GitHub Portfolio", "Transcripts", "Recommendation Letters"],
            deadline: "2026-09-25"
        },

        // Mid-Tier
        {
            professorName: "Prof. Jaewoo Kang",
            institution: "Korea University - Data & Information Lab (DILAB)",
            researchArea: "Biomedical AI, Large Language Models in Healthcare & BioBERT Creators",
            link: "https://dilab.korea.ac.kr/",
            reasonForMatch: "Candidate's data pipeline handling and NLP competencies align seamlessly with DILAB's world-famous biomedical language intelligence research.",
            universityTier: "Mid-Tier",
            country: "South Korea",
            baseMatchScore: 93,
            fundingType: "Fully Funded (Korea University Global Leader Scholarship + BK21+ ~1,650,000 KRW/mo)",
            keyKeywords: ["BioBERT", "Biomedical NLP", "Korea University", "Health AI"],
            tuitionFees: "100% Waived by Graduate Assistantship",
            ranking: "Top-3 SKY University in Korea, QS World #79",
            applicationRequirements: ["Bachelor degree in STEM", "English proficiency", "Cover Letter & Transcripts"],
            deadline: "2026-10-08"
        },
        {
            professorName: "Prof. Jaesik Choi",
            institution: "UNIST - Artificial Intelligence Graduate School (XAI Lab)",
            researchArea: "Explainable Artificial Intelligence (XAI), Dynamic Probabilistic Models & Causality",
            link: "https://xai.unist.ac.kr/",
            reasonForMatch: "Candidate's solid foundation in probabilistic reasoning and interpretability matches UNIST's national XAI center goals.",
            universityTier: "Mid-Tier",
            country: "South Korea",
            baseMatchScore: 92,
            fundingType: "Fully Funded (UNIST International Fellowship ~1,600,000 KRW/mo + Housing)",
            keyKeywords: ["Explainable AI", "Probabilistic Models", "UNIST", "Causality"],
            tuitionFees: "100% Tuition Remission",
            ranking: "National Science & Tech Institute, Global Top 100 Young Universities",
            applicationRequirements: ["Bachelor's in CS or related field", "IELTS/TOEFL", "Research Statement"],
            deadline: "2026-10-20"
        },
        {
            professorName: "Prof. Simon S. Woo",
            institution: "Sungkyunkwan University (SKKU) - DASH Lab",
            researchArea: "AI Safety, Deepfake Detection, Trustworthy ML & Cyber Threat Analytics",
            link: "https://dash.skku.edu/",
            reasonForMatch: "Candidate's software development experience and empirical data analysis fit DASH lab's large-scale AI security projects.",
            universityTier: "Mid-Tier",
            country: "South Korea",
            baseMatchScore: 91,
            fundingType: "Fully Funded (Samsung-SKKU AI Graduate Fellowship + BK21+ ~1,700,000 KRW/mo)",
            keyKeywords: ["AI Safety", "Deepfake Defense", "SKKU", "Trustworthy ML"],
            tuitionFees: "Fully Covered by Industry Grant",
            ranking: "Historic Flagship University with Samsung R&D Partnership",
            applicationRequirements: ["Relevant Bachelor degree", "Transcripts", "Statement of Purpose"],
            deadline: "2026-10-12"
        },
        {
            professorName: "Prof. Tae-Hyun Oh",
            institution: "Hanyang University - Computer Vision and Intelligent Systems Lab",
            researchArea: "Multimodal Sensor Fusion, 3D Reconstruction & Spatial Perception for Robotics",
            link: "https://sites.google.com/view/cvis-lab/",
            reasonForMatch: "Candidate's technical versatility bridging computer vision and robotics engineering provides an immediate fit.",
            universityTier: "Mid-Tier",
            country: "South Korea",
            baseMatchScore: 90,
            fundingType: "Fully Funded (Hanyang International Excellence Award + RA ~1,550,000 KRW/mo)",
            keyKeywords: ["Sensor Fusion", "Spatial Perception", "Hanyang", "Robotics AI"],
            tuitionFees: "100% Waived",
            ranking: "Top Engineering Hub in Seoul Metro Area",
            applicationRequirements: ["BSc in CS/EE/Robotics", "English Test Scores", "Study Plan"],
            deadline: "2026-10-24"
        },
        {
            professorName: "Prof. Moontae Lee",
            institution: "GIST - AI Graduate School",
            researchArea: "Natural Language Understanding, Cognitive AI & Neural Reasoning",
            link: "https://ai.gist.ac.kr/",
            reasonForMatch: "Candidate's quantitative curiosity and Python/deep learning background support GIST's focus on foundational reasoning models.",
            universityTier: "Mid-Tier",
            country: "South Korea",
            baseMatchScore: 89,
            fundingType: "Fully Funded (GIST Graduate Fellowship + Monthly Living Allowance ~1,500,000 KRW/mo)",
            keyKeywords: ["Neural Reasoning", "Cognitive AI", "GIST", "NLP"],
            tuitionFees: "Zero Tuition (Full State Waiver)",
            ranking: "Elite Research Institute in Gwangju, Highly Ranked for Citations per Faculty",
            applicationRequirements: ["STEM Degree", "TOEFL 80+ or IELTS 6.5+", "Statement of Purpose"],
            deadline: "2026-10-30"
        },
        {
            professorName: "Prof. Sungwon Park",
            institution: "Kyung Hee University - Autonomous Intelligence Lab",
            researchArea: "Reinforcement Learning for Autonomous Vehicles, Intelligent Agents & Simulation",
            link: "https://khu.ac.kr/eng/user/faculty/view.do",
            reasonForMatch: "Good alignment with candidate's simulation experience, clean coding practices, and passion for autonomy.",
            universityTier: "Mid-Tier",
            country: "South Korea",
            baseMatchScore: 88,
            fundingType: "Fully Funded (Kyung Hee Global Scholarship + Lab Grant ~1,450,000 KRW/mo)",
            keyKeywords: ["Reinforcement Learning", "Autonomous Vehicles", "Kyung Hee"],
            tuitionFees: "Full Tuition Waiver",
            ranking: "Top 10 Comprehensive University in Korea",
            applicationRequirements: ["Undergraduate Degree", "CV", "Language Proficiency"],
            deadline: "2026-11-05"
        },

        // Regional / Foundation / High-Acceptance Tier (Low-Rank / Emerging)
        {
            professorName: "Prof. Hyung-Min Park",
            institution: "Chungnam National University (CNU) - Intelligent Signal Processing Lab",
            researchArea: "Speech Recognition, Audio Signal AI, Intelligent Sensor Processing & Embedded Audio",
            link: "https://cnucomputer.cnu.ac.kr/",
            reasonForMatch: "High acceptance potential; candidate's signal analysis and core programming competencies match CNU's funded industrial lab grant.",
            universityTier: "Low-Rank",
            country: "South Korea",
            baseMatchScore: 87,
            fundingType: "Fully Funded (BK21+ Four Grant + Graduate Research Assistantship ~1,400,000 KRW/mo)",
            keyKeywords: ["Audio AI", "Signal Processing", "Chungnam National", "Embedded AI"],
            tuitionFees: "Zero Tuition (National University Rate + Full Waiver)",
            ranking: "Flagship National University of Central Korea (Daejeon High-Tech R&D Belt)",
            applicationRequirements: ["BSc in Computer Science or ECE", "IELTS 5.5+ or Duolingo Accepted", "Transcripts"],
            deadline: "2026-11-15"
        },
        {
            professorName: "Prof. Hyoung-Gook Kim",
            institution: "Pusan National University (PNU) - Intelligent Multimedia Lab",
            researchArea: "Acoustic Scene Analysis, Edge AI, Embedded Intelligent Systems & Computer Vision",
            link: "https://cse.pusan.ac.kr/",
            reasonForMatch: "Great accessibility and high acceptance for international scholars; directly values candidate's hands-on project deliverables.",
            universityTier: "Low-Rank",
            country: "South Korea",
            baseMatchScore: 86,
            fundingType: "Fully Funded (PNU Premier Scholarship + BK21+ ~1,500,000 KRW/mo)",
            keyKeywords: ["Edge AI", "Multimedia Processing", "Pusan National", "Acoustics"],
            tuitionFees: "100% Tuition Remission",
            ranking: "#1 Flagship National University in Southern Korea",
            applicationRequirements: ["Degree in Engineering or Computing", "Transcripts", "Study Plan"],
            deadline: "2026-11-20"
        },
        {
            professorName: "Prof. Dong Seog Han",
            institution: "Kyungpook National University (KNU) - Mobile & Autonomous Media Lab",
            researchArea: "Connected Autonomous Driving, V2X AI Perception, Wireless Edge Learning",
            link: "https://see.knu.ac.kr/",
            reasonForMatch: "Solid fit for candidate's systems-level programming and interest in deployed intelligent connected vehicles.",
            universityTier: "Low-Rank",
            country: "South Korea",
            baseMatchScore: 85,
            fundingType: "Fully Funded (KNU Global Talent Award + BK21+ Research Contract ~1,400,000 KRW/mo)",
            keyKeywords: ["V2X", "Autonomous Perception", "KNU", "Wireless AI"],
            tuitionFees: "Full Tuition Covered",
            ranking: "Major Flagship National University in Daegu Metropolitan Region",
            applicationRequirements: ["STEM Bachelor", "Language Certificate", "Letter of Intent"],
            deadline: "2026-11-25"
        },
        {
            professorName: "Prof. Hak-Man Kim",
            institution: "Inha University - Smart Energy & AI Systems Lab",
            researchArea: "Energy Informatics, Neural Network Optimization for Smart Microgrids",
            link: "https://ee.inha.ac.kr/",
            reasonForMatch: "Applies candidate's quantitative optimization toolkit to high-demand sustainable energy smart systems.",
            universityTier: "Low-Rank",
            country: "South Korea",
            baseMatchScore: 84,
            fundingType: "Fully Funded (Jungseok International Scholarship + Lab Assistantship ~1,350,000 KRW/mo)",
            keyKeywords: ["Energy Informatics", "Optimization", "Inha University", "Smart Grids"],
            tuitionFees: "100% Waived",
            ranking: "Top Engineering Corridor University in Incheon",
            applicationRequirements: ["BSc in Engineering or Math", "Transcripts", "CV"],
            deadline: "2026-11-10"
        },
        {
            professorName: "Prof. Sangyoun Lee",
            institution: "Ajou University - AI & Cognitive Computing Lab",
            researchArea: "Computer Vision, Industrial AI Inspection, Medical Image Analysis",
            link: "https://software.ajou.ac.kr/",
            reasonForMatch: "Candidate's empirical testing and software debugging track record matches lab's automated vision inspection projects.",
            universityTier: "Low-Rank",
            country: "South Korea",
            baseMatchScore: 83,
            fundingType: "Fully Funded (Ajou Global Pioneer Grant + Research Assistantship ~1,350,000 KRW/mo)",
            keyKeywords: ["Industrial AI", "Computer Vision", "Ajou University", "Medical Imaging"],
            tuitionFees: "Full Tuition Remission",
            ranking: "Top Tech Corridor University in Suwon (Near Samsung Digital City)",
            applicationRequirements: ["Bachelor degree in CS or Engineering", "CV & Transcripts"],
            deadline: "2026-11-18"
        },
        {
            professorName: "Prof. Jin-Hyuk Jung",
            institution: "Chonnam National University (CNU) - Big Data Analytics & AI Lab",
            researchArea: "Scalable Machine Learning, Data Mining, Bioinformatics Applications & Graph Analytics",
            link: "https://jnu.ac.kr/",
            reasonForMatch: "Generous GKS and BK21+ quotas for international graduate students; highly favorable admissions ratio.",
            universityTier: "Low-Rank",
            country: "South Korea",
            baseMatchScore: 82,
            fundingType: "Fully Funded (GKS Korean Government Scholarship + BK21+ ~1,400,000 KRW/mo)",
            keyKeywords: ["Big Data", "Graph Analytics", "Chonnam National", "Data Mining"],
            tuitionFees: "Zero Tuition (Full State Waiver)",
            ranking: "Major Flagship National University in Gwangju/Jeonnam",
            applicationRequirements: ["Bachelor degree", "IELTS 5.5+ or English Medium of Instruction letter"],
            deadline: "2026-11-30"
        }
    ],

    'usa': [
        // Top-Tier
        {
            professorName: "Prof. Chelsea Finn",
            institution: "Stanford University - IRIS Lab (Intelligence & Learning)",
            researchArea: "Meta-Learning, Few-Shot Adaptation, Robot Learning & Multimodal Foundation Models",
            link: "https://iris.stanford.edu/",
            reasonForMatch: "Candidate's solid mathematical basis, algorithmic mindset, and rapid model adaptation interests match IRIS research agenda.",
            universityTier: "Top-Tier",
            country: "USA",
            baseMatchScore: 97,
            fundingType: "Fully Funded (Stanford Graduate Fellowship / RA $44,000/yr + 100% Tuition Remission)",
            keyKeywords: ["Meta-Learning", "Few-Shot Learning", "Robot Learning", "Stanford AI"],
            tuitionFees: "100% Remitted by Fellowship",
            ranking: "US News #1 in Computer Science / AI, Top 3 Worldwide",
            applicationRequirements: ["BSc in CS, Math or ECE", "Transcripts", "Statement of Purpose", "3 Letters of Recommendation"],
            deadline: "2026-12-05"
        },
        {
            professorName: "Prof. Sergey Levine",
            institution: "UC Berkeley - Robotic AI & Learning (RAIL) Lab",
            researchArea: "Deep Reinforcement Learning, Embodied Agents & Generalist Robotics Foundations",
            link: "https://rail.eecs.berkeley.edu/",
            reasonForMatch: "Direct match with candidate's machine learning programming competencies and drive for autonomous generalist agents.",
            universityTier: "Top-Tier",
            country: "USA",
            baseMatchScore: 96,
            fundingType: "Fully Funded (Graduate Student Researcher $42,000/yr + Full Tuition Waiver)",
            keyKeywords: ["Reinforcement Learning", "Robotics", "Embodied AI", "UC Berkeley"],
            tuitionFees: "100% Covered",
            ranking: "Top-1 Public University Worldwide for Computing & AI",
            applicationRequirements: ["Strong Academic Record", "Research Sample", "3 Recommendation Letters"],
            deadline: "2026-12-10"
        },
        {
            professorName: "Prof. Antonio Torralba",
            institution: "MIT - Computer Science and Artificial Intelligence Lab (CSAIL)",
            researchArea: "Computer Vision, Generative World Models, Visual Representation Learning",
            link: "https://groups.csail.mit.edu/vision/torralbalab/",
            reasonForMatch: "Synergy with candidate's computer vision and visual representation feature extraction experience.",
            universityTier: "Top-Tier",
            country: "USA",
            baseMatchScore: 96,
            fundingType: "Fully Funded (MIT Presidential Fellowship / RA $45,000/yr + Health Insurance)",
            keyKeywords: ["Computer Vision", "World Models", "MIT CSAIL", "Deep Learning"],
            tuitionFees: "100% Covered",
            ranking: "QS World #1 Overall",
            applicationRequirements: ["BSc in STEM", "Statement of Objectives", "3 Letters", "Transcripts"],
            deadline: "2026-12-15"
        },
        {
            professorName: "Prof. Graham Neubig",
            institution: "Carnegie Mellon University (CMU) - Language Technologies Institute",
            researchArea: "Natural Language Processing, Large Language Models, Code Intelligence & Reasoning",
            link: "https://www.phontron.com/",
            reasonForMatch: "Ideal for candidate's interest in code intelligence, programmatic reasoning, and transformer architectures.",
            universityTier: "Top-Tier",
            country: "USA",
            baseMatchScore: 94,
            fundingType: "Fully Funded (CMU Graduate RA $38,000/yr + Full Tuition Waiver)",
            keyKeywords: ["NLP", "Code Intelligence", "CMU LTI", "LLM Reasoning"],
            tuitionFees: "100% Waived",
            ranking: "World-Leading Language Technologies & AI Institute",
            applicationRequirements: ["Python/PyTorch mastery", "Research Portfolio", "Transcripts", "SOP"],
            deadline: "2026-12-08"
        },
        {
            professorName: "Prof. Fei-Fei Li & Prof. Jiajun Wu",
            institution: "Stanford University - Stanford Vision and Learning Lab (SVL)",
            researchArea: "Embodied Vision, Physics-Informed Neural Learning & Interactive Perception",
            link: "https://svl.stanford.edu/",
            reasonForMatch: "Exceptional synergy with candidate's interdisciplinary technical versatility and passion for scalable intelligence systems.",
            universityTier: "Top-Tier",
            country: "USA",
            baseMatchScore: 95,
            fundingType: "Fully Funded (Stanford Research Assistantship $44,000/yr + Tuition)",
            keyKeywords: ["Embodied Vision", "Physics-Informed AI", "Stanford SVL"],
            tuitionFees: "100% Waived",
            ranking: "Flagship Academic Vision Research Group",
            applicationRequirements: ["High GPA", "SOP", "3 Reference Letters"],
            deadline: "2026-12-05"
        },

        // Mid-Tier
        {
            professorName: "Prof. David Inouye",
            institution: "Purdue University - Department of Computer Science",
            researchArea: "Probabilistic Machine Learning, Distribution Shift & Trustworthy AI",
            link: "https://dinouye.github.io/",
            reasonForMatch: "Strong alignment with candidate's data modeling, mathematical optimization, and empirical testing skills.",
            universityTier: "Mid-Tier",
            country: "USA",
            baseMatchScore: 92,
            fundingType: "Fully Funded (Purdue Ross Fellowship / Research Assistantship $32,000/yr + Tuition Waiver)",
            keyKeywords: ["Probabilistic ML", "Distribution Shift", "Purdue CS", "Robust AI"],
            tuitionFees: "100% Covered",
            ranking: "Top-20 US CS Graduate Program, Renowned Engineering Powerhouse",
            applicationRequirements: ["BSc in CS or related", "Transcripts", "SOP", "3 Letters"],
            deadline: "2026-12-20"
        },
        {
            professorName: "Prof. Judy Hoffman",
            institution: "Georgia Institute of Technology - Computer Vision Group",
            researchArea: "Domain Adaptation, Safe Vision Models & Algorithmic Fairness",
            link: "https://faculty.cc.gatech.edu/~jhoffman9/",
            reasonForMatch: "Candidate's deep learning skills and interest in dependable, real-world deployment fit Hoffman lab milestones.",
            universityTier: "Mid-Tier",
            country: "USA",
            baseMatchScore: 91,
            fundingType: "Fully Funded (Georgia Tech Graduate RA $34,000/yr + Tuition Waiver)",
            keyKeywords: ["Domain Adaptation", "Safe AI", "Georgia Tech", "Computer Vision"],
            tuitionFees: "100% Covered",
            ranking: "Top-10 US Engineering & Computing Institute",
            applicationRequirements: ["STEM Degree", "Transcripts", "Statement of Purpose"],
            deadline: "2026-12-15"
        },
        {
            professorName: "Prof. Zoran Popovic",
            institution: "University of Washington - Paul G. Allen School of CSE",
            researchArea: "Human-in-the-Loop Machine Learning, Interactive Data Systems & Scientific AI",
            link: "https://homes.cs.washington.edu/~zoran/",
            reasonForMatch: "Matches candidate's project execution and algorithmic problem-solving capabilities.",
            universityTier: "Mid-Tier",
            country: "USA",
            baseMatchScore: 92,
            fundingType: "Fully Funded (Allen School RAship $36,000/yr + Full Tuition)",
            keyKeywords: ["Interactive AI", "Scientific Discovery", "UW Allen School"],
            tuitionFees: "100% Waived",
            ranking: "Top-6 US CS Graduate Program",
            applicationRequirements: ["BS in Computing/Math", "3 Recommendation Letters", "SOP"],
            deadline: "2026-12-15"
        },
        {
            professorName: "Prof. C. Lee Giles",
            institution: "Penn State University - Intelligent Systems Lab",
            researchArea: "Neurosymbolic AI, Information Extraction & Scientific Knowledge Discovery",
            link: "https://clgiles.ist.psu.edu/",
            reasonForMatch: "Candidate's research synthesis and text data processing experience fit CiteSeerX / neurosymbolic projects.",
            universityTier: "Mid-Tier",
            country: "USA",
            baseMatchScore: 89,
            fundingType: "Fully Funded (Penn State Graduate Assistantship $31,000/yr + Tuition)",
            keyKeywords: ["Neurosymbolic AI", "Information Extraction", "Penn State"],
            tuitionFees: "Full Tuition Waiver",
            ranking: "Major US R1 Research University",
            applicationRequirements: ["BSc in Computing", "Transcripts", "Statement of Goals"],
            deadline: "2026-12-30"
        },
        {
            professorName: "Prof. Huan Sun",
            institution: "Ohio State University - Knowledge Graph & NLP Lab",
            researchArea: "Question Answering, Tool-Augmented LLMs & Reasoning Over Structured Data",
            link: "https://sunlab-osu.github.io/",
            reasonForMatch: "Direct fit for candidate's Python development background and knowledge extraction coursework.",
            universityTier: "Mid-Tier",
            country: "USA",
            baseMatchScore: 90,
            fundingType: "Fully Funded (OSU University Fellowship / Graduate Assistantship $32,000/yr)",
            keyKeywords: ["Knowledge Graphs", "Tool-Augmented LLMs", "Ohio State"],
            tuitionFees: "100% Covered",
            ranking: "Leading US Midwest R1 Research Center",
            applicationRequirements: ["Undergraduate Degree", "Transcripts", "Statement of Purpose"],
            deadline: "2027-01-05"
        },

        // Low-Rank / Foundation / High-Acceptance Tier
        {
            professorName: "Prof. Chitta Baral",
            institution: "Arizona State University (ASU) - Cognitive Information Processing",
            researchArea: "Automated Knowledge Representation, Multi-Step Reasoning & Applied NLP",
            link: "https://www.public.asu.edu/~cbaral/",
            reasonForMatch: "High acceptance rate with substantial funding; directly values candidate's hands-on development baseline and technical writing.",
            universityTier: "Low-Rank",
            country: "USA",
            baseMatchScore: 87,
            fundingType: "Fully Funded (ASU Graduate TA/RA $28,000/yr + 100% Tuition Waiver)",
            keyKeywords: ["Reasoning", "Knowledge Representation", "ASU Computing", "NLP"],
            tuitionFees: "100% Waived by Graduate Assistantship",
            ranking: "Top-1 in US for Innovation, High Research Activity R1",
            applicationRequirements: ["BSc in CS or related field", "IELTS 6.5+ or TOEFL 80+", "Transcripts & Resume"],
            deadline: "2027-01-15"
        },
        {
            professorName: "Prof. Vivek Srikumar",
            institution: "University of Utah - Utah NLP Group (School of Computing)",
            researchArea: "Structured Prediction, Domain Generalization & Robust NLP Systems",
            link: "https://svivek.com/",
            reasonForMatch: "Great welcoming environment with strong faculty mentoring; values candidate's empirical grit.",
            universityTier: "Low-Rank",
            country: "USA",
            baseMatchScore: 86,
            fundingType: "Fully Funded (Utah Graduate Research Assistantship $29,000/yr + Full Tuition Remission)",
            keyKeywords: ["Structured Prediction", "Generalization", "Utah Computing"],
            tuitionFees: "Full Tuition Remission",
            ranking: "Renowned Computing Pioneer (Silicon Slopes Corridor)",
            applicationRequirements: ["STEM Degree", "Transcripts", "Statement of Purpose"],
            deadline: "2027-01-15"
        },
        {
            professorName: "Prof. Tommy Dang",
            institution: "Texas Tech University - Interactive Data Visualization Lab (iDVL)",
            researchArea: "Visual Analytics, Explainable Machine Learning & Scientific Big Data",
            link: "https://myweb.ttu.edu/toda/",
            reasonForMatch: "High acceptance potential with generous departmental stipends; ideal match for candidate's data processing abilities.",
            universityTier: "Low-Rank",
            country: "USA",
            baseMatchScore: 85,
            fundingType: "Fully Funded (TTU Departmental Assistantship $26,000/yr + In-State Waiver)",
            keyKeywords: ["Visual Analytics", "Explainable ML", "Texas Tech", "Big Data"],
            tuitionFees: "Tuition Covered via In-State Scholarship Rate",
            ranking: "Major West Texas R1 Research Center",
            applicationRequirements: ["Bachelor degree", "TOEFL/IELTS", "Transcripts"],
            deadline: "2027-02-01"
        },
        {
            professorName: "Prof. Fuxin Li",
            institution: "Oregon State University - Machine Learning & Computer Vision",
            researchArea: "Video Segmentation, 3D Point Cloud Learning & Interpretable Deep Neural Networks",
            link: "https://web.engr.oregonstate.edu/~lif/",
            reasonForMatch: "Candidate's PyTorch experience and computer vision projects align with Oregon State's open lab openings.",
            universityTier: "Low-Rank",
            country: "USA",
            baseMatchScore: 85,
            fundingType: "Fully Funded (OSU Graduate Research Assistantship $28,500/yr + Tuition)",
            keyKeywords: ["Point Cloud", "Video Segmentation", "Oregon State", "Vision"],
            tuitionFees: "100% Waived",
            ranking: "Top Pacific Northwest R1 Center for Robotics & AI",
            applicationRequirements: ["Undergraduate Degree in STEM", "Statement of Purpose", "CV"],
            deadline: "2027-01-15"
        },
        {
            professorName: "Prof. Indrakshi Ray",
            institution: "Colorado State University - Cyber Security & Applied AI Lab",
            researchArea: "Secure Machine Learning, Cyber-Physical Systems & IoT Data Security",
            link: "https://www.cs.colostate.edu/~iray/",
            reasonForMatch: "Accessible R1 program with dependable funding; matches candidate's software engineering strengths.",
            universityTier: "Low-Rank",
            country: "USA",
            baseMatchScore: 84,
            fundingType: "Fully Funded (CSU Graduate Assistantship $27,000/yr + Tuition Remission)",
            keyKeywords: ["Cyber-Physical Systems", "Security", "Colorado State", "IoT AI"],
            tuitionFees: "100% Remitted",
            ranking: "Major Colorado Front Range R1 Research Institution",
            applicationRequirements: ["BS in Computer Science or ECE", "Transcripts", "Statement of Purpose"],
            deadline: "2027-02-01"
        }
    ],

    'germany': [
        // Top-Tier
        {
            professorName: "Prof. Dr. Daniel Cremers",
            institution: "Technical University of Munich (TUM) - Computer Vision Group",
            researchArea: "3D Reconstruction, Visual SLAM, Real-Time Deep Perception & Dynamic Scene Flow",
            link: "https://cvg.cit.tum.de/",
            reasonForMatch: "Candidate's strong mathematical foundation and C++/Python programming match TUM CVG's rigorous standards.",
            universityTier: "Top-Tier",
            country: "Germany",
            baseMatchScore: 97,
            fundingType: "Fully Funded (TV-L E13 Position ~€52,000/yr / DAAD Doctoral Fellowship)",
            keyKeywords: ["Visual SLAM", "3D Computer Vision", "TUM", "Scene Flow"],
            tuitionFees: "Zero Tuition (Only ~€150/semester administrative fee)",
            ranking: "QS World #28, #1 University in Germany for Computer Science",
            applicationRequirements: ["BSc/MSc in CS, Math or ECE", "C++/PyTorch proficiency", "Cover Letter & Transcripts"],
            deadline: "2026-09-30"
        },
        {
            professorName: "Prof. Dr. Bernhard Schölkopf",
            institution: "Max Planck Institute for Intelligent Systems (MPI-IS) & ELLIS Unit",
            researchArea: "Causal Representation Learning, Machine Learning Foundations & Kernel Methods",
            link: "https://is.mpg.de/research/departments/empirical-inference",
            reasonForMatch: "Candidate's analytical clarity and algorithmic grounding fit MPI's world-leading doctoral academy.",
            universityTier: "Top-Tier",
            country: "Germany",
            baseMatchScore: 96,
            fundingType: "Fully Funded (Max Planck Doctoral Contract ~€2,600/mo net + Research Budget)",
            keyKeywords: ["Causality", "Representation Learning", "MPI-IS", "ELLIS"],
            tuitionFees: "Zero Tuition / Fully Funded",
            ranking: "World-Leading Pure Research Institution",
            applicationRequirements: ["Outstanding Academic Record", "Strong Math/Algorithms Base", "Research Statement"],
            deadline: "2026-10-15"
        },
        {
            professorName: "Prof. Dr. Eyke Hüllermeier",
            institution: "LMU Munich (Ludwig-Maximilians-Universität) - Institute of Informatics",
            researchArea: "Uncertainty Quantification in Machine Learning, Preference Learning & Trustworthy AI",
            link: "https://www.ifi.lmu.de/en/",
            reasonForMatch: "Matches candidate's interest in robust, mathematically sound machine intelligence.",
            universityTier: "Top-Tier",
            country: "Germany",
            baseMatchScore: 94,
            fundingType: "Fully Funded (Bavarian AI Fellowship / TV-L E13 ~€50,000/yr)",
            keyKeywords: ["Uncertainty Quantification", "Preference Learning", "LMU Munich"],
            tuitionFees: "Zero Tuition (State Funded)",
            ranking: "QS World #54, German Excellence University",
            applicationRequirements: ["BSc/MSc in Computer Science or Data Science", "CV & Transcripts"],
            deadline: "2026-10-01"
        },

        // Mid-Tier
        {
            professorName: "Prof. Dr. Frank Hutter",
            institution: "University of Freiburg - Machine Learning Lab & ELLIS Unit",
            researchArea: "Automated Machine Learning (AutoML), Neural Architecture Search & Meta-Learning",
            link: "https://www.automl.org/",
            reasonForMatch: "Candidate's empirical ML pipeline development experience aligns directly with AutoML and hyperparameter optimization research.",
            universityTier: "Mid-Tier",
            country: "Germany",
            baseMatchScore: 93,
            fundingType: "Fully Funded (DFG Research Grant / TV-L E13 Contract)",
            keyKeywords: ["AutoML", "Hyperparameter Optimization", "Freiburg", "ELLIS"],
            tuitionFees: "Tuition Free for Doctoral Studies",
            ranking: "World-Leading Center for AutoML Research",
            applicationRequirements: ["Degree in Computer Science or AI", "Deep PyTorch Experience", "Cover Letter"],
            deadline: "2026-10-15"
        },
        {
            professorName: "Prof. Dr. Bastian Leibe",
            institution: "RWTH Aachen University - Computer Vision Group",
            researchArea: "Multi-Object Tracking, Autonomous Driving Perception & Deep Sensor Fusion",
            link: "https://www.vision.rwth-aachen.de/",
            reasonForMatch: "Strong fit with candidate's data engineering and object recognition project experience.",
            universityTier: "Mid-Tier",
            country: "Germany",
            baseMatchScore: 91,
            fundingType: "Fully Funded (Research Associate Position TV-L E13)",
            keyKeywords: ["Object Tracking", "Autonomous Driving", "RWTH Aachen"],
            tuitionFees: "Zero Tuition",
            ranking: "TU9 Leading Technical University in Germany",
            applicationRequirements: ["MSc in Informatics or related", "C++ skills", "Recommendation letters"],
            deadline: "2026-10-30"
        },
        {
            professorName: "Prof. Dr. Klaus-Robert Müller",
            institution: "TU Berlin - Machine Learning Group",
            researchArea: "Explainable AI (Layer-wise Relevance Propagation), Quantum ML & Brain-Computer Interfaces",
            link: "https://www.ml.tu-berlin.de/",
            reasonForMatch: "Candidate's technical curiosity and scientific data handling fit TU Berlin's BIDA institute.",
            universityTier: "Mid-Tier",
            country: "Germany",
            baseMatchScore: 90,
            fundingType: "Fully Funded (BMBF Research Contract TV-L E13)",
            keyKeywords: ["Explainable AI", "LRP", "TU Berlin", "Quantum ML"],
            tuitionFees: "Zero Tuition",
            ranking: "TU9 Member, Berlin University Alliance",
            applicationRequirements: ["Master degree", "Strong Python knowledge", "Transcripts"],
            deadline: "2026-11-01"
        },

        // Low-Rank / Foundation / High-Acceptance Tier
        {
            professorName: "Prof. Dr. Gabriel Zachmann",
            institution: "University of Bremen - Computer Graphics and Virtual Reality Lab",
            researchArea: "Spatial Computing, Collision Detection & Real-Time Geometric Algorithms",
            link: "https://cgvr.cs.uni-bremen.de/",
            reasonForMatch: "High acceptance probability for motivated international candidates; values candidate's core coding background.",
            universityTier: "Low-Rank",
            country: "Germany",
            baseMatchScore: 87,
            fundingType: "Fully Funded (State Research Assistantship TV-L E13 / DAAD)",
            keyKeywords: ["Spatial Computing", "Virtual Reality", "Bremen", "Algorithms"],
            tuitionFees: "Zero Tuition (Only semester ticket ~€350)",
            ranking: "Major Hanseatic Research University",
            applicationRequirements: ["BSc/MSc in STEM", "Solid C++/Python skills", "Transcripts"],
            deadline: "2026-11-15"
        },
        {
            professorName: "Prof. Dr. Michael Möller",
            institution: "University of Siegen - Computer Vision Group",
            researchArea: "Variational Methods, Inverse Problems in Imaging & Neural Implicit Representations",
            link: "https://www.eti.uni-siegen.de/vc/",
            reasonForMatch: "Personalized mentorship and welcoming research group; matches candidate's mathematical curiosity.",
            universityTier: "Low-Rank",
            country: "Germany",
            baseMatchScore: 86,
            fundingType: "Fully Funded (DFG Research Contract TV-L E13)",
            keyKeywords: ["Inverse Problems", "Variational Methods", "Siegen", "Computer Vision"],
            tuitionFees: "Zero Tuition",
            ranking: "Active German University with Fast-Growing AI Lab",
            applicationRequirements: ["STEM Degree", "Statement of Purpose", "CV"],
            deadline: "2026-11-20"
        },
        {
            professorName: "Prof. Dr. Stefan Gumhold",
            institution: "TU Dresden - Computer Graphics & Visualization",
            researchArea: "3D Mesh Processing, Geometric Machine Learning & Scientific Visualization",
            link: "https://tu-dresden.de/inf/cgc",
            reasonForMatch: "Candidate's visual computing coursework and programming grit fit TU Dresden's European research grants.",
            universityTier: "Low-Rank",
            country: "Germany",
            baseMatchScore: 85,
            fundingType: "Fully Funded (Saxon State Fellowship / TV-L E13)",
            keyKeywords: ["Geometric ML", "Visualization", "TU Dresden"],
            tuitionFees: "Zero Tuition",
            ranking: "German Excellence University in Saxony Silicon Hub",
            applicationRequirements: ["Degree in Computer Science or Math", "Transcripts", "CV"],
            deadline: "2026-11-30"
        }
    ],

    'canada': [
        // Top-Tier
        {
            professorName: "Prof. Yoshua Bengio",
            institution: "Mila - Quebec AI Institute & Université de Montréal",
            researchArea: "Generative Flow Networks (GFlowNets), Representation Learning & AI for Scientific Discovery",
            link: "https://mila.quebec/en/directory/yoshua-bengio/",
            reasonForMatch: "Candidate's core curiosity in deep neural principles matches Mila's global hub for machine learning discovery.",
            universityTier: "Top-Tier",
            country: "Canada",
            baseMatchScore: 97,
            fundingType: "Fully Funded (Mila Fellowship $34,000/yr + Full Tuition Remission)",
            keyKeywords: ["GFlowNets", "Deep Learning Theory", "Mila AI", "Causal AI"],
            tuitionFees: "100% Covered by Mila Grant",
            ranking: "World's Largest Academic Deep Learning Center",
            applicationRequirements: ["BSc/MSc in CS/Math", "Strong Research Aptitude", "Statement of Purpose", "3 Letters"],
            deadline: "2026-12-01"
        },
        {
            professorName: "Prof. Sanja Fidler",
            institution: "University of Toronto & Vector Institute",
            researchArea: "Computer Vision, Generative Simulation & 3D Interactive Environments",
            link: "https://www.cs.toronto.edu/~fidler/",
            reasonForMatch: "Direct match with candidate's computer vision and machine learning toolkit.",
            universityTier: "Top-Tier",
            country: "Canada",
            baseMatchScore: 96,
            fundingType: "Fully Funded (Vector Scholarship in AI / U of T Fellowship $35,000/yr + Tuition)",
            keyKeywords: ["Computer Vision", "Generative Simulation", "Vector Institute"],
            tuitionFees: "100% Waived",
            ranking: "QS World #21, #1 in Canada",
            applicationRequirements: ["Top GPA", "3 Academic Letters of Recommendation", "CV"],
            deadline: "2026-12-15"
        },

        // Mid-Tier
        {
            professorName: "Prof. Pascal Poupart",
            institution: "University of Waterloo - David R. Cheriton School of CS & Vector Institute",
            researchArea: "Reinforcement Learning, Conversational AI & Scalable Optimization",
            link: "https://cs.uwaterloo.ca/~ppoupart/",
            reasonForMatch: "Candidate's hands-on algorithm design and deep learning skills align directly with Waterloo's top AI lab.",
            universityTier: "Mid-Tier",
            country: "Canada",
            baseMatchScore: 93,
            fundingType: "Fully Funded (Waterloo Presidential Fellowship + RA/TA $32,000/yr)",
            keyKeywords: ["Reinforcement Learning", "Conversational AI", "Waterloo CS"],
            tuitionFees: "Full Tuition Covered",
            ranking: "Top Tier Canadian CS Program (Silicon Valley North)",
            applicationRequirements: ["Bachelor degree in STEM", "Solid programming background", "Transcripts"],
            deadline: "2026-12-15"
        },
        {
            professorName: "Prof. Mark Schmidt",
            institution: "University of British Columbia (UBC) - Machine Learning Group",
            researchArea: "Numerical Optimization, Empirical Machine Learning & Large-Scale Convex Algorithms",
            link: "https://www.cs.ubc.ca/~schmidtm/",
            reasonForMatch: "Candidate's mathematical background and optimization toolkit fit UBC ML group agenda.",
            universityTier: "Mid-Tier",
            country: "Canada",
            baseMatchScore: 92,
            fundingType: "Fully Funded (NSERC / UBC Four-Year Doctoral Fellowship $32,000/yr)",
            keyKeywords: ["Optimization", "Large-Scale ML", "UBC Computing"],
            tuitionFees: "100% Waived",
            ranking: "Top-3 Canadian Research Institution",
            applicationRequirements: ["Bachelor's or Master's in STEM", "Transcripts", "Statement of Purpose"],
            deadline: "2026-12-15"
        },

        // Low-Rank / Foundation / High-Acceptance Tier
        {
            professorName: "Prof. Greg Mori",
            institution: "Simon Fraser University (SFU) - Computational Vision Lab",
            researchArea: "Human Activity Recognition, Video Understanding & Machine Learning",
            link: "https://www.cs.sfu.ca/~mori/",
            reasonForMatch: "High acceptance potential with established research faculty; values candidate's real-world problem-solving.",
            universityTier: "Low-Rank",
            country: "Canada",
            baseMatchScore: 87,
            fundingType: "Fully Funded (SFU Graduate Fellowship + RA $28,000/yr)",
            keyKeywords: ["Activity Recognition", "Video Understanding", "SFU Computing"],
            tuitionFees: "Tuition Covered via Departmental Award",
            ranking: "Leading Comprehensive Canadian University in Metro Vancouver",
            applicationRequirements: ["BSc in CS or related", "Transcripts", "2-3 References"],
            deadline: "2027-01-15"
        },
        {
            professorName: "Prof. Frank Maurer",
            institution: "University of Calgary - Department of Computer Science",
            researchArea: "Spatial Data Systems, Augmented Reality & Applied Machine Learning",
            link: "https://pages.cpsc.ucalgary.ca/~maurer/",
            reasonForMatch: "Welcoming international research cohort with high funding availability in Alberta.",
            universityTier: "Low-Rank",
            country: "Canada",
            baseMatchScore: 86,
            fundingType: "Fully Funded (Alberta Innovates Graduate Scholarship $27,500/yr)",
            keyKeywords: ["Spatial Computing", "Applied AI", "Univ of Calgary"],
            tuitionFees: "Tuition Covered",
            ranking: "Major Canadian U15 Research University",
            applicationRequirements: ["Undergraduate Degree", "CV", "Transcripts"],
            deadline: "2027-01-30"
        }
    ],

    'uk': [
        // Top-Tier
        {
            professorName: "Prof. Michael Bronstein",
            institution: "University of Oxford - Department of Computer Science",
            researchArea: "Geometric Deep Learning, Graph Neural Networks & Drug Discovery AI",
            link: "https://www.cs.ox.ac.uk/people/michael.bronstein/",
            reasonForMatch: "Candidate's rigorous algorithmic grounding is tailored for Oxford's world-leading geometric deep learning team.",
            universityTier: "Top-Tier",
            country: "UK",
            baseMatchScore: 97,
            fundingType: "Fully Funded (Clarendon Fund Scholarship £21,500/yr tax-free + Full Fees)",
            keyKeywords: ["Geometric Deep Learning", "Graph Neural Networks", "Oxford CS"],
            tuitionFees: "100% Covered by Clarendon Award",
            ranking: "QS World #3, Top in UK",
            applicationRequirements: ["First Class Honours or equivalent", "Research Proposal", "3 Academic References"],
            deadline: "2027-01-08"
        },
        {
            professorName: "Prof. Zoubin Ghahramani",
            institution: "University of Cambridge - Machine Learning Group",
            researchArea: "Probabilistic Machine Learning, Bayesian Neural Networks & Gaussian Processes",
            link: "http://mlg.eng.cam.ac.uk/",
            reasonForMatch: "Exceptional match with candidate's interest in robust statistical learning and mathematical foundations of AI.",
            universityTier: "Top-Tier",
            country: "UK",
            baseMatchScore: 96,
            fundingType: "Fully Funded (Gates Cambridge / Cambridge Trust Studentship £22,000/yr + Fees)",
            keyKeywords: ["Bayesian Deep Learning", "Gaussian Processes", "Cambridge MLG"],
            tuitionFees: "100% Waived",
            ranking: "QS World #2",
            applicationRequirements: ["Outstanding Transcript", "Mathematical Background", "Statement of Purpose"],
            deadline: "2026-12-05"
        },
        {
            professorName: "Prof. Andrew Davison",
            institution: "Imperial College London - Dyson Robotics Laboratory",
            researchArea: "Spatial AI, Real-Time Dense SLAM & Robot Perception",
            link: "https://www.imperial.ac.uk/dyson-robotics-lab/",
            reasonForMatch: "Candidate's programming capability and interest in visual computing align directly with Imperial's spatial perception research.",
            universityTier: "Top-Tier",
            country: "UK",
            baseMatchScore: 94,
            fundingType: "Fully Funded (President's PhD Scholarship £23,000/yr + Full Fees)",
            keyKeywords: ["Spatial AI", "SLAM", "Robotics Vision", "Imperial College"],
            tuitionFees: "Fully Covered",
            ranking: "QS World #6",
            applicationRequirements: ["BSc/MSc in Computing or EEE", "Strong C++/Python skills", "SOP"],
            deadline: "2027-01-10"
        },

        // Mid-Tier
        {
            professorName: "Prof. Laura Toni",
            institution: "University College London (UCL) - Electronic & Electrical Engineering",
            researchArea: "Graph Signal Processing, Multi-Agent Reinforcement Learning & Networked AI",
            link: "https://iris.ucl.ac.uk/iris/browse/profile?upi=LTONI27",
            reasonForMatch: "Matches candidate's network and communication systems understanding with modern multi-agent RL.",
            universityTier: "Mid-Tier",
            country: "UK",
            baseMatchScore: 92,
            fundingType: "Fully Funded (UCL Research Excellence Scholarship £21,500/yr + Fees)",
            keyKeywords: ["Multi-Agent RL", "Graph Signal Processing", "UCL"],
            tuitionFees: "100% Waived",
            ranking: "QS World #9, Russell Group Flagship",
            applicationRequirements: ["First Class Honours", "Transcripts", "Statement of Purpose"],
            deadline: "2027-01-15"
        },
        {
            professorName: "Prof. Amos Storkey",
            institution: "University of Edinburgh - School of Informatics",
            researchArea: "Meta-Learning, Bayesian Optimization & Continuous Representation Models",
            link: "https://homepages.inf.ed.ac.uk/amos/",
            reasonForMatch: "Edinburgh's elite European informatics hub provides an ideal environment for candidate's deep learning ambitions.",
            universityTier: "Mid-Tier",
            country: "UK",
            baseMatchScore: 91,
            fundingType: "Fully Funded (Edinburgh Doctoral College Scholarship £20,000/yr)",
            keyKeywords: ["Bayesian Optimization", "Meta-Learning", "Edinburgh Informatics"],
            tuitionFees: "Full Fees Paid",
            ranking: "Largest Informatics Department in the UK",
            applicationRequirements: ["MSc or Top BSc", "Research Statement", "2 Academic Letters"],
            deadline: "2027-01-20"
        },

        // Low-Rank / Foundation / High-Acceptance Tier
        {
            professorName: "Prof. Haiping Lu",
            institution: "University of Sheffield - Department of Computer Science",
            researchArea: "Multilinear Subspace Learning, Brain Informatics & Medical Data AI",
            link: "https://haipinglu.github.io/",
            reasonForMatch: "High acceptance probability for hardworking international candidates with strong programming skills.",
            universityTier: "Low-Rank",
            country: "UK",
            baseMatchScore: 87,
            fundingType: "Fully Funded (Sheffield University Research Studentship £19,200/yr + Tuition)",
            keyKeywords: ["Brain Informatics", "Subspace Learning", "Sheffield CS"],
            tuitionFees: "100% Fees Paid",
            ranking: "Russell Group Member in Yorkshire",
            applicationRequirements: ["2:1 Honours Degree or equivalent", "English proficiency", "Transcripts"],
            deadline: "2027-02-01"
        },
        {
            professorName: "Prof. Sean Holden",
            institution: "University of Nottingham - School of Computer Science",
            researchArea: "Automated Theorem Proving, Neural Reasoning & Computational Logic",
            link: "https://www.nottingham.ac.uk/computerscience/people/",
            reasonForMatch: "Great welcoming academic environment with full EPSRC funded studentships.",
            universityTier: "Low-Rank",
            country: "UK",
            baseMatchScore: 85,
            fundingType: "Fully Funded (EPSRC DTP Studentship £18,622/yr tax-free + Full Fees)",
            keyKeywords: ["Automated Reasoning", "Computational Logic", "Nottingham"],
            tuitionFees: "Zero Tuition",
            ranking: "Russell Group Research Institution",
            applicationRequirements: ["Degree in Computing/Math", "Transcripts", "Research Proposal"],
            deadline: "2027-02-15"
        }
    ],

    'japan': [
        // Top-Tier
        {
            professorName: "Prof. Tatsuya Harada",
            institution: "The University of Tokyo - Machine Intelligence & Systems Lab (RCAST & RIKEN AIP)",
            researchArea: "Multimodal Intelligence, Cross-Modal Representation Learning, Robotics AI",
            link: "https://www.mi.t.u-tokyo.ac.jp/",
            reasonForMatch: "Candidate's background in visual computing and machine learning aligns with U-Tokyo's world-leading laboratory.",
            universityTier: "Top-Tier",
            country: "Japan",
            baseMatchScore: 96,
            fundingType: "Fully Funded (MEXT University Recommendation / JSPS Fellowship ¥150,000/mo + Fee Waiver)",
            keyKeywords: ["Multimodal AI", "Cross-Modal Learning", "University of Tokyo"],
            tuitionFees: "100% Waived by Japanese Government",
            ranking: "QS World #28, #1 in Japan",
            applicationRequirements: ["Outstanding Academic Transcript", "Study Plan in English", "2 Letters of Recommendation"],
            deadline: "2026-10-15"
        },
        {
            professorName: "Prof. Masashi Sugiyama",
            institution: "Tokyo Institute of Technology & RIKEN AIP",
            researchArea: "Weakly Supervised Learning, Statistical Learning Theory & Robust Machine Learning",
            link: "https://www.ms.k.u-tokyo.ac.jp/",
            reasonForMatch: "Candidate's solid mathematical basis and statistical understanding fit Sugiyama's leading theory lab.",
            universityTier: "Top-Tier",
            country: "Japan",
            baseMatchScore: 95,
            fundingType: "Fully Funded (JSPS Doctoral Fellowship ¥200,000/mo + Research Grant)",
            keyKeywords: ["Weakly Supervised", "Statistical Learning", "Tokyo Tech", "RIKEN"],
            tuitionFees: "100% Waived",
            ranking: "Top Science & Engineering University in Japan",
            applicationRequirements: ["Master's Degree in STEM", "Strong Math/Algorithms Base", "Transcripts"],
            deadline: "2026-10-25"
        },

        // Mid-Tier
        {
            professorName: "Prof. Kentaro Inui",
            institution: "Tohoku University - Natural Language Processing Lab",
            researchArea: "Argument Mining, Reasoning in Large Language Models & Knowledge Acquisition",
            link: "https://www.nlp.ecei.tohoku.ac.jp/",
            reasonForMatch: "Tohoku NLP is one of the premier computational linguistics hubs in Asia; aligns with candidate's NLP ambitions.",
            universityTier: "Mid-Tier",
            country: "Japan",
            baseMatchScore: 92,
            fundingType: "Fully Funded (Tohoku University Fellowship ¥180,000/mo + Full Tuition Remission)",
            keyKeywords: ["Argument Mining", "LLM Reasoning", "Tohoku NLP"],
            tuitionFees: "Zero Tuition",
            ranking: "Times Higher Education #1 University in Japan",
            applicationRequirements: ["STEM Degree", "English Proficiency", "Study Plan"],
            deadline: "2026-11-05"
        },

        // Low-Rank / Foundation / High-Acceptance Tier
        {
            professorName: "Prof. Shogo Okada",
            institution: "JAIST (Japan Advanced Institute of Science and Technology)",
            researchArea: "Social Signal Processing, Multimodal Emotion AI & Human-Robot Interaction",
            link: "https://www.jaist.ac.jp/",
            reasonForMatch: "High acceptance rate with generous institutional grants; 100% English research environment.",
            universityTier: "Low-Rank",
            country: "Japan",
            baseMatchScore: 86,
            fundingType: "Fully Funded (JAIST Foundation Grant ¥130,000/mo + Zero Tuition)",
            keyKeywords: ["Emotion AI", "Social Signal Processing", "JAIST"],
            tuitionFees: "Zero Tuition",
            ranking: "National Postgraduate Specialist University in Ishikawa",
            applicationRequirements: ["BSc in Computing or EEE", "Transcripts", "Statement of Purpose"],
            deadline: "2026-11-20"
        }
    ],

    'france': [
        // Top-Tier
        {
            professorName: "Prof. Gaël Varoquaux",
            institution: "Inria Saclay & Université Paris-Saclay - Parietal Team",
            researchArea: "Neuroimaging Data Science, Statistical Learning & Scientific Open Source (Scikit-Learn)",
            link: "https://gael-varoquaux.info/",
            reasonForMatch: "Candidate's scientific Python fluency and empirical optimization interest fit Parietal's world-leading lab.",
            universityTier: "Top-Tier",
            country: "France",
            baseMatchScore: 96,
            fundingType: "Fully Funded (Inria Doctoral Contract ~€2,200/mo net + Full Waiver)",
            keyKeywords: ["Scikit-Learn", "Neuroimaging", "Inria", "Paris-Saclay"],
            tuitionFees: "Zero Tuition (French Public Research Contract)",
            ranking: "Paris-Saclay QS World #12 in Mathematics, Top European AI Center",
            applicationRequirements: ["Master's in CS, Math or Data Science", "Strong Python proficiency", "CV & Letters"],
            deadline: "2026-10-30"
        },
        {
            professorName: "Prof. Cordelia Schmid",
            institution: "Inria Paris & ENS / PSL - THOTH Team",
            researchArea: "Video Representation Learning, Embodied Perception & Action Recognition",
            link: "https://www.di.ens.fr/~schmid/",
            reasonForMatch: "Synergy with candidate's visual computing and deep learning project background.",
            universityTier: "Top-Tier",
            country: "France",
            baseMatchScore: 95,
            fundingType: "Fully Funded (ENS / Inria International Fellowship ~€2,250/mo)",
            keyKeywords: ["Video Learning", "Embodied Vision", "ENS Paris", "Inria"],
            tuitionFees: "Zero Tuition",
            ranking: "Leading European Computer Vision Pioneer",
            applicationRequirements: ["MSc in CS", "C++/Python skills", "Transcripts"],
            deadline: "2026-11-15"
        },

        // Mid-Tier & Foundation
        {
            professorName: "Prof. Julien Mairal",
            institution: "Inria Grenoble - THOTH & LEAR Groups",
            researchArea: "Kernel Methods, Large-Scale Optimization & Mathematical Machine Learning",
            link: "https://lear.inrialpes.fr/people/mairal/",
            reasonForMatch: "Candidate's mathematical foundation fits Mairal's rigorous algorithmic inquiries.",
            universityTier: "Mid-Tier",
            country: "France",
            baseMatchScore: 92,
            fundingType: "Fully Funded (ANR Doctoral Contract ~€2,100/mo net)",
            keyKeywords: ["Kernel Methods", "Optimization", "Inria Grenoble"],
            tuitionFees: "Zero Tuition",
            ranking: "Leading French Applied Math & Computing Hub",
            applicationRequirements: ["Master's degree in Applied Math or CS", "Transcripts", "CV"],
            deadline: "2026-11-20"
        },
        {
            professorName: "Prof. Marc Sebban",
            institution: "Université Jean Monnet & CNRS - Hubert Curien Lab",
            researchArea: "Metric Learning, Optimal Transport & Algorithmic Generalization in Machine Learning",
            link: "https://laboratoirehubertcurien.univ-st-etienne.fr/",
            reasonForMatch: "Very high acceptance potential; dedicated research mentoring in applied machine learning.",
            universityTier: "Low-Rank",
            country: "France",
            baseMatchScore: 86,
            fundingType: "Fully Funded (French Regional Doctoral Grant ~€2,000/mo net)",
            keyKeywords: ["Metric Learning", "Optimal Transport", "CNRS"],
            tuitionFees: "Zero Tuition",
            ranking: "CNRS Associated Research Laboratory",
            applicationRequirements: ["BSc/MSc in STEM", "Motivation Letter", "Transcripts"],
            deadline: "2026-12-01"
        }
    ],

    'erasmus-mundus': [
        {
            professorName: "BDMA - Big Data Management and Analytics (EMJMD)",
            institution: "ULB (Belgium), UPC (Spain), TU Berlin (Germany), CentraleSupélec (France)",
            researchArea: "Large-Scale Data Engineering, Distributed AI, Cloud Analytics",
            link: "https://bdma.ulb.ac.be",
            reasonForMatch: "Candidate's strong computational foundation and data background match BDMA's multi-university international consortium track.",
            universityTier: "Top-Tier",
            country: "European Union (EMJMD)",
            baseMatchScore: 97,
            fundingType: "Fully Funded (EU Scholarship - €1,400/mo + Fee Waiver)",
            keyKeywords: ["Distributed Systems", "Cloud AI", "Data Pipelines", "EMJMD"],
            tuitionFees: "100% Waived by Erasmus+ Grant",
            ranking: "Consortium of Top European Research Universities",
            applicationRequirements: ["BSc in CS/Math/Engineering", "IELTS 6.5+ / TOEFL 90+", "2 Academic Reference Letters"],
            deadline: "2026-12-15"
        },
        {
            professorName: "GENIAL - Green Embedded Neural Intelligence (EMJMD)",
            institution: "Univ of Perpignan (France), Univ of Extremadura (Spain), Univ of Applied Sciences Upper Austria",
            researchArea: "Edge AI, Low-Power Embedded Computing, Green Computing",
            link: "https://master-genial.eu",
            reasonForMatch: "Direct match with candidate's programming skills and interest in sustainable edge computing and hardware acceleration.",
            universityTier: "Top-Tier",
            country: "European Union (EMJMD)",
            baseMatchScore: 94,
            fundingType: "Fully Funded (Erasmus Mundus Grant - €1,400/mo)",
            keyKeywords: ["Edge Computing", "Neural Acceleration", "Embedded Systems"],
            tuitionFees: "Fully Funded / Zero Tuition",
            ranking: "European Commission Excellence Flagship",
            applicationRequirements: ["Bachelor degree in STEM", "Motivation Letter", "CV (Europass)"],
            deadline: "2026-12-20"
        },
        {
            professorName: "BioData - Computational Biology and Biomedicine (EMJMD)",
            institution: "Sorbonne Université (France), Uppsala University (Sweden), University of Lisbon (Portugal)",
            researchArea: "Bioinformatics, Machine Learning in Healthcare, Precision Genomics",
            link: "https://master-biodata.eu",
            reasonForMatch: "Ideal for applying machine learning and quantitative modeling to biological datasets and health informatics.",
            universityTier: "Top-Tier",
            country: "European Union (EMJMD)",
            baseMatchScore: 93,
            fundingType: "Fully Funded (€1,400/month stipend + Full Waiver)",
            keyKeywords: ["Computational Biology", "Genomics", "AI in Health"],
            tuitionFees: "Full Tuition Covered",
            ranking: "Top European Life Sciences Consortium",
            applicationRequirements: ["Relevant STEM/Life Science Bachelor", "English Proficiency", "Statement of Purpose"],
            deadline: "2027-01-10"
        },
        {
            professorName: "COSI - Computational Colour and Spectral Imaging (EMJMD)",
            institution: "Jean Monnet Univ (France), NTNU (Norway), Univ of Granada (Spain), Univ of Eastern Finland",
            researchArea: "Computer Vision, Spectral Image Processing, Optical Learning",
            link: "https://cosi-master.eu",
            reasonForMatch: "Superb alignment with image processing, computer vision, and applied sensory machine learning.",
            universityTier: "Mid-Tier",
            country: "European Union (EMJMD)",
            baseMatchScore: 91,
            fundingType: "Fully Funded (Erasmus+ Scholarship)",
            keyKeywords: ["Computer Vision", "Spectral Imaging", "Optics & AI"],
            tuitionFees: "Fully Funded by European Commission",
            ranking: "International Excellence Flagship",
            applicationRequirements: ["BSc in Computer Science, Physics, or Math", "Transcript", "2 Recommendation Letters"],
            deadline: "2027-01-15"
        },
        {
            professorName: "EMAI - European Master in Artificial Intelligence (EMJMD)",
            institution: "UPF Barcelona (Spain), Sapienza (Italy), Radboud (Netherlands), Univ of Ljubljana (Slovenia)",
            researchArea: "Fundamental AI, Multi-Agent Systems, Cognitive Robotics & Machine Learning",
            link: "https://emai-master.eu/",
            reasonForMatch: "Comprehensive flagship program offering diverse tracks; welcoming admissions profile.",
            universityTier: "Low-Rank",
            country: "European Union (EMJMD)",
            baseMatchScore: 88,
            fundingType: "Fully Funded (€1,400/month + Full Waiver)",
            keyKeywords: ["General AI", "Multi-Agent Systems", "EMAI", "Robotics"],
            tuitionFees: "Zero Tuition",
            ranking: "New European Commission Horizon Consortium",
            applicationRequirements: ["Bachelor degree in CS or STEM", "English B2/C1", "Motivation Letter"],
            deadline: "2027-01-25"
        }
    ],

    'australia': [
        // Top-Tier
        {
            professorName: "Prof. Trevor Cohn",
            institution: "University of Melbourne - Natural Language Processing Group",
            researchArea: "Robust NLP, Cross-Lingual Machine Learning & Representation Learning",
            link: "https://people.eng.unimelb.edu.au/tcohn/",
            reasonForMatch: "Candidate's background in language processing and neural representations matches Melbourne's high-impact agenda.",
            universityTier: "Top-Tier",
            country: "Australia",
            baseMatchScore: 96,
            fundingType: "Fully Funded (Melbourne Research Scholarship AUD $37,000/yr + Full Fee Remission)",
            keyKeywords: ["NLP", "Cross-Lingual", "Univ of Melbourne", "Deep Learning"],
            tuitionFees: "100% Remitted",
            ranking: "QS World #13, #1 in Australia",
            applicationRequirements: ["High Honours degree or equivalent", "Research Proposal", "Transcripts"],
            deadline: "2026-10-31"
        },
        {
            professorName: "Prof. Dacheng Tao",
            institution: "University of Sydney - School of Computer Science",
            researchArea: "Deep Geometric Learning, Computer Vision & Trustworthy AI",
            link: "https://www.sydney.edu.au/engineering/about/our-people/academic-staff/dacheng-tao.html",
            reasonForMatch: "Candidate's visual computing skills and analytical toolkit fit USYD's AI flagship center.",
            universityTier: "Top-Tier",
            country: "Australia",
            baseMatchScore: 95,
            fundingType: "Fully Funded (Australian RTP Scholarship AUD $38,500/yr + Full Fees)",
            keyKeywords: ["Geometric Learning", "Trustworthy AI", "Univ of Sydney"],
            tuitionFees: "100% Covered",
            ranking: "QS World #18",
            applicationRequirements: ["Outstanding Academic Track Record", "Referees", "Statement"],
            deadline: "2026-10-31"
        },

        // Mid-Tier & Foundation
        {
            professorName: "Prof. Arcot Sowmya",
            institution: "UNSW Sydney - School of Computer Science and Engineering",
            researchArea: "Biomedical Image Analysis, Computer Vision & Machine Learning in Medicine",
            link: "https://www.unsw.edu.au/staff/arcot-sowmya",
            reasonForMatch: "Candidate's image processing and pipeline engineering experience align directly with UNSW projects.",
            universityTier: "Mid-Tier",
            country: "Australia",
            baseMatchScore: 92,
            fundingType: "Fully Funded (UNSW Scientia PhD Scholarship AUD $40,000/yr)",
            keyKeywords: ["Biomedical Imaging", "Computer Vision", "UNSW Sydney"],
            tuitionFees: "Zero Tuition",
            ranking: "QS World #19, Group of Eight",
            applicationRequirements: ["Bachelor degree with First Class Honours", "Transcripts", "CV"],
            deadline: "2026-11-15"
        },
        {
            professorName: "Prof. Ajmal Mian",
            institution: "University of Western Australia (UWA) - Computer Science",
            researchArea: "3D Point Cloud Processing, Facial Biometrics & Deep Sensor Analysis",
            link: "https://web.csse.uwa.edu.au/~ajmal/",
            reasonForMatch: "High acceptance potential with generous RTP living stipends in Perth; matches candidate's 3D/sensor skills.",
            universityTier: "Low-Rank",
            country: "Australia",
            baseMatchScore: 86,
            fundingType: "Fully Funded (UWA International Postgraduate Research Scholarship AUD $35,000/yr)",
            keyKeywords: ["3D Point Clouds", "Biometrics", "UWA Perth"],
            tuitionFees: "100% Waived",
            ranking: "Group of Eight University in Western Australia",
            applicationRequirements: ["Honours/Master degree", "Transcripts", "Research Summary"],
            deadline: "2026-11-30"
        }
    ],

    'singapore': [
        // Top-Tier
        {
            professorName: "Prof. Min-Yen Kan",
            institution: "National University of Singapore (NUS) - WING Lab",
            researchArea: "Information Retrieval, Scholarly Document AI & Neural Language Modeling",
            link: "https://wing.comp.nus.edu.sg/~kanmy/",
            reasonForMatch: "Candidate's research paper synthesis and software engineering abilities fit WING lab's document intelligence research.",
            universityTier: "Top-Tier",
            country: "Singapore",
            baseMatchScore: 96,
            fundingType: "Fully Funded (SINGA Award SGD $3,200/mo + Full Tuition Remission)",
            keyKeywords: ["Document AI", "NLP", "NUS Computing", "Information Retrieval"],
            tuitionFees: "100% Waived by A*STAR / NUS",
            ranking: "QS World #8, #1 in Asia",
            applicationRequirements: ["BSc in Computing or STEM", "Strong Academic Record", "2 Letters", "Statement of Purpose"],
            deadline: "2026-12-01"
        },
        {
            professorName: "Prof. Bo An",
            institution: "Nanyang Technological University (NTU) - Artificial Intelligence Lab",
            researchArea: "Multi-Agent Systems, Reinforcement Learning for Game Theory & Decision Optimization",
            link: "https://personal.ntu.edu.sg/boan/",
            reasonForMatch: "Candidate's algorithmic problem solving and optimization skills fit NTU's multi-agent AI group.",
            universityTier: "Top-Tier",
            country: "Singapore",
            baseMatchScore: 95,
            fundingType: "Fully Funded (NTU Research Scholarship SGD $3,000/mo + Zero Tuition)",
            keyKeywords: ["Multi-Agent Systems", "Reinforcement Learning", "NTU Singapore"],
            tuitionFees: "Zero Tuition",
            ranking: "QS World #15, Leading Technological University",
            applicationRequirements: ["BSc/MSc in CS", "GRE/GATE (if non-local)", "Transcripts"],
            deadline: "2026-12-15"
        },

        // Mid-Tier & Foundation
        {
            professorName: "Prof. David Lo",
            institution: "Singapore Management University (SMU) - School of Computing & Information Systems",
            researchArea: "Software Analytics, AI for Software Engineering & Code Intelligence",
            link: "https://www.mysmu.edu/faculty/davidlo/",
            reasonForMatch: "Direct fit for candidate's software debugging, Git portfolio, and programming language background.",
            universityTier: "Mid-Tier",
            country: "Singapore",
            baseMatchScore: 91,
            fundingType: "Fully Funded (SMU PhD Fellowship SGD $3,000/mo + Tuition Waiver)",
            keyKeywords: ["Software Analytics", "AI for Code", "SMU"],
            tuitionFees: "100% Covered",
            ranking: "Premier Specialized University in Downtown Singapore",
            applicationRequirements: ["Bachelor degree in CS", "Transcripts", "Statement of Purpose"],
            deadline: "2026-12-31"
        },
        {
            professorName: "Dr. Joey Tianyi Zhou",
            institution: "A*STAR - Centre for Frontier AI Research (CFAR)",
            researchArea: "Secure Machine Learning, Federated Learning & Transferable Neural Models",
            link: "https://www.a-star.edu.sg/cfar",
            reasonForMatch: "A*STAR national research institute; generous fellowship quotas for international candidates.",
            universityTier: "Low-Rank",
            country: "Singapore",
            baseMatchScore: 87,
            fundingType: "Fully Funded (A*STAR SINGA Fellowship SGD $3,200/mo)",
            keyKeywords: ["Federated Learning", "Secure AI", "A*STAR CFAR"],
            tuitionFees: "Zero Tuition",
            ranking: "Singapore National Research Institute",
            applicationRequirements: ["STEM Degree", "Transcripts", "Research Interest Form"],
            deadline: "2027-01-05"
        }
    ],

    'poland': [
        {
            professorName: "Prof. Piotr Sankowski",
            institution: "University of Warsaw - MIMUW & IDEAS NCBR",
            researchArea: "Graph Neural Networks, Algorithmic Foundations & Scalable AI",
            link: "https://www.mimuw.edu.pl/~sank/",
            reasonForMatch: "Candidate's algorithmic foundation matches MIMUW's world-champion mathematical and competitive programming culture.",
            universityTier: "Top-Tier",
            country: "Poland",
            baseMatchScore: 94,
            fundingType: "Fully Funded (NCN Preludium Bis / IDEAS NCBR Fellowship ~6,000 PLN/mo net)",
            keyKeywords: ["Graph Neural Networks", "Algorithms", "Univ of Warsaw", "IDEAS NCBR"],
            tuitionFees: "Zero Tuition (State Funded Doctoral School)",
            ranking: "Top-1 University in Poland for Mathematics & Computer Science",
            applicationRequirements: ["BSc/MSc in Computer Science or Math", "Transcripts", "CV"],
            deadline: "2026-10-31"
        },
        {
            professorName: "Prof. Jacek Tabor",
            institution: "Jagiellonian University (Kraków) - Machine Learning Group (GMUM)",
            researchArea: "Continuous Normalizing Flows, Deep Generative Models & Information-Theoretic AI",
            link: "https://gmum.net/",
            reasonForMatch: "Synergy with candidate's analytical skills and deep learning optimization experience.",
            universityTier: "Top-Tier",
            country: "Poland",
            baseMatchScore: 93,
            fundingType: "Fully Funded (Foundation for Polish Science FNP Fellowship ~5,500 PLN/mo net)",
            keyKeywords: ["Generative Models", "Normalizing Flows", "Jagiellonian Univ"],
            tuitionFees: "Zero Tuition",
            ranking: "Oldest & Most Prestigious Polish University",
            applicationRequirements: ["Master's or Strong Bachelor's in CS/Math", "CV & Transcripts"],
            deadline: "2026-11-15"
        },
        {
            professorName: "Prof. Przemysław Biecek",
            institution: "Warsaw University of Technology - MI2DataLab",
            researchArea: "Explainable AI (XAI), Model Interpretability & Responsible Data Science",
            link: "https://mi2.ai/",
            reasonForMatch: "Candidate's data visualization and empirical evaluation background fit MI2DataLab's open-source tools (DALEX).",
            universityTier: "Mid-Tier",
            country: "Poland",
            baseMatchScore: 90,
            fundingType: "Fully Funded (Warsaw Tech Excellence Initiative ~5,000 PLN/mo)",
            keyKeywords: ["Explainable AI", "DALEX", "Warsaw Tech"],
            tuitionFees: "Zero Tuition",
            ranking: "Leading Technical University in Poland",
            applicationRequirements: ["Degree in Computer Science or Data Science", "English B2/C1"],
            deadline: "2026-11-20"
        },
        {
            professorName: "Prof. Halina Kwaśnicka",
            institution: "Wrocław University of Science and Technology - Department of AI",
            researchArea: "Evolutionary Algorithms, Medical Decision Support & Pattern Recognition",
            link: "https://kwasnicka.pl/",
            reasonForMatch: "Very high acceptance rate; hospitable environment with state-funded doctoral positions.",
            universityTier: "Low-Rank",
            country: "Poland",
            baseMatchScore: 85,
            fundingType: "Fully Funded (Wrocław Tech Doctoral School Stipend ~4,500 PLN/mo)",
            keyKeywords: ["Evolutionary Algorithms", "Medical AI", "Wrocław Tech"],
            tuitionFees: "Zero Tuition",
            ranking: "Major Silesian Technical University",
            applicationRequirements: ["STEM Degree", "Transcripts", "Statement of Purpose"],
            deadline: "2026-11-30"
        }
    ],

    'belgium': [
        {
            professorName: "Prof. Luc De Raedt",
            institution: "KU Leuven - Department of Computer Science (DTAI)",
            researchArea: "Probabilistic Logic Learning, Neurosymbolic AI & Constraint Programming",
            link: "https://dtai.cs.kuleuven.be/",
            reasonForMatch: "Matches candidate's logical modeling foundation with world-leading neurosymbolic research.",
            universityTier: "Top-Tier",
            country: "Belgium",
            baseMatchScore: 96,
            fundingType: "Fully Funded (FWO PhD Fellowship ~€2,400/mo net + Full Waiver)",
            keyKeywords: ["Neurosymbolic AI", "Probabilistic Logic", "KU Leuven"],
            tuitionFees: "Zero Tuition",
            ranking: "QS World #61, Top Flemish Research Institution",
            applicationRequirements: ["Master's in CS or Mathematics", "Strong Academic Record", "CV"],
            deadline: "2026-10-31"
        },
        {
            professorName: "Prof. Tinne Tuytelaars",
            institution: "KU Leuven - Center for Processing Speech and Images (PSI)",
            researchArea: "Continual Learning, Self-Supervised Computer Vision & Few-Shot Generalization",
            link: "https://homes.esat.kuleuven.be/~tuytelaa/",
            reasonForMatch: "Direct match with candidate's visual computing and deep learning project background.",
            universityTier: "Top-Tier",
            country: "Belgium",
            baseMatchScore: 95,
            fundingType: "Fully Funded (KU Leuven Doctoral Contract ~€2,350/mo net)",
            keyKeywords: ["Continual Learning", "Self-Supervised", "Computer Vision"],
            tuitionFees: "Zero Tuition",
            ranking: "World-Renowned European Vision Group",
            applicationRequirements: ["Master's in CS, EE or Math", "Transcripts", "Motivation Letter"],
            deadline: "2026-11-15"
        },
        {
            professorName: "Prof. Joni Dambre",
            institution: "Ghent University - AI and Robotics Lab (AIRO)",
            researchArea: "Neuromorphic Computing, Reservoir Computing & Robot Learning",
            link: "https://airo.ugent.be/",
            reasonForMatch: "Candidate's programming versatility matches interdisciplinary hardware-software neural systems.",
            universityTier: "Mid-Tier",
            country: "Belgium",
            baseMatchScore: 91,
            fundingType: "Fully Funded (BOF Special Research Fund ~€2,350/mo)",
            keyKeywords: ["Neuromorphic", "Reservoir Computing", "Ghent University"],
            tuitionFees: "Zero Tuition",
            ranking: "Top-100 Global University",
            applicationRequirements: ["Master's in Engineering or Computing", "Transcripts", "CV"],
            deadline: "2026-11-30"
        },
        {
            professorName: "Prof. Ann Nowé",
            institution: "Vrije Universiteit Brussel (VUB) - AI Lab Brussels",
            researchArea: "Multi-Agent Reinforcement Learning, Evolutionary Game Theory & Decentralized AI",
            link: "https://ai.vub.ac.be/",
            reasonForMatch: "High acceptance potential with direct international research funding in the heart of Europe.",
            universityTier: "Low-Rank",
            country: "Belgium",
            baseMatchScore: 86,
            fundingType: "Fully Funded (VUB Doctoral Fellowship ~€2,300/mo net)",
            keyKeywords: ["Multi-Agent RL", "Game Theory", "VUB AI Lab"],
            tuitionFees: "Zero Tuition",
            ranking: "Birthplace of European AI Research (Founded in 1983)",
            applicationRequirements: ["STEM Degree", "Motivation Letter", "Transcripts"],
            deadline: "2026-12-10"
        }
    ]
};

/**
 * Intelligent Academic Matcher
 * Maps candidates' specific backgrounds (AI, CV, Robotics, Data, Bio) to curated positions
 * and adapts match score and reason dynamically.
 */
export function getCuratedPositionsForCountry(
    countryIdentifier: string,
    cvText: string = '',
    prompt: string = ''
): Omit<Scholarship, 'id' | 'feedback'>[] {
    const norm = (countryIdentifier || '').trim().toLowerCase();
    const promptNorm = (prompt || '').trim().toLowerCase();

    let targetKey = 'global';

    if (norm === 'south-korea' || norm === 'south korea' || norm === 'korea' || promptNorm.includes('south korea') || promptNorm.includes('korea')) {
        targetKey = 'south-korea';
    } else if (norm === 'usa' || norm === 'united states' || norm === 'us' || promptNorm.includes('united states') || promptNorm.includes('nsf/nih')) {
        targetKey = 'usa';
    } else if (norm === 'germany' || promptNorm.includes('germany') || promptNorm.includes('tu9') || promptNorm.includes('max planck')) {
        targetKey = 'germany';
    } else if (norm === 'canada' || promptNorm.includes('canada') || promptNorm.includes('u15') || promptNorm.includes('nserc')) {
        targetKey = 'canada';
    } else if (norm === 'uk' || norm === 'united kingdom' || promptNorm.includes('united kingdom') || promptNorm.includes('russell group')) {
        targetKey = 'uk';
    } else if (norm === 'japan' || promptNorm.includes('japan') || promptNorm.includes('mext')) {
        targetKey = 'japan';
    } else if (norm === 'france' || promptNorm.includes('france') || promptNorm.includes('cnrs') || promptNorm.includes('inria')) {
        targetKey = 'france';
    } else if (norm === 'erasmus-mundus' || norm === 'erasmus' || promptNorm.includes('erasmus') || promptNorm.includes('emjmd')) {
        targetKey = 'erasmus-mundus';
    } else if (norm === 'australia' || promptNorm.includes('australia') || promptNorm.includes('group of eight')) {
        targetKey = 'australia';
    } else if (norm === 'singapore' || promptNorm.includes('singapore') || promptNorm.includes('nus') || promptNorm.includes('ntu')) {
        targetKey = 'singapore';
    } else if (norm === 'poland' || promptNorm.includes('poland') || promptNorm.includes('nawa')) {
        targetKey = 'poland';
    } else if (norm === 'belgium' || promptNorm.includes('belgium') || promptNorm.includes('ku leuven')) {
        targetKey = 'belgium';
    }

    let positionsTemplate: CuratedPositionTemplate[] = [];

    if (targetKey !== 'global' && ACADEMIC_POSITIONS_BY_COUNTRY[targetKey]) {
        positionsTemplate = ACADEMIC_POSITIONS_BY_COUNTRY[targetKey];
    } else {
        // Global: Balanced mix across Top-Tier, Mid-Tier, and Low-Rank from diverse regions
        const koreaTop = ACADEMIC_POSITIONS_BY_COUNTRY['south-korea']?.slice(0, 3) || [];
        const koreaMid = ACADEMIC_POSITIONS_BY_COUNTRY['south-korea']?.slice(5, 7) || [];
        const koreaReg = ACADEMIC_POSITIONS_BY_COUNTRY['south-korea']?.slice(11, 13) || [];
        const usaTop = ACADEMIC_POSITIONS_BY_COUNTRY['usa']?.slice(0, 3) || [];
        const usaMid = ACADEMIC_POSITIONS_BY_COUNTRY['usa']?.slice(5, 7) || [];
        const usaReg = ACADEMIC_POSITIONS_BY_COUNTRY['usa']?.slice(10, 12) || [];
        const germanyTop = ACADEMIC_POSITIONS_BY_COUNTRY['germany']?.slice(0, 2) || [];
        const germanyMid = ACADEMIC_POSITIONS_BY_COUNTRY['germany']?.slice(3, 4) || [];
        const canadaTop = ACADEMIC_POSITIONS_BY_COUNTRY['canada']?.slice(0, 2) || [];
        const erasmus = ACADEMIC_POSITIONS_BY_COUNTRY['erasmus-mundus']?.slice(0, 2) || [];

        positionsTemplate = [
            ...koreaTop,
            ...usaTop,
            ...germanyTop,
            ...canadaTop,
            ...erasmus,
            ...koreaMid,
            ...usaMid,
            ...germanyMid,
            ...koreaReg,
            ...usaReg
        ];
    }

    // Detect candidate domain to personalize match score and reason
    const cvLower = (cvText || '').toLowerCase();
    const hasPython = cvLower.includes('python');
    const hasPyTorch = cvLower.includes('pytorch') || cvLower.includes('tensorflow');
    const hasVision = cvLower.includes('vision') || cvLower.includes('image') || cvLower.includes('cnn');
    const hasNlp = cvLower.includes('nlp') || cvLower.includes('language') || cvLower.includes('bert') || cvLower.includes('transformer');
    const hasRobotics = cvLower.includes('robot') || cvLower.includes('ros') || cvLower.includes('control');

    return positionsTemplate.map((item, idx) => {
        let scoreBonus = 0;
        let tailoredReason = item.reasonForMatch;

        if (hasPyTorch && item.keyKeywords.some(k => k.toLowerCase().includes('deep learning') || k.toLowerCase().includes('vision') || k.toLowerCase().includes('nlp'))) {
            scoreBonus += 2;
        }
        if (hasVision && (item.researchArea.toLowerCase().includes('vision') || item.researchArea.toLowerCase().includes('image') || item.researchArea.toLowerCase().includes('3d'))) {
            scoreBonus += 3;
            tailoredReason += ` Candidate's hands-on computer vision experience directly maps to current laboratory experimental benchmarks.`;
        } else if (hasNlp && (item.researchArea.toLowerCase().includes('nlp') || item.researchArea.toLowerCase().includes('language') || item.researchArea.toLowerCase().includes('text'))) {
            scoreBonus += 3;
            tailoredReason += ` Candidate's background in language models and NLP pipelines provides an immediate foundation for lab deliverables.`;
        } else if (hasRobotics && (item.researchArea.toLowerCase().includes('robot') || item.researchArea.toLowerCase().includes('spatial') || item.researchArea.toLowerCase().includes('autonomous'))) {
            scoreBonus += 3;
            tailoredReason += ` Direct synergy with candidate's interest in autonomous perception, robotics simulation, and embodied agents.`;
        } else if (hasPython) {
            scoreBonus += 1;
        }

        const calculatedScore = Math.min(99, Math.max(76, item.baseMatchScore + scoreBonus - (idx % 2)));

        return {
            professorName: item.professorName,
            institution: item.institution,
            researchArea: item.researchArea,
            link: item.link,
            reasonForMatch: tailoredReason,
            universityTier: item.universityTier,
            country: item.country,
            matchScore: calculatedScore,
            fundingType: item.fundingType,
            keyKeywords: item.keyKeywords,
            tuitionFees: item.tuitionFees,
            ranking: item.ranking,
            applicationRequirements: item.applicationRequirements,
            deadline: item.deadline || new Date(Date.now() + (idx * 4 + 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
    });
}
