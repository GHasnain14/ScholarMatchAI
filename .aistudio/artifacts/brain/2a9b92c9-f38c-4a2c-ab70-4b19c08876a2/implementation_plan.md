# Universal STEM Agentic Faculty & University Discovery Engine with Strict QA/QC

Expand the platform from computer science-centric recommendations into an all-encompassing, cross-disciplinary academic discovery powerhouse covering all branches of Science, Technology, and Engineering, powered by an autonomous agentic discovery pipeline with live OpenAlex scholarly graph verification and a 4-gate QA/QC audit system.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural decisions below have been calibrated based on your confirmed preferences in Phase 1:

- **STEM Discipline Breadth (Confirmed)**: Full-spectrum coverage across all Science, Technology, and Engineering fields (Life Sciences & Bioengineering, Chemical Sciences & Materials, Physical & Quantum Sciences, Mechanical & Aerospace, Electrical & Robotics, Civil & Environmental, and Computational/Mathematical Sciences).
- **Agentic Discovery Engine (Confirmed)**: Multi-agent discovery orchestrator querying the OpenAlex 250M+ scholarly entity graph and global university directories to discover faculty across all institutional tiers worldwide.
- **QA/QC Verification Standards (Confirmed)**: Every faculty card and university program must pass a 4-gate QA/QC protocol (Active Web/Lab Gate, OpenAlex Bibliometric Gate, CV-Synergy Grounding Gate, and Tier/Funding Viability Gate) prior to presentation.
- **CV-Readiness Grounding (Confirmed)**: Zero hit-and-trial; readiness ratings and synergy scores are calibrated directly from concrete textual evidence in the user's uploaded CV (coursework, instruments, techniques, software, papers, and GPA).

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the scholarship and graduate admissions explorer into an intelligent, autonomous agent that analyzes any candidate's CV across any STEM domain, executes structured multi-agent searches across worldwide universities and the OpenAlex open scholarly graph, enforces automated QA/QC integrity filters, and presents verified faculty labs and graduate programs with transparent evidence badges.
- **Target Audience / Persona**: Prospective Master’s and PhD applicants, postbaccalaureate researchers, and graduate scholars across all global scientific and engineering domains seeking fully funded positions, research assistantships (RA/TA), and tailored faculty supervisors.
- **Key Value**: Eliminates speculative outreach and broken links. Candidates receive verified, diverse faculty opportunities matched specifically to their unique research trajectory, backed by real citation data and verifiable lab portals.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **CV Intake & STEM Domain Classification**: The user uploads their CV or pastes raw profile text. The system automatically detects their primary STEM discipline, subfield specializations, lab competencies, and analytical toolsets.
2. **Discipline & Diversity Selector**: The candidate can review the auto-detected discipline or seamlessly filter across 7 core STEM clusters (Biomedical & Life Sciences, Chemical & Materials Engineering, Physical & Quantum Sciences, Mechanical & Aerospace Engineering, Electrical & Computer Engineering, Civil & Earth Systems, and Mathematics & Data Sciences) across Top-Tier, Mid-Tier, and High-Acceptance Regional institutions.
3. **Live Agentic Discovery Console**: While searching, the user sees an interactive multi-agent status stepper:
   - *Agent 1: CV Profiler* – Extracts core experimental competencies and research objectives.
   - *Agent 2: Global Directory & OpenAlex Crawler* – Queries open bibliographic databases and institutional directories for active principal investigators (PIs).
   - *Agent 3: QA/QC Verification Inspector* – Audits lab URLs, checks 2021–2026 publication activity, and validates contact points.
   - *Agent 4: Synergy & Readiness Calibrator* – Matches candidate specific coursework/skills against faculty ongoing grants and papers.
4. **Verified Faculty Matrix & QA/QC Inspector**: Each presented professor displays an interactive "QA/QC Verified" badge. Clicking the badge opens a transparent inspection drawer showing verified citations from OpenAlex, recent papers with DOIs, lab landing URLs, and exact CV evidence alignment.

