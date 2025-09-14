import type { Timestamp } from 'firebase/firestore';

export type SignupForm = {
    email: string;
    password: any;
    firstName: string;
    lastName: string;
    country?: string;
    city?: string;
    address?: string;
    phoneNumber?: string;
};

export type UserProfile = {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    country?: string;
    city?: string;
    address?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    createdAt: Timestamp | string | Date;
}

export type LoginForm = {
    email: string;
    password:any;
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
    generationSource?: 'manual' | 'cron' | 'editor'; // 'editor' for posts from "New Post"
    generationStatus?: 'success' | 'failed'; // For tracking auto-generated posts
    authorName?: string;
    commentsCount?: number;
};

export type Comment = {
    id?: string;
    articleId: string;
    articleTitle: string;
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
    inContentImagesAlignment: 'center' | 'left' | 'all-right' | 'alternate-left' | 'alternate-right';
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
    globalRandomBackgroundUrls?: string[];
    globalBackgroundOverlayColor?: string;
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

export interface AdConfig {
    enableHeadScript?: boolean;
    headScript?: string;
    enableTopHeaderAd?: boolean;
    topHeaderAdScript?: string;
    enableUnderHeaderAd?: boolean;
    underHeaderAdScript?: string;
}

export interface HeaderConfig {
    logoText?: string;
    logoIconUrl?: string;
    menuItems?: MenuItem[];
    subscribeLink?: string;
    subscribeButtonText?: string;
    loginLink?: string;
    loginButtonText?: string;
    lightModeColors?: HeaderColors;
    darkModeColors?: HeaderColors;
}

export interface HeroColors {
    titleColor?: string;
    metaColor?: string;
    iconColor?: string;
    backgroundColor?: string;
    overlayColor?: string;
    badgeTextColor?: string;
    badgeBackgroundColor?: string;
    textBoxOverlayColor?: string;
    heroButtonTextColor?: string;
    heroButtonBgColor?: string;
}

export interface HeroSectionConfig {
    enabled?: boolean;
    featuredPostId?: string;
    sidePostIds?: string[];
    lightModeColors?: HeroColors;
    darkModeColors?: HeroColors;
    badgeText?: string;
    heroButtonText?: string;
    randomImageUrls?: string[];
    randomAuthorNames?: string[];
    topAdScript?: string;
    bottomAdScript?: string;
    marketMoversTitle?: string; // For Finance Template
    scoresTitle?: string; // For Sports Template
    breakingNewsTitle?: string; // For Politics Template
}

export interface LatestPostsGridColors {
    backgroundColor?: string;
    overlayColor?: string;
    headerTextColor?: string;
    descriptionTextColor?: string;
    postTitleColor?: string;
    postDescriptionColor?: string;
    postMetaColor?: string;
    featuredBadgeTextColor?: string;
    featuredBadgeBackgroundColor?: string;
    featuredBadgeIconColor?: string;
    postTextBoxOverlayColor?: string;
    featuredPostTextBoxOverlayColor?: string;
}

export interface LatestPostsGridConfig {
    enabled?: boolean;
    headerText?: string;
    descriptionText?: string;
    headerAlignment?: 'left' | 'center' | 'right';
    mode?: 'automatic' | 'manual';
    postLimit?: number;
    manualPostIds?: string[];
    featuredPostId?: string; // The last big post
    featuredBadgeText?: string;
    lightModeColors?: LatestPostsGridColors;
    darkModeColors?: LatestPostsGridColors;
    topAdScript?: string;
    bottomAdScript?: string;
}

export interface CategorySlot {
    name: string;
    color?: string;
    postIds: string[];
}

export interface CategoriesSectionColors {
    backgroundColor?: string;
    overlayColor?: string;
    headerTextColor?: string;
    descriptionTextColor?: string;
    postTitleColor?: string;
    postMetaColor?: string;
    postBoxColor?: string;
}

export interface CategoriesSectionConfig {
    enabled?: boolean;
    headerText?: string;
    descriptionText?: string;
    headerAlignment?: 'left' | 'center' | 'right';
    categorySlots?: CategorySlot[];
    lightModeColors?: CategoriesSectionColors;
    darkModeColors?: CategoriesSectionColors;
    topAdScript?: string;
    bottomAdScript?: string;
}

export interface DualSystemColors {
    backgroundColor?: string;
    overlayColor?: string;
    headerTextColor?: string;
    lineColor?: string;
    postTitleColor?: string;
    postMetaColor?: string;
    postTitleOverlayColor?: string;
    showMoreTextColor?: string;
}

export interface DualSystemPartConfig {
    headerText?: string;
    featuredPostId?: string;
    sidePostIds?: string[];
    bottomPostIds?: string[];
    showMoreText?: string;
    showMoreLink?: string;
}

export interface DualSystemSectionConfig {
    enabled?: boolean;
    part1?: DualSystemPartConfig;
    part2?: DualSystemPartConfig;
    lightModeColors?: DualSystemColors;
    darkModeColors?: DualSystemColors;
    topAdScript?: string;
    bottomAdScript?: string;
}

export interface RecentPostsSectionColors {
    backgroundColor?: string;
    overlayColor?: string;
    headerTextColor?: string;
    descriptionTextColor?: string;
    postTitleColor?: string;
    postTitleOverlayColor?: string;
    showMoreButtonBgColor?: string;
    showMoreButtonTextColor?: string;
}

export interface RecentPostsSectionConfig {
    enabled?: boolean;
    headerText?: string;
    descriptionText?: string;
    headerAlignment?: 'left' | 'center' | 'right';
    postIds?: string[];
    initialPostsToShow?: number;
    postsPerLoad?: number;
    showMoreButtonText?: string;
    lightModeColors?: RecentPostsSectionColors;
    darkModeColors?: RecentPostsSectionColors;
    topAdScript?: string;
    bottomAdScript?: string;
}

export interface FooterMenuColumn {
    id: string;
    title: string;
    links: { id: string; name: string; value: string }[];
}

export interface FooterColors {
    backgroundColor?: string;
    overlayColor?: string;
    lineColor?: string;
    textColor?: string;
    titleColor?: string;
    linkColor?: string;
    copyrightTextColor?: string;
    subscribeButtonBgColor?: string;
    subscribeButtonTextColor?: string;
}

export interface FooterConfig {
    enabled?: boolean;
    newsletterTitle?: string;
    newsletterDescription?: string;
    subscribeButtonText?: string;
    aboutText?: string;
    copyrightText?: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
    menuColumns?: FooterMenuColumn[];
    lightModeColors?: FooterColors;
    darkModeColors?: FooterColors;
    topAdScript?: string;
    bottomAdScript?: string;
}

export interface TemplateConfig {
    id: string;
    isActive: boolean;
    themeMode: 'light' | 'dark';
    customPathLight?: string;
    customPathDark?: string;
    header?: HeaderConfig;
    ads?: AdConfig;
    hero?: HeroSectionConfig;
    latestPostsGrid?: LatestPostsGridConfig;
    categoriesSection?: CategoriesSectionConfig;
    dualSystemSection?: DualSystemSectionConfig;
    recentPostsSection?: RecentPostsSectionConfig;
    footer?: FooterConfig;
    [key: string]: any; // Allow other properties
}

// Types for Main and Custom Pages

export interface PageThemeColors {
    backgroundColor?: string;
    textColor?: string;
    titleColor?: string;
    overlayColor?: string;
}

export type ContentBlock = {
    id: string;
    type: 'paragraph' | 'image' | 'heading' | 'html';
    content: string; // URL for image, text for paragraph, text for heading, html code for html
};

export interface PageSection {
    id: string;
    title: string;
    content: string;
}

export interface ContactDetails {
    email?: string;
    whatsapp?: string;
    telegram?: string;
}

export interface BlogPageConfig {
    mode: 'all' | 'selected';
    selectedPostIds?: string[];
}

export interface PageConfig {
    id: string;
    title: string;
    path: string;
    content: string;
    blocks: ContentBlock[];
    sections: PageSection[];
    contactDetails?: ContactDetails;
    lightTheme: PageThemeColors;
    darkTheme: PageThemeColors;
    backgroundImage?: string;
    customPathLight?: string;
    customPathDark?: string;
    enableOnSignup?: boolean;
    blogPageConfig?: BlogPageConfig;
}
