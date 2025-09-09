'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a draft blog post from a given title.
 *
 * - draftBlogPostFromTitle - A function that generates a blog post draft from a title.
 * - DraftBlogPostFromTitleInput - The input type for the draftBlogPostFromTitle function.
 * - DraftBlogPostFromTitleOutput - The return type for the draftBlogPostFromTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftBlogPostFromTitleInputSchema = z.object({
  title: z.string().describe('The title of the blog post to generate.'),
});
export type DraftBlogPostFromTitleInput = z.infer<typeof DraftBlogPostFromTitleInputSchema>;

const DraftBlogPostFromTitleOutputSchema = z.object({
  draft: z.string().describe('The generated draft of the blog post.'),
});
export type DraftBlogPostFromTitleOutput = z.infer<typeof DraftBlogPostFromTitleOutputSchema>;

export async function draftBlogPostFromTitle(input: DraftBlogPostFromTitleInput): Promise<DraftBlogPostFromTitleOutput> {
  return draftBlogPostFromTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftBlogPostFromTitlePrompt',
  input: {schema: DraftBlogPostFromTitleInputSchema},
  output: {schema: DraftBlogPostFromTitleOutputSchema},
  prompt: `You are an expert blog post writer. Please generate a full draft of a blog post, including an introduction, body paragraphs, and a conclusion, based on the following title:\n\nTitle: {{{title}}}`,
});

const draftBlogPostFromTitleFlow = ai.defineFlow(
  {
    name: 'draftBlogPostFromTitleFlow',
    inputSchema: DraftBlogPostFromTitleInputSchema,
    outputSchema: DraftBlogPostFromTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