#### Visual Identity & Theme (Science & Engineering Precision)
- **Palette Budget (60-30-10 Rule)**:
  - `60% Lab Slate Base`: Clinical, clean background (`bg-slate-900` dark / `bg-slate-50` light) providing high-contrast readability.
  - `30% Structured Precision Panels`: Deep cobalt/slate framing (`bg-slate-800/80` dark / `bg-white` light) with 1px hairline borders (`border-slate-700/60` dark / `border-slate-200` light).
  - `10% Calibrated Telemetry Accents`: Precision emerald (`#10B981`) for QA/QC passed gates, electric cobalt (`#3B82F6`) for agentic activity, and telemetry amber (`#F59E0B`) for funding assistantships.
- **Typography & Precision Notation**:
  - Strict zero-pill metadata discipline: Informational tags and status items rendered as crisp text with quiet separators (`·`, `/`), reserving pill buttons exclusively for interactive filter switches.
  - Monospace tabular figures (`font-mono tabular-nums`) for match scores, acceptance benchmarks, citation counts, and deadlines.
- **Interactive Feedback**:
  - Dynamic radar chart visualizer recalibrating across STEM-specific competencies (e.g., wet lab protocols, finite element analysis, spectroscopy, or algorithmic design).
  - Real-time agent status pulse indicators with animated scanlines during agentic exploration.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid Agentic Engine (Live OpenAlex Graph + Diverse Seed Registries + Gemini Synthesis)**
  - *Chosen Approach*: Execute multi-stage queries against OpenAlex REST API (`/works` and `/authors`) for real-time bibliographic grounding, supplemented by an expanded multi-disciplinary academic database spanning all 7 STEM fields and 25+ global countries, synthesized by Gemini 3.8 Flash.
  - *Why*: Guarantees authentic research papers, real DOIs, and active faculty names while providing instant fallback resilience even in offline or rate-limited environments.
  - *Alternatives Considered*: Pure LLM generation was rejected because it causes institutional hallucinations and broken links. Pure database queries were rejected because they lack flexibility for niche candidate CVs.

- **Decision 2: 4-Gate Automated QA/QC Verification Pipeline**
  - *Chosen Approach*: Build a dedicated verification pipeline (`qaqcVerificationService`) that runs 4 rigorous checks:
    1. *Active Lab & Institutional Gate*: Checks URL format, official domain endings (`.edu`, `.ac.uk`, `.mpg.de`, `.tum.de`, `.ac.kr`), and live accessibility.
    2. *OpenAlex Citation Gate*: Validates publication record, recent works (within 2021-2026), and citation count metrics.
    3. *CV-Synergy Grounding Gate*: Validates that `reasonForMatch` cites actual items found in the candidate's CV text rather than generic praise.
    4. *Tier & Funding Diversity Gate*: Enforces an equitable distribution between Top-Tier (Reach), Mid-Tier (Target), and Emerging/Regional (Safety) institutions with verified funding mechanisms.
  - *Why*: Addresses the user's explicit requirement that recommendations must not be "hit and trial" and must undergo strict QA/QC before presentation.

