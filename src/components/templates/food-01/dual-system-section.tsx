
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction } from '@/app/actions';
import type { Article, TemplateConfig, DualSystemPartConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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


interface DualSystemPartProps {
    partConfig?: DualSystemPartConfig;
    colors?: any; // Simplified for props
}

const DualSystemPart = ({ partConfig, colors }: DualSystemPartProps) => {
    const [featuredPost, setFeaturedPost] = useState<Article | null>(null);
    const [sidePosts, setSidePosts] = useState<Article[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!partConfig) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            const postIdsToFetch = [
                partConfig.featuredPostId, 
                ...(partConfig.sidePostIds || []),
            ].filter(Boolean) as string[];

            if (postIdsToFetch.length > 0) {
                const posts = await getPostDetails(postIdsToFetch);
                if (partConfig.featuredPostId) {
                    setFeaturedPost(posts.find(p => p.id === partConfig.featuredPostId) || null);
                }
                if (partConfig.sidePostIds) {
                    setSidePosts(partConfig.sidePostIds.map(id => posts.find(p => p.id === id)).filter(Boolean) as Article[]);
                }
            } else {
                 setFeaturedPost(null);
                 setSidePosts([]);
            }
            setIsLoading(false);
        }

        fetchData();
    }, [partConfig]);

    if (isLoading) {
        return (
            <div className="py-8">
                 <Skeleton className="h-8 w-1/3 mb-4" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-6 w-3/4 mt-4" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }
    
    if (!partConfig?.featuredPostId && (!partConfig?.sidePostIds || partConfig.sidePostIds.length === 0)) {
        return null;
    }
    
    return (
        <div className="py-8">
             <div className="flex justify-between items-center mb-4">
                {partConfig.headerText && (
                    <h2 className="text-2xl font-bold font-headline" style={{ color: colors?.headerTextColor }}>
                        {partConfig.headerText}
                    </h2>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                <div className="space-y-6">
                    {featuredPost && (
                        <Link href={`/post/${featuredPost.id}`} className="block group">
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-4">
                                <Image
                                    src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/800/450`}
                                    alt={featuredPost.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                             <h3 className="text-2xl font-semibold leading-tight group-hover:underline" style={{ color: colors?.postTitleColor }}>
                                {featuredPost.title}
                            </h3>
                            <p className="text-sm mt-2" style={{color: colors?.postMetaColor}}>{featuredPost.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}...</p>
                             <div className="flex items-center gap-4 text-xs mt-3" style={{color: colors?.postMetaColor}}>
                                <span>BY {featuredPost.authorName?.toUpperCase() || 'STAFF'}</span>
                            </div>
                        </Link>
                    )}
                </div>

                <div className="space-y-4">
                    {sidePosts.slice(0, 4).map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-4 group transition-colors hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-md border-b" style={{borderColor: colors?.lineColor}}>
                             <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                <Image
                                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/100`}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-base leading-tight group-hover:underline" style={{ color: colors?.postTitleColor }}>
                                    {post.title}
                                </h3>
                                 <p className="text-xs mt-1" style={{color: colors?.postMetaColor}}>{format(new Date(post.createdAt as string), 'PP')}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const FoodDualSystemSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
    const { resolvedTheme } = useTheme();
    const sectionConfig = config?.dualSystemSection;

    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? sectionConfig?.darkModeColors : sectionConfig?.lightModeColors;

    if (!sectionConfig?.enabled) {
        return null;
    }

    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
        backgroundImage: colors?.backgroundColor?.startsWith('http') || colors?.backgroundColor?.startsWith('https') ? `url(${colors.backgroundColor})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    const overlayStyle = { backgroundColor: colors?.overlayColor };

    return (
        <section className="relative" style={containerStyle}>
            {overlayStyle.backgroundColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 py-12 relative z-10 divide-y" style={{borderColor: colors?.lineColor}}>
                <DualSystemPart partConfig={sectionConfig.part1} colors={colors} />
                <DualSystemPart partConfig={sectionConfig.part2} colors={colors} />
            </div>
        </section>
    );
};
