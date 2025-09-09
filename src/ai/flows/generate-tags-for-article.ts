
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating SEO-friendly tags for a blog article.
 *
 * It exports:
 * - `generateTagsForArticle`: An async function that takes article content and returns a list of suggested tags.
 * - `GenerateTagsForArticleInput`: The input type for the `generateTagsForArticle` function.
 * - `GenerateTagsForArticleOutput`: The output type for the `generateTagsForArticle` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTagsForArticleInputSchema = z.object({
  articleContent: z.string().describe('The full content of the blog article.'),
  articleTitle: z.string().describe('The title of the blog article.'),
  numberOfTags: z
    .string()
    .describe('The desired number of tags to generate.'),
});
export type GenerateTagsForArticleInput = z.infer<typeof GenerateTagsForArticleInputSchema>;

const GenerateTagsForArticleOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of generated tags.'),
});
export type GenerateTagsForArticleOutput = z.infer<typeof GenerateTagsForArticleOutputSchema>;

export async function generateTagsForArticle(
  input: GenerateTagsForArticleInput
): Promise<GenerateTagsForArticleOutput> {
  return generateTagsFlow(input);
}

const generateTagsPrompt = ai.definePrompt({
  name: 'generateTagsPrompt',
  input: {schema: GenerateTagsForArticleInputSchema},
  output: {schema: GenerateTagsForArticleOutputSchema},
  prompt: `You are an SEO and content marketing expert. Based on the following article title and content, generate exactly {{{numberOfTags}}} relevant and engaging tags (hashtags).

The tags should be concise, relevant to the main topics of the article, and optimized for discoverability. Do not include the '#' symbol in the output tags.

Article Title: {{{articleTitle}}}

Article Content:
{{{articleContent}}}
`,
});

const generateTagsFlow = ai.defineFlow(
  {
    name: 'generateTagsFlow',
    inputSchema: GenerateTagsForArticleInputSchema,
    outputSchema: GenerateTagsForArticleOutputSchema,
  },
  async input => {
    const {output} = await generateTagsPrompt(input);
    return output!;
  }
);
