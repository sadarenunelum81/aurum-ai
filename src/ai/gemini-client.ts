import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set');
}

export const genAI = new GoogleGenerativeAI(apiKey);

export function getModel(modelName: string = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}
