
import { notFound } from 'next/navigation';
import { getArticleByIdAction, getCommentsForArticleAction, addCommentAction } from '@/app/actions';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CommentSection } from '@/components/comment-section';
import { getAutoBloggerConfig } from '@/lib/config';

const spacingClasses = {
    small: 'space-y-2',
    medium: 'space-y-4',
    large: 'space-y-6',
};

function processContent(htmlContent: string, article: any) {
    if (!htmlContent) return '';
    
    let imageAlignmentClass = 'block my-4 w-full';
    if (article?.inContentImagesAlignment) {
        switch (article.inContentImagesAlignment) {
            case 'all-left':
                imageAlignmentClass = 'float-left mr-4 mb-4 w-full md:w-1/3';
                break;
            case 'all-right':
                imageAlignmentClass = 'float-right ml-4 mb-4 w-full md:w-1/3';
                break;
            case 'center':
            default:
                imageAlignmentClass = 'block my-4 w-full';
                break;
        }
    }

    let processed = htmlContent.replace(
        /<img src="([^"]+)" alt="([^"]*)" class="in-content-image[^"]*" \/>/g,
        (match, src, alt) => {
            return `<div class="clearfix my-4"><img src="${src}" alt="${alt}" class="rounded-lg shadow-md ${imageAlignmentClass}" /></div>`;
        }
    );

    processed = processed.replace(/(<div class="clearfix[^>]*>.*?<\/div>)/g, '$1<div style="clear:both;"></div>');
    
    return processed;
}

const getColorClassOrStyle = (colorValue?: string) => {
    if (!colorValue) return {};
    if (colorValue.startsWith('#') || colorValue.startsWith('rgb')) {
        return { style: { color: colorValue } };
    }
    return { className: colorValue };
};


export default async function PostPage({ params }: { params: { id: string } }) {
    const articleResult = await getArticleByIdAction(params.id);

    if (!articleResult.success || !articleResult.data.article) {
        notFound();
    }
    
    const article = articleResult.data.article;

    const autoBloggerConfig = await getAutoBloggerConfig();

    return (
        <div 
            className="relative"
            style={article.backgroundImageUrl ? {
                backgroundImage: `url(${article.backgroundImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            } : {}}
        >
            {article.backgroundImageUrl && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"></div>
            )}
            <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 md:py-16">
                 <article>
                    <header className="mb-8 text-center">
                        <div className="text-sm text-muted-foreground mb-4">
                            {article.category && (
                                <Badge variant="secondary">{article.category}</Badge>
                            )}
                        </div>
                        <h1 
                            className="font-headline text-4xl md:text-6xl font-bold"
                            {...getColorClassOrStyle(autoBloggerConfig?.postTitleColor)}
                        >
                            {article.title}
                        </h1>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Published on {format(new Date(article.createdAt as string), 'PPP')}
                        </p>
                    </header>

                    {article.imageUrl && (
                        <div className="relative aspect-video w-full mb-8">
                            <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover rounded-lg shadow-lg"
                                priority
                            />
                        </div>
                    )}
                    
                    <div 
                        className={cn(
                            "prose dark:prose-invert max-w-none",
                            spacingClasses[article.paragraphSpacing || 'medium'],
                            article.contentAlignment === 'center' && "text-center mx-auto",
                            article.contentAlignment === 'full' ? "max-w-full" : "max-w-3xl mx-auto",
                            getColorClassOrStyle(autoBloggerConfig?.postContentColor).className
                         )}
                         style={getColorClassOrStyle(autoBloggerConfig?.postContentColor).style}
                         dangerouslySetInnerHTML={{ __html: processContent(article.content, article) }} 
                    />

                     {article.tags && article.tags.length > 0 && (
                        <div className="mt-12 flex flex-wrap justify-center gap-2">
                            {article.tags.map((tag, index) => (
                                <Badge key={index} variant="outline">#{tag}</Badge>
                            ))}
                        </div>
                    )}

                    {article.commentsEnabled && article.id && (
                        <CommentSection articleId={article.id} articleTitle={article.title} />
                    )}

                 </article>
            </div>
        </div>
    );
}

