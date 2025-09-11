
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
import { MessageSquare, ChevronsRight } from 'lucide-react';
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
    const [bottomPosts, setBottomPosts] = useState<Article[]>([]);
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
                ...(partConfig.bottomPostIds || [])
            ].filter(Boolean) as string[];

            if (postIdsToFetch.length > 0) {
                const posts = await getPostDetails(postIdsToFetch);
                if (partConfig.featuredPostId) {
                    setFeaturedPost(posts.find(p => p.id === partConfig.featuredPostId) || null);
                }
                if (partConfig.sidePostIds) {
                    setSidePosts(partConfig.sidePostIds.map(id => posts.find(p => p.id === id)).filter(Boolean) as Article[]);
                }
                if (partConfig.bottomPostIds) {
                    setBottomPosts(partConfig.bottomPostIds.map(id => posts.find(p => p.id === id)).filter(Boolean) as Article[]);
                }
            } else {
                 setFeaturedPost(null);
                 setSidePosts([]);
                 setBottomPosts([]);
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
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                </div>
                 <Skeleton className="h-40 w-full mt-8" />
            </div>
        );
    }
    
    if (!partConfig?.featuredPostId && (!partConfig?.sidePostIds || partConfig.sidePostIds.length === 0)) {
        return null; // Don't render the part if no main posts are selected
    }
    
    return (
        <div className="py-8">
             <div className="flex justify-between items-center mb-4">
                {partConfig.headerText && (
                    <h2 className="text-2xl font-bold font-headline" style={{ color: colors?.headerTextColor }}>
                        {partConfig.headerText}
                    </h2>
                )}
                 {partConfig.showMoreText && partConfig.showMoreLink && (
                    <Button asChild variant="link" className="font-semibold group" style={{ color: colors?.showMoreTextColor }}>
                        <Link href={partConfig.showMoreLink}>{partConfig.showMoreText} <ChevronsRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" /></Link>
                    </Button>
                )}
            </div>
            <hr className="border-t mb-6" style={{ borderColor: colors?.lineColor }} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 {/* Left Side: Featured Post */}
                <div className="lg:col-span-2">
                    {featuredPost && (
                        <div>
                            <Link href={`/post/${featuredPost.id}`} className="block group mb-4">
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                                    <Image
                                        src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/800/450`}
                                        alt={featuredPost.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div 
                                        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
                                        style={{backgroundColor: colors?.postTitleOverlayColor}}
                                    >
                                         <h3 className="text-2xl font-semibold leading-tight text-white group-hover:underline" style={{ color: colors?.postTitleColor }}>
                                            {featuredPost.title}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                             <div className="flex items-center gap-4 text-xs" style={{color: colors?.postMetaColor}}>
                                <span>BY {featuredPost.authorName?.toUpperCase() || 'STAFF'}</span>
                                 <span>{format(new Date(featuredPost.createdAt as string), 'PPP')}</span>
                                {featuredPost.commentsEnabled && <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {featuredPost.commentsCount || 0}</div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Side Posts */}
                 <div className="divide-y rounded-lg overflow-hidden" style={{borderColor: colors?.lineColor}}>
                    {sidePosts.slice(0, 5).map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-4 group p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                             <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                <Image
                                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/100`}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm leading-tight group-hover:underline" style={{ color: colors?.postTitleColor }}>
                                    {post.title}
                                </h3>
                                 <p className="text-xs mt-1" style={{color: colors?.postMetaColor}}>{format(new Date(post.createdAt as string), 'PP')}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            
            {/* Bottom Posts */}
            {bottomPosts.length > 0 && (
                <div className="mt-8 pt-6 border-t" style={{borderColor: colors?.lineColor}}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bottomPosts.map(post => (
                            <Link key={post.id} href={`/post/${post.id}`} className="group">
                                <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md">
                                     <Image
                                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/300/300`}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <h4 className="font-semibold mt-2 text-sm leading-tight group-hover:underline" style={{color: colors?.postTitleColor}}>
                                    {post.title}
                                </h4>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const PetsDualSystemSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
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
            <div className="container mx-auto px-4 md:px-6 py-12 relative z-10 divide-y" style={{borderColor: colors?.lineColor}}>
                <DualSystemPart partConfig={sectionConfig.part1} colors={colors} />
                <DualSystemPart partConfig={sectionConfig.part2} colors={colors} />
            </div>
        </section>
    );
};
