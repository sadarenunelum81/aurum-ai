"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getArticlesByStatusAction, getArticleByIdAction, getCommentsForArticleAction } from '@/app/actions';
import type { PageConfig, Article } from '@/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { getUserProfile } from '@/lib/auth';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to fetch all necessary data for a list of posts
async function enrichPosts(posts: Article[]): Promise<Article[]> {
    const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
            const newPost = { ...post };
            if (newPost.id) {
                // Fetch Author
                if (newPost.authorId) {
                    try {
                        const author = await getUserProfile(newPost.authorId);
                        newPost.authorName = author?.firstName ? `${author.firstName} ${author.lastName || ''}`.trim() : author?.email || 'STAFF';
                    } catch (error) {
                        console.error(`Failed to fetch author for post ${newPost.id}`, error);
                        newPost.authorName = 'STAFF';
                    }
                } else {
                    newPost.authorName = 'STAFF';
                }

                // Fetch Comment Count
                if (newPost.commentsEnabled) {
                    try {
                        const commentsResult = await getCommentsForArticleAction({ articleId: newPost.id });
                        newPost.commentsCount = commentsResult.success ? commentsResult.data.comments.length : 0;
                    } catch (error) {
                        console.error(`Failed to fetch comments for post ${newPost.id}`, error);
                        newPost.commentsCount = 0;
                    }
                } else {
                    newPost.commentsCount = 0;
                }
            }
            return newPost;
        })
    );
    return enrichedPosts;
}


async function getInitialPosts(config: PageConfig | null): Promise<Article[]> {
    let posts: Article[] = [];
    const mode = config?.blogPageConfig?.mode || 'all';

    if (mode === 'selected' && config?.blogPageConfig?.selectedPostIds?.length) {
        const postPromises = config.blogPageConfig.selectedPostIds.map(async id => {
            const result = await getArticleByIdAction(id);
            return result.success ? result.data.article : null;
        });
        const results = await Promise.all(postPromises);
        posts = results.filter(Boolean) as Article[];
    } else { // 'all' or 'category' mode initially fetches all published posts
        const result = await getArticlesByStatusAction('published');
        if (result.success) {
            posts = result.data.articles;
        }
    }
    
    return enrichPosts(posts);
}

export function BlogIndexPage({ config }: { config: PageConfig | null }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [allPosts, setAllPosts] = useState<Article[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Article[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const postsPerPage = 9;

    useEffect(() => {
        async function loadPosts() {
            setIsLoading(true);
            const fetchedPosts = await getInitialPosts(config);
            setAllPosts(fetchedPosts);

            // Determine categories from fetched posts
            const postCategories = new Set(fetchedPosts.map(p => p.category).filter(Boolean) as string[]);
            const configCategories = config?.blogPageConfig?.selectedCategories || [];
            
            let categoriesToShow: string[];
            if (config?.blogPageConfig?.showAllCategories) {
                categoriesToShow = Array.from(postCategories);
            } else {
                categoriesToShow = configCategories.filter(cat => postCategories.has(cat));
            }
            setAvailableCategories(categoriesToShow.sort());

            setIsLoading(false);
        }
        loadPosts();
    }, [config]);

    useEffect(() => {
        let postsToFilter = allPosts;
        // Server-side category filtering
        if (config?.blogPageConfig?.mode === 'category' && !config.blogPageConfig.showAllCategories && config.blogPageConfig.selectedCategories?.length) {
            postsToFilter = allPosts.filter(p => p.category && config.blogPageConfig!.selectedCategories!.includes(p.category));
        }

        // Client-side category filtering
        if (selectedCategory === 'all') {
            setFilteredPosts(postsToFilter);
        } else {
            setFilteredPosts(postsToFilter.filter(post => post.category === selectedCategory));
        }
        setPage(1); // Reset pagination on filter change
    }, [allPosts, selectedCategory, config]);


    const themeColors = isDark ? config?.darkTheme : config?.lightTheme;
    const pageStyle = { /* ... */ };
    const titleStyle = { color: themeColors?.titleColor || 'inherit' };
    const overlayStyle = { backgroundColor: themeColors?.overlayColor || 'transparent' };

    const paginatedPosts = filteredPosts.slice(0, page * postsPerPage);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    }
    
    const renderPostCard = (post: Article) => {
        const createdAtDate = post.createdAt ? new Date(post.createdAt) : new Date();

        return (
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
                        <div className="flex items-center gap-3">
                            {post.commentsEnabled && (
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3"/>
                                    {post.commentsCount ?? 0}
                                </div>
                            )}
                            <span>{format(createdAtDate, 'PP')}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    };
    
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

                {availableCategories.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-2 mb-12">
                        <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} onClick={() => setSelectedCategory('all')}>All</Button>
                        {availableCategories.map(cat => (
                            <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)}>
                                {cat}
                            </Button>
                        ))}
                    </div>
                )}
                
                {paginatedPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedPosts.map(renderPostCard)}
                        </div>
                        {filteredPosts.length > paginatedPosts.length && (
                            <div className="mt-12 text-center">
                                <Button onClick={handleLoadMore}>Load More</Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No posts found for this configuration.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
