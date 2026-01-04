import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set');
}

export const genAI = new GoogleGenerativeAI(apiKey);

export function getModel(modelName: string = 'gemini-2.0-flash') {
  const requestOptions = {
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
  };
  return genAI.getGenerativeModel({ model: modelName }, requestOptions);
}
