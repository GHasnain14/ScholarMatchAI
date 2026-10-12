import { CvProfile } from '../types';

export const LOCAL_STORAGE_KEY_PROFILES_BASE = 'scholar_cv_profiles';
export const LOCAL_STORAGE_KEY_ACTIVE_ID_BASE = 'scholar_active_cv_id';
export const LOCAL_STORAGE_LEGACY_CV_TEXT = 'scholar_cv_text';

/**
 * Returns or generates a unique, persistent guest session identifier
 * so each unauthenticated visitor/device has their own private workspace.
 */
export function getOrCreateGuestSessionId(): string {
    const GUEST_KEY = 'scholar_device_session_id';
    try {
        let id = localStorage.getItem(GUEST_KEY);
        if (!id) {
            id = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem(GUEST_KEY, id);
        }
        return id;
    } catch {
        return 'guest_transient_' + Date.now().toString(36);
    }
}

/**
 * Determines storage key scoped strictly by user identity or private guest session
 */
export function getUserScopeKey(userId?: string | null): string {
    if (userId && typeof userId === 'string' && userId.trim().length > 0) {
        return `user_${userId.trim()}`;
    }
    return getOrCreateGuestSessionId();
}

export function getScopedStorageKey(baseKey: string, userId?: string | null): string {
    return `${baseKey}_${getUserScopeKey(userId)}`;
}

export const STARTER_CV_TEMPLATES: Omit<CvProfile, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>[] = [];

export function isFakeTemplateText(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (
        lower.includes('alex chen') ||
        lower.includes('maya lin') ||
        lower.includes('lucas morales') ||
        lower.includes('artificial intelligence & robotics') && lower.includes('visual perception lab')
    );
}

export function generateProfileId(): string {
    return 'cv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Loads the user's authentic saved CV text, guaranteeing no fake starter templates are loaded.
 */
export function loadSavedCvText(userId?: string | null): string {
    try {
        const text = localStorage.getItem(LOCAL_STORAGE_LEGACY_CV_TEXT) || '';
        if (isFakeTemplateText(text)) {
            localStorage.removeItem(LOCAL_STORAGE_LEGACY_CV_TEXT);
            return '';
        }
        return text;
    } catch {
        return '';
    }
}

/**
 * Saves the user's authentic CV text.
 */
export function saveSavedCvText(text: string, userId?: string | null): void {
    try {
        if (!text || !text.trim()) {
            localStorage.removeItem(LOCAL_STORAGE_LEGACY_CV_TEXT);
        } else {
            localStorage.setItem(LOCAL_STORAGE_LEGACY_CV_TEXT, text.trim());
        }
    } catch (e) {
        console.error('Failed to save CV text:', e);
    }
}

export function loadLocalProfiles(userId?: string | null): CvProfile[] {
    const scopeKey = getUserScopeKey(userId);
    const storageKey = getScopedStorageKey(LOCAL_STORAGE_KEY_PROFILES_BASE, userId);
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Filter out any fake demo profiles from previous sessions
                const clean = parsed.filter(p => !isFakeTemplateText(p.text) && !isFakeTemplateText(p.name));
                if (clean.length > 0) {
                    return clean;
                }
            }
        }

        // Check if legacy single CV exists
        const legacyCvText = localStorage.getItem(LOCAL_STORAGE_LEGACY_CV_TEXT);
        if (legacyCvText && !isFakeTemplateText(legacyCvText) && legacyCvText.trim().length > 30) {
            const initialProfiles: CvProfile[] = [{
                id: generateProfileId(),
                name: 'Primary Academic CV',
                targetField: 'General / Current Research',
                text: legacyCvText.trim(),
                isDefault: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                analysis: null,
            }];
            saveLocalProfiles(initialProfiles, userId);
            return initialProfiles;
        }

        return [];
    } catch (e) {
        console.warn('Failed to load local CV profiles for workspace:', e);
        return [];
    }
}

export function saveLocalProfiles(profiles: CvProfile[], userId?: string | null): void {
    const storageKey = getScopedStorageKey(LOCAL_STORAGE_KEY_PROFILES_BASE, userId);
    try {
        localStorage.setItem(storageKey, JSON.stringify(profiles));
    } catch (e) {
        console.error('Failed to save CV profiles to local storage for workspace:', e);
    }
}

export function getActiveProfileId(userId?: string | null): string | null {
    const storageKey = getScopedStorageKey(LOCAL_STORAGE_KEY_ACTIVE_ID_BASE, userId);
    try {
        const scoped = localStorage.getItem(storageKey);
        if (scoped) return scoped;
        return localStorage.getItem('scholar_active_cv_id');
    } catch {
        return null;
    }
}

export function setActiveProfileId(id: string, userId?: string | null): void {
    const storageKey = getScopedStorageKey(LOCAL_STORAGE_KEY_ACTIVE_ID_BASE, userId);
    try {
        localStorage.setItem(storageKey, id);
    } catch (e) {
        console.error('Failed to set active CV profile id for workspace:', e);
    }
}

export function mergeLocalAndCloudProfiles(local: CvProfile[], cloud: CvProfile[]): CvProfile[] {
    const map = new Map<string, CvProfile>();
    
    // Cloud is source of truth for items present in cloud
    cloud.forEach((p) => map.set(p.id, p));

    // For local items not in cloud: only keep them if they were created very recently (within 5 minutes)
    // or if cloud has zero items yet. This prevents resurrected deleted profiles across devices.
    const now = Date.now();
    local.forEach((loc) => {
        const existing = map.get(loc.id);
        if (!existing) {
            if (cloud.length === 0) {
                map.set(loc.id, loc);
            } else {
                const createdTime = new Date(loc.createdAt || 0).getTime();
                // If created locally in the last 2 minutes, keep it for sync
                if (now - createdTime < 120000) {
                    map.set(loc.id, loc);
                }
            }
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
