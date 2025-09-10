
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction } from '@/app/actions';
import type { Article, TemplateConfig, HeroSectionConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { getUserProfile } from '@/lib/auth';

async function getPostDetails(postIds: string[], heroConfig: HeroSectionConfig): Promise<Article[]> {
    const randomAuthors = heroConfig.randomAuthorNames || [];

    const postPromises = postIds.map(async (id, index) => {
        const result = await getArticleByIdAction(id);
        if (result.success && result.data.article) {
            const article = result.data.article;
            
            if (randomAuthors.length > 0) {
                 article.authorName = randomAuthors[index % randomAuthors.length];
            } else if (article.authorId) {
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

export const TechTemplate01HeroSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: TemplateConfig['themeMode'] }) => {
    const { resolvedTheme } = useTheme();
    const [featuredPost, setFeaturedPost] = useState<Article | null>(null);
    const [sidePosts, setSidePosts] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const heroConfig = config?.hero;
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? heroConfig?.darkModeColors : heroConfig?.lightModeColors;
    
    useEffect(() => {
        if (!heroConfig?.enabled) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            const allIds = [heroConfig.featuredPostId, ...(heroConfig.sidePostIds || [])].filter(Boolean) as string[];
            if (allIds.length === 0) {
                setIsLoading(false);
                return;
            }
            
            const posts = await getPostDetails(allIds, heroConfig);
            
            const featured = posts.find(p => p.id === heroConfig.featuredPostId) || null;
            const sides = (heroConfig.sidePostIds || [])
                .map(id => posts.find(p => p.id === id))
                .filter(Boolean) as Article[];
                
            setFeaturedPost(featured);
            setSidePosts(sides);
            setIsLoading(false);
        }

        fetchData();
    }, [heroConfig]);

    const getSidePostImage = (post: Article, index: number): string => {
        if (post.imageUrl) return post.imageUrl;
        const randomImages = heroConfig?.randomImageUrls || [];
        if (randomImages.length > 0) {
            return randomImages[index % randomImages.length];
        }
        return `https://picsum.photos/seed/${post.id}/100/100`;
    }

    if (!heroConfig?.enabled) return null;

    if (isLoading) {
        return <Skeleton className="h-[60vh] w-full" />;
    }

    if (!featuredPost) {
        return null; // Or a placeholder
    }

    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
        backgroundImage: colors?.backgroundColor?.startsWith('http') ? `url(${colors.backgroundColor})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    const overlayStyle = {
        backgroundColor: colors?.overlayColor
    };

    const titleStyle = { color: colors?.titleColor };
    const metaStyle = { color: colors?.metaColor };
    const iconStyle = { color: colors?.iconColor };
    const badgeStyle = { color: colors?.badgeTextColor, backgroundColor: colors?.badgeBackgroundColor };

    return (
        <section className="relative" style={containerStyle}>
             {colors?.overlayColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Featured Post */}
                <div className="lg:col-span-2">
                    <Link href={`/post/${featuredPost.id}`} className="block group">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-4">
                            <Image src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/800/450`} alt={featuredPost.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                           {heroConfig.badgeText && (
                                 <div className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm" style={badgeStyle}>
                                    <Star className="h-4 w-4" />
                                    <span>{heroConfig.badgeText}</span>
                                </div>
                           )}
                        </div>
                        <p className="text-sm font-semibold uppercase" style={iconStyle}>{featuredPost.category || 'Uncategorized'}</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 group-hover:underline" style={titleStyle}>{featuredPost.title}</h2>
                        <p className="mt-2 text-muted-foreground" style={titleStyle}>{featuredPost.content.substring(0, 150)}...</p>
                    </Link>
                    <div className="flex items-center gap-4 mt-4 text-sm" style={metaStyle}>
                        <span>BY {featuredPost.authorName?.toUpperCase() || 'STAFF'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{format(new Date(featuredPost.createdAt as string), 'PPP')}</span>
                         {featuredPost.commentsEnabled && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare className="h-4 w-4" style={iconStyle}/>
                                    <span>{featuredPost.commentsCount || 0}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Side Posts */}
                <div className="space-y-6">
                    {sidePosts.map((post, index) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-4 group">
                             <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                                <Image src={getSidePostImage(post, index)} alt={post.title} width={64} height={64} className="object-cover transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold leading-tight group-hover:underline" style={titleStyle}>{post.title}</h3>
                                 <div className="flex items-center gap-2 mt-1 text-xs" style={metaStyle}>
                                    <span>{post.authorName?.toUpperCase() || 'STAFF'}</span>
                                    <span className="w-1 h-1 rounded-full bg-current" />
                                    <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
