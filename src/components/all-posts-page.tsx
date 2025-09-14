
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticlesByStatusAction } from '@/app/actions';
import type { Article } from '@/types';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { getUserProfile } from '@/lib/auth';
import { Newspaper } from 'lucide-react';
import { getCommentsForArticleAction } from '@/app/actions';

export function AllPostsPage() {
    const [posts, setPosts] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            setIsLoading(true);
            try {
                const result = await getArticlesByStatusAction('published');
                if (result.success && result.data.articles) {
                    const fetchedPosts = result.data.articles;
                    const enrichedPosts = await Promise.all(
                        fetchedPosts.map(async (post) => {
                            const newPost = { ...post };
                            if (newPost.authorId) {
                                try {
                                    const author = await getUserProfile(newPost.authorId);
                                    newPost.authorName = author?.firstName ? `${author.firstName} ${author.lastName || ''}`.trim() : author?.email || 'STAFF';
                                } catch (e) {
                                    newPost.authorName = 'STAFF';
                                }
                            }
                            if (post.id) {
                                 try {
                                    const commentsResult = await getCommentsForArticleAction({ articleId: post.id });
                                    if (commentsResult.success) {
                                        newPost.commentsCount = commentsResult.data.comments.length;
                                    }
                                } catch (e) {
                                    newPost.commentsCount = 0;
                                }
                            }
                            return newPost;
                        })
                    );
                    setPosts(enrichedPosts);
                } else {
                    console.error("Failed to fetch articles:", result.error);
                }
            } catch (error) {
                console.error("Failed to fetch articles:", error);
            }
            setIsLoading(false);
        }
        loadPosts();
    }, []);

    const renderPostCard = (post: Article) => (
        <div key={post.id} className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10 bg-neutral-900/50">
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
                    <h3 className="text-lg font-bold font-headline text-white group-hover:text-primary">{post.title}</h3>
                </Link>
                 <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                    <span>BY {post.authorName?.toUpperCase() || 'STAFF'}</span>
                    <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                </div>
            </div>
        </div>
    );
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white container mx-auto px-4 py-16">
                 <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-white">
                        All Posts
                    </h1>
                </header>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-96 w-full bg-neutral-800" />)}
                 </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
             <header className="border-b border-neutral-800">
                <div className="container mx-auto px-4 py-4 flex items-center gap-3">
                    <Newspaper className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold text-white font-headline">
                        <Link href="/posts">All Published Posts</Link>
                    </h1>
                </div>
            </header>
            <main className="container mx-auto px-4 py-16">
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(renderPostCard)}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-neutral-400">No published posts found.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
