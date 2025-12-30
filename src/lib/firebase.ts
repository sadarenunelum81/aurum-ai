import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig as baseConfig } from "./firebase-config";

// Dynamically determine the auth domain
const getAuthDomain = () => {
  const isProduction = process.env.NODE_ENV === "production";
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
};

// ✅ ONLY ONE firebaseConfig
const firebaseConfig = {
  ...baseConfig,
  authDomain: getAuthDomain(),
};

// Prevent re-initializing Firebase on hot reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
