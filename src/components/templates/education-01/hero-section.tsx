
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { ArrowRight } from 'lucide-react';

export const EducationTemplate01HeroSection = ({ 
    config, 
    themeMode,
    featuredPost,
}: { 
    config?: TemplateConfig, 
    themeMode?: TemplateConfig['themeMode'],
    featuredPost: Article | null,
    sidePosts: Article[] // sidePosts is not used in this unique design but kept for type compatibility
}) => {
    const { resolvedTheme } = useTheme();

    const heroConfig = config?.hero;
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? heroConfig?.darkModeColors : heroConfig?.lightModeColors;

    if (!heroConfig?.enabled) return null;
    
    if (!featuredPost) {
         return (
            <div className="container mx-auto px-4 md:px-6 py-12">
                 <div className="grid md:grid-cols-2 gap-8 items-center">
                    <Skeleton className="h-96 w-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-1/3" />
                    </div>
                 </div>
            </div>
        );
    }

    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
    };
    
    const titleStyle = { color: colors?.titleColor };
    const metaStyle = { color: colors?.metaColor };
    const buttonStyle = { color: colors?.badgeTextColor, backgroundColor: colors?.badgeBackgroundColor };

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Image Side */}
                    <div className="relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                        <Image 
                            src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/800/600`} 
                            alt={featuredPost.title} 
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Text Side */}
                    <div className="text-center md:text-left">
                        {featuredPost.category && (
                            <p className="text-sm font-semibold uppercase tracking-widest" style={metaStyle}>
                                {featuredPost.category}
                            </p>
                        )}
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mt-2" style={titleStyle}>
                            {featuredPost.title}
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground" style={metaStyle}>
                            {featuredPost.content.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                        </p>
                        <Button asChild size="lg" className="mt-8 group" style={buttonStyle}>
                            <Link href={`/post/${featuredPost.id}`}>
                                Start Reading
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
