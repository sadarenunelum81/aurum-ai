
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, CornerDownRight } from 'lucide-react';
import { addCategoryAction, getAllCategoriesAction, deleteCategoryAction } from '@/app/actions';
import type { Category } from '@/lib/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Recursive function to render categories and their children
function CategoryList({ categories, allCategories, level = 0, onDelete }: { categories: Category[], allCategories: Category[], level?: number, onDelete: (id: string, name: string) => void }) {
    return (
        <ul className={level > 0 ? "pl-6 mt-2" : ""}>
            {categories.map((cat) => {
                const children = allCategories.filter(c => c.parentId === cat.id);
                return (
                    <li key={cat.id} className="group flex items-center justify-between py-2 border-b">
                        <div className="flex items-center">
                            {level > 0 && <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />}
                            <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <div>
                             <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(cat.id, cat.name)}
                                className="text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                         {children.length > 0 && (
                            <CategoryList categories={children} allCategories={allCategories} level={level + 1} onDelete={onDelete} />
                        )}
                    </li>
                );
            })}
        </ul>
    );
};


export default function CategoriesSetupPage() {
    const { toast } = useToast();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(undefined);
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
                title: 'Error fetching categories',
                description: result.error,
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Category name cannot be empty.',
            });
            return;
        }

        setIsAdding(true);
        const result = await addCategoryAction({ name: newCategoryName, parentId: parentCategoryId });
        if (result.success) {
            toast({
                title: 'Success',
                description: `Category "${newCategoryName}" added.`,
            });
            setNewCategoryName('');
            setParentCategoryId(undefined);
            fetchCategories(); // Refresh the list
        } else {
            toast({
                variant: 'destructive',
                title: 'Error adding category',
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
                title: 'Error deleting category',
                description: result.error,
            });
        }
    };
    
    // Memoize the hierarchical list to prevent re-computation on every render
    const topLevelCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Category</CardTitle>
                    <CardDescription>Add a new category or sub-category to organize your blog posts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="new-category-name" className="text-sm font-medium">Category Name</label>
                        <Input
                            id="new-category-name"
                            placeholder="e.g., Artificial Intelligence"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            disabled={isAdding}
                        />
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="parent-category" className="text-sm font-medium">Parent Category (Optional)</label>
                        <Select onValueChange={(value) => setParentCategoryId(value === 'none' ? undefined : value)} disabled={isAdding}>
                            <SelectTrigger id="parent-category">
                                <SelectValue placeholder="Select a parent category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Top-Level)</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={handleAddCategory} disabled={isAdding}>
                            {isAdding ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Add Category
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Existing Categories</CardTitle>
                    <CardDescription>Manage your current list of categories and their hierarchy.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : categories.length > 0 ? (
                       <CategoryList categories={topLevelCategories} allCategories={categories} onDelete={handleDeleteCategory} />
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">No categories found. Add one above to get started.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
