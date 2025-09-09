
"use client";

import { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
    getAllCommentsAction,
    updateCommentStatusAction,
    deleteCommentAction,
} from '@/app/actions';
import type { Comment } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
import { MoreHorizontal, Trash, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommentList() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    async function fetchComments() {
        setLoading(true);
        const result = await getAllCommentsAction();
        if (result.success) {
            setComments(result.data.comments);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchComments();
    }, []);

    const handleStatusToggle = async (commentId: string, currentStatus: 'visible' | 'hidden') => {
        const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
        const result = await updateCommentStatusAction({ commentId, status: newStatus });
        if (result.success) {
            toast({ title: 'Success', description: `Comment status set to ${newStatus}.` });
            fetchComments(); // Refresh the list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    const handleDelete = async (commentId: string) => {
        const result = await deleteCommentAction({ commentId });
        if (result.success) {
            toast({ title: 'Success', description: 'Comment deleted.' });
            fetchComments(); // Refresh the list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Comment Management</CardTitle>
                    <CardDescription>A list of all comments from users on your articles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[35%]">Comment</TableHead>
                                <TableHead>Article</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comments.map((comment) => (
                                <TableRow key={comment.id} className={cn(comment.status === 'hidden' && 'opacity-50')}>
                                    <TableCell className="max-w-sm truncate">{comment.content}</TableCell>
                                    <TableCell className="font-medium">{comment.articleTitle}</TableCell>
                                    <TableCell>{comment.authorName}</TableCell>
                                    <TableCell>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</TableCell>
                                    <TableCell>
                                        <Badge variant={comment.status === 'visible' ? 'default' : 'secondary'}>
                                            {comment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusToggle(comment.id!, comment.status)}>
                                                    {comment.status === 'visible' ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                                    {comment.status === 'visible' ? 'Hide' : 'Show'}
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
                                                        This action cannot be undone. This will permanently delete this comment.
                                                      </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                      <AlertDialogAction onClick={() => handleDelete(comment.id!)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete
                                                      </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                  </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
