
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
import { generateTagsForArticle } from './generate-tags-for-article';
import {saveArticle} from '@/lib/articles';

const GenerateAutoBlogPostInputSchema = z.object({
  userId: z.string().describe('The ID of the user generating the post.'),
  category: z.string().describe('The category of the blog post.'),
  keywords: z.string().describe('SEO keywords for the blog post.'),
  titleMode: z.enum(['auto', 'manual']).describe('Whether to generate the title automatically or use a manual one.'),
  manualTitle: z.string().optional().describe('The manual title to use if titleMode is "manual".'),
  useRandomKeyword: z.boolean().optional().describe('Whether to use a random keyword from the list.'),
  paragraphs: z.string().describe('Number of paragraphs for the post.'),
  words: z.string().describe('Approximate word count for the post.'),
  publishAction: z.enum(['draft', 'publish']).describe('Action to take after generation.'),
  featuredImageMode: z.enum(['ai', 'random', 'none']).describe("Controls how the featured image is generated."),
  randomImageUrlList: z.array(z.string()).optional().describe("A list of image URLs to choose from when mode is 'random'."),
  backgroundImageMode: z.enum(['ai', 'random', 'none']).describe("Controls how the background image is generated."),
  randomBgImageUrlList: z.array(z.string()).optional().describe("A list of background image URLs to choose from when mode is 'random'."),
  inContentImagesMode: z.enum(['ai', 'random', 'none']).describe("Controls how in-content images are generated."),
  randomInContentImageUrlList: z.array(z.string()).optional().describe("A list of image URLs to choose from for in-content images when mode is 'random'."),
  websiteNameWatermark: z.string().optional().describe('Text to be added as a watermark on generated images.'),
  contentAlignment: z.enum(['center', 'left', 'full']).describe('The alignment for the post content.'),
  inContentImages: z.string().describe("Rules for inserting images within content (e.g., 'none', 'every', '2,5')."),
  inContentImagesAlignment: z.enum(['center', 'all-left', 'all-right', 'alternate-left', 'alternate-right']).describe("Alignment of in-content images."),
  paragraphSpacing: z.enum(['small', 'medium', 'large']).describe('The spacing between paragraphs.'),
  addTags: z.boolean().describe('Whether to add tags to the post.'),
  tagGenerationMode: z.enum(['auto', 'manual']).describe('How to generate tags.'),
  manualTags: z.array(z.string()).optional().describe('A list of manual tags to add.'),
  numberOfTags: z.string().describe('The number of tags to generate or add.'),
  enableComments: z.boolean().describe('Whether to enable comments on the post.'),
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

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    console.log('Starting auto blog post generation...');


    const keywordList = input.keywords.split(',').map(k => k.trim()).filter(Boolean);
    
    if (keywordList.length === 0) {
        throw new Error("The keyword list is empty. Please provide keywords in the Auto Blogger setup.");
    }
    
    let title = '';
    let titleTopicString = input.keywords;
    
    if (input.titleMode === 'manual' && input.manualTitle) {
      console.log('Using manual title.');
      title = input.manualTitle;
    } else {
        console.log('Generating title automatically.');
        if (input.useRandomKeyword) {
          if (keywordList.length > 0) {
            titleTopicString = keywordList[Math.floor(Math.random() * keywordList.length)];
            console.log(`Using random keyword for title: ${titleTopicString}`);
          }
        }
        
        if (!titleTopicString) {
            throw new Error("Cannot generate a title without either keywords or a category.");
        }
        const titleTopic: GenerateArticleTitlesInput = {
          topic: `${input.category}: ${titleTopicString}`,
        };
        const titlesOutput = await generateArticleTitles(titleTopic);
        title = titlesOutput.titles[0] || 'Untitled Post';
        console.log(`Generated title: ${title}`);
    }

    if (!title) {
      throw new Error('Could not determine a title for the blog post.');
    }


    // 2. Draft the blog post text
    console.log('Drafting blog post content...');
    const draftOutput = await draftBlogPostFromTitle({
      title,
      paragraphs: input.paragraphs,
      words: input.words,
    });
    const textContent = draftOutput.draft; // Plain text content
    console.log('Blog post content drafted.');

    // 3. Generate tags from plain text content (before adding HTML/images)
    let tags: string[] = [];
    if (input.addTags) {
        console.log('Generating tags...');
        if (input.tagGenerationMode === 'auto') {
            const tagsOutput = await generateTagsForArticle({
                articleTitle: title,
                articleContent: textContent, // Use plain text for tag generation
                numberOfTags: input.numberOfTags,
            });
            tags = tagsOutput.tags;
            console.log(`Auto-generated ${tags.length} tags.`);
        } else {
            tags = input.manualTags || [];
            const numTags = parseInt(input.numberOfTags, 10);
            if (!isNaN(numTags) && numTags > 0) {
                tags = tags.slice(0, numTags);
            }
            console.log(`Using ${tags.length} manual tags.`);
        }
    }

    // 4. Handle featured image generation based on the selected mode.
    let featuredImageUrl: string | null = null;
    if (input.featuredImageMode === 'ai') {
        console.log('Generating AI featured image...');
        const imageOutput = await generateBlogImage({
            title, 
            category: input.category,
            keywords: titleTopicString,
            type: 'featured',
            websiteNameWatermark: input.websiteNameWatermark,
        });
        featuredImageUrl = imageOutput.imageUrl;
        console.log('AI featured image generated:', featuredImageUrl);
        await delay(2000); // Add delay
    } else if (input.featuredImageMode === 'random' && input.randomImageUrlList && input.randomImageUrlList.length > 0) {
        featuredImageUrl = input.randomImageUrlList[Math.floor(Math.random() * input.randomImageUrlList.length)];
        console.log('Selected random featured image:', featuredImageUrl);
    }

    // 5. Handle background image generation
    let backgroundImageUrl: string | null = null;
    if (input.backgroundImageMode === 'ai') {
        console.log('Generating AI background image...');
        const imageOutput = await generateBlogImage({
            title, 
            category: input.category,
            keywords: `abstract, pattern, subtle, ${titleTopicString}`,
            type: 'background',
            websiteNameWatermark: input.websiteNameWatermark,
        });
        backgroundImageUrl = imageOutput.imageUrl;
        console.log('AI background image generated:', backgroundImageUrl);
        await delay(2000); // Add delay
    } else if (input.backgroundImageMode === 'random' && input.randomBgImageUrlList && input.randomBgImageUrlList.length > 0) {
        backgroundImageUrl = input.randomBgImageUrlList[Math.floor(Math.random() * input.randomBgImageUrlList.length)];
        console.log('Selected random background image:', backgroundImageUrl);
    }


    // 6. Generate in-content images and format paragraphs into final HTML
    const inContentImageRule = input.inContentImages?.toLowerCase().trim();
    const paragraphs = textContent.split('\n\n').filter(p => p.trim() !== '');
    const newContentParts: string[] = [];
    let finalContent = '';

    if (input.inContentImagesMode !== 'none' && inContentImageRule && inContentImageRule !== 'none') {
        console.log(`Processing in-content images with rule: ${inContentImageRule}`);
        const imageParagraphIndices = new Set<number>();
        const ruleParts = inContentImageRule.split('-');
        
        if (ruleParts[0] === 'every') {
            const interval = ruleParts.length > 1 ? parseInt(ruleParts[1], 10) : 2;
            if (!isNaN(interval) && interval > 0) {
                for (let i = interval - 1; i < paragraphs.length; i += interval) {
                    imageParagraphIndices.add(i);
                }
            }
        } else {
            inContentImageRule.split(',').forEach(numStr => {
                const num = parseInt(numStr.trim(), 10);
                if (!isNaN(num) && num > 0 && num <= paragraphs.length) {
                    imageParagraphIndices.add(num - 1); 
                }
            });
        }
        
        const alignmentSetting = input.inContentImagesAlignment;
        let imageCounter = 0;
        
        for (let i = 0; i < paragraphs.length; i++) {
            newContentParts.push(`<p>${paragraphs[i]}</p>`);

            if (imageParagraphIndices.has(i)) {
                 let imageUrl: string | null = null;
                 if (input.inContentImagesMode === 'ai') {
                    console.log(`Generating AI in-content image for paragraph ${i + 1}...`);
                    const imageOutput = await generateBlogImage({
                        title: `Image for article: ${title}`,
                        category: input.category,
                        keywords: paragraphs[i].substring(0, 200),
                        type: 'in-content',
                        websiteNameWatermark: input.websiteNameWatermark,
                    });
                    imageUrl = imageOutput.imageUrl;
                    console.log(`AI in-content image for paragraph ${i + 1} generated:`, imageUrl);
                    await delay(2000); // Add delay
                } else if (input.inContentImagesMode === 'random' && input.randomInContentImageUrlList && input.randomInContentImageUrlList.length > 0) {
                    imageUrl = input.randomInContentImageUrlList[Math.floor(Math.random() * input.randomInContentImageUrlList.length)];
                    console.log(`Selected random in-content image for paragraph ${i + 1}:`, imageUrl);
                }

                if (imageUrl) {
                    let alignmentClass = '';
                    switch (alignmentSetting) {
                        case 'all-left':
                            alignmentClass = 'in-content-image float-left mr-4 mb-4 w-full md:w-1/3';
                            break;
                        case 'all-right':
                            alignmentClass = 'in-content-image float-right ml-4 mb-4 w-full md:w-1/3';
                            break;
                        case 'alternate-left':
                            alignmentClass = imageCounter % 2 === 0
                                ? 'in-content-image float-left mr-4 mb-4 w-full md:w-1/3'
                                : 'in-content-image float-right ml-4 mb-4 w-full md:w-1/3';
                            break;
                        case 'alternate-right':
                            alignmentClass = imageCounter % 2 === 0
                                ? 'in-content-image float-right ml-4 mb-4 w-full md:w-1/3'
                                : 'in-content-image float-left mr-4 mb-4 w-full md:w-1/3';
                            break;
                        case 'center':
                        default:
                            alignmentClass = 'in-content-image block my-4 w-full';
                            break;
                    }
                    
                    const imageHtml = `<div class="clearfix my-4">
                        <img src="${imageUrl}" alt="In-content image related to ${title}" class="rounded-lg shadow-md ${alignmentClass}" />
                    </div>`;
                    newContentParts.push(imageHtml);
                    imageCounter++;
                }
            }
        }
        finalContent = newContentParts.join(''); 
    } else {
        console.log('No in-content images to process.');
        finalContent = paragraphs.map(p => `<p>${p}</p>`).join('');
    }

    // 7. Save the final article to Firestore
    console.log('Saving final article to database...');
    const articleId = await saveArticle({
      title,
      content: finalContent,
      status: input.publishAction,
      authorId: input.userId,
      category: input.category,
      keywords: input.keywords ? input.keywords.split(',').map(kw => kw.trim()) : [],
      tags,
      imageUrl: featuredImageUrl,
      backgroundImageUrl: backgroundImageUrl,
      contentAlignment: input.contentAlignment,
      paragraphSpacing: input.paragraphSpacing,
      inContentImages: input.inContentImages,
      inContentImagesAlignment: input.inContentImagesAlignment,
      commentsEnabled: input.enableComments,
    });
    console.log(`Article saved with ID: ${articleId}`);

    return {articleId};
  }
);

    