

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig as baseConfig } from './firebase-config';

const getAuthDomain = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const projectUrl = process.env.NEXT_PUBLIC_PROJECT_URL;

    if (isProduction && projectUrl) {
        try {
            return new URL(projectUrl).hostname;
        } catch (e) {
            console.error("Invalid PROJECT_URL, falling back to default auth domain:", e);
            return baseConfig.authDomain;
        }
    }

    return baseConfig.authDomain;
}

const firebaseConfig = {
    ...baseConfig,
    authDomain: getAuthDomain()
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { app as firebaseApp, db, auth };

