
"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { getArticleCounts, getArticlesByStatus } from '@/lib/articles';
import { Skeleton } from './ui/skeleton';
import { Users, FileText, FileCheck } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { format } from 'date-fns';
import type { Article } from '@/types';

export function AdminDashboard() {
  const [stats, setStats] = useState<{ drafts: number; published: number } | null>(null);
  const [drafts, setDrafts] = useState<Article[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoadingStats(true);
        const counts = await getArticleCounts();
        setStats(counts);
      } catch (error) {
        console.error("Failed to fetch article counts:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    async function fetchDrafts() {
      try {
        setLoadingDrafts(true);
        const draftArticles = await getArticlesByStatus('draft');
        setDrafts(draftArticles);
      } catch (error) {
        console.error("Failed to fetch drafts:", error);
      } finally {
        setLoadingDrafts(false);
      }
    }

    fetchStats();
    fetchDrafts();
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
                      <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.published ?? 0}</div>}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.drafts ?? 0}</div>}
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
          {loadingDrafts ? (
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
                {drafts.length > 0 ? drafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">{draft.title}</TableCell>
                    <TableCell>
                      {draft.updatedAt ? format(draft.updatedAt.toDate(), 'PPP p') : 'N/A'}
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
