
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getArticlesByStatusAction, getArticleByIdAction } from '@/app/actions';
import type { PageConfig, Article } from '@/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { getUserProfile } from '@/lib/auth';

async function getPosts(config: PageConfig | null): Promise<Article[]> {
    let posts: Article[] = [];
    
    // Default to 'all' if config or blogPageConfig is missing
    const mode = config?.blogPageConfig?.mode || 'all';

    if (mode === 'selected' && config?.blogPageConfig?.selectedPostIds) {
        const postPromises = config.blogPageConfig.selectedPostIds.map(async id => {
            const result = await getArticleByIdAction(id);
            return result.success ? result.data.article : null;
        });
        const results = await Promise.all(postPromises);
        posts = results.filter(Boolean) as Article[];
    } else {
        // Fallback to 'all' published posts if mode is 'all' or if 'selected' but no IDs are present
        const result = await getArticlesByStatusAction('published');
        if (result.success) {
            posts = result.data.articles;
        }
    }
    
    // Fetch author names for the determined posts
    const enrichedPosts = await Promise.all(posts.map(async post => {
        if (post.authorId) {
            const author = await getUserProfile(post.authorId);
            post.authorName = author?.firstName ? `${author.firstName} ${author.lastName}` : author?.email || 'STAFF';
        }
        return post;
    }));

    return enrichedPosts;
}

export function BlogIndexPage({ config }: { config: PageConfig | null }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [posts, setPosts] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const postsPerPage = 9;

    useEffect(() => {
        async function loadPosts() {
            setIsLoading(true);
            const fetchedPosts = await getPosts(config);
            setPosts(fetchedPosts);
            setIsLoading(false);
        }
        loadPosts();
    }, [config]);

    const themeColors = isDark ? config?.darkTheme : config?.lightTheme;

    const pageStyle = {
        backgroundColor: themeColors?.backgroundColor || 'transparent',
        color: themeColors?.textColor || 'inherit',
        backgroundImage: config?.backgroundImage ? `url(${config.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
    };

    const titleStyle = { color: themeColors?.titleColor || 'inherit' };
    const overlayStyle = { backgroundColor: themeColors?.overlayColor || 'transparent' };

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
                 <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
                 <Skeleton className="h-6 w-3/4 mx-auto mb-12" />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                 </div>
            </div>
        )
    }

    return (
        <div style={pageStyle} className="relative min-h-screen">
            <div className="absolute inset-0" style={overlayStyle} />
            <main className="relative z-10 container mx-auto px-4 py-16">
                 <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline" style={titleStyle}>
                        {config?.title || 'Our Blog'}
                    </h1>
                    {config?.content && <p className="mt-4 max-w-2xl mx-auto" style={{color: themeColors?.textColor}}>{config.content}</p>}
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedPosts.map(renderPostCard)}
                </div>
                {posts.length > paginatedPosts.length && (
                    <div className="mt-12 text-center">
                        <Button onClick={handleLoadMore}>Load More</Button>
                    </div>
                )}
            </main>
        </div>
    );
}
