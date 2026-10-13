# Research Paper Tracker for Academic Applications

A dedicated research literature management and reading tracker designed for graduate, PhD, and postdoc applicants to catalog, annotate, and prioritize seminal scientific papers linked to target universities and professors.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been confirmed based on user feedback:
> - **Paper Ingestion Flow**: Hybrid ingestion supporting both **1-click import directly from Scholar search** and a comprehensive **manual entry modal** (with support for titles, authors, DOIs, PDF links, and venues).
> - **Organization System**: Multi-dimensional categorization including **custom tags**, **priority tiers** (High, Medium, Low), and direct **linkage to target university/lab destinations**.
> - **Core Reading State**: Streamlined binary reading status (**Pending** vs. **Read**) with visual progress meters, reading notes, and cold email / SOP hook integration.

---

## 1. Overview & Core Concept

### What It Does
The **Research Paper Tracker** gives STEM applicants a centralized academic bibliography workspace. When preparing competitive graduate school or faculty applications, candidates must demonstrate literature awareness in cold emails, statements of purpose (SOP), and interviews. 

This tool allows users to:
1. Search Google Scholar or OpenAlex and save papers to their tracker with a single click.
2. Manually add preprints, published papers, or lab manuscripts with custom links, DOIs, and PDF URLs.
3. Toggle reading status (`Pending` ↔ `Read`) with real-time reading progress indicators.
4. Capture synthesized author notes, methodology takeaways, and literature hooks formatted for inclusion in SOPs or professor outreach emails.
5. Filter and organize by target university (e.g., Stanford, MIT, Oxford, Cambridge, ETH Zurich), priority level, and research tags.
6. Export the bibliography directly into BibTeX, APA citation lists, or CSV format.

### Target Audience & Persona
- Prospective PhD, Master's, and Postdoctoral researchers applying across global STEM departments.
- Applicants actively reviewing professor publications to craft personalized outreach and research statements.

### Key Value
Eliminates fragmented notes across browser tabs and spreadsheets, transforming literature review into structured, application-ready ammunition.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 RESEARCH PAPER TRACKER WORKFLOW                                         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [1. Ingestion]                       [2. Triage & Tagging]                [3. Application Leverage]
  ┌───────────────────────┐            ┌──────────────────────┐             ┌────────────────────────┐
  │ Google Scholar Search │──(1-Click)─▶                      │             │ SOP & Cold Email Hooks │
  └───────────────────────┘            │ Read Status:         │             │ Copy APA / BibTeX      │
             OR                        │ [Pending] / [Read]   │────────────▶│ Linked University Plan │
  ┌───────────────────────┐            │ Priority: High/Med   │             │ Interview Prep Cheat   │
  │ Manual Paper Dialog   │───────────▶│ Target University    │             └────────────────────────┘
  │ (Title, DOI, Authors) │            │ Tags & Notes         │
  └───────────────────────┘            └──────────────────────┘
```

1. **Workspace Entry**: Users select the "Research Paper Tracker" tab from the primary navigation bar.
2. **Dashboard Overview**:
   - Header with reading metrics: total saved papers, pending count, read count, and reading completion percentage.
   - Action controls: "Search & Import from Scholar", "Add Paper Manually", "Export BibTeX", and "Export APA".
3. **Filtering & Search Bar**:
   - Status segmented switch: `All Papers`, `Pending`, `Read`.
   - Priority filter: `All Priorities`, `High`, `Medium`, `Low`.
   - University filter: Dropdown populated with universities from saved application targets.
   - Search input: Real-time query matching across paper title, authors, venue, tags, and notes.
4. **Paper Card Architecture**:
   - Top row: Paper title with external link, publication venue, year, and priority badge.
   - Middle row: Author list, target university association, and topic tags.
   - Read Toggle: An accessible, prominent toggle button allowing instant switching between "Pending" and "Read" with timestamp tracking.
   - Author / Literature Notes Section: Expandable or inline rich note area for candidate observations, key methodology notes, and SOP quote hooks.
   - Card Toolbar: "Open PDF", "Google Scholar", "Copy APA", "Edit Notes/Tags", and "Delete".
5. **1-Click Import Integration**:
   - When searching papers inside the existing Google Scholar Modal, each paper card features a prominent `Save to Tracker` button.
   - If already saved, the button reflects `Saved in Tracker` with an instant link to view in the tracker.

### Visual Identity & Theme
- **Aesthetic Direction**: Clinical scientific precision adhering to `references/8_science_space_biotech.md` and the universal frontend design guidelines. Monochromatic crisp surfaces with hairline borders (`border border-slate-200 dark:border-slate-800`), refined typography, and zero-pill discipline for informational metadata.
- **Palette & Atmosphere**:
  - Dominant Neutral (60%): Clean lab slate background (`#F8FAFC` light / `#0B0E17` dark).
  - Structural Panels (30%): White / dark slate card surfaces (`bg-white dark:bg-slate-900`) with subtle hairline dividers.
  - Accent Budget (10%): Calibrated deep indigo and cobalt (`#2563EB` / `#4F46E5`) for primary actions, emerald (`#059669`) for "Read" state, and amber (`#D97706`) for "Pending" / high-priority cues.
