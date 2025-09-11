
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
    colors?: any;
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
                setFeaturedPost(posts.find(p => p.id === partConfig.featuredPostId) || null);
                setSidePosts(partConfig.sidePostIds?.map(id => posts.find(p => p.id === id)).filter(Boolean) as Article[] || []);
            }
            setIsLoading(false);
        }

        fetchData();
    }, [partConfig]);

    if (isLoading) {
        return (
            <div className="py-8">
                 <Skeleton className="h-8 w-1/3 mb-6" />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Skeleton className="aspect-video w-full" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }
    
    if (!featuredPost) return null;
    
    return (
        <div className="py-8">
             <div className="mb-6">
                {partConfig?.headerText && (
                    <h2 className="text-2xl font-bold font-headline" style={{ color: colors?.headerTextColor }}>
                        {partConfig.headerText}
                    </h2>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Featured Post */}
                <div className="lg:col-span-2 space-y-4">
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
                    <div>
                         <p className="text-xs font-semibold uppercase tracking-wider" style={{color: colors?.postMetaColor}}>{featuredPost.category || 'Featured'}</p>
                         <Link href={`/post/${featuredPost.id}`} className="block group">
                             <h3 className="text-2xl font-semibold leading-tight group-hover:text-primary mt-1" style={{ color: colors?.postTitleColor }}>
                                {featuredPost.title}
                            </h3>
                        </Link>
                        <p className="text-sm mt-2 text-muted-foreground" style={{color: colors?.postMetaColor}}>{featuredPost.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
                    </div>
                </div>
                {/* Side Posts List */}
                <div className="space-y-4">
                    {sidePosts.slice(0, 4).map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="block group p-3 rounded-md hover:bg-muted" style={{backgroundColor: colors?.postTitleOverlayColor}}>
                            <h4 className="font-semibold text-sm leading-tight group-hover:text-primary" style={{ color: colors?.postTitleColor }}>
                                {post.title}
                            </h4>
                            <p className="text-xs mt-1 text-muted-foreground" style={{color: colors?.postMetaColor}}>{format(new Date(post.createdAt as string), 'PP')}</p>
                        </Link>
                    ))}
                    {partConfig?.showMoreText && partConfig.showMoreLink && (
                        <Button asChild variant="outline" className="w-full" style={{color: colors?.showMoreTextColor, borderColor: colors?.lineColor}}>
                            <Link href={partConfig.showMoreLink}>{partConfig.showMoreText}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const EducationDualSystemSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
    const { resolvedTheme } = useTheme();
    const sectionConfig = config?.dualSystemSection;
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? sectionConfig?.darkModeColors : sectionConfig?.lightModeColors;

    if (!sectionConfig?.enabled) return null;

    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
    };
    
    return (
        <section className="relative" style={containerStyle}>
            <div className="container mx-auto px-4 md:px-6 py-6 divide-y" style={{borderColor: colors?.lineColor}}>
                <DualSystemPart partConfig={sectionConfig.part1} colors={colors} />
                <DualSystemPart partConfig={sectionConfig.part2} colors={colors} />
            </div>
        </section>
    );
};
