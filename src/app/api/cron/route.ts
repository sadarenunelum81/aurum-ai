
import { NextResponse } from 'next/server';
import { generateAutoBlogPost } from '@/ai/flows/generate-auto-blog-post';
import { getAutoBloggerConfig } from '@/lib/config';
import type { GenerateAutoBlogPostInput } from '@/ai/flows/generate-auto-blog-post';
import { getAllUsers } from '@/lib/auth';

async function handler(request: Request) {
    // Regardless of method, check for the secret.
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || secret !== cronSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // For GET requests, show a success message but encourage POST.
    if (request.method === 'GET') {
        const cronUrl = request.url;
        const cronCommand = `curl -X POST "${cronUrl}"`;
        // This response is mainly for users who test the URL in a browser.
        return NextResponse.json({ 
            success: true, 
            message: 'Endpoint is active. Please use the POST method to trigger post generation.',
            note: 'Your cron job service should be configured to make a POST request to this URL.',
            example: cronCommand,
        }, { status: 200 });
    }


    // The rest of the logic only runs for POST requests
    try {
        const config = await getAutoBloggerConfig();

        if (!config) {
            return NextResponse.json({ success: false, message: 'Auto Blogger configuration not found.' }, { status: 404 });
        }
        
        const allUsers = await getAllUsers();
        const adminUser = allUsers.find(user => (user as any).role === 'admin');

        if (!adminUser) {
             return NextResponse.json({ success: false, message: 'No admin user found in the system. An admin user is required to attribute automated posts.' }, { status: 500 });
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

        // Do not await the result. The cron service doesn't need to wait for the whole process.
        // This helps prevent timeouts.
        generateAutoBlogPost(input).catch(error => {
            // Log errors that happen during the background generation process
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

export { handler as GET, handler as POST };
