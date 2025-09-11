
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleByIdAction } from '@/app/actions';
import type { Article, TemplateConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getUserProfile } from '@/lib/auth';

async function getPostDetails(postIds: string[]): Promise<Article[]> {
    if (!postIds || postIds.length === 0) return [];

    const postPromises = postIds.map(async id => {
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

type PopulatedCategorySlot = {
    name: string;
    color?: string;
    posts: Article[];
};

export const FoodCategoriesSection = ({ config, themeMode }: { config?: TemplateConfig, themeMode?: 'light' | 'dark' }) => {
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
            const populatedPromises = sectionConfig.categorySlots.map(async (slot) => {
                const posts = await getPostDetails(slot.postIds || []);
                return {
                    name: slot.name,
                    color: slot.color,
                    posts: posts,
                };
            });

            const newPopulatedSlots = await Promise.all(populatedPromises);
            
            setPopulatedSlots(newPopulatedSlots);
            setIsLoading(false);
        }

        fetchData();
    }, [sectionConfig]);

    const useDarkColors = themeMode === 'dark' || (themeMode !== 'light' && resolvedTheme === 'dark');
    const colors = useDarkColors ? sectionConfig?.darkModeColors : sectionConfig?.lightModeColors;
    
    if (!sectionConfig?.enabled) return null;

    
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
             <Link href={`/post/${post.id}`} className="flex gap-4 group">
                <div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                        src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/75`}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold leading-tight group-hover:underline" style={{color: colors?.postTitleColor}}>{post.title}</h4>
                    <div className="text-xs mt-1" style={{color: colors?.postMetaColor}}>
                        <span>{format(new Date(post.createdAt as string), 'PP')}</span>
                    </div>
                </div>
            </Link>
        </li>
    );
    
    const renderCategorySlot = (slot?: PopulatedCategorySlot, index?: number) => {
        if (!slot || slot.posts.length === 0) return <div key={`empty-${index}`}><Skeleton className="h-8 w-1/2 mb-4" /><div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div></div>;

        return (
            <div key={index}>
                <h3 className="text-2xl font-bold font-headline mb-4" style={{color: slot.color || colors?.postTitleColor}}>{slot.name}</h3>
                 <ul className="space-y-0">
                    {slot.posts.map(renderPostItem)}
                </ul>
            </div>
        );
    }
    
    const CategorySlotsSkeletons = () => (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-4">
                     <Skeleton className="h-8 w-1/2" />
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
                </div>
            ))}
        </div>
    );

    return (
        <section className="relative py-12 md:py-20" style={containerStyle}>
            {overlayStyle.backgroundColor && <div className="absolute inset-0 z-0" style={overlayStyle} />}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {isLoading ? (
                    <CategorySlotsSkeletons />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {populatedSlots.filter(s => s.posts.length > 0).map((slot, i) => renderCategorySlot(slot, i))}
                    </div>
                )}
            </div>
        </section>
    );
};
