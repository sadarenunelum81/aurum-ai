
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export const PoliticsLatestPostsGrid = ({ 
    config, 
    themeMode,
    posts,
}: { 
    config?: TemplateConfig, 
    themeMode?: 'light' | 'dark',
    posts: Article[],
    featuredPost: Article | null
}) => {
    const { resolvedTheme } = useTheme();

    const gridConfig = config?.latestPostsGrid;
    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? gridConfig?.darkModeColors : gridConfig?.lightModeColors;
    
    if (!gridConfig?.enabled) return null;

    if (!posts || posts.length === 0) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-12">
                <Skeleton className="h-10 w-1/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-video w-full rounded-lg" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    const containerStyle = {
        backgroundColor: colors?.backgroundColor,
    };

    const headerAlignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const renderPostCard = (post: Article) => (
        <div key={post.id} className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md" style={{borderColor: colors?.postTextBoxOverlayColor, backgroundColor: colors?.postTextBoxOverlayColor}}>
            <Link href={`/post/${post.id}`} className="block w-full">
                 <div className="relative w-full overflow-hidden aspect-video">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/400`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>
            <div className="flex-1 p-4 flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary" style={{color: colors?.postMetaColor}}>{post.category || 'Analysis'}</p>
                <Link href={`/post/${post.id}`} className="flex-1">
                    <h3 className="text-lg font-bold font-headline group-hover:underline" style={{ color: colors?.postTitleColor }}>{post.title}</h3>
                </Link>
                 <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground" style={{ color: colors?.postMetaColor }}>
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                </div>
            </div>
        </div>
    );
    
    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className={cn("mb-8 md:mb-12", headerAlignmentClasses[gridConfig.headerAlignment || 'left'])}>
                    {gridConfig.headerText && <h2 className="text-3xl md:text-4xl font-bold font-headline" style={{color: colors?.headerTextColor}}>{gridConfig.headerText}</h2>}
                    {gridConfig.descriptionText && <p className="mt-2 text-lg max-w-3xl" style={{color: colors?.descriptionTextColor}}>{gridConfig.descriptionText}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => renderPostCard(post))}
                </div>
            </div>
        </section>
    );
};
