
import type { Timestamp } from 'firebase/firestore';

export type SignupForm = {
    email: string;
    password: any;
};

export type LoginForm = {
    email: string;
    password: any;
};

export type Article = {
    id?: string;
    title: string;
    content: string;
    status: 'draft' | 'published';
    authorId: string;
    createdAt: Timestamp | string;
    updatedAt: Timestamp | string;
    category?: string;
    keywords?: string[];
    imageUrl?: string | null;
};

export type AutoBloggerConfig = {
    category: string;
    keywordMode: 'auto' | 'manual';
    keywords: string[];
    useRandomKeyword: boolean;
    paragraphs: string;
    words: string;
    frequency: string;
    publishAction: 'draft' | 'publish';
    generateImage: boolean;
    updatedAt?: Timestamp;
};
