import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut as fbSignOut, 
    onAuthStateChanged, 
    User 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    getDocFromServer, 
    collection, 
    setDoc, 
    deleteDoc, 
    onSnapshot, 
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CvProfile, ResearchPaperItem } from '../types';

export enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

export interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
        userId?: string | null;
        email?: string | null;
        emailVerified?: boolean | null;
        isAnonymous?: boolean | null;
        tenantId?: string | null;
        providerInfo?: {
            providerId?: string | null;
            email?: string | null;
        }[];
    };
}

// 1. Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Skill Error Handler
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo: auth.currentUser?.providerData?.map(provider => ({
                providerId: provider.providerId,
                email: provider.email,
            })) || []
        },
        operationType,
        path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}

// Skill Connection Tester
export async function testConnection(): Promise<boolean> {
    try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        return true;
    } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
        }
        return false;
    }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
    try {
        const credential = await signInWithPopup(auth, googleProvider);
        return credential.user;
    } catch (error) {
        console.error('Google Sign-In failed:', error);
        throw error;
    }
}

export async function signOutUser(): Promise<void> {
    try {
        await fbSignOut(auth);
    } catch (error) {
        console.error('Sign-Out failed:', error);
        throw error;
    }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// Firestore CV Profiles Operations
export async function saveCvProfileToFirestore(userId: string, profile: CvProfile): Promise<void> {
    const profilePath = `users/${userId}/cv_profiles/${profile.id}`;
    try {
        const payload: Record<string, any> = {
            id: profile.id,
            userId: userId,
            name: profile.name.slice(0, 100),
            targetField: profile.targetField.slice(0, 100),
            text: profile.text.slice(0, 20000),
            isDefault: Boolean(profile.isDefault),
            createdAt: profile.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (profile.targetInstitutions) {
            payload.targetInstitutions = profile.targetInstitutions.slice(0, 200);
        }
        if (profile.notes) {
            payload.notes = profile.notes.slice(0, 1000);
        }

        await setDoc(doc(db, 'users', userId, 'cv_profiles', profile.id), payload);
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, profilePath);
    }
}

export async function deleteCvProfileFromFirestore(userId: string, profileId: string): Promise<void> {
    const profilePath = `users/${userId}/cv_profiles/${profileId}`;
    try {
        await deleteDoc(doc(db, 'users', userId, 'cv_profiles', profileId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, profilePath);
    }
}

export async function fetchCvProfilesFromFirestore(userId: string): Promise<CvProfile[]> {
    const collectionPath = `users/${userId}/cv_profiles`;
    try {
        const colRef = collection(db, 'users', userId, 'cv_profiles');
        const q = query(colRef, orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        const profiles: CvProfile[] = [];
        snapshot.forEach((d) => {
            const data = d.data() as CvProfile;
            profiles.push(data);
        });
        return profiles;
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
}

export function subscribeToCvProfiles(
    userId: string, 
    callback: (profiles: CvProfile[]) => void,
    onError?: (error: any) => void
): () => void {
    const collectionPath = `users/${userId}/cv_profiles`;
    const colRef = collection(db, 'users', userId, 'cv_profiles');
    const q = query(colRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
        q,
        (snapshot) => {
            const profiles: CvProfile[] = [];
            snapshot.forEach((d) => {
                profiles.push(d.data() as CvProfile);
            });
            callback(profiles);
        },
        (error) => {
            if (onError) onError(error);
            handleFirestoreError(error, OperationType.LIST, collectionPath);
        }
    );
}

// Firestore Research Papers Operations
export async function saveResearchPaperToFirestore(userId: string, paper: ResearchPaperItem): Promise<void> {
    const paperPath = `users/${userId}/research_papers/${paper.id}`;
    try {
        const payload: Record<string, any> = {
            id: paper.id,
            userId: userId,
            title: paper.title.slice(0, 500),
            authors: (paper.authors || []).slice(0, 50).map(a => String(a).slice(0, 150)),
            journalOrVenue: (paper.journalOrVenue || 'Unknown Venue').slice(0, 200),
            year: String(paper.year || new Date().getFullYear()).slice(0, 32),
            status: paper.status === 'read' ? 'read' : 'pending',
            priority: ['high', 'medium', 'low'].includes(paper.priority) ? paper.priority : 'medium',
            tags: (paper.tags || []).slice(0, 30).map(t => String(t).slice(0, 50)),
            dateAdded: paper.dateAdded || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (typeof paper.citationCount === 'number') payload.citationCount = paper.citationCount;
        if (paper.abstract) payload.abstract = paper.abstract.slice(0, 5000);
        if (paper.scholarUrl) payload.scholarUrl = paper.scholarUrl.slice(0, 1000);
        if (paper.pdfUrl) payload.pdfUrl = paper.pdfUrl.slice(0, 1000);
        if (paper.doi) payload.doi = paper.doi.slice(0, 200);
        if (paper.targetUniversity) payload.targetUniversity = paper.targetUniversity.slice(0, 200);
        if (paper.targetProfessor) payload.targetProfessor = paper.targetProfessor.slice(0, 150);
        if (paper.notes) payload.notes = paper.notes.slice(0, 5000);
        if (paper.sopHookSentence) payload.sopHookSentence = paper.sopHookSentence.slice(0, 1000);
        if (paper.apaCitation) payload.apaCitation = paper.apaCitation.slice(0, 1000);
        if (paper.bibtex) payload.bibtex = paper.bibtex.slice(0, 2000);
        if (paper.dateRead) payload.dateRead = paper.dateRead.slice(0, 64);

        await setDoc(doc(db, 'users', userId, 'research_papers', paper.id), payload);
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, paperPath);
    }
}

export async function deleteResearchPaperFromFirestore(userId: string, paperId: string): Promise<void> {
    const paperPath = `users/${userId}/research_papers/${paperId}`;
    try {
        await deleteDoc(doc(db, 'users', userId, 'research_papers', paperId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, paperPath);
    }
}

export async function fetchResearchPapersFromFirestore(userId: string): Promise<ResearchPaperItem[]> {
    const collectionPath = `users/${userId}/research_papers`;
    try {
        const colRef = collection(db, 'users', userId, 'research_papers');
        const q = query(colRef, orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        const papers: ResearchPaperItem[] = [];
        snapshot.forEach((d) => {
            const data = d.data() as ResearchPaperItem;
            papers.push(data);
        });
        return papers;
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
}

export function subscribeToResearchPapers(
    userId: string,
    callback: (papers: ResearchPaperItem[]) => void,
    onError?: (error: any) => void
): () => void {
    const collectionPath = `users/${userId}/research_papers`;
    const colRef = collection(db, 'users', userId, 'research_papers');
    const q = query(colRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
        q,
        (snapshot) => {
            const papers: ResearchPaperItem[] = [];
            snapshot.forEach((d) => {
                papers.push(d.data() as ResearchPaperItem);
            });
            callback(papers);
        },
        (error) => {
            if (onError) onError(error);
            handleFirestoreError(error, OperationType.LIST, collectionPath);
        }
    );
}