- **Typography**: Neo-grotesque sans (`Plus Jakarta Sans`) for titles and body, paired with `font-mono tabular-nums` for publication years, citation counts, and reading progress percentages.
- **Zero-Pill Compliance**: Static metadata (authors, venue, year, DOI) is rendered as clean unboxed inline text with typographic middle-dot separators (`·`), avoiding colored pill candy traps. Interactive controls (status filter, priority selector) use proper accessible button styling.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Import Strategy (Scholar Modal vs. Manual Entry)
- **Chosen Approach**: Provide both an embedded Scholar search drawer/modal import with 1-click addition AND a clean manual entry modal.
- **Why**: Many applicants find papers directly through Google Scholar queries on their advisor's profile, but also discover papers through arXiv preprints, institutional repositories, or direct email recommendations.
- **Alternatives Considered**: 
  - *Scholar search only*: Would lock out arXiv, Nature, or local PDF links not easily queried.
  - *Manual only*: High friction; applicants would have to retype titles, authors, and citation metadata manually.

### Decision 2: Dual Persistence Layer (Local Storage + Optional Firestore Sync)
- **Chosen Approach**: Primary zero-latency `localStorage` store synchronized automatically with Firestore subcollection `users/{userId}/research_papers/{paperId}` when the applicant is signed in with Google.
- **Why**: Ensures instant responsiveness and full offline capability without requiring login upfront, while protecting data across devices for authenticated users.
- **Alternatives Considered**: 
  - *Firestore-only*: Forces compulsory login before testing or saving papers.
  - *LocalStorage-only*: Risk of data loss when changing devices or clearing browser cache.

### Decision 3: First-Class Integration with Existing Application Pipeline
- **Chosen Approach**: Allow linking saved papers directly to target universities or application entries in the `ApplicationTracker`.
- **Why**: Reading papers is not an abstract hobby; it serves the concrete goal of writing compelling application statements and discussing specifics in interviews with specific faculty.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION SYSTEM ARCHITECTURE                              │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [Navigation Bar] ──▶ [Tab: Research Paper Tracker (Tab.ResearchPaperTracker)]
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  GoogleScholarModal  │        │ ManualPaperEntryModal│
    │  (1-Click Save Btn)  │        │ (Full metadata form) │
    └──────────┬───────────┘        └──────────┬───────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
    ┌──────────────────────────────────────────────────────┐
    │            ResearchPaperTracker Component            │
    │  - Metric Progress Bar (Read vs Pending)             │
    │  - Status & Priority Segmented Controls              │
    │  - Tag & Target University Filter Bar                │
    │  - Paper List & Detail Cards                         │
    │  - Notes & Literature Hook Editor                    │
    │  - Export Engine (BibTeX / APA / JSON)               │
    └──────────────────────────┬───────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │     LocalStorage     │        │  Firestore Database  │
    │ (academic_papers_v1) │        │ (users/{uid}/papers) │
    └──────────────────────┘        └──────────────────────┘
```

### Data Model (`types.ts`)

```typescript
export type ReadingStatus = 'pending' | 'read';
export type PaperPriority = 'high' | 'medium' | 'low';

export interface ResearchPaperItem {
    id: string;
    title: string;
    authors: string[];
    journalOrVenue: string;
    year: number | string;
    citationCount?: number;
    abstract?: string;
    scholarUrl?: string;
    pdfUrl?: string;
    doi?: string;
    
    // Organization & Status
    status: ReadingStatus;
    priority: PaperPriority;
    targetUniversity?: string;
    targetProfessor?: string;
    tags: string[];
    
    // Candidate Notes & Hooks
    notes?: string;
    sopHookSentence?: string;
    apaCitation?: string;
    bibtex?: string;
    
    // Timestamps
    dateAdded: string;
    dateRead?: string;
    updatedAt: string;
}
```

### Interactive Component & State Mapping

1. **Tab Integration**:
   - Add `Tab.ResearchPaperTracker = "research-paper-tracker"` to `types.ts`.
   - Update `Header.tsx` nav items with a Book/FileText icon, badge count of pending papers, and clean active styling.
   - Render `ResearchPaperTracker` in `App.tsx` when `activeTab === Tab.ResearchPaperTracker`.

2. **1-Click Import in `GoogleScholarModal.tsx`**:
   - Pass `savedPaperIds: string[]` and `onToggleSavePaper: (paper: ScholarPaper) => void`.
   - Render a primary `Save to Tracker` button on each paper result card with visual confirmation when saved.

3. **`ResearchPaperTracker.tsx` Component State**:
   - `papers: ResearchPaperItem[]`: Full collection stored in state.
   - `searchQuery: string`: Debounced filter query.
   - `selectedStatus: 'all' | 'pending' | 'read'`: Active reading filter.
   - `selectedPriority: 'all' | 'high' | 'medium' | 'low'`: Priority filter.
   - `selectedUniversity: string`: University filter.
   - `selectedTag: string`: Active tag filter.
   - `isAddModalOpen: boolean`: Controls manual entry modal visibility.
   - `editingPaper: ResearchPaperItem | null`: Inline/modal notes editor.

4. **Persistence & Sync**:
   - `loadResearchPapers()`: Reads from `localStorage` on initial load.
   - When `currentUser` is logged in, syncs bidirectional with Firestore collection `users/${userId}/research_papers`.
   - Provide fallback and merge to ensure zero data loss.
