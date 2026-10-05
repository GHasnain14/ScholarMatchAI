import { Scholarship } from '../types';

export const LOCAL_STORAGE_KEY_NOTIFIED_DEADLINES = 'scholar_notified_deadlines';

export interface DeadlineNotificationResult {
    scholarshipId: string;
    professorName: string;
    institution: string;
    deadline: string;
    daysRemaining: number;
    notificationSent: boolean;
    reason?: string;
}

/**
 * Calculates calendar days remaining until target deadline.
 * Positive number = days in the future.
 * 0 = today.
 * Negative number = past deadline.
 */
export function calculateDaysRemaining(deadlineStr?: string): number | null {
    if (!deadlineStr) return null;

    try {
        const parts = deadlineStr.split('-');
        if (parts.length !== 3) {
            const parsed = new Date(deadlineStr);
            if (isNaN(parsed.getTime())) return null;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            parsed.setHours(0, 0, 0, 0);
            return Math.round((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const target = new Date(year, month, day);
        target.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - now.getTime();
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
}

/**
 * Checks if browser push notifications are supported
 */
export function isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Requests browser push notification permission from the user
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
    if (!isNotificationSupported()) return false;

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (e) {
        console.warn('Failed to request notification permission:', e);
        return false;
    }
}

/**
 * Get map of already sent notifications from localStorage
 */
function getSentNotificationsMap(): Record<string, number> {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFIED_DEADLINES);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

/**
 * Record a sent notification in localStorage
 */
function recordSentNotification(key: string) {
    try {
        const current = getSentNotificationsMap();
        current[key] = Date.now();
        localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFIED_DEADLINES, JSON.stringify(current));
    } catch (e) {
        console.debug('Failed to record notification log:', e);
    }
}

/**
 * Dispatches a native browser push notification
 */
export async function dispatchBrowserPushNotification(params: {
    title: string;
    body: string;
    tag: string;
    url?: string;
    scholarshipId?: string;
}): Promise<boolean> {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        return false;
    }

    const { title, body, tag, scholarshipId } = params;

    try {
        // Try Service Worker registration first if available
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            try {
                const reg = await navigator.serviceWorker.getRegistration();
                if (reg && reg.showNotification) {
                    await reg.showNotification(title, {
                        body,
                        icon: '/vite.svg',
                        badge: '/vite.svg',
                        tag,
                        requireInteraction: true,
                        data: { scholarshipId, timestamp: Date.now() }
                    });
                    return true;
                }
            } catch {
                // Fall back to standard Notification constructor
            }
        }

        // Standard Web Notifications API fallback
        const notification = new Notification(title, {
            body,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag,
            requireInteraction: true
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            // Dispatch custom window event so App.tsx switches to Deadlines tab
            window.dispatchEvent(new CustomEvent('scholarship-notification-click', {
                detail: { scholarshipId }
            }));
        };

        return true;
    } catch (err) {
        console.error('Failed to dispatch browser notification:', err);
        return false;
    }
}

/**
 * Checks all scholarships with deadlines and triggers browser notifications
 * specifically 3 days before the scheduled deadline.
 */
export async function checkAndTrigger3DayNotifications(
    scholarships: Scholarship[],
    options: { force?: boolean } = {}
): Promise<DeadlineNotificationResult[]> {
    if (!isNotificationSupported()) {
        return [];
    }

    const permission = Notification.permission;
    if (permission !== 'granted' && !options.force) {
        return [];
    }

    const results: DeadlineNotificationResult[] = [];
    const sentMap = getSentNotificationsMap();
    const todayDateStr = new Date().toISOString().split('T')[0];

    for (const s of scholarships) {
        if (!s.deadline) continue;

        const daysRemaining = calculateDaysRemaining(s.deadline);
        if (daysRemaining === null) continue;

        // Check specifically for 3 days before deadline (or within 1-3 days if not yet alerted)
        const isThreeDayWindow = daysRemaining === 3 || (daysRemaining <= 3 && daysRemaining >= 1);

        if (isThreeDayWindow || options.force) {
            const id = s.id || `${s.professorName}-${s.institution}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const notificationKey = `${id}_deadline_${s.deadline}_${daysRemaining}days_${todayDateStr}`;

            // Check if already notified for this milestone today
            if (sentMap[notificationKey] && !options.force) {
                results.push({
                    scholarshipId: id,
                    professorName: s.professorName,
                    institution: s.institution,
                    deadline: s.deadline,
                    daysRemaining,
                    notificationSent: false,
                    reason: 'Already notified today for this deadline'
                });
                continue;
            }

            const title = daysRemaining === 3
                ? `⏰ 3-Day Deadline Alert: ${s.professorName}`
                : `🚨 Urgent (${daysRemaining} Days Left): ${s.professorName}`;

            const body = daysRemaining === 3
                ? `Only 3 days remaining! The application deadline for ${s.institution} (${s.researchArea}) is on ${s.deadline}. Finalize your outreach emails, SOP, and reference letters!`
                : `Urgent reminder: Deadline is in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} on ${s.deadline} for ${s.institution}. Submit your materials today!`;

            const sent = await dispatchBrowserPushNotification({
                title,
                body,
                tag: `deadline-alert-${id}-${daysRemaining}`,
                scholarshipId: id
            });

            if (sent) {
                recordSentNotification(notificationKey);
            }

            results.push({
                scholarshipId: id,
                professorName: s.professorName,
                institution: s.institution,
                deadline: s.deadline,
                daysRemaining,
                notificationSent: sent,
                reason: sent ? 'Notification delivered' : 'Browser dispatch failed'
            });
        }
    }

    return results;
}

/**
 * Triggers a test 3-day deadline push notification so user can verify permissions and system alerts
 */
export async function sendTest3DayNotification(): Promise<boolean> {
    const title = `⏰ 3-Day Deadline Alert (Test Simulation)`;
    const body = `3 days remaining! Sample application deadline for Prof. David Miller at Stanford University is approaching in 3 days. Your browser notifications are active!`;

    return dispatchBrowserPushNotification({
        title,
        body,
        tag: `test-3day-deadline-${Date.now()}`
    });
}
