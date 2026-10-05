import React, { useState } from 'react';
import { 
    Bell, 
    BellRing, 
    CheckCircle2, 
    AlertTriangle, 
    Clock, 
    Sparkles, 
    Calendar, 
    ShieldAlert, 
    Send, 
    RefreshCw,
    Info,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { Scholarship } from '../types';
import { 
    getNotificationPermission, 
    requestBrowserNotificationPermission, 
    sendTest3DayNotification, 
    checkAndTrigger3DayNotifications,
    calculateDaysRemaining
} from '../services/deadlineNotificationService';

interface DeadlineNotificationCenterProps {
    scholarships: Scholarship[];
    onUpdateDeadline?: (scholarshipId: string, deadline: string) => void;
    onSelectScholarship?: (scholarship: Scholarship) => void;
    onPermissionsChanged?: (granted: boolean) => void;
}

export const DeadlineNotificationCenter: React.FC<DeadlineNotificationCenterProps> = ({
    scholarships,
    onUpdateDeadline,
    onSelectScholarship,
    onPermissionsChanged,
}) => {
    const [permissionStatus, setPermissionStatus] = useState<string>(() => getNotificationPermission());
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [isTesting, setIsTesting] = useState<boolean>(false);

    // Calculate scholarships with deadlines
    const scholarshipsWithDeadlines = scholarships.filter(s => Boolean(s.deadline));

    // Calculate scholarships within 3-day critical window
    const criticalThreeDayScholarships = scholarshipsWithDeadlines.filter(s => {
        const days = calculateDaysRemaining(s.deadline);
        return days !== null && days <= 3 && days >= 0;
    });

    const exactlyThreeDaysScholarships = scholarshipsWithDeadlines.filter(s => {
        const days = calculateDaysRemaining(s.deadline);
        return days === 3;
    });

    const handleEnableNotifications = async () => {
        const granted = await requestBrowserNotificationPermission();
        const newStatus = getNotificationPermission();
        setPermissionStatus(newStatus);
        onPermissionsChanged?.(granted);

        if (granted) {
            setStatusMessage('✅ Browser push notifications enabled! You will receive an alert 3 days before any scholarship deadline.');
            // Run an immediate check for any existing 3-day deadlines
            await checkAndTrigger3DayNotifications(scholarships);
        } else {
            setStatusMessage('⚠️ Browser notification permission was not granted. Please check your browser site settings.');
        }

        setTimeout(() => setStatusMessage(null), 6000);
    };

    const handleSendTestNotification = async () => {
        setIsTesting(true);
        try {
            if (permissionStatus !== 'granted') {
                const granted = await requestBrowserNotificationPermission();
                setPermissionStatus(getNotificationPermission());
                onPermissionsChanged?.(granted);
                if (!granted) {
                    setStatusMessage('⚠️ Please allow notification permission in your browser prompt to receive alerts.');
                    setIsTesting(false);
                    return;
                }
            }

            const sent = await sendTest3DayNotification();
            if (sent) {
                setStatusMessage('🔔 Test 3-day deadline alert dispatched to your operating system!');
            } else {
                setStatusMessage('⚠️ Could not dispatch notification. Ensure your browser allows notifications from this site.');
            }
        } catch (e) {
            console.error('Test notification error:', e);
            setStatusMessage('Failed to trigger test notification.');
        } finally {
            setIsTesting(false);
            setTimeout(() => setStatusMessage(null), 6000);
        }
    };

    const handleScanDeadlines = async () => {
        setIsScanning(true);
        try {
            if (permissionStatus !== 'granted') {
                await handleEnableNotifications();
            }

            const results = await checkAndTrigger3DayNotifications(scholarships, { force: true });
            const triggered = results.filter(r => r.notificationSent);

            if (triggered.length > 0) {
                setStatusMessage(`🔔 Triggered ${triggered.length} deadline alert(s) for upcoming applications!`);
            } else if (criticalThreeDayScholarships.length > 0) {
                setStatusMessage(`ℹ️ Found ${criticalThreeDayScholarships.length} application(s) within the 3-day window.`);
            } else {
                setStatusMessage('ℹ️ All deadlines evaluated. No applications are currently at the 3-day milestone.');
            }
        } catch (e) {
            console.error('Scan error:', e);
            setStatusMessage('Error scanning deadlines.');
        } finally {
            setIsScanning(false);
            setTimeout(() => setStatusMessage(null), 6000);
        }
    };

    // Quick helper to schedule a test deadline exactly 3 days from now
    const handleSetDemoDeadlineThreeDays = (scholarshipId: string) => {
        if (!onUpdateDeadline) return;
        const target = new Date();
        target.setDate(target.getDate() + 3);
        const yyyy = target.getFullYear();
        const mm = String(target.getMonth() + 1).padStart(2, '0');
        const dd = String(target.getDate()).padStart(2, '0');
        const deadlineStr = `${yyyy}-${mm}-${dd}`;

        onUpdateDeadline(scholarshipId, deadlineStr);
        setStatusMessage(`🗓️ Set deadline to ${deadlineStr} (exactly 3 days away). Run "Check Deadlines Now" to trigger notification!`);
        setTimeout(() => setStatusMessage(null), 6000);
    };

    const isGranted = permissionStatus === 'granted';

    return (
        <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/50 dark:from-slate-850 dark:via-slate-800 dark:to-slate-900 p-5 sm:p-7 shadow-xl shadow-indigo-500/5 space-y-6">
            {/* Header & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-indigo-100 dark:border-slate-700/80">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        {isGranted ? <BellRing className="w-6 h-6 animate-bounce" /> : <Bell className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                3-Day Deadline Push Notification System
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isGranted 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300' 
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300'
                            }`}>
                                {isGranted ? '✓ Active & Enabled' : 'Action Required'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Automatically triggers browser push notifications <strong>3 days prior</strong> to any stored scholarship or lab application deadline
                        </p>
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {!isGranted ? (
                        <button
                            type="button"
                            onClick={handleEnableNotifications}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all"
                        >
                            <Bell className="w-4 h-4" />
                            <span>Enable Browser Notifications</span>
                        </button>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Push Alerts Permitted
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleSendTestNotification}
                        disabled={isTesting}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50"
                        title="Simulate a 3-day deadline push notification in your browser"
                    >
                        <Send className={`w-3.5 h-3.5 text-indigo-600 ${isTesting ? 'animate-pulse' : ''}`} />
                        <span>{isTesting ? 'Sending Alert...' : 'Test 3-Day Alert'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleScanDeadlines}
                        disabled={isScanning}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all shadow-2xs disabled:opacity-50"
                        title="Manually trigger a scan of all deadlines"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                        <span>{isScanning ? 'Scanning...' : 'Check Deadlines Now'}</span>
                    </button>
                </div>
            </div>

            {/* Notification Status Alert Bar */}
            {statusMessage && (
                <div className="p-3.5 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/70 border border-indigo-300 dark:border-indigo-800 text-xs font-semibold text-indigo-900 dark:text-indigo-100 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{statusMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusMessage(null)}
                        className="text-xs text-indigo-600 hover:underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* 3-Day Critical Milestones Banner */}
            {criticalThreeDayScholarships.length > 0 && (
                <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-800/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 dark:from-amber-950/40 dark:via-slate-850 dark:to-orange-950/30 p-4 sm:p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                            <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                                🚨 Urgent: {criticalThreeDayScholarships.length} Opportunity Deadline(s) Approaching Within 3 Days!
                            </h4>
                        </div>
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-500 text-white shadow-2xs">
                            Active 3-Day Window
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {criticalThreeDayScholarships.map(s => {
                            const days = calculateDaysRemaining(s.deadline);
                            const isExactly3 = days === 3;

                            return (
                                <div 
                                    key={s.id || s.professorName}
                                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 shadow-2xs flex flex-col justify-between space-y-2.5"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                {s.professorName}
                                            </span>
                                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                                                isExactly3 
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 animate-pulse border border-amber-300' 
                                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300'
                                            }`}>
                                                {days === 0 ? 'Due Today!' : days === 1 ? '1 Day Left' : `${days} Days Remaining`}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                            {s.institution} • {s.researchArea}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 text-xs">
                                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                            Deadline: <strong>{s.deadline}</strong>
                                        </span>
                                        {onSelectScholarship && (
                                            <button
                                                type="button"
                                                onClick={() => onSelectScholarship(s)}
                                                className="text-xs font-bold text-indigo-600 hover:underline"
                                            >
                                                Draft Materials →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Policy & Fast Testing Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 3-Day Milestone Timing
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Push notifications trigger automatically when an application deadline is exactly <strong>3 calendar days away</strong>.
                    </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Deduplication Guard
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Alerts are stored with local identifiers so you never receive duplicate alerts for the same deadline within a 24-hour cycle.
                    </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Rapid Testing Tool
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Set any scholarship deadline to 3 days from now, then click "Check Deadlines Now" to test the alert mechanism.
                    </p>
                    {scholarships.length > 0 && onUpdateDeadline && (
                        <div className="pt-1">
                            <button
                                type="button"
                                onClick={() => handleSetDemoDeadlineThreeDays(scholarships[0].id!)}
                                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Set 1st position to 3 days from today →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
