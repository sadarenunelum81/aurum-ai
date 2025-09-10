
"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { getDashboardData } from '@/lib/articles';
import { Skeleton } from './ui/skeleton';
import { Users, FileText, FileCheck, Library } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { format } from 'date-fns';
import type { Article } from '@/types';

export function AdminDashboard() {
  const [stats, setStats] = useState<{ drafts: number; published: number; total: number } | null>(null);
  const [recentDrafts, setRecentDrafts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = getDashboardData((data) => {
      setStats(data.counts);
      setRecentDrafts(data.recentDrafts);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <Card>
        <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
            <CardDescription>An overview of your content and system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                      <Library className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.total ?? 0}</div>}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.published ?? 0}</div>}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.drafts ?? 0}</div>}
                  </CardContent>
              </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Drafts</CardTitle>
          <CardDescription>Articles that are currently in draft status.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDrafts.length > 0 ? recentDrafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">{draft.title}</TableCell>
                    <TableCell>
                      {draft.updatedAt ? format(new Date(draft.updatedAt), 'PPP p') : 'N/A'}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">No drafts found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
