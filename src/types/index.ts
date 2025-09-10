

import type { Timestamp } from 'firebase/firestore';

export type SignupForm = {
    email: string;
    password: any;
    firstName: string;
    lastName: string;
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
    tags?: string[];
    imageUrl?: string | null;
    backgroundImageUrl?: string | null;
    contentAlignment?: 'center' | 'left' | 'full';
    paragraphSpacing?: 'small' | 'medium' | 'large';
    inContentImages?: string;
    inContentImagesAlignment?: 'center' | 'all-left' | 'all-right' | 'alternate-left' | 'alternate-right';
    commentsEnabled?: boolean;
    generationSource?: 'manual' | 'cron';
};

export type Comment = {
    id?: string;
    articleId: string;
    articleTitle: string;
    authorId: string;
    authorName: string; // For simplicity, we'll use a name. Could be linked to a user ID.
    content: string;
    createdAt: Timestamp | string | Date;
    status: 'visible' | 'hidden';
};


export type AutoBloggerConfig = {
    userId: string; // The ID of the admin user to attribute posts to.
    category: string;
    keywordMode: 'auto' | 'manual';
    keywords: string[];
    titleMode: 'auto' | 'manual';
    manualTitle?: string;
    paragraphs: string;
    words: string;
    frequency: string;
    publishAction: 'draft' | 'published';
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
    addTags: boolean;
    tagGenerationMode: 'auto' | 'manual';
    manualTags: string[];
    numberOfTags: string;
    enableComments: boolean;
    updatedAt?: Timestamp;
    postTitleColor?: string;
    postContentColor?: string;
    language?: string;
};

export interface MenuItem {
    id: string;
    name: string;
    type: 'section' | 'path' | 'url';
    value: string;
}

export interface HeaderColors {
    backgroundColor?: string;
    textColor?: string;
    subscribeButtonBgColor?: string;
    subscribeButtonTextColor?: string;
    loginButtonBgColor?: string;
    loginButtonTextColor?: string;
}

export interface HeaderConfig {
    logoText?: string;
    logoIconUrl?: string;
    menuItems?: MenuItem[];
    subscribeLink?: string;
    subscribeButtonText?: string;
    loginLink?: string;
    loginButtonText?: string;
    showThemeToggle?: boolean;
    lightModeColors?: HeaderColors;
    darkModeColors?: HeaderColors;
}

export interface TemplateConfig {
    id: string;
    isActive: boolean;
    customPath?: string;
    themeMode?: 'both' | 'light-only' | 'dark-only';
    defaultTheme?: 'light' | 'dark' | 'system';
    header?: HeaderConfig;
    [key: string]: any; // Allow other properties
}
