'use server';

/**
 * @fileOverview AI flow for adjusting the style (tone, length, and complexity) of a given article.
 *
 * - adjustArticleStyle - A function that handles the article style adjustment process.
 * - AdjustArticleStyleInput - The input type for the adjustArticleStyle function.
 * - AdjustArticleStyleOutput - The return type for the adjustArticleStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustArticleStyleInputSchema = z.object({
  article: z.string().describe('The article content to adjust.'),
  tone: z
    .string()
    .optional()
    .describe(
      'The desired tone of the article (e.g., formal, informal, professional).'
    ),
  length: z
    .string()
    .optional()
    .describe(
      'The desired length of the article (e.g., shorter, longer, same).'
    ),
  complexity: z
    .string()
    .optional()
    .describe(
      'The desired complexity of the article (e.g., simpler, more complex).'
    ),
});
export type AdjustArticleStyleInput = z.infer<typeof AdjustArticleStyleInputSchema>;

const AdjustArticleStyleOutputSchema = z.object({
  adjustedArticle: z.string().describe('The adjusted article content.'),
});
export type AdjustArticleStyleOutput = z.infer<typeof AdjustArticleStyleOutputSchema>;

export async function adjustArticleStyle(
  input: AdjustArticleStyleInput
): Promise<AdjustArticleStyleOutput> {
  return adjustArticleStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustArticleStylePrompt',
  input: {schema: AdjustArticleStyleInputSchema},
  output: {schema: AdjustArticleStyleOutputSchema},
  prompt: `You are an AI assistant specializing in adjusting the style of articles.

  Please adjust the following article based on the user's specifications for tone, length, and complexity.

  Original Article: {{{article}}}

  Tone: {{{tone}}}
  Length: {{{length}}}
  Complexity: {{{complexity}}}

  Adjusted Article:`, //Crucially, the prompt should instruct the LLM to rewrite the document, not just edit in-place.
});

const adjustArticleStyleFlow = ai.defineFlow(
  {
    name: 'adjustArticleStyleFlow',
    inputSchema: AdjustArticleStyleInputSchema,
    outputSchema: AdjustArticleStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      adjustedArticle: output!.adjustedArticle,
    };
  }
);
