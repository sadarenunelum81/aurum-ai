
import { NextResponse } from 'next/server';
import { generateAutoBlogPost } from '@/ai/flows/generate-auto-blog-post';
import { getAutoBloggerConfig } from '@/lib/config';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';
import { getAllUsers } from '@/lib/auth';


async function runCronJob(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || secret !== cronSecret) {
        throw new Error('Unauthorized');
    }
    
    console.log('Cron job triggered. Fetching configuration...');
    const config = await getAutoBloggerConfig();

    if (!config) {
        throw new Error('Auto Blogger configuration not found.');
    }
    
    const allUsers = await getAllUsers();
    const adminUser = allUsers.find(user => (user as any).role === 'admin');

    if (!adminUser) {
         throw new Error('No admin user found in the system. An admin user is required to attribute automated posts.');
    }
    
    const keywords = config.keywords.join(', ');
    
    const input: GenerateAutoBlogPostInput = {
        userId: adminUser.id,
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
    };

    console.log('Configuration loaded, starting blog post generation...');
    // We must await the full generation process before returning a response.
    // Otherwise, the serverless function may terminate before the work is done.
    await generateAutoBlogPost(input);
    console.log('Blog post generation process completed successfully.');
}

async function handler(request: Request) {
    try {
        await runCronJob(request);
        return NextResponse.json({ success: true, message: 'Blog post generation completed successfully.' });
    } catch (error: any) {
        console.error('Cron Job Handler Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}


export { handler as GET, handler as POST };
