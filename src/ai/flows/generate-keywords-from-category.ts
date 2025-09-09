
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating SEO keywords based on a blog post category.
 *
 * It exports:
 * - `generateKeywordsFromCategory`: An async function that takes a category and returns a list of suggested SEO keywords.
 * - `GenerateKeywordsInput`: The input type for the `generateKeywordsFromCategory` function.
 * - `GenerateKeywordsOutput`: The output type for the `generateKeywordsFromCategory` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKeywordsInputSchema = z.object({
  category: z
    .string()
    .describe('The category of the blog post. The AI will generate relevant SEO keywords based on this category.'),
});
export type GenerateKeywordsInput = z.infer<typeof GenerateKeywordsInputSchema>;


const GenerateKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of suggested SEO keywords.'),
});
export type GenerateKeywordsOutput = z.infer<typeof GenerateKeywordsOutputSchema>;


export async function generateKeywordsFromCategory(
  input: GenerateKeywordsInput
): Promise<GenerateKeywordsOutput> {
  return generateKeywordsFlow(input);
}

const generateKeywordsPrompt = ai.definePrompt({
  name: 'generateKeywordsPrompt',
  input: {schema: GenerateKeywordsInputSchema},
  output: {schema: GenerateKeywordsOutputSchema},
  prompt:
    'You are an SEO expert. Given the following blog post category, please generate a list of 10 relevant and high-traffic SEO keywords:\n\nCategory: {{{category}}}',
});

const generateKeywordsFlow = ai.defineFlow(
  {
    name: 'generateKeywordsFlow',
    inputSchema: GenerateKeywordsInputSchema,
    outputSchema: GenerateKeywordsOutputSchema,
  },
  async input => {
    const {output} = await generateKeywordsPrompt(input);
    return output!;
  }
);
