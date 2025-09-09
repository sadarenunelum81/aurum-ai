'use server';

/**
 * @fileOverview This file defines a Genkit flow for uploading an image to ImageBB.
 *
 * It exports:
 * - `uploadImage`: An async function that takes a Base64 image data URI and returns a public URL.
 * - `UploadImageInput`: The input type for the `uploadImage` function.
 * - `UploadImageOutput`: The output type for the `uploadImage` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UploadImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The Base64 encoded image data with a data URI prefix (e.g., 'data:image/png;base64,...')."
    ),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  imageUrl: z.string().describe('The public URL of the hosted image.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

export async function uploadImage(
  input: UploadImageInput
): Promise<UploadImageOutput> {
  return uploadImageFlow(input);
}

const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: UploadImageOutputSchema,
  },
  async ({ imageDataUri }) => {
    const apiKey = process.env.IMAGEBB_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ImageBB API key is not configured in environment variables.'
      );
    }

    // ImageBB expects the raw base64 data, without the data URI prefix.
    const base64Data = imageDataUri.substring(imageDataUri.indexOf(',') + 1);

    const formData = new FormData();
    formData.append('image', base64Data);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImageBB Upload Error:', errorText);
      throw new Error(
        `ImageBB upload failed with status ${response.status}: ${errorText}`
      );
    }

    const jsonResponse = await response.json();

    if (jsonResponse.success && jsonResponse.data && jsonResponse.data.url) {
      return { imageUrl: jsonResponse.data.url };
    } else {
      throw new Error(
        `ImageBB response did not include a success status or URL. Response: ${JSON.stringify(
          jsonResponse
        )}`
      );
    }
  }
);
