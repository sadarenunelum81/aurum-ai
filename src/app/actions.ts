

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
import { 
  uploadImage,
  UploadImageInput,
  UploadImageOutput
} from '@/ai/flows/upload-image';
import { saveAutoBloggerConfig, getAutoBloggerConfig } from '@/lib/config';
import { getAllArticles, updateArticleStatus, deleteArticle, updateArticle as updateArticleDb, saveArticle, getArticleById, getArticlesByStatus } from '@/lib/articles';
import { getAllComments, updateCommentStatus, deleteComment as deleteCommentDb, addComment, getCommentsForArticle } from '@/lib/comments';
import { addCategory, getAllCategories, deleteCategory as deleteCategoryDb, type Category } from '@/lib/categories';
import { saveTemplateConfig, getTemplateConfig, setActiveTemplate } from '@/lib/templates';
import { getPageConfig, savePageConfig } from '@/lib/pages';
import type { AutoBloggerConfig, Article, Comment, TemplateConfig, PageConfig } from '@/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { revalidate } from '@/lib/revalidate';


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
    geminiApiKey?: string;
    imagebbApiKey?: string;
    projectUrl?: string;
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
        let updatedLines: string[] = [];
        const keysToUpdate: Record<string, string | undefined> = {
            'GEMINI_API_KEY': data.geminiApiKey,
            'IMAGEBB_API_KEY': data.imagebbApiKey,
            'PROJECT_URL': data.projectUrl,
        };

        const keysFound = new Set<string>();

        // Check if CRON_SECRET exists
        let cronSecretExists = false;
        for (const line of lines) {
            if (line.startsWith('CRON_SECRET=')) {
                cronSecretExists = true;
                updatedLines.push(line); // Keep existing secret
                keysFound.add('CRON_SECRET');
                break;
            }
        }
        
        // If CRON_SECRET doesn't exist, generate and add it
        if (!cronSecretExists) {
            const newCronSecret = randomBytes(16).toString('hex');
            updatedLines.push(`CRON_SECRET=${newCronSecret}`);
            process.env.CRON_SECRET = newCronSecret;
        }


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
            // Add non-updated lines, excluding the one we just processed
            if (!found && line && !line.startsWith('CRON_SECRET=')) {
                updatedLines.push(line);
            }
        }
        
        for (const [key, value] of Object.entries(keysToUpdate)) {
            if (!keysFound.has(key) && value) {
                updatedLines.push(`${key}=${value}`);
            }
        }
        

        // Filter out duplicate keys, keeping the last occurrence
        const finalLines: string[] = [];
        const seenKeys = new Set<string>();
        for (let i = updatedLines.length - 1; i >= 0; i--) {
            const line = updatedLines[i];
            const key = line.split('=')[0];
            if (!seenKeys.has(key)) {
                finalLines.unshift(line);
                seenKeys.add(key);
            }
        }

        await fs.writeFile(envPath, finalLines.join('\n'));

        // This is a temporary measure to make the new environment variables available without a restart.
        if (data.geminiApiKey) process.env.GEMINI_API_KEY = data.geminiApiKey;
        if (data.imagebbApiKey) process.env.IMAGEBB_API_KEY = data.imagebbApiKey;
        if (data.projectUrl) process.env.PROJECT_URL = data.projectUrl;
        
        revalidate('/'); // Revalidate homepage in case URL change affects it.

        return { success: true, data: {} };
    } catch (error) {
        console.error('Error saving API keys:', error);
        return { success: false, error: 'Failed to save API keys to the .env file.' };
    }
}

