
import { NextResponse } from 'next/server';
import { generateAutoBlogPost } from '@/ai/flows/generate-auto-blog-post';
import { getAutoBloggerConfig } from '@/lib/config';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';
import { getAdminUser } from '@/lib/auth';

// Vercel function configuration
export const maxDuration = 60; // Allow up to 60 seconds for execution (Hobby plan max)
export const dynamic = 'force-dynamic'; // Prevent caching

async function runCronJob(request: Request) {
    console.log('=== CRON JOB STARTED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Environment:', process.env.NODE_ENV);
    
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error('FATAL: CRON_SECRET is not set in environment variables');
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
            console.log('DEBUG: Authorization via header successful');
        }
    }

    // Fallback to URL query parameter (backward compatibility)
    if (!isAuthorized && urlSecret) {
        console.log('DEBUG: URL secret parameter present');
        if (urlSecret === cronSecret) {
            isAuthorized = true;
            console.log('DEBUG: Authorization via URL parameter successful');
        }
    }

    if (!isAuthorized) {
        console.error('FATAL: Authorization failed');
        throw new Error('Unauthorized: Invalid or missing secret. Use Authorization header or ?secret= query parameter.');
    }

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
        console.error('FATAL: Neither GEMINI_API_KEY nor GOOGLE_GENAI_API_KEY is set');
        throw new Error('GEMINI_API_KEY or GOOGLE_GENAI_API_KEY must be set in environment variables.');
    }

    console.log('✓ Authorization successful');
    console.log('✓ API Key configured');
    console.log('Fetching Auto Blogger configuration...');

    let config;
    try {
        config = await getAutoBloggerConfig();
    } catch (error: any) {
        console.error('ERROR fetching Auto Blogger config:', error.message);
        throw new Error(`Failed to fetch Auto Blogger configuration: ${error.message}`);
    }

    if (!config) {
        console.error('FATAL: Auto Blogger configuration not found');
        throw new Error('Auto Blogger configuration not found. Please save the configuration in the Admin Panel.');
    }

    console.log('✓ Configuration loaded');
    console.log('Configuration details:', {
        category: config.category,
        keywords: config.keywords?.length || 0,
        titleMode: config.titleMode,
        publishAction: config.publishAction
    });

    console.log('Fetching admin user...');
    let adminUser;
    try {
        adminUser = await getAdminUser();
    } catch (error: any) {
        console.error('ERROR fetching admin user:', error.message);
        throw new Error(`Failed to fetch admin user: ${error.message}`);
    }

    if (!adminUser) {
        console.error('FATAL: No admin user found in Firestore');
        throw new Error('No admin user found in the system. An admin user is required to attribute automated posts.');
    }
    
    console.log('✓ Admin user found:', {
        id: (adminUser as any).id,
        email: (adminUser as any).email
    });

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

    console.log(`Starting blog post generation...`);
    console.log('Input parameters:', {
        userId: (adminUser as any).id,
        category: config.category,
        titleMode: config.titleMode,
        publishAction: config.publishAction,
        language: config.language
    });
    
    try {
        await generateAutoBlogPost(input);
        console.log('✓ Blog post generation completed successfully');
        console.log('=== CRON JOB COMPLETED ===');
    } catch (error: any) {
        console.error('ERROR during blog post generation:', error.message);
        console.error('Stack trace:', error.stack);
        throw new Error(`Blog post generation failed: ${error.message}`);
    }
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
