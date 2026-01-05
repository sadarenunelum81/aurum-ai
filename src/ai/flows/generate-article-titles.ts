'use server';

import { getModel } from '@/ai/gemini-client';

export interface GenerateArticleTitlesInput {
  topic: string;
  language?: string;
}

export interface GenerateArticleTitlesOutput {
  titles: string[];
}

export async function generateArticleTitles(
  input: GenerateArticleTitlesInput
): Promise<GenerateArticleTitlesOutput> {
  const prompt = `You are an expert blog title generator. Given the following topic, please generate 5 engaging and creative blog titles.${
    input.language ? ` The titles must be in the following language: ${input.language}.` : ''
  }

Topic: ${input.topic}

Please respond with a JSON object in this format:
{
  "titles": ["title1", "title2", "title3", "title4", "title5"]
}`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse titles from AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return { titles: parsed.titles || [] };
}
