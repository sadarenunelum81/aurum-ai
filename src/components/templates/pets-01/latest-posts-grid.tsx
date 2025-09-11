
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';


export const PetsLatestPostsGrid = ({ 
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
    
    const headerAlignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const renderPostCard = (post: Article) => (
        <div key={post.id} className="group flex flex-col overflow-hidden rounded-lg shadow-lg transition-shadow hover:shadow-2xl bg-card" style={{backgroundColor: colors?.postTextBoxOverlayColor}}>
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
            <div className="flex-1 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{color: colors?.postMetaColor}}>{post.category || 'Featured'}</p>
                <Link href={`/post/${post.id}`}>
                    <h3 className="text-xl font-bold font-headline mt-1 group-hover:underline" style={{ color: colors?.postTitleColor }}>{post.title}</h3>
                </Link>
                <p className="mt-3 text-sm text-muted-foreground" style={{ color: colors?.postDescriptionColor }}>{post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
            </div>
             <div className="border-t p-4 flex items-center justify-between text-xs" style={{borderColor: colors?.backgroundColor, color: colors?.postMetaColor}}>
                <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                <span>{format(new Date(post.createdAt as string), 'PP')}</span>
            </div>
        </div>
    );
    
    const renderFeaturedPost = (post: Article) => (
         <div key={post.id} className="group lg:col-span-3 flex flex-col md:flex-row items-center gap-8 mt-12 bg-card p-6 rounded-lg shadow-xl" style={{backgroundColor: colors?.featuredPostTextBoxOverlayColor}}>
             <Link href={`/post/${post.id}`} className="block w-full md:w-1/2">
                 <div className="relative w-full overflow-hidden rounded-lg aspect-video shadow-lg">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/450`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-semibold" style={{backgroundColor: colors?.featuredBadgeBackgroundColor, color: colors?.featuredBadgeTextColor}}>
                         <Star className="h-3 w-3" style={{color: colors?.featuredBadgeIconColor}}/>
                         <span>{gridConfig?.featuredBadgeText || 'FEATURED'}</span>
                    </div>
                </div>
            </Link>
             <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{color: colors?.postMetaColor}}>{post.category || 'Featured'}</p>
                <Link href={`/post/${post.id}`}>
                    <h3 className="text-3xl font-bold font-headline mt-2 group-hover:underline" style={{ color: colors?.postTitleColor }}>{post.title}</h3>
                </Link>
                <p className="mt-4 text-md text-muted-foreground" style={{ color: colors?.postDescriptionColor }}>{post.content.replace(/<[^>]*>?/gm, '').substring(0, 180)}...</p>
                 <div className="flex items-center justify-center md:justify-start gap-3 mt-4 text-xs" style={{ color: colors?.postMetaColor }}>
                    <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                    <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                </div>
            </div>
        </div>
    );

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            {overlayStyle.backgroundColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
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
