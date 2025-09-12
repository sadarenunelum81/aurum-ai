
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, File, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { getAllPagesAction, deletePageAction } from '@/lib/pages';
import type { PageConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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

export default function CustomPagesAdminPage() {
    const { toast } = useToast();
    const [pages, setPages] = useState<PageConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPages = async () => {
        setIsLoading(true);
        const result = await getAllPagesAction();
        if (result.success) {
            setPages(result.data.pages);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load custom pages.' });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleDelete = async (pageId: string) => {
        const result = await deletePageAction(pageId);
        if (result.success) {
            toast({ title: 'Success', description: 'Page deleted successfully.' });
            fetchPages();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Custom Pages</CardTitle>
                        <CardDescription>Manage your unique, custom-built pages.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/custom-pages/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Page
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : pages.length > 0 ? (
                        <div className="space-y-3">
                            {pages.map(page => (
                                <div key={page.id} className="flex items-center justify-between rounded-md border p-3">
                                    <div className="flex items-center gap-3">
                                        <File className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{page.title}</p>
                                            <Link href={`/${page.path}`} target="_blank" className="text-xs text-primary hover:underline">
                                                /{page.path}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button asChild variant="outline" size="icon">
                                            <Link href={`/admin/custom-pages/edit/${page.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the page "{page.title}". This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(page.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No custom pages have been created yet.</p>
                            <p className="text-sm text-muted-foreground">Click "Create New Page" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
