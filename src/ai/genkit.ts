import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || 'build-time-placeholder';

export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: apiKey
    }),
  ],
  model: 'gemini-pro',
});
