

"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { MessageSquare, Star } from 'lucide-react';
import { cn } from '@/lib/utils';


export const LatestPostsGrid = ({ 
    config, 
    themeMode,
    posts,
    featuredPost
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

    if (!posts && !featuredPost) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-12">
                <Skeleton className="h-10 w-1/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
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
        backgroundImage: colors?.backgroundColor?.startsWith('http') || colors?.backgroundColor?.startsWith('https') ? `url(${colors.backgroundColor})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    const overlayStyle = { backgroundColor: colors?.overlayColor };
    const textBoxStyle = { backgroundColor: colors?.postTextBoxOverlayColor };
    const featuredTextBoxStyle = { backgroundColor: colors?.featuredPostTextBoxOverlayColor };
    
    const headerAlignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const renderPostCard = (post: Article) => (
        <div key={post.id} className="group flex flex-col">
            <Link href={`/post/${post.id}`} className="block w-full">
                 <div className="relative w-full overflow-hidden rounded-lg aspect-video">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/400`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>
            <div className="mt-4 flex-1 p-4 rounded-md" style={textBoxStyle}>
                {post.category && (
                    <p className="text-sm font-semibold uppercase" style={{ color: colors?.featuredBadgeIconColor }}>
                        {post.category}
                    </p>
                )}
                <Link href={`/post/${post.id}`}>
                    <h3 className="text-xl font-bold font-headline mt-1 group-hover:underline" style={{ color: colors?.postTitleColor }}>{post.title}</h3>
                </Link>
                <p className="mt-2 text-sm text-muted-foreground" style={{ color: colors?.postDescriptionColor }}>{post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: colors?.postMetaColor }}>
                    <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                    <span>{format(new Date(post.createdAt as string), 'P')}</span>
                    {post.commentsEnabled && <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}</div>}
                </div>
            </div>
        </div>
    );
    
    const renderFeaturedPost = (post: Article) => (
         <div key={post.id} className="group lg:col-span-3 flex flex-col lg:flex-row items-center gap-8 mt-8">
            <div className="lg:w-1/2 flex-1 p-6 rounded-md" style={featuredTextBoxStyle}>
                 {post.category && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-px" style={{backgroundColor: colors?.featuredBadgeIconColor}}/>
                        <p className="text-sm font-semibold uppercase" style={{ color: colors?.featuredBadgeIconColor }}>
                            {post.category}
                        </p>
                    </div>
                )}
                <Link href={`/post/${post.id}`}>
                    <h3 className="text-3xl font-bold font-headline mt-2 group-hover:underline" style={{ color: colors?.postTitleColor }}>{post.title}</h3>
                </Link>
                <p className="mt-2 text-md text-muted-foreground" style={{ color: colors?.postDescriptionColor }}>{post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
                <div className="flex items-center gap-3 mt-4 text-xs" style={{ color: colors?.postMetaColor }}>
                    <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                    <span>{format(new Date(post.createdAt as string), 'P')}</span>
                    {post.commentsEnabled && <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}</div>}
                </div>
            </div>
             <Link href={`/post/${post.id}`} className="block w-full lg:w-1/2">
                 <div className="relative w-full overflow-hidden rounded-lg aspect-video">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/450`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs" style={{backgroundColor: colors?.featuredBadgeBackgroundColor, color: colors?.featuredBadgeTextColor}}>
                         <Star className="h-3 w-3" style={{color: colors?.featuredBadgeIconColor}}/>
                         <span>{gridConfig?.featuredBadgeText || 'FEATURED'}</span>
                    </div>
                </div>
            </Link>
        </div>
    );

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            {colors?.overlayColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className={cn("mb-8 md:mb-12", headerAlignmentClasses[gridConfig.headerAlignment || 'left'])}>
                    {gridConfig.headerText && <h2 className="text-3xl md:text-4xl font-bold font-headline" style={{color: colors?.headerTextColor}}>{gridConfig.headerText}</h2>}
                    {gridConfig.descriptionText && <p className="mt-2 text-lg text-muted-foreground" style={{color: colors?.descriptionTextColor}}>{gridConfig.descriptionText}</p>}
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => renderPostCard(post))}
                    {featuredPost && renderFeaturedPost(featuredPost)}
                </div>
            </div>
        </section>
    );
};
