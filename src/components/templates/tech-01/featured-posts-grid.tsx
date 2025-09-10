
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction } from '@/app/actions';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getUserProfile } from '@/lib/auth';

async function getPostDetails(postIds: string[]): Promise<Article[]> {
    const postPromises = postIds.map(async (id) => {
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


export const TechTemplate01FeaturedPostsGrid = ({ config }: { config?: TemplateConfig, themeMode?: TemplateConfig['themeMode'] }) => {
    const [posts, setPosts] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const gridConfig = config?.featuredPostsGrid;

    useEffect(() => {
        if (!gridConfig?.enabled || !gridConfig.postIds || gridConfig.postIds.length === 0) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            const fetchedPosts = await getPostDetails(gridConfig.postIds!);
            setPosts(fetchedPosts);
            setIsLoading(false);
        }

        fetchData();
    }, [gridConfig]);
    
    if (!gridConfig?.enabled) return null;

    if (isLoading) {
        return (
            <section className="container mx-auto px-4 md:px-6 py-12">
                 <Skeleton className="h-8 w-1/3 mb-8" />
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="space-y-2">
                             <Skeleton className="aspect-video w-full" />
                             <Skeleton className="h-5 w-1/4" />
                             <Skeleton className="h-6 w-full" />
                             <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                 </div>
            </section>
        );
    }
    
    if (posts.length === 0) {
        return null;
    }

    const gridClasses = cn(
        'grid gap-8',
        `grid-cols-${gridConfig.mobilePosts || 1}`,
        `sm:grid-cols-${gridConfig.tabletPosts || 2}`,
        `lg:grid-cols-${gridConfig.desktopPosts || 4}`
    );

    return (
        <section className="container mx-auto px-4 md:px-6 py-12">
            {gridConfig.title && <h2 className="text-3xl font-bold font-headline mb-8">{gridConfig.title}</h2>}
            <div className={gridClasses}>
                {posts.map((post) => (
                     <Link key={post.id} href={`/post/${post.id}`} className="block group">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-4">
                             <Image src={post.imageUrl || `https://picsum.photos/seed/${post.id}/400/225`} alt={post.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <p className="text-sm font-semibold uppercase text-primary">{post.category || 'Uncategorized'}</p>
                        <h3 className="text-lg font-bold font-headline mt-1 group-hover:underline">{post.title}</h3>
                        <div className="text-xs text-muted-foreground mt-2">
                            <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                            <span className="mx-2">•</span>
                            <span>{format(new Date(post.createdAt as string), 'PPP')}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