export async function getApiKeyStatusAction(): Promise<ActionResult<{ geminiKeySet: boolean; imagebbKeySet: boolean; projectUrl: string | null; cronSecret: string | null; }>> {
  try {
    const geminiKeySet = !!process.env.GEMINI_API_KEY;
    const imagebbKeySet = !!process.env.IMAGEBB_API_KEY;
    const projectUrl = process.env.PROJECT_URL || null;
    const cronSecret = process.env.CRON_SECRET || null;
    return { success: true, data: { geminiKeySet, imagebbKeySet, projectUrl, cronSecret } };
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
    revalidate('/posts'); // Revalidate the main blog index
    revalidate(`/post/${result.articleId}`); // Revalidate the new post's page
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error during auto blog post generation:', error);
    const errorMessage = error.message || 'An unknown error occurred during post generation.';
    
    await saveArticle({
        title: `Failed Generation Attempt`,
        content: `Could not generate post. Reason: ${errorMessage}`,
        status: 'draft',
        authorId: data.userId || 'unknown',
        generationSource: data.generationSource,
        generationStatus: 'failed',
    });
    
    revalidate('/admin/posts');

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
    
    if (errorMessage.includes('Image generation failed') || errorMessage.includes('ImageBB')) {
         return { success: false, error: `Image generation or hosting failed: ${errorMessage}` };
    }

    return { success: false, error: `Failed to generate post: ${errorMessage}` };
  }
}

export async function saveAutoBloggerConfigAction(
  config: AutoBloggerConfig
): Promise<ActionResult<{}>> {
  try {
    await saveAutoBloggerConfig(config);
    revalidate('/'); // Revalidate relevant pages after config change
    revalidate('/posts');
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
  } catch (error: any) {
    console.error('Error fetching all articles:', error);
    return { success: false, error: error.message || 'Failed to fetch articles.' };
  }
}

export async function updateArticleStatusAction(
  data: { articleId: string; status: 'draft' | 'publish' }
): Promise<ActionResult<{}>> {
  try {
    await updateArticleStatus(data.articleId, data.status);
    revalidate('/posts');
    revalidate(`/post/${data.articleId}`);
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
    revalidate('/posts');
    revalidate(`/post/${data.articleId}`);
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
        // Find articleId to revalidate the post page - this is a simplification
        // In a real app, you might store articleId on the comment to avoid an extra read.
        revalidate('/admin/comments'); 
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
        revalidate('/admin/comments');
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
    } catch (error: any) {
        console.error('Error fetching comments for article:', error);
        return { success: false, error: error.message || 'Failed to fetch comments.' };
    }
}

export async function addCommentAction(
    data: { articleId: string; articleTitle: string; authorId: string; content: string }
): Promise<ActionResult<{ commentId: string }>> {
    try {
        const commentId = await addComment(data);
        revalidate(`/post/${data.articleId}`);
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
        await updateArticleDb(data.articleId, { commentsEnabled: data.commentsEnabled });
        revalidate(`/post/${data.articleId}`);
        return { success: true, data: {} };
    } catch (error) {
        console.error('Error toggling article comments:', error);
        return { success: false, error: 'Failed to toggle article comments.' };
    }
}

export async function uploadImageAction(
  data: UploadImageInput
): Promise<ActionResult<UploadImageOutput>> {
  try {
    const result = await uploadImage(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message || 'Failed to upload image.' };
  }
}

