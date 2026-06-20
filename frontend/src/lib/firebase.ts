/**
 * Firebase Client SDK Initialization
 * 
 * Initializes Firebase app for browser use.
 * Only uses public VITE_ environment variables.
 * Admin operations remain server-side ONLY.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in development
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth = getAuth(app);
export const firebaseDB = getFirestore(app);
export const firebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize analytics only in production
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
    analytics = getAnalytics(app);
}
export { analytics };

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(firebaseAuth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(firebaseDB, 'localhost', 8080);
    connectStorageEmulator(firebaseStorage, 'localhost', 9199);
}

export default app;
