"use client";

import { useState, useEffect } from 'react';
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


export function BlogIndexPage({ config }: { config: PageConfig | null }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [allPosts, setAllPosts] = useState<Article[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Article[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const postsPerPage = config?.blogPageConfig?.postsPerPage || 9;

    useEffect(() => {
        const loadPosts = async () => {
            if (!config) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            // Step 1: Fetch posts based on mode ('all' or 'selected')
            let basePosts: Article[] = [];
            const mode = config?.blogPageConfig?.mode || 'all';

            if (mode === 'selected' && config?.blogPageConfig?.selectedPostIds?.length) {
                const postPromises = config.blogPageConfig.selectedPostIds.map(id => getArticleByIdAction(id));
                const results = await Promise.all(postPromises);
                basePosts = results.map(r => r.success ? r.data.article : null).filter(Boolean) as Article[];
            } else { // 'all' mode
                const result = await getArticlesByStatusAction('published');
                if (result.success) {
                    basePosts = result.data.articles;
                }
            }
            
            // Step 2: Apply server-side filters from config
            let serverFilteredPosts = basePosts;
            
            // Filter by source
            const source = config?.blogPageConfig?.source || 'all';
            if (source !== 'all') {
                const sourceMap = { 'cron': 'cron', 'manual-gen': 'manual', 'editor': 'editor' };
                serverFilteredPosts = serverFilteredPosts.filter(p => p.generationSource === sourceMap[source as keyof typeof sourceMap]);
            }

            // Filter by category if not showing all
            if (!config?.blogPageConfig?.showAllCategories && config?.blogPageConfig?.selectedCategories?.length) {
                serverFilteredPosts = serverFilteredPosts.filter(p => p.category && config!.blogPageConfig!.selectedCategories!.includes(p.category));
            }

            // Step 3: Enrich all remaining posts with author and comment count
            const enrichedPosts = await Promise.all(
                serverFilteredPosts.map(async (post) => {
                    const newPost = { ...post };
                    if (!newPost.id) return newPost;
            
                    try {
                        if (newPost.authorId) {
                            const author = await getUserProfile(newPost.authorId);
                            newPost.authorName = author?.firstName ? `${author.firstName} ${author.lastName || ''}`.trim() : author?.email || 'STAFF';
                        } else {
                            newPost.authorName = 'STAFF';
                        }
                    } catch (e) {
                        console.error("Failed to fetch author", e);
                        newPost.authorName = 'STAFF';
                    }
            
                    try {
                        if (newPost.commentsEnabled) {
                            const commentsResult = await getCommentsForArticleAction({ articleId: newPost.id });
                            newPost.commentsCount = commentsResult.success ? commentsResult.data.comments.length : 0;
                        } else {
                            newPost.commentsCount = 0;
                        }
                    } catch (e) {
                         console.error("Failed to fetch comments", e);
                         newPost.commentsCount = 0;
                    }
                    
                    return newPost;
                })
            );

            setAllPosts(enrichedPosts);
            
            // Step 4: Set up categories for client-side filtering
            const postCategories = new Set(enrichedPosts.map(p => p.category).filter(Boolean) as string[]);
            let categoriesToShow: string[] = [];
            if (config?.blogPageConfig?.showAllCategories) {
                categoriesToShow = Array.from(postCategories);
            } else if (config?.blogPageConfig?.selectedCategories?.length) {
                // Only show filters for categories that were actually selected and are present
                categoriesToShow = config.blogPageConfig.selectedCategories.filter(cat => postCategories.has(cat));
            }
            setAvailableCategories(categoriesToShow.sort());

            setIsLoading(false);
        };

        loadPosts();
    }, [config]);

    // This effect handles client-side filtering when the category buttons are clicked
    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredPosts(allPosts);
        } else {
            setFilteredPosts(allPosts.filter(post => post.category === selectedCategory));
        }
        setPage(1); // Reset pagination when filters change
    }, [allPosts, selectedCategory]);


    const themeColors = isDark ? config?.darkTheme : config?.lightTheme;
    const pageStyle: React.CSSProperties = {
        backgroundColor: themeColors?.backgroundColor || 'transparent',
        color: themeColors?.textColor || 'inherit',
        backgroundImage: config?.backgroundImage ? `url(${config.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
    };

    const titleStyle = { color: themeColors?.titleColor || 'inherit' };
    const overlayStyle = { backgroundColor: themeColors?.overlayColor || 'transparent' };

    const paginatedPosts = filteredPosts.slice(0, page * postsPerPage);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    }
    
    const renderPostCard = (post: Article) => {
         const createdAtDate = post.createdAt ? new Date(post.createdAt as string) : new Date();
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
                    <div className="text-center py-12 bg-background/50 rounded-lg">
                        <p className="text-muted-foreground">No posts found for this configuration.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