- **Decision 3: Universal STEM Discipline Taxonomy**
  - *Chosen Approach*: Expand candidate profile models, radar charts, and position databases from CS/AI to cover:
    - *Biological & Biomedical Sciences* (Genomics, Molecular Biology, Immunology, Pharmacology)
    - *Chemical Sciences & Materials* (Polymer Chemistry, Nanomaterials, Catalysis, Battery Chem)
    - *Physics & Quantum Sciences* (Condensed Matter, Quantum Optics, Astrophysics, High-Energy)
    - *Mechanical & Aerospace Engineering* (Fluid Dynamics, Thermodynamics, Robotics, Propulsion)
    - *Electrical & Computer Engineering* (VLSI, Power Systems, Signal Processing, Telecommunications)
    - *Civil, Environmental & Earth Systems* (Structural Engineering, Hydrology, Climate Systems)
    - *Computing, AI & Mathematics* (Algorithms, Machine Learning, Applied Math, Statistics)
  - *Why*: Ensures the platform is truly universal for all science, technology, and engineering students.

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT APPLICATION (REACT)                                   │
│                                                                                              │
│   ┌───────────────────────────┐      ┌───────────────────────────┐      ┌─────────────────┐  │
│   │   CV Intake & Parser      │ ───> │  STEM Taxonomy Classifier │ ───> │ CV Readiness    │  │
│   │   (Text/PDF + Metadata)   │      │  (7 Broad STEM Clusters)  │      │ Radar Visualizer│  │
│   └───────────────────────────┘      └───────────────────────────┘      └─────────────────┘  │
│                 │                                  │                                         │
│                 ▼                                  ▼                                         │
│   ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│   │                          Live Agentic Discovery Orchestrator                          │  │
│   │  [Agent 1: CV Profiler] -> [Agent 2: OpenAlex & Directory Crawler] -> [Agent 3: QA/QC]│  │
│   └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                 │                                                                            │
│                 ▼                                                                            │
│   ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│   │                          Verified Faculty & University Matrix                         │  │
│   │   - 4-Gate QA/QC Badges  - Tier & Country Diversity  - Transparent Synergy Evidence   │  │
│   └───────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ▲
                                              │ HTTP / Proxy Endpoints
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SERVER & INTEGRATION LAYER                                   │
│                                                                                              │
│   ┌───────────────────────────┐      ┌───────────────────────────┐      ┌─────────────────┐  │
│   │  /api/agentic-find-stem   │      │   OpenAlex Works &        │      │ 4-Gate QA/QC    │  │
│   │  Multi-agent orchestrator │ <──> │   Authors REST API        │ <──> │ Validation      │  │
│   │  (Gemini + Domain DB)     │      │   (250M+ Academic Graph)  │      │ Engine          │  │
│   └───────────────────────────┘      └───────────────────────────┘      └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities & Extensions (`types.ts`)
```ts
export type StemDiscipline = 
    | 'all'
    | 'biological_biomedical'
    | 'chemical_materials'
    | 'physics_quantum'
    | 'mechanical_aerospace'
    | 'electrical_electronics'
    | 'civil_environmental'
    | 'computing_data_ai'
    | 'mathematics_quantitative';

export interface QaqcVerificationResult {
    overallStatus: 'passed' | 'warning' | 'failed';
    overallScore: number; // 0-100
    gates: {
        activeLabGate: { passed: boolean; details: string; verifiedUrl?: string };
        openAlexCitationGate: { passed: boolean; paperCount: number; recentPaperTitle?: string; doi?: string };
        cvGroundingGate: { passed: boolean; matchedCvTerms: string[]; synergyRationale: string };
        tierFundingGate: { passed: boolean; tier: string; fundingVerified: boolean; details: string };
    };
    auditTimestamp: string;
}

export interface VerifiedScholarship extends Scholarship {
    stemDiscipline: StemDiscipline;
    qaqc: QaqcVerificationResult;
    openAlexAuthorId?: string;
    recentPublications?: { title: string; year: number; doi?: string; citations: number }[];
}
```

#### Interactive Handlers & State Flow
- **CV Upload Event**: Triggers multi-agent extraction of degree, scientific domain, specific laboratory techniques (e.g., HPLC, PCR, CAD, FEA, PyTorch, MATLAB, SEM), and grade metrics.
- **STEM Filter Event**: Updates active discipline view with instantaneous client-side re-indexing, displaying matching faculty across Top-Tier, Mid-Tier, and Regional institutions.
- **Live QA/QC Drawer Toggle**: Allows candidate to inspect full verification credentials for any professor, view recent publications directly via DOI/OpenAlex links, and inspect why their CV matched.
- **Agentic Re-Scan Action**: Allows user to specify custom subfield focus (e.g., "Nanofluidics for Drug Delivery" or "Renewable Microgrids") and trigger a live agent query with live progress indication.
