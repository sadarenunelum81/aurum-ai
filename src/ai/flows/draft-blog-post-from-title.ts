'use server';

import { getModel } from '@/ai/gemini-client';

export interface DraftBlogPostFromTitleInput {
  title: string;
  paragraphs?: string;
  words?: string;
  language?: string;
}

export interface DraftBlogPostFromTitleOutput {
  draft: string;
}

export async function draftBlogPostFromTitle(
  input: DraftBlogPostFromTitleInput
): Promise<DraftBlogPostFromTitleOutput> {
  let prompt = `You are an expert blog post writer. Your task is to generate a full draft of a blog post based on the provided title and constraints.

The generated blog post must include a compelling introduction, a well-structured body, and a concise conclusion.`;

  if (input.language) {
    prompt += `\nThe blog post must be written in the following language: ${input.language}.`;
  }

  prompt += `\n\n**Constraints:**\nYou MUST adhere to the following constraints for the generated content.\n- Title: ${input.title}`;

  if (input.paragraphs) {
    prompt += `\n- **Paragraphs:** You MUST generate exactly ${input.paragraphs} paragraphs.`;
  }

  if (input.words) {
    prompt += `\n- **Word Count:** The total word count MUST be approximately ${input.words} words.`;
  }

  prompt += `\n\nGenerate the blog post draft now. Respond with a JSON object in this format:\n{\n  "draft": "your full blog post text here"\n}`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse draft from AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return { draft: parsed.draft || '' };
}
