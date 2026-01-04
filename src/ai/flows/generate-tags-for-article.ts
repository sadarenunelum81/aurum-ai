
'use server';

import { getModel } from '@/ai/gemini-client';

export interface GenerateTagsForArticleInput {
  articleContent: string;
  articleTitle: string;
  numberOfTags: string;
  language?: string;
}

export interface GenerateTagsForArticleOutput {
  tags: string[];
}

export async function generateTagsForArticle(
  input: GenerateTagsForArticleInput
): Promise<GenerateTagsForArticleOutput> {
  let prompt = `You are an SEO and content marketing expert. Based on the following article title and content, generate exactly ${input.numberOfTags} relevant and engaging tags (hashtags).

The tags should be concise, relevant to the main topics of the article, and optimized for discoverability. Do not include the '#' symbol in the output tags.`;

  if (input.language) {
    prompt += `\nThe tags must be in the following language: ${input.language}.`;
  }

  prompt += `\n\nArticle Title: ${input.articleTitle}\n\nArticle Content:\n${input.articleContent}\n\nRespond with a JSON object in this format:\n{\n  "tags": ["tag1", "tag2", "tag3"]\n}`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse tags from AI response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  return { tags: parsed.tags || [] };
}
