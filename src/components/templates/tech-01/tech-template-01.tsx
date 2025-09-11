

import type { Article, HeroSectionConfig, LatestPostsGridConfig, TemplateConfig } from "@/types";
import { getArticleByIdAction, getArticlesByStatusAction } from '@/app/actions';
import { getUserProfile } from '@/lib/auth';
import { TechTemplate01Header } from '@/components/templates/tech-01/header';
import { TechTemplate01HeroSection } from '@/components/templates/tech-01/hero-section';
import { LatestPostsGrid } from '@/components/templates/tech-01/latest-posts-grid';
import { CategoriesSection } from '@/components/templates/tech-01/categories-section';
import { DualSystemSection } from '@/components/templates/tech-01/dual-system-section';
import { RecentPostsSection } from '@/components/templates/tech-01/recent-posts-section';
import { TechTemplate01Footer } from '@/components/templates/tech-01/footer';


async function getPostDetails(postIds: string[], heroConfig: HeroSectionConfig): Promise<Article[]> {
    if (!postIds || postIds.length === 0) return [];
    
    const randomAuthors = heroConfig.randomAuthorNames || [];

    const postPromises = postIds.map(async (id, index) => {
        if (!id) return null;
        const result = await getArticleByIdAction(id);
        if (result.success && result.data.article) {
            const article = result.data.article;
            
            if (randomAuthors.length > 0) {
                 article.authorName = randomAuthors[index % randomAuthors.length];
            } else if (article.authorId) {
                const authorProfile = await getUserProfile(article.authorId);
                article.authorName = authorProfile?.firstName ? `${authorProfile.firstName} ${authorProfile.lastName}` : authorProfile?.email || 'STAFF';
            }
            return article;
        }
        return null;
    });

    const results = await Promise.all(postPromises);
    return results.filter(Boolean) as Article[];
}

async function getLatestPosts(gridConfig: LatestPostsGridConfig): Promise<Article[]> {
    if (gridConfig.mode === 'automatic') {
        const result = await getArticlesByStatusAction('published', gridConfig.postLimit || 6);
        return result.success ? result.data.articles : [];
    } else if (gridConfig.manualPostIds?.length) {
        // Re-use getPostDetails but with an empty config for authors
        return getPostDetails(gridConfig.manualPostIds, {});
    }
    return [];
}

async function getFeaturedPost(gridConfig: LatestPostsGridConfig): Promise<Article | null> {
    if (!gridConfig.featuredPostId) return null;
    const result = await getArticleByIdAction(gridConfig.featuredPostId);
    if (result.success && result.data.article) {
        const featPost = result.data.article;
        if (featPost.authorId) {
            const author = await getUserProfile(featPost.authorId);
            featPost.authorName = author?.firstName ? `${author.firstName} ${author.lastName}` : author?.email || 'STAFF';
        }
        return featPost;
    }
    return null;
}


export const TechTemplate01 = async ({ config, theme }: { config: TemplateConfig, theme: 'light' | 'dark' }) => {
    // Data fetching for all sections
    const [heroPosts, latestGridPosts, featuredGridPost] = await Promise.all([
        config.hero?.enabled ? getPostDetails([config.hero.featuredPostId, ...(config.hero.sidePostIds || [])].filter(Boolean) as string[], config.hero) : Promise.resolve([]),
        config.latestPostsGrid?.enabled ? getLatestPosts(config.latestPostsGrid) : Promise.resolve([]),
        config.latestPostsGrid?.enabled ? getFeaturedPost(config.latestPostsGrid) : Promise.resolve(null),
    ]);
    
    const featuredPost = heroPosts.find(p => p.id === config.hero?.featuredPostId) || null;
    const sidePosts = (config.hero?.sidePostIds || []).map(id => heroPosts.find(p => p.id === id)).filter(Boolean) as Article[];

    return (
        <div>
            <TechTemplate01Header config={config} themeMode={theme} />
            <TechTemplate01HeroSection config={config} themeMode={theme} featuredPost={featuredPost} sidePosts={sidePosts} />
            <LatestPostsGrid config={config} themeMode={theme} posts={latestGridPosts} featuredPost={featuredGridPost} />
            <CategoriesSection config={config} themeMode={theme} />
            <DualSystemSection config={config} themeMode={theme} />
            <RecentPostsSection config={config} themeMode={theme} />
            <TechTemplate01Footer config={config} themeMode={theme} />
        </div>
    );
};
