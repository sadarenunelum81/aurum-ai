
'use server';

/**
 * @fileOverview This file defines a Genkit flow for orchestrating the generation of a full blog post.
 *
 * It exports:
 * - `generateAutoBlogPost`: An async function that takes configuration, generates a title, content, and optionally an image, then saves it to Firestore.
 * - `GenerateAutoBlogPostInput`: The input type for the `generateAutoBlogPost` function.
 * - `GenerateAutoBlogPostOutput`: The output type for the `generateAutoBlogPost` function, containing the ID of the saved article.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  generateArticleTitles,
  GenerateArticleTitlesInput,
} from './generate-article-titles';
import {draftBlogPostFromTitle} from './draft-blog-post-from-title';
import {generateBlogImage, GenerateBlogImageInput} from './generate-blog-image';
import {saveArticle} from '@/lib/articles';

const GenerateAutoBlogPostInputSchema = z.object({
  userId: z.string().describe('The ID of the user generating the post.'),
  category: z.string().describe('The category of the blog post.'),
  keywords: z.string().describe('SEO keywords for the blog post.'),
  paragraphs: z.string().describe('Number of paragraphs for the post.'),
  words: z.string().describe('Approximate word count for the post.'),
  publishAction: z.enum(['draft', 'publish']).describe('Action to take after generation.'),
  generateImage: z.boolean().describe('Whether to generate an image for the post.'),
});
export type GenerateAutoBlogPostInput = z.infer<
  typeof GenerateAutoBlogPostInputSchema
>;

const GenerateAutoBlogPostOutputSchema = z.object({
  articleId: z.string().describe('The ID of the saved article.'),
});
export type GenerateAutoBlogPostOutput = z.infer<
  typeof GenerateAutoBlogPostOutputSchema
>;

export async function generateAutoBlogPost(
  input: GenerateAutoBlogPostInput
): Promise<GenerateAutoBlogPostOutput> {
    return generateAutoBlogPostFlow(input);
}

const generateAutoBlogPostFlow = ai.defineFlow(
  {
    name: 'generateAutoBlogPostFlow',
    inputSchema: GenerateAutoBlogPostInputSchema,
    outputSchema: GenerateAutoBlogPostOutputSchema,
  },
  async input => {
    if (!input.userId) {
      throw new Error('User is not authenticated.');
    }

    // 1. Generate a title
    const titleTopic: GenerateArticleTitlesInput = {
      topic: `${input.category}: ${input.keywords}`,
    };
    const titlesOutput = await generateArticleTitles(titleTopic);
    const title = titlesOutput.titles[0] || 'Untitled Post'; // Fallback title

    // 2. Draft the blog post
    const draftOutput = await draftBlogPostFromTitle({title});
    const content = draftOutput.draft;

    // 3. Generate an image (optional)
    let imageDataUri: string | null = null;
    if (input.generateImage) {
      try {
        const imageOutput = await generateBlogImage({title});
        imageDataUri = imageOutput.imageDataUri;
      } catch (error) {
          console.error("Image generation failed, proceeding without image:", error);
          // The flow will continue with imageDataUri as null
      }
    }

    // 4. Save the article to Firestore
    const articleId = await saveArticle({
      title,
      content,
      status: input.publishAction,
      authorId: input.userId,
      category: input.category,
      keywords: input.keywords.split(',').map(kw => kw.trim()),
      imageDataUri: imageDataUri,
    });

    return {articleId};
  }
);
