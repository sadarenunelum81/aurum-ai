
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction, getArticlesByStatusAction } from '@/app/actions';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { getUserProfile } from '@/lib/auth';
import { MessageSquare, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

async function getPostDetails(postIds: string[]): Promise<Article[]> {
    const postPromises = postIds.map(async id => {
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

export const LatestPostsGrid = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
    const { resolvedTheme } = useTheme();
    const [posts, setPosts] = useState<Article[]>([]);
    const [featuredPost, setFeaturedPost] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const gridConfig = config?.latestPostsGrid;

    useEffect(() => {
        if (!gridConfig?.enabled) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            
            let fetchedPosts: Article[] = [];
            if (gridConfig.mode === 'automatic') {
                const result = await getArticlesByStatusAction('published', gridConfig.postLimit || 6);
                if (result.success) {
                    fetchedPosts = result.data.articles;
                }
            } else if (gridConfig.manualPostIds?.length) {
                fetchedPosts = await getPostDetails(gridConfig.manualPostIds);
            }

            if (gridConfig.featuredPostId) {
                const featuredResult = await getArticleByIdAction(gridConfig.featuredPostId);
                if (featuredResult.success && featuredResult.data.article) {
                    const featPost = featuredResult.data.article;
                    if (featPost.authorId) {
                        const author = await getUserProfile(featPost.authorId);
                        featPost.authorName = author?.firstName ? `${author.firstName} ${author.lastName}` : author?.email || 'STAFF';
                    }
                    setFeaturedPost(featPost);
                    // Ensure the featured post is not duplicated in the main grid
                    fetchedPosts = fetchedPosts.filter(p => p.id !== gridConfig.featuredPostId);
                }
            }
            
            setPosts(fetchedPosts);
            setIsLoading(false);
        }

        fetchData();
    }, [gridConfig]);

    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? gridConfig?.darkModeColors : gridConfig?.lightModeColors;
    
    if (!gridConfig?.enabled) return null;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-12">
                <Skeleton className="h-10 w-1/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-video w-full rounded-lg" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
        backgroundImage: colors?.backgroundColor?.startsWith('http') ? `url(${colors.backgroundColor})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    const overlayStyle = { backgroundColor: colors?.overlayColor };
    const textBoxStyle = { backgroundColor: colors?.postTextBoxOverlayColor };
    const featuredTextBoxStyle = { backgroundColor: colors?.featuredPostTextBoxOverlayColor };

    
    const renderPostCard = (post: Article, index: number) => (
        <div key={post.id} className="group flex flex-col">
            <Link href={`/post/${post.id}`} className="block w-full">
                 <div className="relative w-full overflow-hidden rounded-lg aspect-video">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/400`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>
            <div className="mt-4 flex-1 p-4 rounded-md" style={textBoxStyle}>
                {post.category && (
                    <p className="text-sm font-semibold uppercase" style={{ color: colors?.featuredBadgeIconColor }}>
                        {post.category}
                    </p>
                )}
                <Link href={`/post/${post.id}`}>
                    <h3 className="text-xl font-bold font-headline mt-1 group-hover:underline" style={{ color: colors?.postTitleColor }}>{post.title}</h3>
                </Link>
                <p className="mt-2 text-sm text-muted-foreground" style={{ color: colors?.postDescriptionColor }}>{post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: colors?.postMetaColor }}>
                    <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                    <span>{format(new Date(post.createdAt as string), 'P')}</span>
                    {post.commentsEnabled && <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}</div>}
                </div>
            </div>
        </div>
    );
    
    const renderFeaturedPost = (post: Article) => (
         <div key={post.id} className="group lg:col-span-3 flex flex-col lg:flex-row items-center gap-8 mt-8">
            <div className="lg:w-1/2 flex-1 p-6 rounded-md" style={featuredTextBoxStyle}>
                 {post.category && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-px" style={{backgroundColor: colors?.featuredBadgeIconColor}}/>
                        <p className="text-sm font-semibold uppercase" style={{ color: colors?.featuredBadgeIconColor }}>
                            {post.category}
                        </p>
                    </div>
                )}
                <Link href={`/post/${post.id}`}>
                    <h3 className="text-3xl font-bold font-headline mt-2 group-hover:underline" style={{ color: colors?.postTitleColor }}>{post.title}</h3>
                </Link>
                <p className="mt-2 text-md text-muted-foreground" style={{ color: colors?.postDescriptionColor }}>{post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
                <div className="flex items-center gap-3 mt-4 text-xs" style={{ color: colors?.postMetaColor }}>
                    <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                    <span>{format(new Date(post.createdAt as string), 'P')}</span>
                    {post.commentsEnabled && <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}</div>}
                </div>
            </div>
             <Link href={`/post/${post.id}`} className="block w-full lg:w-1/2">
                 <div className="relative w-full overflow-hidden rounded-lg aspect-video">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/450`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs" style={{backgroundColor: colors?.featuredBadgeBackgroundColor, color: colors?.featuredBadgeTextColor}}>
                         <Star className="h-3 w-3" style={{color: colors?.featuredBadgeIconColor}}/>
                         <span>{gridConfig?.featuredBadgeText || 'FEATURED'}</span>
                    </div>
                </div>
            </Link>
        </div>
    );

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            {colors?.overlayColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {gridConfig.headerText && <h2 className="text-3xl md:text-4xl font-bold font-headline" style={{color: colors?.headerTextColor}}>{gridConfig.headerText}</h2>}
                {gridConfig.descriptionText && <p className="mt-2 text-lg text-muted-foreground" style={{color: colors?.descriptionTextColor}}>{gridConfig.descriptionText}</p>}

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => renderPostCard(post, index))}
                    {featuredPost && renderFeaturedPost(featuredPost)}
                </div>
            </div>
        </section>
    );
};
