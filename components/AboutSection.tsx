import React from 'react';
import { 
    GraduationCap, 
    Sparkles, 
    Compass, 
    FileText, 
    ShieldCheck, 
    BookOpen, 
    Award, 
    Globe, 
    Users, 
    Lock, 
    CheckCircle2, 
    ArrowUp, 
    ExternalLink,
    Clock,
    Zap,
    Heart
} from 'lucide-react';

interface AboutSectionProps {
    onNavigateToTab?: (tab: any) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateToTab }) => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const features = [
        {
            icon: Compass,
            title: "Global Research Lab Matching",
            description: "Direct discovery of funded Master's, PhD, and Research Assistantship (RA/TA) openings across 12+ regions including USA, Germany, UK, Canada, South Korea, Japan, France, Australia, and EU Erasmus Mundus programs.",
            badge: "Worldwide Coverage",
            color: "from-blue-600 to-indigo-600"
        },
        {
            icon: Award,
            title: "Intelligent CV Readiness & Radar",
            description: "Analyzes candidate transcripts and research backgrounds against top-tier graduate admissions standards, generating radar proficiency charts across 6 core research competencies.",
            badge: "Deep Analysis",
            color: "from-emerald-600 to-teal-600"
        },
        {
            icon: GraduationCap,
            title: "Curriculum-Integrated Master's Explorer",
            description: "Bridges candidate profiles directly with university course catalogs (ECTS credits, application portals like Uni-Assist/RWTHonline, living costs, and blocked accounts).",
            badge: "Curriculum Match",
            color: "from-purple-600 to-indigo-600"
        },
        {
            icon: FileText,
            title: "Academic Document Studio",
            description: "Drafts personalized cold outreach emails, 2-week follow-ups, Statements of Purpose (SOP), letters of motivation, and 1-page proposals calibrated to specific IELTS writing bands.",
            badge: "IELTS Calibrated",
            color: "from-pink-600 to-rose-600"
        },
        {
            icon: ShieldCheck,
            title: "Stealth AI Watermark Cleaner",
            description: "Identifies and eliminates robotic AI phrases, clichés ('delve', 'testament', 'crucial'), and structural markers to restore authentic, human scholarly tone.",
            badge: "Academic Integrity",
            color: "from-cyan-600 to-blue-600"
        },
        {
            icon: BookOpen,
            title: "Google Scholar & Literature Integration",
            description: "Connects with OpenAlex and Google Scholar to retrieve peer-reviewed papers, calculate h-index and citation metrics, and generate tailored publication citation hooks for emails.",
            badge: "Live Scholarly Graph",
            color: "from-amber-600 to-orange-600"
        }
    ];

    const pipelineSteps = [
        {
            step: "01",
            title: "Upload & Tailor Your CV",
            desc: "Upload a PDF/DOCX or select starter profiles. Manage multiple CV versions for different research niches."
        },
        {
            step: "02",
            title: "Evaluate & Discover Openings",
            desc: "Review your readiness score, gap recommendations, and curated lab openings ranked by compatibility score."
        },
        {
            step: "03",
            title: "Draft Materials & Track Deadlines",
            desc: "Generate tailored outreach emails and proposals, cite recent papers, set deadlines, and manage your pipeline."
        }
    ];

    return (
        <section 
            id="about-section" 
            className="mt-16 pt-12 border-t border-slate-200/90 dark:border-slate-800 space-y-12"
            aria-label="About ScholarMatch AI"
        >
            {/* Header Badge & Title */}
            <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>About ScholarMatch AI</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Empowering Global Academic Trajectories & Research Breakthroughs
                </h2>
                
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    ScholarMatch AI was created to democratize access to international graduate education, funded research laboratories, and prestigious fellowships. We combine computational curriculum matching, natural language document synthesis, and scholarly graph intelligence into a unified academic application assistant.
                </p>
            </div>

            {/* Core Capability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feat, i) => {
                    const Icon = feat.icon;
                    return (
                        <div 
                            key={i} 
                            className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md shadow-indigo-500/15`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                                        {feat.badge}
                                    </span>
                                </div>
                                
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {feat.title}
                                </h3>
                                
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {feat.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* How It Works Workflow Bar */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-6">
                    <div className="max-w-xl space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-400" />
                            Streamlined Workflow
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                            From Academic CV to Confident Submission in 3 Steps
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        {pipelineSteps.map((step, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                                <div className="text-2xl font-black text-indigo-300 font-mono">
                                    {step.step}
                                </div>
                                <h4 className="text-sm font-bold text-white">
                                    {step.title}
                                </h4>
                                <p className="text-xs text-indigo-100/80 leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Privacy & Academic Integrity Statement */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Student Privacy First
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Your CV, grades, and personal drafts are never sold or shared with third-party advertisers.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Global Portals & Funding
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Direct links to official DAAD, Uni-Assist, Campus France, Singa, and university portals.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Academic Rigor & Ethics
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Humanized tone preserving candidate originality and strict compliance with university honor codes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Credits & Back to Top */}
            <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                            ScholarMatch AI
                        </span>
                        <span className="mx-2">•</span>
                        <span>Academic Application Suite v2.4</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-[11px]">
                        Built for researchers worldwide <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    </span>

                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold shadow-2xs transition-colors cursor-pointer"
                        title="Scroll to top of page"
                    >
                        <span>Back to Top</span>
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </section>
    );
};
