
import { NextResponse } from 'next/server';
import { generateAutoBlogPost } from '@/ai/flows/generate-auto-blog-post';
import { getAutoBloggerConfig } from '@/lib/config';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';

async function handler(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (request.method !== 'POST') {
        return NextResponse.json({ success: false, message: 'Method Not Allowed' }, { status: 405 });
    }

    if (!cronSecret || secret !== cronSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const config = await getAutoBloggerConfig();

        if (!config) {
            return NextResponse.json({ success: false, message: 'Auto Blogger configuration not found.' }, { status: 404 });
        }
        
        if (!config.userId) {
            return NextResponse.json({ success: false, message: 'No admin user ID found in the configuration. Please save the Auto Blogger settings again.' }, { status: 500 });
        }

        const keywords = config.keywords.join(', ');
        
        const input: GenerateAutoBlogPostInput = {
            userId: config.userId,
            category: config.category,
            keywords,
            titleMode: config.titleMode,
            manualTitle: config.manualTitle,
            paragraphs: config.paragraphs,
            words: config.words,
            publishAction: config.publishAction,
            featuredImageMode: config.featuredImageMode,
            randomImageUrlList: config.randomImageUrlList,
            backgroundImageMode: config.backgroundImageMode,
            randomBgImageUrlList: config.randomBgImageUrlList,
            inContentImagesMode: config.inContentImagesMode,
            randomInContentImageUrlList: config.randomInContentImageUrlList,
            websiteNameWatermark: config.websiteNameWatermark,
            contentAlignment: config.contentAlignment,
            inContentImages: config.inContentImages,
            inContentImagesAlignment: config.inContentImagesAlignment,
            paragraphSpacing: config.paragraphSpacing,
            addTags: config.addTags,
            tagGenerationMode: config.tagGenerationMode,
            manualTags: config.manualTags || [],
            numberOfTags: config.numberOfTags,
            enableComments: config.enableComments,
            generationSource: 'cron',
        };

        // Do not await the result. The cron service doesn't need to wait for the whole process.
        // This helps prevent timeouts.
        generateAutoBlogPost(input).catch(error => {
            // Log errors that happen during the async generation process
            console.error('Error during background blog post generation:', error);
        });

        // Respond immediately to the cron service to let it know the job was accepted.
        return NextResponse.json({ success: true, message: 'Blog post generation process started.' });

    } catch (error: any) {
        // This will catch errors during the initial setup (e.g., getting config)
        console.error('Cron Job Handler Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}

export { handler as POST };
