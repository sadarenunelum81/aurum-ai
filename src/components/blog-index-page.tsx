
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getArticlesByStatusAction, getAllCategoriesAction, getPageConfigAction, getCommentsForArticleAction } from '@/app/actions';
import type { PageConfig, Article, Category } from '@/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { getUserProfile } from '@/lib/auth';
import { MessageSquare } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function BlogIndexPage({ config: initialConfig }: { config: PageConfig | null }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [config, setConfig] = useState<PageConfig | null>(initialConfig);
    const [allPosts, setAllPosts] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const postsPerPage = config?.blogPageConfig?.postsPerPage || 9;

    useEffect(() => {
        const loadPageData = async () => {
            setIsLoading(true);

            let currentConfig = initialConfig;
            if (!currentConfig) {
                const result = await getPageConfigAction('blog');
                if (result.success && result.data) {
                    currentConfig = result.data;
                    setConfig(result.data);
                }
            }

            const [articleResult, categoryResult] = await Promise.all([
                getArticlesByStatusAction('published'),
                getAllCategoriesAction()
            ]);
            
            if (articleResult.success) {
                const enrichedPosts = await Promise.all(
                    articleResult.data.articles.map(async (post) => {
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
                            newPost.authorName = 'STAFF';
                        }
                        try {
                            const commentsResult = await getCommentsForArticleAction({ articleId: newPost.id });
                            if (commentsResult.success) {
                                newPost.commentsCount = commentsResult.data.comments.length;
                            }
                        } catch (e) {
                            newPost.commentsCount = 0;
                        }
                        return newPost;
                    })
                );
                setAllPosts(enrichedPosts);
            } else {
                 console.error("Failed to fetch articles:", articleResult.error);
            }

            if (categoryResult.success) {
                setCategories(categoryResult.data.categories);
            }

            setIsLoading(false);
        };
    
        loadPageData();
    }, [initialConfig]);
    
    const filteredPosts = useMemo(() => {
        let postsToFilter = [...allPosts];
        const blogConfig = config?.blogPageConfig;
    
        if (blogConfig) {
            const { mode, source, showAllCategories, selectedCategories, selectedPostIds } = blogConfig;
    
            if (mode === 'selected') {
                if (selectedPostIds && selectedPostIds.length > 0) {
                    const selectedIdsSet = new Set(selectedPostIds);
                    postsToFilter = postsToFilter.filter(p => p.id && selectedIdsSet.has(p.id));
                }
            } else { 
                if (source && source !== 'all') {
                    postsToFilter = postsToFilter.filter(p => p.generationSource === source);
                }
    
                if (!showAllCategories && selectedCategories && selectedCategories.length > 0) {
                    const selectedCatsSet = new Set(selectedCategories);
                    postsToFilter = postsToFilter.filter(p => p.category && selectedCatsSet.has(p.category));
                }
            }
        }
    
        if (searchQuery) {
            postsToFilter = postsToFilter.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
    
        if (selectedCategory !== 'all') {
             postsToFilter = postsToFilter.filter(post => post.category === selectedCategory);
        }
    
        return postsToFilter;
    }, [allPosts, config, searchQuery, selectedCategory]);


    const availableCategories = useMemo(() => {
        const showAll = config?.blogPageConfig?.showAllCategories !== false;
        const selectedCatsConfig = config?.blogPageConfig?.selectedCategories || [];
        
        let relevantPosts = allPosts;
        if (config?.blogPageConfig?.source && config.blogPageConfig.source !== 'all') {
            relevantPosts = allPosts.filter(p => p.generationSource === config.blogPageConfig.source);
        }

        const postCategories = new Set(relevantPosts.map(p => p.category).filter(Boolean) as string[]);
        
        if (showAll) {
            return Array.from(postCategories).sort();
        }
        return selectedCatsConfig.filter(cat => postCategories.has(cat)).sort();
    }, [allPosts, config]);

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
                    <div className="flex items-center gap-3">
                        {post.commentsEnabled && (
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3"/>
                                {post.commentsCount ?? 0}
                            </div>
                        )}
                        <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                    </div>
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

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <Input
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="md:max-w-xs"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="md:max-w-xs">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {availableCategories.map(cat => (
                               <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
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
                        <p className="text-muted-foreground">No posts found for the current filter settings.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
