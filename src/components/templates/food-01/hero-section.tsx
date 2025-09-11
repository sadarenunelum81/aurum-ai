
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';

export const FoodTemplate01HeroSection = ({ 
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

    if (!heroConfig?.enabled) return null;
    
    if (!featuredPost) {
         return (
            <div className="container mx-auto px-4 md:px-6 py-12">
                 <Skeleton className="h-[70vh] w-full" />
            </div>
        );
    }

    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
        backgroundImage: `url(${featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/1600/900`})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    const overlayStyle = {
        backgroundColor: colors?.overlayColor || 'rgba(0,0,0,0.4)'
    };

    const titleStyle = { color: colors?.titleColor || '#FFFFFF' };
    const metaStyle = { color: colors?.metaColor || '#E2E8F0' };
    const badgeStyle = { color: colors?.badgeTextColor, backgroundColor: colors?.badgeBackgroundColor };

    return (
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center text-center text-white" style={containerStyle}>
            <div className="absolute inset-0 z-0" style={overlayStyle} />
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                 <Link href={`/post/${featuredPost.id}`} className="block group">
                    {heroConfig.badgeText && (
                         <div className="mb-4 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold w-fit mx-auto" style={badgeStyle}>
                            <Star className="h-3 w-3" />
                            <span>{heroConfig.badgeText}</span>
                        </div>
                   )}
                    <h1 className="text-4xl md:text-6xl font-bold font-headline mt-2 group-hover:underline" style={titleStyle}>{featuredPost.title}</h1>
                    <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mt-6 text-sm" style={metaStyle}>
                        <span>BY {featuredPost.authorName?.toUpperCase() || 'STAFF'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{format(new Date(featuredPost.createdAt as string), 'PPP')}</span>
                    </div>
                </Link>
            </div>
        </section>
    );
};
