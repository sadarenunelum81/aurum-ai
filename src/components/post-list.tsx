
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
    getAllArticlesAction,
    updateArticleStatusAction,
    deleteArticleAction,
} from '@/app/actions';
import type { Article } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash, ToggleRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

export function PostList() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    async function fetchArticles() {
        setLoading(true);
        const result = await getAllArticlesAction();
        if (result.success) {
            setArticles(result.data.articles);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleStatusToggle = async (articleId: string, currentStatus: 'draft' | 'published') => {
        const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
        const result = await updateArticleStatusAction({ articleId, status: newStatus });
        if (result.success) {
            toast({ title: 'Success', description: `Article moved to ${newStatus}.` });
            fetchArticles(); // Refresh the list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    const handleDelete = async (articleId: string) => {
        const result = await deleteArticleAction({ articleId });
        if (result.success) {
            toast({ title: 'Success', description: 'Article deleted.' });
            fetchArticles(); // Refresh the list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };
    
    const openDialog = (article: Article) => {
        setSelectedArticle(article);
        setIsDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-[200px] w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    const spacingClasses = {
        small: 'space-y-2',
        medium: 'space-y-4',
        large: 'space-y-6',
    };
    
    // Injects a clearfix class after each floated image to reset the layout for the next paragraph.
    const processContent = (htmlContent: string) => {
        return htmlContent
            .replace(/\n/g, '<br />')
            .replace(/(<div class="clearfix[^>]*>.*?<\/div>)/g, '$1<div style="clear:both;"></div>');
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {articles.map((article) => (
                    <Card key={article.id} className="flex flex-col">
                        <CardHeader className="p-0">
                            <div className="relative aspect-video w-full cursor-pointer bg-muted" onClick={() => openDialog(article)}>
                                {article.imageUrl ? (
                                    <Image
                                        src={article.imageUrl}
                                        alt={article.title}
                                        fill
                                        className="object-cover rounded-t-lg"
                                    />
                                ) : <div className="h-full w-full bg-secondary rounded-t-lg"></div>}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-4">
                            <div className="flex justify-between items-start">
                               <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                                   {article.status}
                               </Badge>
                               <span className="text-xs text-muted-foreground">
                                   {format(new Date(article.createdAt as any), 'PPp')}
                               </span>
                            </div>
                            <CardTitle className="mt-2 text-lg font-headline leading-tight cursor-pointer" onClick={() => openDialog(article)}>
                                {article.title}
                            </CardTitle>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatusToggle(article.id!, article.status)}>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Toggle Status
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm font-normal text-destructive hover:bg-destructive/10 hover:text-destructive">
                                          <Trash className="mr-2 h-4 w-4" />
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the article.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(article.id!)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent 
                    className="sm:max-w-4xl h-[90vh] flex flex-col"
                    style={selectedArticle?.backgroundImageUrl ? {
                        backgroundImage: `url(${selectedArticle.backgroundImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {}}
                >
                  <div className="absolute inset-0 bg-background/80 z-0"></div>
                  <div className="relative z-10 flex flex-col h-full p-6">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-3xl">{selectedArticle?.title}</DialogTitle>
                         <DialogDescription>
                            Published on {selectedArticle?.createdAt ? format(new Date(selectedArticle.createdAt as any), 'PPP') : 'N/A'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-6 -mr-6 mt-4">
                       {selectedArticle?.imageUrl && (
                           <div className="relative aspect-video w-full mb-4">
                               <Image
                                   src={selectedArticle.imageUrl}
                                   alt={selectedArticle.title}
                                   fill
                                   className="object-cover rounded-md"
                               />
                           </div>
                       )}
                       <div 
                         className={cn(
                            "prose prose-invert max-w-none",
                            spacingClasses[selectedArticle?.paragraphSpacing || 'medium'],
                            selectedArticle?.contentAlignment === 'center' && "mx-auto",
                            selectedArticle?.contentAlignment === 'full' && "max-w-full",
                         )}
                         dangerouslySetInnerHTML={{ __html: selectedArticle ? processContent(selectedArticle.content) : '' }} 
                        />
                    </div>
                  </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
