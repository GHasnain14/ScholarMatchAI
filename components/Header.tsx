import React from 'react';
import { Sparkles, GraduationCap, Compass, FileEdit, Calendar, BookmarkCheck, BarChart2, ShieldCheck } from 'lucide-react';
import { Tab } from '../types';

interface HeaderProps {
    activeTab: Tab;
    onSelectTab: (tab: Tab) => void;
    savedCount: number;
    deadlinesCount: number;
    activeTheme: string;
    onChangeTheme: (theme: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
    activeTab,
    onSelectTab,
    savedCount,
    deadlinesCount,
    activeTheme,
    onChangeTheme,
}) => {
    const navItems = [
        {
            id: Tab.MasterPrograms,
            label: "Master's Programs",
            icon: GraduationCap,
            color: 'from-blue-600 to-violet-600',
            badge: 'NEW',
            badgeColor: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
            activeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        },
        {
            id: Tab.FindPositions,
            label: 'Find Opportunities',
            icon: Compass,
            color: 'from-blue-500 to-indigo-600',
            activeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        },
        {
            id: Tab.CvInsights,
            label: 'CV Readiness & Radar',
            icon: BarChart2,
            color: 'from-emerald-500 to-teal-600',
            activeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        },
        {
            id: Tab.WatermarkRemover,
            label: 'AI Watermark Remover',
            icon: ShieldCheck,
            color: 'from-cyan-500 to-blue-600',
            badge: 'NEW',
            badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
            activeColor: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        },
        {
            id: Tab.DraftDocuments,
            label: 'Document Studio',
            icon: FileEdit,
            color: 'from-purple-500 to-pink-600',
            activeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        },
        {
            id: Tab.ApplicationTracker,
            label: 'Tracker & Pipeline',
            icon: BookmarkCheck,
            badge: savedCount,
            badgeColor: 'bg-amber-500 text-white',
            activeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        },
        {
            id: Tab.Deadlines,
            label: 'Deadlines',
            icon: Calendar,
            badge: deadlinesCount,
            badgeColor: 'bg-rose-500 text-white',
            activeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
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
                <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
                    {/* Brand */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:via-blue-100 dark:to-indigo-200 bg-clip-text text-transparent">
                                        ScholarMatch AI
                                    </h1>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-2xs">
                                        <Sparkles className="w-2.5 h-2.5" /> PRO
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Global Academic Scholarship & Research Lab Finder
                                </p>
                            </div>
                        </div>

                        {/* Mobile Theme Palette Selector */}
                        <div className="flex md:hidden items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onChangeTheme(t.id)}
                                    title={t.label}
                                    className={`w-4 h-4 rounded-full transition-all ${t.class} ${
                                        activeTheme === t.id ? 'ring-2 ring-offset-1 ring-slate-800 dark:ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectTab(item.id)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                                        isActive
                                            ? `${item.activeColor} shadow-2xs font-bold scale-[1.02]`
                                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-current' : 'text-slate-400 dark:text-slate-500'}`} />
                                    <span>{item.label}</span>
                                    {typeof item.badge === 'number' && item.badge > 0 && (
                                        <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {/* Desktop Theme Selector */}
                        <div className="hidden md:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400 font-medium mr-1">Theme:</span>
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onChangeTheme(t.id)}
                                    title={t.label}
                                    className={`w-4 h-4 rounded-full transition-all ${t.class} ${
                                        activeTheme === t.id ? 'ring-2 ring-offset-1 ring-slate-800 dark:ring-offset-slate-900 scale-125 shadow-xs' : 'opacity-60 hover:opacity-100 hover:scale-110'
                                    }`}
                                />
                            ))}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};
