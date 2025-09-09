
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
import {
  generateAutoBlogPost,
  GenerateAutoBlogPostInput,
  GenerateAutoBlogPostOutput,
} from '@/ai/flows/generate-auto-blog-post';
import {
    generateTagsForArticle,
    GenerateTagsForArticleInput,
    GenerateTagsForArticleOutput
} from '@/ai/flows/generate-tags-for-article';
import { saveAutoBloggerConfig, getAutoBloggerConfig } from '@/lib/config';
import { getAllArticles, updateArticleStatus, deleteArticle, updateArticle } from '@/lib/articles';
import { getAllComments, updateCommentStatus, deleteComment as deleteCommentDb, addComment, getCommentsForArticle } from '@/lib/comments';
import type { AutoBloggerConfig, Article, Comment } from '@/types';
import * as fs from 'fs/promises';
import * as path from 'path';


type ActionResult<T> = { success: true; data: T } | { success: false; error: string; data?: any };

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

export async function generateTagsAction(
    data: GenerateTagsForArticleInput
): Promise<ActionResult<GenerateTagsForArticleOutput>> {
    try {
        const result = await generateTagsForArticle(data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating tags:', error);
        return { success: false, error: 'Failed to generate tags. Please try again.' };
    }
}


export async function saveApiKeysAction(data: {
    geminiApiKey: string;
    imagebbApiKey: string;
}): Promise<ActionResult<{}>> {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = '';
        try {
            envContent = await fs.readFile(envPath, 'utf-8');
        } catch (e: any) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }

        const lines = envContent.split('\n');
        const updatedLines: string[] = [];
        const keysToUpdate = {
            'GEMINI_API_KEY': data.geminiApiKey,
            'IMAGEBB_API_KEY': data.imagebbApiKey,
        };

        const keysFound = new Set<string>();

        for (const line of lines) {
            let found = false;
            for (const [key, value] of Object.entries(keysToUpdate)) {
                if (line.startsWith(`${key}=`)) {
                    if (value) {
                       updatedLines.push(`${key}=${value}`);
                    }
                    keysFound.add(key);
                    found = true;
                    break;
                }
            }
            if (!found && line) {
                updatedLines.push(line);
            }
        }
        
        for (const [key, value] of Object.entries(keysToUpdate)) {
            if (!keysFound.has(key) && value) {
                updatedLines.push(`${key}=${value}`);
            }
        }

        await fs.writeFile(envPath, updatedLines.join('\n'));

        // This is a temporary measure to make the new environment variables available without a restart.
        if (data.geminiApiKey) process.env.GEMINI_API_KEY = data.geminiApiKey;
        if (data.imagebbApiKey) process.env.IMAGEBB_API_KEY = data.imagebbApiKey;

        return { success: true, data: {} };
    } catch (error) {
        console.error('Error saving API keys:', error);
        return { success: false, error: 'Failed to save API keys to the .env file.' };
    }
}

export async function getApiKeyStatusAction(): Promise<ActionResult<{ geminiKeySet: boolean; imagebbKeySet: boolean }>> {
  try {
    const geminiKeySet = !!process.env.GEMINI_API_KEY;
    const imagebbKeySet = !!process.env.IMAGEBB_API_KEY;
    return { success: true, data: { geminiKeySet, imagebbKeySet } };
  } catch (error) {
    console.error('Error getting API key status:', error);
    return { success: false, error: 'Failed to retrieve API key status.' };
  }
}

