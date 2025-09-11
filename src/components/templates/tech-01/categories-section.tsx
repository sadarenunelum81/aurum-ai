
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction } from '@/app/actions';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

async function getPostDetails(postIds: string[]): Promise<Article[]> {
    const postPromises = postIds.map(async id => {
        const result = await getArticleByIdAction(id);
        return result.success ? result.data.article : null;
    });
    const results = await Promise.all(postPromises);
    return results.filter(Boolean) as Article[];
}

type PopulatedCategorySlot = {
    name: string;
    color?: string;
    posts: Article[];
};

export const CategoriesSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
    const { resolvedTheme } = useTheme();
    const [populatedSlots, setPopulatedSlots] = useState<PopulatedCategorySlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const sectionConfig = config?.categoriesSection;

    useEffect(() => {
        if (!sectionConfig?.enabled || !sectionConfig.categorySlots) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            const allPostIds = sectionConfig.categorySlots.flatMap(slot => slot.postIds || []);
            
            if (allPostIds.length === 0) {
                 const emptySlots = sectionConfig.categorySlots.map(slot => ({
                    name: slot.name,
                    color: slot.color,
                    posts: [],
                }));
                setPopulatedSlots(emptySlots);
                setIsLoading(false);
                return;
            }

            const allPosts = await getPostDetails(allPostIds);

            const newPopulatedSlots = sectionConfig.categorySlots.map(slot => {
                const slotPosts = (slot.postIds || []).map(id => allPosts.find(p => p.id === id)).filter(Boolean) as Article[];
                return {
                    name: slot.name,
                    color: slot.color,
                    posts: slotPosts,
                };
            });
            
            setPopulatedSlots(newPopulatedSlots);
            setIsLoading(false);
        }

        fetchData();
    }, [sectionConfig]);

    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? sectionConfig?.darkModeColors : sectionConfig?.lightModeColors;
    
    if (!sectionConfig?.enabled) return null;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-12">
                <Skeleton className="h-10 w-1/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-4">
                             <Skeleton className="h-8 w-1/2" />
                             <Skeleton className="h-24 w-full" />
                             <Skeleton className="h-24 w-full" />
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
    
    const renderPostItem = (post: Article) => (
        <li key={post.id} className="border-t py-4" style={{borderColor: colors?.postBoxColor}}>
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                    <Link href={`/post/${post.id}`}>
                       <h4 className="font-semibold leading-tight hover:underline" style={{color: colors?.postTitleColor}}>{post.title}</h4>
                    </Link>
                    <div className="flex items-center gap-2 text-xs" style={{color: colors?.postMetaColor}}>
                        <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                        {post.commentsEnabled && <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}</div>}
                    </div>
                </div>
                <Link href={`/post/${post.id}`} className="block">
                    <div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted">
                        <Image
                            src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/75`}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                </Link>
            </div>
        </li>
    );

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            {colors?.overlayColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className={cn("mb-8 md:mb-12", headerAlignmentClasses[sectionConfig.headerAlignment || 'left'])}>
                    {sectionConfig.headerText && <h2 className="text-3xl md:text-4xl font-bold font-headline" style={{color: colors?.headerTextColor}}>{sectionConfig.headerText}</h2>}
                    {sectionConfig.descriptionText && <p className="mt-2 text-lg text-muted-foreground" style={{color: colors?.descriptionTextColor}}>{sectionConfig.descriptionText}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">
                    {populatedSlots.map((slot, index) => (
                        <div key={index}>
                            <h3 className="text-2xl font-bold font-headline mb-4" style={{color: slot.color || colors?.postTitleColor}}>{slot.name}</h3>
                             <ul className="space-y-0">
                                {slot.posts.map(renderPostItem)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
