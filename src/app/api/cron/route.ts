
import { NextResponse } from 'next/server';
import { generateAutoBlogPost } from '@/ai/flows/generate-auto-blog-post';
import { getAutoBloggerConfig } from '@/lib/config';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';

async function handler(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

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
            useRandomKeyword: config.useRandomKeyword,
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

        const result = await generateAutoBlogPost(input);

        return NextResponse.json({ success: true, message: 'Blog post generated successfully.', articleId: result.articleId });

    } catch (error: any) {
        console.error('Cron Job Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}

export { handler as GET, handler as POST };
