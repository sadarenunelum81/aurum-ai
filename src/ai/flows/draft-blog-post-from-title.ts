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
  paragraphs: z
    .string()
    .optional()
    .describe('The desired number of paragraphs in the blog post.'),
  words: z
    .string()
    .optional()
    .describe('The approximate desired word count for the blog post.'),
  language: z.string().optional().describe('The language for the blog post.'),
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
  prompt: `You are an expert blog post writer. Your task is to generate a full draft of a blog post based on the provided title and constraints.

The generated blog post must include a compelling introduction, a well-structured body, and a concise conclusion.
{{#if language}}The blog post must be written in the following language: {{{language}}}.{{/if}}

**Constraints:**
You MUST adhere to the following constraints for the generated content.
- Title: {{{title}}}
{{#if paragraphs}}- **Paragraphs:** You MUST generate exactly {{{paragraphs}}} paragraphs.{{/if}}
{{#if words}}- **Word Count:** The total word count MUST be approximately {{{words}}} words.{{/if}}

Generate the blog post draft now.`,
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
