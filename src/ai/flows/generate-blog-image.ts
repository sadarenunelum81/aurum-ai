'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a blog post cover image.
 *
 * It exports:
 * - `generateBlogImage`: An async function that takes an article title and returns an image data URI.
 * - `GenerateBlogImageInput`: The input type for the `generateBlogImage` function.
 * - `GenerateBlogImageOutput`: The output type for the `generateBlogImage` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogImageInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  category: z.string().describe('The category of the blog post.'),
  keywords: z.string().describe('The keywords for the blog post.'),
});
export type GenerateBlogImageInput = z.infer<typeof GenerateBlogImageInputSchema>;

const GenerateBlogImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The generated image as a Base64 data URI.'),
});
export type GenerateBlogImageOutput = z.infer<
  typeof GenerateBlogImageOutputSchema
>;

export async function generateBlogImage(
  input: GenerateBlogImageInput
): Promise<GenerateBlogImageOutput> {
  return generateBlogImageFlow(input);
}

const generateImagePrompt = ai.definePrompt(
  {
    name: 'generateImagePrompt',
    input: { schema: GenerateBlogImageInputSchema },
    output: { schema: z.object({ imagePrompt: z.string() }) },
    prompt: `You are an expert in creating prompts for image generation models.
    Based on the blog post details below, create a short, descriptive prompt for generating a cover image.
    The prompt should be suitable for a text-to-image model like Imagen.
    Describe a visually appealing scene that captures the essence of the topic.
    Focus on creating a photorealistic and engaging image.

    Blog Post Title: {{{title}}}
    Category: {{{category}}}
    Keywords: {{{keywords}}}
    `,
  },
);

const generateBlogImageFlow = ai.defineFlow(
  {
    name: 'generateBlogImageFlow',
    inputSchema: GenerateBlogImageInputSchema,
    outputSchema: GenerateBlogImageOutputSchema,
  },
  async input => {
    // 1. Generate a good prompt for the image model
    const { output } = await generateImagePrompt(input);
    const imagePrompt = output!.imagePrompt;
    
    // 2. Generate the image using the prompt
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: imagePrompt,
    });

    if (!media.url) {
        throw new Error('Image generation failed to return a data URI.');
    }

    return {
      imageDataUri: media.url,
    };
  }
);
