
'use server';

import {
  generateArticleTitles,
  GenerateArticleTitlesInput,
  GenerateArticleTitlesOutput,
} from '@/ai/flows/generate-article-titles';
import {
  draftBlogPostFromTitle,
  DraftBlogPostFromTitleInput,
  DraftBlogPostFromTitleOutput,
} from '@/ai/flows/draft-blog-post-from-title';
import {
  adjustArticleStyle,
  AdjustArticleStyleInput,
  AdjustArticleStyleOutput,
} from '@/ai/flows/adjust-article-style';
import {
  optimizeContentForSEO,
  OptimizeContentForSEOInput,
  OptimizeContentForSEOOutput,
} from '@/ai/flows/optimize-content-for-seo';
import { 
  generateKeywordsFromCategory,
  GenerateKeywordsInput,
  GenerateKeywordsOutput,
} from '@/ai/flows/generate-keywords-from-category';


type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function generateTitlesAction(
  data: GenerateArticleTitlesInput
): Promise<ActionResult<GenerateArticleTitlesOutput>> {
  try {
    const result = await generateArticleTitles(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating titles:', error);
    return { success: false, error: 'Failed to generate titles. Please try again.' };
  }
}

export async function draftArticleAction(
  data: DraftBlogPostFromTitleInput
): Promise<ActionResult<DraftBlogPostFromTitleOutput>> {
  try {
    const result = await draftBlogPostFromTitle(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error drafting article:', error);
    return { success: false, error: 'Failed to draft article. Please try again.' };
  }
}

export async function adjustStyleAction(
  data: AdjustArticleStyleInput
): Promise<ActionResult<AdjustArticleStyleOutput>> {
  try {
    const result = await adjustArticleStyle(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error adjusting style:', error);
    return { success: false, error: 'Failed to adjust article style. Please try again.' };
  }
}

export async function optimizeSeoAction(
  data: OptimizeContentForSEOInput
): Promise<ActionResult<OptimizeContentForSEOOutput>> {
  try {
    if (!data.keywords) {
      return { success: false, error: 'Keywords are required for SEO optimization.' };
    }
    const result = await optimizeContentForSEO(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error optimizing for SEO:', error);
    return { success: false, error: 'Failed to optimize for SEO. Please try again.' };
  }
}

export async function generateKeywordsAction(
  data: GenerateKeywordsInput
): Promise<ActionResult<GenerateKeywordsOutput>> {
  try {
    const result = await generateKeywordsFromCategory(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating keywords:', error);
    return { success: false, error: 'Failed to generate keywords. Please try again.' };
  }
}
