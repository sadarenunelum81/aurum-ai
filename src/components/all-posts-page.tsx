
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getArticlesByStatusAction } from '@/app/actions';
import type { Article } from '@/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { getUserProfile } from '@/lib/auth';

export function AllPostsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [posts, setPosts] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const postsPerPage = 9;

    useEffect(() => {
        async function loadPosts() {
            setIsLoading(true);
            const result = await getArticlesByStatusAction('published');
            if (result.success && result.data.articles) {
                const enrichedPosts = await Promise.all(result.data.articles.map(async post => {
                    if (post.authorId) {
                        try {
                            const author = await getUserProfile(post.authorId);
                            post.authorName = author?.firstName ? `${author.firstName} ${author.lastName || ''}`.trim() : author?.email || 'STAFF';
                        } catch (e) {
                             console.error(`Failed to fetch author for post ${post.id}`, e);
                             post.authorName = 'STAFF';
                        }
                    }
                    return post;
                }));
                setPosts(enrichedPosts);
            } else {
                 console.error("Failed to fetch articles:", result.error);
            }
            setIsLoading(false);
        }
        loadPosts();
    }, []);

    const paginatedPosts = posts.slice(0, page * postsPerPage);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    }
    
    const renderPostCard = (post: Article) => (
        <div key={post.id} className="group flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-xl bg-card">
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
            <div className="flex-1 p-6 flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">{post.category || 'Article'}</p>
                <Link href={`/post/${post.id}`} className="flex-1">
                    <h3 className="text-lg font-bold font-headline group-hover:text-primary">{post.title}</h3>
                </Link>
                 <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                    <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                </div>
            </div>
        </div>
    );
    
    if (isLoading) {
        return (
            <div className="min-h-screen container mx-auto px-4 py-16">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                 </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-background">
            <main className="relative z-10 container mx-auto px-4 py-16">
                 <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline">
                        All Published Posts
                    </h1>
                </header>
                {paginatedPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedPosts.map(renderPostCard)}
                        </div>
                        {posts.length > paginatedPosts.length && (
                            <div className="mt-12 text-center">
                                <Button onClick={handleLoadMore}>Load More</Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No published posts found.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
