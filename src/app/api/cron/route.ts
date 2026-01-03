
import { NextResponse } from 'next/server';
import { generateAutoBlogPost } from '@/ai/flows/generate-auto-blog-post';
import { getAutoBloggerConfig } from '@/lib/config';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';
import { getAdminUser } from '@/lib/auth';

// Vercel function configuration
export const maxDuration = 60; // Allow up to 60 seconds for execution (Hobby plan max)
export const dynamic = 'force-dynamic'; // Prevent caching

async function runCronJob(request: Request) {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        throw new Error('CRON_SECRET is not set in environment variables.');
    }

    // Support both Authorization header and URL query parameter
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const urlSecret = searchParams.get('secret');

    let isAuthorized = false;

    // Check Authorization header first (recommended)
    if (authHeader) {
        const bearerToken = authHeader.replace('Bearer ', '').trim();
        console.log('DEBUG: Authorization header present');
        if (bearerToken === cronSecret) {
            isAuthorized = true;
        }
    }

    // Fallback to URL query parameter (backward compatibility)
    if (!isAuthorized && urlSecret) {
        console.log('DEBUG: URL secret parameter present');
        if (urlSecret === cronSecret) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        throw new Error('Unauthorized: Invalid or missing secret. Use Authorization header or ?secret= query parameter.');
    }

    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }

    console.log('Cron job triggered. Fetching configuration...');
    // Log the API key presence (do not log the actual key)
    console.log('DEBUG: GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

    const config = await getAutoBloggerConfig();

    if (!config) {
        throw new Error('Auto Blogger configuration not found. Please save the configuration in the Admin Panel.');
    }

    console.log('Fetching admin user...');
    const adminUser = await getAdminUser();

    if (!adminUser) {
         throw new Error('No admin user found in the system. An admin user is required to attribute automated posts.');
    }

    const keywords = config.keywords.join(', ');

    const input: GenerateAutoBlogPostInput = {
        userId: (adminUser as any).id,
        category: config.category,
        keywords,
        titleMode: config.titleMode as any,
        manualTitle: config.manualTitle,
        paragraphs: config.paragraphs,
        words: config.words,
        publishAction: config.publishAction as any,
        featuredImageMode: config.featuredImageMode as any,
        randomImageUrlList: config.randomImageUrlList,
        backgroundImageMode: config.backgroundImageMode as any,
        randomBgImageUrlList: config.randomBgImageUrlList,
        inContentImagesMode: config.inContentImagesMode as any,
        randomInContentImageUrlList: config.randomInContentImageUrlList,
        websiteNameWatermark: config.websiteNameWatermark,
        contentAlignment: config.contentAlignment as any,
        inContentImages: config.inContentImages,
        inContentImagesAlignment: config.inContentImagesAlignment as any,
        paragraphSpacing: config.paragraphSpacing as any,
        addTags: config.addTags,
        tagGenerationMode: config.tagGenerationMode as any,
        manualTags: config.manualTags || [],
        numberOfTags: config.numberOfTags,
        enableComments: config.enableComments,
        generationSource: 'cron',
        language: config.language,
    };

    console.log('Configuration loaded, starting blog post generation...');
    await generateAutoBlogPost(input);
    console.log('Blog post generation process completed successfully.');
}

async function handler(request: Request) {
    try {
        await runCronJob(request);
        return NextResponse.json({ success: true, message: 'Blog post generation completed successfully.' });
    } catch (error: any) {
        console.error('Cron Job Handler Error:', error);
        // Return detailed error information for debugging
        return NextResponse.json({
            success: false,
            message: error.message || 'An unknown error occurred.',
            name: error.name,
            stack: error.stack, // Expose stack trace for debugging
            env: process.env.NODE_ENV
        }, { status: 500 });
    }
}


export { handler as GET, handler as POST };
