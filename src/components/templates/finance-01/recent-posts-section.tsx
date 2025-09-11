
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction } from '@/app/actions';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/lib/auth';
import { format } from 'date-fns';

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

export const FinanceRecentPostsSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
    const { resolvedTheme } = useTheme();
    const sectionConfig = config?.recentPostsSection;

    const [allPosts, setAllPosts] = useState<Article[]>([]);
    const [visiblePosts, setVisiblePosts] = useState<Article[]>([]);
    const [postsToShow, setPostsToShow] = useState(sectionConfig?.initialPostsToShow || 8);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (!sectionConfig?.enabled || !sectionConfig.postIds || sectionConfig.postIds.length === 0) {
            setIsLoading(false);
            return;
        }
        async function fetchData() {
            setIsLoading(true);
            const posts = await getPostDetails(sectionConfig.postIds!);
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
        setTimeout(() => {
            setPostsToShow(prev => prev + (sectionConfig?.postsPerLoad || 8));
            setIsLoadingMore(false);
        }, 500);
    };
    
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? sectionConfig?.darkModeColors : sectionConfig?.lightModeColors;

    if (!sectionConfig?.enabled) return null;

    const Skeletons = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: sectionConfig.initialPostsToShow || 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-full" />
                </div>
            ))}
        </div>
    );
    
    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
    };
    const buttonStyle = { backgroundColor: colors?.showMoreButtonBgColor, color: colors?.showMoreButtonTextColor };
    
    const headerAlignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const renderPostCard = (post: Article) => (
        <div key={post.id} className="group">
            <Link href={`/post/${post.id}`} className="block mb-4">
                 <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden shadow-md">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/400`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>
             <Link href={`/post/${post.id}`}>
                <h3 className="font-bold text-lg leading-tight mt-1 group-hover:underline" style={{ color: colors?.postTitleColor }}>
                    {post.title}
                </h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-2" style={{color: colors?.descriptionTextColor}}>
                BY {post.authorName?.toUpperCase() || 'STAFF'} / {format(new Date(post.createdAt as string), 'PP')}
            </p>
        </div>
    );

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                 <div className={cn("mb-8 md:mb-12", headerAlignmentClasses[sectionConfig.headerAlignment || 'center'])}>
                    {sectionConfig.headerText && <h2 className="text-3xl md:text-4xl font-bold font-headline" style={{color: colors?.headerTextColor}}>{sectionConfig.headerText}</h2>}
                    {sectionConfig.descriptionText && <p className="mt-2 text-lg max-w-3xl mx-auto" style={{color: colors?.descriptionTextColor}}>{sectionConfig.descriptionText}</p>}
                </div>

                {isLoading ? <Skeletons /> : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                            {visiblePosts.map(renderPostCard)}
                        </div>
                        
                        {allPosts.length > visiblePosts.length && (
                            <div className="mt-16 text-center">
                                <Button
                                    onClick={handleShowMore}
                                    disabled={isLoadingMore}
                                    size="lg"
                                    style={buttonStyle}
                                >
                                    {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {sectionConfig.showMoreButtonText || 'Load More Articles'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};
