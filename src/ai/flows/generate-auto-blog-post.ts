

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
import {generateBlogImage} from './generate-blog-image';
import {saveArticle} from '@/lib/articles';

const GenerateAutoBlogPostInputSchema = z.object({
  userId: z.string().describe('The ID of the user generating the post.'),
  category: z.string().describe('The category of the blog post.'),
  keywords: z.string().describe('SEO keywords for the blog post.'),
  useRandomKeyword: z.boolean().optional().describe('Whether to use a random keyword from the list.'),
  paragraphs: z.string().describe('Number of paragraphs for the post.'),
  words: z.string().describe('Approximate word count for the post.'),
  publishAction: z.enum(['draft', 'publish']).describe('Action to take after generation.'),
  generateImage: z.boolean().describe('Whether to generate a featured image for the post.'),
  contentAlignment: z.enum(['center', 'left', 'full']).describe('The alignment for the post content.'),
  inContentImages: z.string().describe("Rules for inserting images within content (e.g., 'none', 'every', '2,5')."),
  inContentImagesAlignment: z.enum(['center', 'all-left', 'all-right', 'alternate-left', 'alternate-right']).describe("Alignment of in-content images."),
  paragraphSpacing: z.enum(['small', 'medium', 'large']).describe('The spacing between paragraphs.'),
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

    // 1. Generate a title.
    let titleTopicString = input.keywords;
    if (input.useRandomKeyword) {
      const keywordList = input.keywords.split(',').map(k => k.trim()).filter(Boolean);
      if (keywordList.length > 0) {
        titleTopicString = keywordList[Math.floor(Math.random() * keywordList.length)];
      }
    }
    
    if (!titleTopicString) {
        throw new Error("Cannot generate a title without either keywords or a category.");
    }
    const titleTopic: GenerateArticleTitlesInput = {
      topic: `${input.category}: ${titleTopicString}`,
    };
    const titlesOutput = await generateArticleTitles(titleTopic);
    const title = titlesOutput.titles[0] || 'Untitled Post';

    // 2. Draft the blog post text
    const draftOutput = await draftBlogPostFromTitle({title});
    let content = draftOutput.draft;

    // 3. Generate a featured image (optional)
    let featuredImageUrl: string | null = null;
    if (input.generateImage) {
      try {
        const imageOutput = await generateBlogImage({
            title, 
            category: input.category,
            keywords: titleTopicString,
        });
        featuredImageUrl = imageOutput.imageUrl;
      } catch (error) {
          console.error("Featured image generation failed, proceeding without image:", error);
      }
    }

    // 4. Generate in-content images (optional)
    const inContentImageRule = input.inContentImages.toLowerCase().trim();
    if (inContentImageRule && inContentImageRule !== 'none') {
        const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
        const newContentParts: string[] = [];

        // Determine which paragraphs get an image
        const imageParagraphIndices = new Set<number>();
        const ruleParts = inContentImageRule.split('-')
        if (ruleParts[0] === 'every') {
            const interval = ruleParts.length > 1 ? parseInt(ruleParts[1], 10) : 1;
            if (interval > 0) {
                for (let i = 0; i < paragraphs.length; i++) {
                    if ((i + 1) % interval === 0) {
                        imageParagraphIndices.add(i);
                    }
                }
            }
        } else {
            inContentImageRule.split(',').forEach(numStr => {
                const num = parseInt(numStr.trim(), 10);
                if (!isNaN(num) && num > 0 && num <= paragraphs.length) {
                    imageParagraphIndices.add(num - 1); // convert to 0-based index
                }
            });
        }
        
        const alignmentSetting = input.inContentImagesAlignment;
        let imageCounter = 0;

        for (let i = 0; i < paragraphs.length; i++) {
            newContentParts.push(paragraphs[i]);

            if (imageParagraphIndices.has(i)) {
                 try {
                    console.log(`Generating in-content image for paragraph ${i + 1}...`);
                    const imageOutput = await generateBlogImage({
                        title: `Image for article: ${title}`,
                        category: input.category,
                        keywords: paragraphs[i].substring(0, 200), // Use paragraph content as keywords
                    });

                    if (imageOutput.imageUrl) {
                        let alignmentClass = '';
                        switch (alignmentSetting) {
                            case 'all-left':
                                alignmentClass = 'in-content-image float-left mr-4 mb-4 w-1/3';
                                break;
                            case 'all-right':
                                alignmentClass = 'in-content-image float-right ml-4 mb-4 w-1/3';
                                break;
                            case 'alternate-left':
                                alignmentClass = imageCounter % 2 === 0
                                    ? 'in-content-image float-left mr-4 mb-4 w-1/3'
                                    : 'in-content-image float-right ml-4 mb-4 w-1/3';
                                break;
                            case 'alternate-right':
                                alignmentClass = imageCounter % 2 === 0
                                    ? 'in-content-image float-right ml-4 mb-4 w-1/3'
                                    : 'in-content-image float-left mr-4 mb-4 w-1/3';
                                break;
                            case 'center':
                            default:
                                alignmentClass = 'in-content-image block my-4 w-full';
                                break;
                        }
                        
                        // The wrapping div with 'clearfix' is important for float layouts
                        const imageHtml = `<div class="clearfix my-4">
                            <img src="${imageOutput.imageUrl}" alt="In-content image related to ${title}" class="rounded-lg shadow-md ${alignmentClass}" />
                        </div>`;
                        newContentParts.push(imageHtml);
                        imageCounter++;
                    }
                } catch (error) {
                    console.error(`In-content image generation for paragraph ${i + 1} failed, skipping:`, error);
                }
            }
        }
        content = newContentParts.join('\n\n');
    }


    // 5. Save the final article to Firestore
    const articleId = await saveArticle({
      title,
      content,
      status: input.publishAction,
      authorId: input.userId,
      category: input.category,
      keywords: input.keywords ? input.keywords.split(',').map(kw => kw.trim()) : [],
      imageUrl: featuredImageUrl,
      contentAlignment: input.contentAlignment,
      paragraphSpacing: input.paragraphSpacing,
      inContentImages: input.inContentImages,
      inContentImagesAlignment: input.inContentImagesAlignment,
    });

    return {articleId};
  }
);

    