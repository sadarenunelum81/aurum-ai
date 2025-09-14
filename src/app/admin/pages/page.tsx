"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageEditor } from '@/components/page-editor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

function PagesComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'about';
    
    return (
        <Tabs value={tab} onValueChange={(value) => router.push(`/admin/pages?tab=${value}`)} className="flex-1 p-4 md:p-6 lg:p-8">
            <TabsList className="mb-6 flex-wrap h-auto">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="terms">Terms &amp; Conditions</TabsTrigger>
                <TabsTrigger value="blog">Published Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="about">
                <PageEditor pageId="about" />
            </TabsContent>
            <TabsContent value="contact">
                 <PageEditor pageId="contact" />
            </TabsContent>
            <TabsContent value="privacy">
                 <PageEditor pageId="privacy" />
            </TabsContent>
            <TabsContent value="terms">
                <PageEditor pageId="terms" />
            </TabsContent>
            <TabsContent value="blog">
                <PageEditor pageId="blog" />
            </TabsContent>
        </Tabs>
    );
}


export default function AdminPages() {
    return (
        <Suspense fallback={<div>Loading page editor...</div>}>
            <PagesComponent />
        </Suspense>
    );
}
