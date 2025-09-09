
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a blog post cover image.
 * This flow generates an image and then calls the upload-image flow to host it.
 *
 * It exports:
 * - `generateBlogImage`: An async function that takes article details and returns a hosted image URL.
 * - `GenerateBlogImageInput`: The input type for the `generateBlogImage` function.
 * - `GenerateBlogImageOutput`: The output type for the `generateBlogImage` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { uploadImage } from './upload-image';

const GenerateBlogImageInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  category: z.string().describe('The category of the blog post.'),
  keywords: z.string().describe('The keywords for the blog post.'),
  type: z.enum(['featured', 'in-content', 'background']).describe('The type of image to generate.'),
  websiteNameWatermark: z.string().optional().describe('Text to be added as a watermark on the image.'),
});
export type GenerateBlogImageInput = z.infer<typeof GenerateBlogImageInputSchema>;

const GenerateBlogImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The publicly hosted URL of the generated image.'),
});
export type GenerateBlogImageOutput = z.infer<
  typeof GenerateBlogImageOutputSchema
>;

export async function generateBlogImage(
  input: GenerateBlogImageInput
): Promise<GenerateBlogImageOutput> {
  return generateBlogImageFlow(input);
}

const generateBlogImageFlow = ai.defineFlow(
  {
    name: 'generateBlogImageFlow',
    inputSchema: GenerateBlogImageInputSchema,
    outputSchema: GenerateBlogImageOutputSchema,
  },
  async input => {
    
    let imagePrompt = '';
    if (input.type === 'background') {
         imagePrompt = `Create a very subtle, minimalist, and abstract background image for a blog post. The design should be elegant and not distracting, using a soft, muted color palette related to the topic. Focus on gentle gradients, soft textures, or simple, non-intrusive patterns. The image must be high-quality and contain no text or recognizable objects.

Topic: ${input.category}
Keywords: ${input.keywords}`;
    } else {
         imagePrompt = `Create a photorealistic, high-quality blog post header image that is suitable for a text-to-image model like Imagen. The image should be visually appealing and capture the essence of the topic described below. Do not include any text in the image.

Blog Post Title: ${input.title}
Category: ${input.category}
Keywords: ${input.keywords}`;
    }

    if (input.websiteNameWatermark) {
        imagePrompt += `\n\nSubtly incorporate the text "${input.websiteNameWatermark}" into the image in a stylish, non-obtrusive way. It should look like a small, elegant watermark in one of the corners.`
    }


    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: imagePrompt,
    });

    if (!media?.url) {
        throw new Error('Image generation failed to return a data URI.');
    }
    const imageDataUri = media.url; // This is a Base64 data URI.

    // 2. Upload the generated image to get a public URL
    const { imageUrl } = await uploadImage({ imageDataUri });

    if (!imageUrl) {
        throw new Error('Image hosting failed to return a public URL.');
    }

    return {
      imageUrl,
    };
  }
);
