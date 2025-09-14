

"use client";

import { useEffect, useState, FormEvent, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import {
    getAllArticlesAction,
    updateArticleStatusAction,
    deleteArticleAction,
    getCommentsForArticleAction,
    addCommentAction,
    toggleArticleCommentsAction,
    getAllCategoriesAction,
} from '@/app/actions';
import type { Article, Comment } from '@/types';
import type { Category } from '@/lib/categories';
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
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash, ToggleRight, MessageSquare, Timer, Edit, AlertTriangle, Send, Share2 } from 'lucide-react';
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
import { useAuth } from '@/context/auth-context';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function CommentSection({ articleId, articleTitle }: { articleId: string, articleTitle: string }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchComments = async () => {
        setIsLoading(true);
        const result = await getCommentsForArticleAction({ articleId });
        if (result.success) {
            setComments(result.data.comments);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load comments.' });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (articleId) {
            fetchComments();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [articleId]);

    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to comment.' });
            return;
        }

        setIsSubmitting(true);
        const result = await addCommentAction({
            articleId,
            articleTitle,
            authorId: user.uid,
            content: newComment,
        });

        if (result.success) {
            setNewComment('');
            toast({ title: 'Success', description: 'Your comment has been posted.' });
            fetchComments(); // Refresh comments list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSubmitting(false);
    };


    return (
        <div className="mt-8 pt-8 border-t border-white/20">
            <h3 className="font-headline text-2xl mb-6">Join the Discussion</h3>
            
            {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                     <Textarea
                        placeholder="Write your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-black/20 border-white/30"
                        rows={4}
                        disabled={isSubmitting}
                    />
                    <Button type="submit" className="mt-4" disabled={isSubmitting || !newComment.trim()}>
                        {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                        Post Comment
                    </Button>
                </form>
            ) : (
                <div className="mb-8 p-4 rounded-lg border border-dashed border-white/30 text-center bg-black/20">
                    <p className="text-muted-foreground mb-4">Please log in or sign up to join the conversation.</p>
                    <div className="flex justify-center gap-4">
                        <Button asChild variant="outline">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild>
                             <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                </div>
            )}


            <div className="space-y-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="flex-1 rounded-lg bg-black/20 p-4 border border-white/20">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-primary">{comment.authorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt as string), { addSuffix: true })}
                                    </p>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    )
}

