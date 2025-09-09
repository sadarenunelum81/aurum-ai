
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
    createdAt: Timestamp | string | Date;
    updatedAt: Timestamp | string | Date;
    category?: string;
    keywords?: string[];
    imageUrl?: string | null;
    backgroundImageUrl?: string | null;
    contentAlignment?: 'center' | 'left' | 'full';
    paragraphSpacing?: 'small' | 'medium' | 'large';
    inContentImages?: string;
    inContentImagesAlignment?: 'center' | 'all-left' | 'all-right' | 'alternate-left' | 'alternate-right';
};

export type AutoBloggerConfig = {
    category: string;
    keywordMode: 'auto' | 'manual';
    keywords: string[];
    titleMode: 'auto' | 'manual';
    manualTitle?: string;
    useRandomKeyword: boolean;
    paragraphs: string;
    words: string;
    frequency: string;
    publishAction: 'draft' | 'publish';
    featuredImageMode: 'ai' | 'random' | 'none';
    randomImageUrlList: string[];
    backgroundImageMode: 'ai' | 'random' | 'none';
    randomBgImageUrlList: string[];
    inContentImagesMode: 'ai' | 'random' | 'none';
    randomInContentImageUrlList: string[];
    websiteNameWatermark?: string;
    inContentImages: string;
    inContentImagesAlignment: 'center' | 'all-left' | 'all-right' | 'alternate-left' | 'alternate-right';
    contentAlignment: 'center' | 'left' | 'full';
    paragraphSpacing: 'small' | 'medium' | 'large';
    updatedAt?: Timestamp;
};
