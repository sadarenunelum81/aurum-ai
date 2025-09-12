
"use client";

import { PageBuilder } from '@/components/page-builder';
import { useParams } from 'next/navigation';

export default function EditCustomPage() {
    const params = useParams();
    const pageId = params.id as string;

    return <PageBuilder pageId={pageId} />;
}
