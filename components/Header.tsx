import React, { useState } from 'react';
import { 
    Sparkles, 
    GraduationCap, 
    Compass, 
    FileEdit, 
    Calendar, 
    BookmarkCheck, 
    BarChart2, 
    ShieldCheck,
    LogOut,
    User as UserIcon,
    Cloud,
    CheckCircle2,
    ChevronDown,
    Layers,
    Info,
    BookOpen
} from 'lucide-react';
import { Tab } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
    activeTab: Tab;
    onSelectTab: (tab: Tab) => void;
    savedCount: number;
    deadlinesCount: number;
    activeTheme: string;
    onChangeTheme: (theme: string) => void;
    currentUser: User | null;
    isAuthLoading?: boolean;
    onSignIn: () => void;
    onSignOut: () => void;
    cvVersionsCount?: number;
    onOpenCvLibrary?: () => void;
    onOpenGoogleScholar?: () => void;
    onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    activeTab,
    onSelectTab,
    savedCount,
    deadlinesCount,
    activeTheme,
    onChangeTheme,
    currentUser,
    isAuthLoading,
    onSignIn,
    onSignOut,
    cvVersionsCount = 1,
    onOpenCvLibrary,
    onOpenGoogleScholar,
    onOpenAbout,
}) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleScrollToAbout = () => {
        if (onOpenAbout) {
            onOpenAbout();
        } else {
            const el = document.getElementById('about-section');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const navItems = [
        {
            id: Tab.MasterPrograms,
            label: "Master's Programs",
            icon: GraduationCap,
            color: 'from-blue-600 to-violet-600',
            badge: 'NEW',
            badgeColor: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
            activeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs font-bold',
        },
        {
            id: Tab.FindPositions,
            label: 'Find Opportunities',
            icon: Compass,
            color: 'from-blue-500 to-indigo-600',
            activeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-2xs font-bold',
        },
        {
            id: Tab.CvInsights,
            label: 'CV Readiness & Radar',
            icon: BarChart2,
            color: 'from-emerald-500 to-teal-600',
            activeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-2xs font-bold',
        },
        {
            id: Tab.WatermarkRemover,
            label: 'AI Watermark Remover',
            icon: ShieldCheck,
            color: 'from-cyan-500 to-blue-600',
            badge: 'NEW',
            badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
            activeColor: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 shadow-2xs font-bold',
        },
        {
            id: Tab.DraftDocuments,
            label: 'Document Studio',
            icon: FileEdit,
            color: 'from-purple-500 to-pink-600',
            activeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800 shadow-2xs font-bold',
        },
        {
            id: Tab.ApplicationTracker,
            label: 'Tracker & Pipeline',
            icon: BookmarkCheck,
            badge: savedCount,
            badgeColor: 'bg-amber-500 text-white',
            activeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-2xs font-bold',
        },
        {
            id: Tab.Deadlines,
            label: 'Deadlines',
            icon: Calendar,
            badge: deadlinesCount,
            badgeColor: 'bg-rose-500 text-white',
            activeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800 shadow-2xs font-bold',
        },
    ];

    const themes = [
        { id: 'vibrant', label: 'Vibrant Blue', class: 'bg-blue-600 ring-blue-400' },
        { id: 'emerald', label: 'Emerald Sage', class: 'bg-emerald-600 ring-emerald-400' },
        { id: 'purple', label: 'Royal Violet', class: 'bg-purple-600 ring-purple-400' },
        { id: 'rose', label: 'Sunset Crimson', class: 'bg-rose-600 ring-rose-400' },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
            {/* Top colorful gradient accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-pink-500 via-amber-500 to-emerald-500 animate-gradient-x" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Row 1: Brand & User Controls - Isolated from tabs so nothing can ever overlap behind logo */}
                <div className="flex items-center justify-between py-2.5 sm:py-3 gap-3">
                    {/* Brand Area */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:via-blue-100 dark:to-indigo-200 bg-clip-text text-transparent whitespace-nowrap">
                                    ScholarMatch AI
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-2xs">
                                    <Sparkles className="w-2.5 h-2.5" /> PRO
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block whitespace-nowrap">
                                Global Academic Scholarship & Research Lab Finder
                            </p>
                        </div>
                    </div>

                    {/* Top Right Action Controls: About Link, Google Scholar, Themes, Auth */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* Quick About Link */}
                        <button
                            type="button"
                            onClick={handleScrollToAbout}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Learn about ScholarMatch AI architecture and mission"
                        >
                            <Info className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="hidden md:inline">About</span>
                        </button>

                        {/* Google Scholar Trigger */}
                        {onOpenGoogleScholar && (
                            <button
                                type="button"
                                onClick={onOpenGoogleScholar}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer"
                                title="Explore Google Scholar papers, citations, and author profiles"
                            >
                                <GraduationCap className="w-3.5 h-3.5 text-[#4285F4]" />
                                <span>Google Scholar</span>
                            </button>
                        )}

                        {/* Theme Palette Dots */}
                        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onChangeTheme(t.id)}
                                    title={t.label}
                                    className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${t.class} ${
                                        activeTheme === t.id ? 'ring-2 ring-offset-1 ring-slate-800 dark:ring-offset-slate-900 scale-125 shadow-xs' : 'opacity-60 hover:opacity-100 hover:scale-110'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Firebase Google Auth Button & Profile Dropdown */}
                        <div className="relative">
                            {currentUser ? (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-indigo-400 shadow-2xs">
                                            {currentUser.photoURL ? (
                                                <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left max-w-[100px] sm:max-w-[130px] truncate hidden sm:block">
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {currentUser.displayName || currentUser.email?.split('@')[0] || 'Scholar'}
                                            </div>
                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <Cloud className="w-2.5 h-2.5" /> Synced
                                            </div>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {userMenuOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40" 
                                                onClick={() => setUserMenuOpen(false)} 
                                            />
                                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-3 space-y-2">
                                                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                        {currentUser.displayName || 'Scholar User'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 truncate">
                                                        {currentUser.email}
                                                    </p>
                                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                                                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                        <span>Firebase Cloud Persistence Active</span>
                                                    </div>
                                                </div>

                                                {onOpenCvLibrary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUserMenuOpen(false);
                                                            onOpenCvLibrary();
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                                                            Manage Tailored CVs
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {cvVersionsCount}
                                                        </span>
                                                    </button>
                                                )}

                                                {onOpenGoogleScholar && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUserMenuOpen(false);
                                                            onOpenGoogleScholar();
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            <GraduationCap className="w-3.5 h-3.5 text-[#4285F4]" />
                                                            Google Scholar Explorer
                                                        </span>
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                            Papers
                                                        </span>
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        onSignOut();
                                                    }}
                                                    className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onSignIn}
                                    disabled={isAuthLoading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all shadow-2xs hover:border-indigo-400 cursor-pointer"
                                    title="Sign in with Google to sync your CVs"
                                >
                                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    <span className="whitespace-nowrap">Sign In with Google</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Dedicated Navigation Tabs Bar - Completely beneath the brand header with zero overlap */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 py-2 overflow-x-auto scrollbar-none scroll-smooth">
                    <nav className="flex items-center gap-1.5 min-w-max pb-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectTab(item.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border cursor-pointer ${
                                        isActive
                                            ? item.activeColor
                                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium'
                                    }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-current' : 'text-slate-400 dark:text-slate-500'}`} />
                                    <span>{item.label}</span>
                                    {item.badge !== undefined && (
                                        <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
};
