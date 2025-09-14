
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction, getArticlesByStatusAction } from '@/app/actions';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/lib/auth';


async function getPostDetails(postIds: string[]): Promise<Article[]> {
    if (!postIds || postIds.length === 0) return [];
    const postPromises = postIds.map(async id => {
        if (!id) return null;
        const result = await getArticleByIdAction(id);
        if (result.success && result.data.article) {
            const article = result.data.article;
            if (article.authorId) {
                const authorProfile = await getUserProfile(article.authorId);
                article.authorName = authorProfile?.firstName ? `${authorProfile.firstName} ${authorProfile.lastName}` : authorProfile?.email || 'STAFF';
            }
            return article;
        }
        return null;
    });
    const results = await Promise.all(postPromises);
    return results.filter(Boolean) as Article[];
}

export const PetsRecentPostsSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
    const { resolvedTheme } = useTheme();
    const sectionConfig = config?.recentPostsSection;

    const [allPosts, setAllPosts] = useState<Article[]>([]);
    const [visiblePosts, setVisiblePosts] = useState<Article[]>([]);
    const [postsToShow, setPostsToShow] = useState(sectionConfig?.initialPostsToShow || 6);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (!sectionConfig?.enabled) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            let posts: Article[] = [];
            if (sectionConfig.mode === 'manual' && sectionConfig.postIds && sectionConfig.postIds.length > 0) {
                posts = await getPostDetails(sectionConfig.postIds);
            } else if (sectionConfig.mode === 'automatic') {
                const result = await getArticlesByStatusAction('published', sectionConfig.postLimit);
                if (result.success) {
                    posts = result.data.articles;
                }
            }
            setAllPosts(posts);
            setIsLoading(false);
        }

        fetchData();
    }, [sectionConfig]);

    useEffect(() => {
        setVisiblePosts(allPosts.slice(0, postsToShow));
    }, [allPosts, postsToShow]);

    const handleShowMore = () => {
        setIsLoadingMore(true);
        // Simulate a delay for loading effect
        setTimeout(() => {
            setPostsToShow(prev => prev + (sectionConfig?.postsPerLoad || 6));
            setIsLoadingMore(false);
        }, 500);
    };
    
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? sectionConfig?.darkModeColors : sectionConfig?.lightModeColors;

    if (!sectionConfig?.enabled) return null;

    const Skeletons = () => (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: sectionConfig.initialPostsToShow || 6 }).map((_, i) => (
                     <div key={i} className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
                        <Skeleton className="h-full w-full" />
                     </div>
                ))}
            </div>
        </div>
    );
    
    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
        backgroundImage: colors?.backgroundColor?.startsWith('http') || colors?.backgroundColor?.startsWith('https') ? `url(${colors.backgroundColor})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    const overlayStyle = { backgroundColor: colors?.overlayColor };
    const titleStyle = { color: colors?.postTitleColor };
    const buttonStyle = { backgroundColor: colors?.showMoreButtonBgColor, color: colors?.showMoreButtonTextColor };
    
    const headerAlignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const renderPostCard = (post: Article) => (
        <Link key={post.id} href={`/post/${post.id}`} className="group block">
             <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/400`}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
             <div className="mt-4 text-center">
                 <h3 className="font-semibold text-lg leading-tight group-hover:underline" style={titleStyle}>
                    {post.title}
                </h3>
            </div>
        </Link>
    );

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            {overlayStyle.backgroundColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                 <div className={cn("mb-8 md:mb-12", headerAlignmentClasses[sectionConfig.headerAlignment || 'left'])}>
                    {sectionConfig.headerText && <h2 className="text-3xl md:text-4xl font-bold font-headline" style={{color: colors?.headerTextColor}}>{sectionConfig.headerText}</h2>}
                    {sectionConfig.descriptionText && <p className="mt-2 text-lg text-muted-foreground" style={{color: colors?.descriptionTextColor}}>{sectionConfig.descriptionText}</p>}
                </div>

                {isLoading ? <Skeletons /> : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                            {visiblePosts.map(renderPostCard)}
                        </div>
                        
                        {allPosts.length > visiblePosts.length && (
                            <div className="mt-12 text-center">
                                <Button
                                    onClick={handleShowMore}
                                    disabled={isLoadingMore}
                                    size="lg"
                                    style={buttonStyle}
                                >
                                    {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {sectionConfig.showMoreButtonText || 'Show More'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};
