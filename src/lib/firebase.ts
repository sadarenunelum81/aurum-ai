

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig as baseConfig } from './firebase-config';

const firebaseConfig = {
  apiKey: "AIzaSyAWxAvIsvAx1Y3DO_cyBIuYEO7zdJ816mE",
  authDomain: "ai-1-3d51d.firebaseapp.com",
  projectId: "ai-1-3d51d",
  storageBucket: "ai-1-3d51d.firebasestorage.app",
  messagingSenderId: "929666491940",
  appId: "1:929666491940:web:ea4baec82df28fe29d1ab1",
  measurementId: "G-SZSB5H0FXC"
};  
      // Dynamically determine the auth domain
const getAuthDomain = () => {
    // This environment variable is automatically set by Vercel, Netlify, and others.
    // It will be 'production' on your live site.
    const isProduction = process.env.NODE_ENV === 'production';
    
    // This is the custom URL you will set on your hosting provider.
    const projectUrl = process.env.NEXT_PUBLIC_PROJECT_URL;

    if (isProduction && projectUrl) {
        // Use the domain from your project URL.
        // e.g., if projectUrl is "https://www.example.com", this will be "www.example.com"
        try {
            return new URL(projectUrl).hostname;
        } catch (e) {
            console.error("Invalid PROJECT_URL, falling back to default auth domain:", e);
            return baseConfig.authDomain;
        }
    }
    
    // Default to the config value for local development or if the URL isn't set.
    return baseConfig.authDomain;
}

const firebaseConfig = {
    ...baseConfig,
    authDomain: getAuthDomain()
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { app as firebaseApp, db, auth };

