
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { Zap } from 'lucide-react';

export const PoliticsTemplate01HeroSection = ({ 
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
                 <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><Skeleton className="h-96 w-full" /></div>
                    <div className="space-y-4"><Skeleton className="h-96 w-full" /></div>
                 </div>
            </div>
        );
    }

    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
    };
    
    const titleStyle = { color: colors?.titleColor };
    const metaStyle = { color: colors?.metaColor };

    return (
        <section className="relative py-12 md:py-16" style={containerStyle}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Featured Post */}
                    <div className="lg:col-span-2">
                        <Link href={`/post/${featuredPost.id}`} className="block group">
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                                <Image 
                                    src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/800/450`} 
                                    alt={featuredPost.title} 
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </Link>
                        <div className="mt-4">
                            {featuredPost.category && (
                                <p className="text-sm font-semibold uppercase tracking-wider text-primary" style={metaStyle}>
                                    {featuredPost.category}
                                </p>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold font-headline mt-2" style={titleStyle}>
                                <Link href={`/post/${featuredPost.id}`}>{featuredPost.title}</Link>
                            </h1>
                             <div className="flex items-center gap-4 text-xs mt-4" style={{color: colors?.metaColor}}>
                                <span>BY {featuredPost.authorName?.toUpperCase() || 'STAFF'}</span>
                                <span className="w-1 h-1 rounded-full bg-current" />
                                <span>{format(new Date(featuredPost.createdAt as string), 'PPP')}</span>
                            </div>
                        </div>
                    </div>
                    {/* Side Posts List */}
                    <div className="bg-card p-4 rounded-lg shadow-sm" style={{backgroundColor: colors?.textBoxOverlayColor}}>
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{color: colors?.titleColor}}>
                            <Zap className="h-5 w-5" />
                            {heroConfig.breakingNewsTitle || 'Breaking News'}
                        </h3>
                        <div className="space-y-4">
                            {sidePosts.map((post) => (
                                <Link key={post.id} href={`/post/${post.id}`} className="block group">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <Image
                                                src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/75`}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm leading-tight group-hover:underline" style={{color: colors?.titleColor}}>{post.title}</h4>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
