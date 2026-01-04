import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set');
}

// Use direct fetch to v1 API instead of SDK to avoid v1beta issues
export async function generateContent(prompt: string, modelName: string = 'gemini-2.5-flash-lite') {
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Keep backwards compatibility
export const genAI = new GoogleGenerativeAI(apiKey);

export function getModel(modelName: string = 'gemini-2.5-flash-lite') {
  // Return a compatible object
  return {
    async generateContent(prompt: string | {text: string}) {
      const text = typeof prompt === 'string' ? prompt : prompt.text;
      const responseText = await generateContent(text, modelName);
      return {
        response: {
          text: () => responseText
        }
      };
    }
  };
}
