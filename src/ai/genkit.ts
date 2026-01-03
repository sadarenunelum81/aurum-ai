import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {firebase} from '@genkit-ai/firebase'; // Temporarily disabled due to import issues

// Use a placeholder key during build time if the real key is missing.
// This prevents the build from failing while ensuring the plugin is loaded.
// At runtime, the real environment variable will be used.
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || 'build-time-placeholder';

export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: apiKey
    }),
    // firebase()
  ],
  model: 'googleai/gemini-2.5-flash',
});