export async function saveArticleAction(
  data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionResult<{ articleId: string }>> {
  try {
    const articleId = await saveArticle(data);
    revalidate('/posts');
    revalidate(`/post/${articleId}`);
    return { success: true, data: { articleId } };
  } catch (error) {
    console.error('Error saving article:', error);
    return { success: false, error: 'Failed to save article.' };
  }
}

export async function addCategoryAction(data: { name: string; parentId?: string }): Promise<ActionResult<{ id: string }>> {
    try {
        const id = await addCategory(data);
        revalidate('/admin/categories-setup');
        revalidate('/posts'); // Categories can affect filtering on posts page
        return { success: true, data: { id } };
    } catch (error: any) {
        console.error('Error adding category:', error);
        return { success: false, error: error.message || 'Failed to add category.' };
    }
}

export async function getAllCategoriesAction(): Promise<ActionResult<{ categories: Category[] }>> {
    try {
        const categories = await getAllCategories();
        return { success: true, data: { categories } };
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        if (error.code === 'permission-denied') {
             return { success: false, error: 'Permission denied. Please check your Firestore security rules to allow reads on the "categories" collection.' };
        }
        return { success: false, error: error.message || 'Failed to fetch categories.' };
    }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult<{}>> {
    try {
        await deleteCategoryDb(id);
        revalidate('/admin/categories-setup');
        revalidate('/posts');
        return { success: true, data: {} };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: 'Failed to delete category.' };
    }
}


export async function getArticleByIdAction(id: string): Promise<ActionResult<{ article: Article | null }>> {
  try {
    const article = await getArticleById(id);
    return { success: true, data: { article } };
  } catch (error: any) {
    console.error('Error fetching article:', error);
    return { success: false, error: error.message || 'Failed to fetch article.' };
  }
}


export async function updateArticleAction(
  id: string,
  data: Partial<Omit<Article, 'id' | 'authorId' | 'createdAt'>>
): Promise<ActionResult<{}>> {
  try {
    await updateArticleDb(id, data);
    revalidate('/posts');
    revalidate(`/post/${id}`);
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error updating article:', error);
    return { success: false, error: 'Failed to update article.' };
  }
}


// Template Actions
export async function getTemplateConfigAction(templateId: string): Promise<ActionResult<TemplateConfig | null>> {
    try {
        const config = await getTemplateConfig(templateId);
        return { success: true, data: config };
    } catch (error) {
        console.error(`Error fetching template config for ${templateId}:`, error);
        return { success: false, error: 'Failed to fetch template configuration.' };
    }
}

export async function saveTemplateConfigAction(templateId: string, config: Partial<TemplateConfig>): Promise<ActionResult<{}>> {
    try {
        await saveTemplateConfig(templateId, config);
        revalidate('/');
        if (config.customPathLight) revalidate(`/${config.customPathLight}`);
        if (config.customPathDark) revalidate(`/${config.customPathDark}`);
        return { success: true, data: {} };
    } catch (error) {
        console.error(`Error saving template config for ${templateId}:`, error);
        return { success: false, error: 'Failed to save template configuration.' };
    }
}

export async function setActiveTemplateAction(templateId: string): Promise<ActionResult<{}>> {
    try {
        await setActiveTemplate(templateId);
        revalidate('/');
        return { success: true, data: {} };
    } catch (error) {
        console.error(`Error setting active template to ${templateId}:`, error);
        return { success: false, error: 'Failed to set active template.' };
    }
}

export async function getArticlesByStatusAction(status: 'draft' | 'publish', limit?: number): Promise<ActionResult<{ articles: Article[] }>> {
    try {
        const articles = await getArticlesByStatus(status, limit);
        return { success: true, data: { articles } };
    } catch (error: any) {
        console.error(`Error fetching articles with status ${status}:`, error);
        return { success: false, error: error.message || 'Failed to fetch articles.' };
    }
}

// Page Actions
export async function getPageConfigAction(pageId: string): Promise<ActionResult<PageConfig | null>> {
    try {
        const config = await getPageConfig(pageId);
        return { success: true, data: config };
    } catch (error: any) {
        console.error(`Error fetching page config for ${pageId}:`, error);
        return { success: false, error: 'Failed to fetch page configuration.' };
    }
}

export async function savePageConfigAction(pageId: string, config: Partial<PageConfig>): Promise<ActionResult<{}>> {
    try {
        await savePageConfig(pageId, config);
        if (pageId === 'blog') revalidate('/posts');
        else revalidate(`/${pageId}`);
        
        if (config.customPathLight) revalidate(`/${config.customPathLight}`);
        if (config.customPathDark) revalidate(`/${config.customPathDark}`);

        return { success: true, data: {} };
    } catch (error) {
        console.error(`Error saving page config for ${pageId}:`, error);
        return { success: false, error: 'Failed to save page configuration.' };
    }
}
