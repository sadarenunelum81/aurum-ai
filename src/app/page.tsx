

import { getActiveTemplate } from '@/lib/templates';
import { TechTemplate01Header } from '@/components/templates/tech-01/header';
import { TechTemplate01HeroSection } from '@/components/templates/tech-01/hero-section';
import { LatestPostsGrid } from '@/components/templates/tech-01/latest-posts-grid';
import { CategoriesSection } from '@/components/templates/tech-01/categories-section';
import type { Article, TemplateConfig, HeroSectionConfig, LatestPostsGridConfig } from '@/types';
import { getArticleByIdAction, getArticlesByStatusAction } from '@/app/actions';
import { getUserProfile } from '@/lib/auth';


async function getPostDetails(postIds: string[], heroConfig: HeroSectionConfig): Promise<Article[]> {
    const randomAuthors = heroConfig.randomAuthorNames || [];

    const postPromises = postIds.map(async (id, index) => {
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
        return getPostDetails(gridConfig.manualPostIds, {} as HeroSectionConfig);
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

const TechTemplate01 = async ({ config }: { config: TemplateConfig }) => {
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
            <TechTemplate01Header config={config} themeMode={config.themeMode} />
            <TechTemplate01HeroSection config={config} themeMode={config.themeMode} featuredPost={featuredPost} sidePosts={sidePosts} />
            <LatestPostsGrid config={config} themeMode={config.themeMode} posts={latestGridPosts} featuredPost={featuredGridPost} />
            <CategoriesSection config={config} themeMode={config.themeMode} />
        </div>
    );
};

const DefaultTemplate = () => <div className="p-8"><h1>Default Landing Page</h1><p>No template active. Go to Admin {'>'} Template Setup to activate one.</p></div>;


export default async function HomePage() {
  const activeTemplate = await getActiveTemplate();

  if (!activeTemplate) {
    return <DefaultTemplate />;
  }

  switch (activeTemplate.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={activeTemplate} />;
    default:
      return <DefaultTemplate />;
  }
}
