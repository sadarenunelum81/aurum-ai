"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageEditor } from '@/components/page-editor';

function AuthPagesComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'login';
    
    return (
        <Tabs value={tab} onValueChange={(value) => router.push(`/admin/auth-pages?tab=${value}`)} className="flex-1 p-4 md:p-6 lg:p-8">
            <TabsList className="mb-6">
                <TabsTrigger value="login">Login Page</TabsTrigger>
                <TabsTrigger value="signup">Signup Page</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <PageEditor pageId="login" />
            </TabsContent>
            <TabsContent value="signup">
                 <PageEditor pageId="signup" />
            </TabsContent>
        </Tabs>
    );
}

export default function AdminAuthPages() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthPagesComponent />
        </Suspense>
    );
}