export async function generateAutoBlogPostAction(
  data: GenerateAutoBlogPostInput
): Promise<ActionResult<GenerateAutoBlogPostOutput>> {
  try {
    const result = await generateAutoBlogPost(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error during auto blog post generation:', error);
    const errorMessage = error.message || 'An unknown error occurred during post generation.';
    
    if (errorMessage.includes('accessible to billed users')) {
      return {
        success: false,
        error: 'Image generation failed: The Imagen API requires a Google Cloud project with billing enabled. Please ensure your API key is associated with a billed account.'
      };
    }

    if (errorMessage.includes('exceeded your current quota')) {
        const now = new Date();
        const resetDate = new Date();
        resetDate.setUTCHours(8, 0, 0, 0); // Midnight PT is 8:00 UTC
        if (now > resetDate) {
            resetDate.setDate(resetDate.getDate() + 1);
        }

        return {
            success: false,
            error: 'You have exceeded your API quota for the image generation model. Please try again after the quota resets.',
            data: {
                resetsAt: resetDate.toISOString(),
            }
        };
    }
    
    return { success: false, error: `Failed to generate post: ${errorMessage}` };
  }
}

export async function saveAutoBloggerConfigAction(
  config: AutoBloggerConfig
): Promise<ActionResult<{}>> {
  try {
    await saveAutoBloggerConfig(config);
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error saving auto-blogger config:', error);
    return { success: false, error: 'Failed to save configuration.' };
  }
}

export async function getAutoBloggerConfigAction(): Promise<ActionResult<AutoBloggerConfig | null>> {
  try {
    const config = await getAutoBloggerConfig();
    if (config?.updatedAt) {
      delete (config as any).updatedAt;
    }
    return { success: true, data: config };
  } catch (error) {
    console.error('Error fetching auto-blogger config:', error);
    return { success: false, error: 'Failed to fetch configuration.' };
  }
}

export async function getAllArticlesAction(): Promise<ActionResult<{ articles: Article[] }>> {
  try {
    const articles = await getAllArticles();
    return { success: true, data: { articles: articles as any } };
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return { success: false, error: 'Failed to fetch articles.' };
  }
}

export async function updateArticleStatusAction(
  data: { articleId: string; status: 'draft' | 'published' }
): Promise<ActionResult<{}>> {
  try {
    await updateArticleStatus(data.articleId, data.status);
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error updating article status:', error);
    return { success: false, error: 'Failed to update article status.' };
  }
}

export async function deleteArticleAction(
  data: { articleId: string }
): Promise<ActionResult<{}>> {
  try {
    await deleteArticle(data.articleId);
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: 'Failed to delete article.' };
  }
}

export async function getAllCommentsAction(): Promise<ActionResult<{ comments: Comment[] }>> {
    try {
        const comments = await getAllComments();
        return { success: true, data: { comments } };
    } catch (error) {
        console.error('Error fetching all comments:', error);
        return { success: false, error: 'Failed to fetch comments.' };
    }
}

export async function updateCommentStatusAction(
    data: { commentId: string; status: 'visible' | 'hidden' }
): Promise<ActionResult<{}>> {
    try {
        await updateCommentStatus(data.commentId, data.status);
        return { success: true, data: {} };
    } catch (error) {
        console.error('Error updating comment status:', error);
        return { success: false, error: 'Failed to update comment status.' };
    }
}

export async function deleteCommentAction(
    data: { commentId: string }
): Promise<ActionResult<{}>> {
    try {
        await deleteCommentDb(data.commentId);
        return { success: true, data: {} };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return { success: false, error: 'Failed to delete comment.' };
    }
}

export async function getCommentsForArticleAction(
    data: { articleId: string }
): Promise<ActionResult<{ comments: Comment[] }>> {
    try {
        const comments = await getCommentsForArticle(data.articleId);
        return { success: true, data: { comments } };
    } catch (error) {
        console.error('Error fetching comments for article:', error);
        return { success: false, error: 'Failed to fetch comments.' };
    }
}

export async function addCommentAction(
    data: { articleId: string; articleTitle: string; authorId: string; content: string }
): Promise<ActionResult<{ commentId: string }>> {
    try {
        const commentId = await addComment(data);
        return { success: true, data: { commentId } };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: 'Failed to add comment.' };
    }
}

export async function toggleArticleCommentsAction(
  data: { articleId: string, commentsEnabled: boolean }
): Promise<ActionResult<{}>> {
    try {
        await updateArticle(data.articleId, { commentsEnabled: data.commentsEnabled });
        return { success: true, data: {} };
    } catch (error) {
        console.error('Error toggling article comments:', error);
        return { success: false, error: 'Failed to toggle article comments.' };
    }
}
