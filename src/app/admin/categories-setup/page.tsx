
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { addCategoryAction, getAllCategoriesAction, deleteCategoryAction } from '@/app/actions';
import type { Category } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesSetupPage() {
    const { toast } = useToast();
    const [newCategory, setNewCategory] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const fetchCategories = async () => {
        setIsLoading(true);
        const result = await getAllCategoriesAction();
        if (result.success) {
            setCategories(result.data.categories);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error,
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Category name cannot be empty.',
            });
            return;
        }

        setIsAdding(true);
        const result = await addCategoryAction(newCategory);
        if (result.success) {
            toast({
                title: 'Success',
                description: `Category "${newCategory}" added.`,
            });
            setNewCategory('');
            fetchCategories(); // Refresh the list
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error,
            });
        }
        setIsAdding(false);
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        const result = await deleteCategoryAction(id);
        if (result.success) {
            toast({
                title: 'Success',
                description: `Category "${name}" deleted.`,
            });
            fetchCategories(); // Refresh the list
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error,
            });
        }
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Category</CardTitle>
                    <CardDescription>Add a new category to organize your blog posts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            id="new-category"
                            placeholder="e.g., Artificial Intelligence"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            disabled={isAdding}
                        />
                        <Button onClick={handleAddCategory} disabled={isAdding}>
                            {isAdding ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                            Add
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Existing Categories</CardTitle>
                    <CardDescription>Manage your current list of categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : categories.length > 0 ? (
                        <ul className="divide-y">
                            {categories.map((cat) => (
                                <li key={cat.id} className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium">{cat.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                        className="text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">No categories found. Add one above to get started.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
