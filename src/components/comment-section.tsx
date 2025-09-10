
"use client";

import { useEffect, useState, FormEvent } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
    getCommentsForArticleAction,
    addCommentAction,
} from '@/app/actions';
import type { Comment } from '@/types';
import { Button } from "@/components/ui/button";
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function CommentSection({ articleId, articleTitle }: { articleId: string, articleTitle: string }) {
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
        <div className="mt-16 pt-8 border-t">
            <h3 className="font-headline text-3xl mb-6 text-center">Join the Discussion</h3>
            
            {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8 max-w-2xl mx-auto">
                     <Textarea
                        placeholder="Write your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-background/50 border-border"
                        rows={4}
                        disabled={isSubmitting}
                    />
                    <Button type="submit" className="mt-4" disabled={isSubmitting || !newComment.trim()}>
                        {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                        Post Comment
                    </Button>
                </form>
            ) : (
                <div className="mb-8 p-4 rounded-lg border border-dashed text-center bg-background/50 max-w-2xl mx-auto">
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


            <div className="space-y-6 max-w-2xl mx-auto">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="flex-1 rounded-lg bg-background/50 p-4 border">
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
                    <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    )
}
