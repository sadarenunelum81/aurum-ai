
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';

export const PetsTemplate01HeroSection = ({ 
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
        return `https://picsum.photos/seed/${post.id}/300/300`;
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
    const badgeStyle = { color: colors?.badgeTextColor, backgroundColor: colors?.badgeBackgroundColor };

    return (
        <section className="relative py-12" style={containerStyle}>
            {overlayStyle.backgroundColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Featured Post */}
                <div className="w-full mb-12">
                    <Link href={`/post/${featuredPost.id}`} className="block group">
                        <div className="relative aspect-[16/9] md:aspect-[2/1] w-full rounded-lg overflow-hidden shadow-2xl">
                            <Image src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/1200/600`} alt={featuredPost.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                               {heroConfig.badgeText && (
                                     <div className="mb-2 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold w-fit" style={badgeStyle}>
                                        <Star className="h-3 w-3" />
                                        <span>{heroConfig.badgeText}</span>
                                    </div>
                               )}
                                <h2 className="text-3xl md:text-5xl font-bold font-headline mt-2 text-white" style={titleStyle}>{featuredPost.title}</h2>
                                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-white/90" style={metaStyle}>
                                    <span>BY {featuredPost.authorName?.toUpperCase() || 'STAFF'}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    <span>{format(new Date(featuredPost.createdAt as string), 'PPP')}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Side Posts */}
                {sidePosts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {sidePosts.map((post, index) => (
                            <Link key={post.id} href={`/post/${post.id}`} className="flex flex-col items-center text-center group">
                                <div className="relative aspect-square h-32 w-32 rounded-full overflow-hidden flex-shrink-0 shadow-lg border-4 border-background bg-muted">
                                    <Image 
                                        src={getSidePostImage(post, index)} 
                                        alt={post.title} 
                                        fill 
                                        className="object-cover object-center transition-transform duration-300 group-hover:scale-110" 
                                        sizes="128px"
                                    />
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold text-sm leading-tight group-hover:underline" style={titleStyle}>{post.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
