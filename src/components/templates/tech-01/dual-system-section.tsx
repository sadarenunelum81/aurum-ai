
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction } from '@/app/actions';
import type { Article, TemplateConfig, DualSystemPartConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

async function getPostDetails(postIds: string[]): Promise<Article[]> {
    if (!postIds || postIds.length === 0) return [];
    const postPromises = postIds.map(async id => {
        if (!id) return null;
        const result = await getArticleByIdAction(id);
        return result.success ? result.data.article : null;
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
            const postIdsToFetch = [partConfig.featuredPostId, ...(partConfig.sidePostIds || [])].filter(Boolean) as string[];
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
                 <Skeleton className="h-px w-full mb-6" />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }
    
    if (!partConfig?.featuredPostId && (!partConfig?.sidePostIds || partConfig.sidePostIds.length === 0)) {
        return null; // Don't render the part if no posts are selected
    }
    

    return (
        <div className="py-8">
            {partConfig.headerText && (
                <>
                    <h2 className="text-2xl font-bold font-headline mb-4" style={{ color: colors?.headerTextColor }}>
                        {partConfig.headerText}
                    </h2>
                     <hr className="border-t-2 mb-6" style={{ borderColor: colors?.lineColor }} />
                </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {featuredPost && (
                    <Link href={`/post/${featuredPost.id}`} className="block group">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/800/450`}
                                alt={featuredPost.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </Link>
                )}

                <div className="space-y-4">
                    {sidePosts.map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-4 group">
                             <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                <Image
                                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/100`}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 p-2 rounded-md" style={{ backgroundColor: colors?.postTitleOverlayColor }}>
                                <h3 className="font-semibold leading-tight group-hover:underline" style={{ color: colors?.postTitleColor }}>
                                    {post.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {partConfig.showMoreText && partConfig.showMoreLink && (
                <div className="mt-6 text-center">
                    <Button asChild variant="link" style={{ color: colors?.showMoreTextColor }}>
                        <Link href={partConfig.showMoreLink}>{partConfig.showMoreText}</Link>
                    </Button>
                </div>
            )}
        </div>
    );
};

export const DualSystemSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
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
            {colors?.overlayColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 py-12 relative z-10">
                <DualSystemPart partConfig={sectionConfig.part1} colors={colors} />
                <DualSystemPart partConfig={sectionConfig.part2} colors={colors} />
            </div>
        </section>
    );
};
