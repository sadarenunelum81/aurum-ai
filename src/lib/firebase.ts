import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig as baseConfig } from './firebase-config';

const firebaseConfig = {
  apiKey: "AIzaSyD9uV5nJBo8ynZO80f9ScuboNIg2Wrat7k",
  authDomain: "new-01-67ef2.firebaseapp.com",
  projectId: "new-01-67ef2",
  storageBucket: "new-01-67ef2.firebasestorage.app",
  messagingSenderId: "991835832906",
  appId: "1:991835832906:web:b3b8d3f2613ab03a951cb3",
  measurementId: "G-1D4KEJ92WL"
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



