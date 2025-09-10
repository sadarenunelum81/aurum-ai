
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllArticlesAction, getAllCategoriesAction } from '@/app/actions';
import type { Article } from '@/types';
import type { Category } from '@/lib/categories';
import { Skeleton } from './ui/skeleton';
import { Check, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PostSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (postIds: string[]) => void;
    currentSelection: string[];
    selectionLimit: number;
}

export function PostSelector({ open, onOpenChange, onSelect, currentSelection, selectionLimit }: PostSelectorProps) {
    const [allPosts, setAllPosts] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [internalSelection, setInternalSelection] = useState<string[]>(currentSelection);

    useEffect(() => {
        if (open) {
            setInternalSelection(currentSelection);
            
            const fetchData = async () => {
                setIsLoading(true);
                const [postsResult, categoriesResult] = await Promise.all([
                    getAllArticlesAction(),
                    getAllCategoriesAction()
                ]);

                if (postsResult.success) {
                    // Only show published posts
                    setAllPosts(postsResult.data.articles.filter(p => p.status === 'published'));
                }
                if (categoriesResult.success) {
                    setCategories(categoriesResult.data.categories);
                }
                setIsLoading(false);
            };
            fetchData();
        }
    }, [open, currentSelection]);

    const filteredPosts = useMemo(() => {
        return allPosts
            .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
            .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allPosts, selectedCategory, searchQuery]);

    const handleToggleSelection = (postId: string) => {
        setInternalSelection(prev => {
            const isSelected = prev.includes(postId);
            if (isSelected) {
                return prev.filter(id => id !== postId);
            } else {
                if (prev.length < selectionLimit) {
                    return [...prev, postId];
                }
                // If limit is 1, replace instead of adding
                if (selectionLimit === 1) {
                    return [postId];
                }
                return prev; // Do nothing if limit is reached for multi-select
            }
        });
    };

    const handleConfirm = () => {
        onSelect(internalSelection);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Post{selectionLimit > 1 ? 's' : ''}</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4">
                    <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-2">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                        ) : (
                            filteredPosts.map(post => {
                                const isSelected = internalSelection.includes(post.id!);
                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => handleToggleSelection(post.id!)}
                                        className="flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-primary/10 data-[selected=true]:border-primary"
                                        data-selected={isSelected}
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{post.title}</p>
                                            <p className="text-sm text-muted-foreground">{post.category}</p>
                                        </div>
                                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm Selection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
