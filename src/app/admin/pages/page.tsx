
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageEditor } from '@/components/page-editor';

function PagesComponent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'about';
    
    return <PageEditor pageId={tab} />;
}


export default function AdminPages() {
    return (
        <Suspense fallback={<div>Loading page editor...</div>}>
            <PagesComponent />
        </Suspense>
    );
}