export function PostList() {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');
    
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    useEffect(() => {
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [categoryFromUrl]);


    async function fetchData() {
        setLoading(true);
        const [articleResult, categoryResult] = await Promise.all([
            getAllArticlesAction(),
            getAllCategoriesAction()
        ]);
        
        if (articleResult.success) {
            setArticles(articleResult.data.articles);
        } else {
            setError(articleResult.error);
        }

        if (categoryResult.success) {
            setCategories(categoryResult.data.categories);
        } else {
             toast({
                variant: 'destructive',
                title: 'Error fetching categories',
                description: categoryResult.error,
            });
        }

        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

    const filteredArticles = useMemo(() => {
        return articles
            .filter(article => {
                if (selectedCategory === 'all') return true;
                return article.category === selectedCategory;
            })
            .filter(article => {
                if (!searchQuery) return true;
                return article.title.toLowerCase().includes(searchQuery.toLowerCase());
            });
    }, [articles, selectedCategory, searchQuery]);

    const handleStatusToggle = async (articleId: string, currentStatus: 'draft' | 'published') => {
        const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
        const result = await updateArticleStatusAction({ articleId, status: newStatus });
        if (result.success) {
            toast({ title: 'Success', description: `Article moved to ${newStatus}.` });
            fetchData(); // Refresh the list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };
    
    const handleCommentsToggle = async (articleId: string, commentsEnabled: boolean) => {
        const result = await toggleArticleCommentsAction({ articleId, commentsEnabled: !commentsEnabled });
        if (result.success) {
            toast({ title: 'Success', description: `Comments ${!commentsEnabled ? 'enabled' : 'disabled'}.` });
            fetchData();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    }

    const handleDelete = async (articleId: string) => {
        const result = await deleteArticleAction({ articleId });
        if (result.success) {
            toast({ title: 'Success', description: 'Article deleted.' });
            fetchData(); // Refresh the list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };
    
    const handleShare = (articleId: string) => {
        const url = `${window.location.origin}/post/${articleId}`;
        navigator.clipboard.writeText(url);
        toast({ title: 'Copied to clipboard', description: 'The public URL for this post has been copied.' });
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
                            <CardHeader className="p-0">
                                <Skeleton className="aspect-video w-full" />
                            </CardHeader>
                            <CardContent className="p-4">
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
    
    const processContent = (htmlContent: string) => {
        if (!htmlContent) return '';
        
        let imageAlignmentClass = 'block my-4 w-full';
        if (selectedArticle?.inContentImagesAlignment) {
            switch (selectedArticle.inContentImagesAlignment) {
                case 'all-left':
                    imageAlignmentClass = 'float-left mr-4 mb-4 w-full md:w-1/3';
                    break;
                case 'all-right':
                    imageAlignmentClass = 'float-right ml-4 mb-4 w-full md:w-1/3';
                    break;
                case 'center':
                default:
                    imageAlignmentClass = 'block my-4 w-full';
                    break;
            }
        }

        let processed = htmlContent.replace(
            /<img src="([^"]+)" alt="([^"]*)" class="in-content-image" \/>/g,
            (match, src, alt) => {
                return `<div class="clearfix my-4"><img src="${src}" alt="${alt}" class="rounded-lg shadow-md ${imageAlignmentClass}" /></div>`;
            }
        );

        processed = processed.replace(/(<div class="clearfix[^>]*>.*?<\/div>)/g, '$1<div style="clear:both;"></div>');
        
        return processed;
    }

    const getColorClassOrStyle = (colorValue?: string) => {
        if (!colorValue) return {};
        if (colorValue.startsWith('#') || colorValue.startsWith('rgb')) {
            return { style: { color: colorValue } };
        }
        return { className: colorValue };
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mb-6 flex flex-col md:flex-row gap-4">
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
                        {categories.map(cat => (
                           <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredArticles.map((article) => (
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
                                ) : (
                                    <div className="h-full w-full bg-secondary rounded-t-lg flex items-center justify-center p-4">
                                        <h3 className="font-headline text-lg text-center text-secondary-foreground">{article.title}</h3>
                                    </div>
                                )}
                                {article.generationStatus === 'failed' && (
                                    <div className="absolute inset-0 bg-destructive/70 flex items-center justify-center">
                                        <AlertTriangle className="h-12 w-12 text-destructive-foreground" />
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-4">
                            <div className="flex justify-between items-start">
                               <div className="flex gap-2 flex-wrap items-center">
                                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                                        {article.status}
                                    </Badge>
                                    {article.generationSource === 'cron' && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Timer className="h-3 w-3" />
                                            Cron
                                        </Badge>
                                    )}
                                     {article.generationSource === 'manual' && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Send className="h-3 w-3" />
                                            Manual Gen
                                        </Badge>
                                    )}
                                    {article.category && (
                                        <Badge variant="outline">{article.category}</Badge>
                                    )}
                               </div>
                               <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                   {format(new Date(article.createdAt as string), 'PPp')}
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
                                     <DropdownMenuItem asChild>
                                        <Link href={`/admin/posts/edit/${article.id}`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleShare(article.id!)}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusToggle(article.id!, article.status)}>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Toggle Status
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleCommentsToggle(article.id!, article.commentsEnabled || false)}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        {article.commentsEnabled ? 'Disable Comments' : 'Enable Comments'}
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
                    className="sm:max-w-4xl h-[90vh] flex flex-col p-0"
                    style={selectedArticle?.backgroundImageUrl ? {
                        backgroundImage: `url(${selectedArticle.backgroundImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {}}
                >
                  <div 
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"
                  ></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle 
                                className="font-headline text-3xl"
                                {...getColorClassOrStyle((selectedArticle as any)?.postTitleColor)}
                            >
                                {selectedArticle?.title}
                            </DialogTitle>
                             <div className="text-sm text-muted-foreground">
                                Published on {selectedArticle?.createdAt ? format(new Date(selectedArticle.createdAt as string), 'PPP') : 'N/A'}
                                {selectedArticle?.category && (
                                    <span className="mx-2">
                                        in <Badge variant="secondary">{selectedArticle.category}</Badge>
                                    </span>
                                )}
                            </div>
                        </DialogHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
                       {selectedArticle?.imageUrl && (
                           <div className="relative aspect-video w-full mb-8">
                               <Image
                                   src={selectedArticle.imageUrl}
                                   alt={selectedArticle.title}
                                   fill
                                   className="object-cover rounded-md shadow-lg"
                               />
                           </div>
                       )}
                       <div 
                         className={cn(
                            "prose prose-invert max-w-none",
                            spacingClasses[selectedArticle?.paragraphSpacing || 'medium'],
                            selectedArticle?.contentAlignment === 'center' && "text-center",
                            selectedArticle?.contentAlignment === 'full' ? "max-w-full" : "mx-auto",
                            getColorClassOrStyle((selectedArticle as any)?.postContentColor).className
                         )}
                         style={getColorClassOrStyle((selectedArticle as any)?.postContentColor).style}
                         dangerouslySetInnerHTML={{ __html: selectedArticle ? processContent(selectedArticle.content) : '' }} 
                        />
                        {selectedArticle?.tags && selectedArticle.tags.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2">
                                {selectedArticle.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline">#{tag}</Badge>
                                ))}
                            </div>
                        )}

                        {selectedArticle?.commentsEnabled && selectedArticle?.id && (
                            <CommentSection articleId={selectedArticle.id} articleTitle={selectedArticle.title} />
                        )}
                    </div>
                    <div className="mt-auto h-2 bg-white/10" />
                  </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
