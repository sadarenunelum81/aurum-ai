
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';

export const TechTemplate01HeroSection = ({ 
    config, 
    themeMode,
    featuredPost,
    sidePosts 
}: { 
    config?: TemplateConfig, 
    themeMode?: TemplateConfig['themeMode'],
    featuredPost: Article | null,
    sidePosts: Article[] 
}) => {
    const { resolvedTheme } = useTheme();

    const heroConfig = config?.hero;
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? heroConfig?.darkModeColors : heroConfig?.lightModeColors;

    const getSidePostImage = (post: Article, index: number): string => {
        if (post.imageUrl) return post.imageUrl;
        const randomImages = heroConfig?.randomImageUrls || [];
        if (randomImages.length > 0) {
            return randomImages[index % randomImages.length];
        }
        return `https://picsum.photos/seed/${post.id}/100/100`;
    }

    if (!heroConfig?.enabled) return null;
    
    if (!featuredPost) {
         return (
            <div className="container mx-auto px-4 md:px-6 py-12">
                 <Skeleton className="h-[60vh] w-full" />
            </div>
        );
    }

    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
        backgroundImage: colors?.backgroundColor?.startsWith('http') || colors?.backgroundColor?.startsWith('https') ? `url(${colors.backgroundColor})` : undefined,
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
    const textBoxStyle = { backgroundColor: colors?.textBoxOverlayColor };

    return (
        <section className="relative" style={containerStyle}>
             {(colors?.overlayColor) && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Featured Post */}
                <div className="lg:col-span-2">
                    <Link href={`/post/${featuredPost.id}`} className="block group">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-4">
                            <Image src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/800/450`} alt={featuredPost.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px" priority />
                           {heroConfig.badgeText && (
                                 <div className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm" style={badgeStyle}>
                                    <Star className="h-4 w-4" />
                                    <span>{heroConfig.badgeText}</span>
                                </div>
                           )}
                        </div>
                        <div className="p-4 rounded-md" style={textBoxStyle}>
                            <p className="text-sm font-semibold uppercase" style={iconStyle}>{featuredPost.category || 'Uncategorized'}</p>
                            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 group-hover:underline" style={titleStyle}>{featuredPost.title}</h2>
                            <p className="mt-2 text-muted-foreground" style={titleStyle}>{featuredPost.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4 mt-4 text-sm p-4 rounded-md" style={textBoxStyle}>
                        <span style={metaStyle}>BY {featuredPost.authorName?.toUpperCase() || 'STAFF'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" style={metaStyle} />
                        <span style={metaStyle}>{format(new Date(featuredPost.createdAt as string), 'PPP')}</span>
                         {featuredPost.commentsEnabled && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" style={metaStyle} />
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare className="h-4 w-4" style={iconStyle}/>
                                    <span style={metaStyle}>{featuredPost.commentsCount || 0}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Side Posts */}
                <div className="space-y-6">
                    {sidePosts.map((post, index) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-4 group">
                             <div className="relative aspect-square h-16 w-16 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                                <Image 
                                    src={getSidePostImage(post, index)} 
                                    alt={post.title} 
                                    fill 
                                    className="object-cover object-center" 
                                    sizes="64px"
                                />
                            </div>
                            <div className="flex-1 p-3 rounded-md" style={textBoxStyle}>
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
