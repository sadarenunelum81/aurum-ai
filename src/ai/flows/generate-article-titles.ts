'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating article titles based on keywords or a topic description.
 *
 * It exports:
 * - `generateArticleTitles`: An async function that takes keywords or a topic description and returns a list of suggested article titles.
 * - `GenerateArticleTitlesInput`: The input type for the `generateArticleTitles` function, defining the keywords or topic description.
 * - `GenerateArticleTitlesOutput`: The output type for the `generateArticleTitles` function, which is a list of article titles.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArticleTitlesInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'Keywords or a brief description of the article topic.  The AI will use this to generate possible titles.'
    ),
});

export type GenerateArticleTitlesInput = z.infer<
  typeof GenerateArticleTitlesInputSchema
>;

const GenerateArticleTitlesOutputSchema = z.object({
  titles: z
    .array(z.string())
    .describe('An array of suggested article titles.'),
});

export type GenerateArticleTitlesOutput = z.infer<
  typeof GenerateArticleTitlesOutputSchema
>;

export async function generateArticleTitles(
  input: GenerateArticleTitlesInput
): Promise<GenerateArticleTitlesOutput> {
  return generateArticleTitlesFlow(input);
}

const generateArticleTitlesPrompt = ai.definePrompt({
  name: 'generateArticleTitlesPrompt',
  input: {schema: GenerateArticleTitlesInputSchema},
  output: {schema: GenerateArticleTitlesOutputSchema},
  prompt:
    'You are an expert blog title generator. Given the following topic, please generate 5 engaging and creative blog titles:\n\nTopic: {{{topic}}}',
});

const generateArticleTitlesFlow = ai.defineFlow(
  {
    name: 'generateArticleTitlesFlow',
    inputSchema: GenerateArticleTitlesInputSchema,
    outputSchema: GenerateArticleTitlesOutputSchema,
  },
  async input => {
    const {output} = await generateArticleTitlesPrompt(input);
    return output!;
  }
);
