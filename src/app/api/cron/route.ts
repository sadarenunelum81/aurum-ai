
import { NextResponse } from 'next/server';
import { generateAutoBlogPost } from '@/ai/flows/generate-auto-blog-post';
import { getAutoBloggerConfig } from '@/lib/config';
import { getAllUsers } from '@/lib/auth';

async function handler(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    // 1. Authenticate the request
    if (!cronSecret || secret !== cronSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Fetch the Auto Blogger configuration
        const config = await getAutoBloggerConfig();

        if (!config) {
            return NextResponse.json({ success: false, message: 'Auto Blogger configuration not found.' }, { status: 404 });
        }
        
        // The generateAutoBlogPost flow requires a userId.
        // We will find the first admin user and use their ID.
        const allUsers = await getAllUsers();
        const adminUser = allUsers.find(user => user.role === 'admin');

        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'No admin user found to attribute the post to.' }, { status: 500 });
        }

        // 3. Prepare the input for the generation flow
        const keywords = config.keywords.join(', ');

        const input = {
            userId: adminUser.id, // Use the found admin user's ID
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
            manualTags: config.manualTags,
            numberOfTags: config.numberOfTags,
            enableComments: config.enableComments,
        };

        // 4. Execute the blog post generation flow
        const result = await generateAutoBlogPost(input);

        // 5. Return a success response
        return NextResponse.json({ success: true, message: 'Blog post generated successfully.', articleId: result.articleId });

    } catch (error: any) {
        console.error('Cron Job Error:', error);
        // Return an error response
        return NextResponse.json({ success: false, message: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}


// This is your serverless function that will be called by the cron job.
// Exporting the same handler for both GET and POST
export { handler as GET, handler as POST };
