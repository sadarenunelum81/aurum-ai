
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
import { saveAutoBloggerConfig, getAutoBloggerConfig } from '@/lib/config';
import type { AutoBloggerConfig } from '@/types';
import * as fs from 'fs/promises';
import * as path from 'path';


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
    console.error('Error generating auto blog post:', error);
    return { success: false, error: error.message || 'Failed to generate post. Please check the logs.' };
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
      delete config.updatedAt;
    }
    return { success: true, data: config };
  } catch (error) {
    console.error('Error fetching auto-blogger config:', error);
    return { success: false, error: 'Failed to fetch configuration.' };
  }
}
