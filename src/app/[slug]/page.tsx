
import { getTemplateByPath } from "@/lib/templates";
import { getPageConfig, getAllPagesAction } from "@/lib/pages";
import { notFound } from "next/navigation";
import { TechTemplate01 } from "@/components/templates/tech-01/tech-template-01";
import { TravelTemplate01 } from "@/components/templates/travel-01/travel-template-01";
import { DefaultTemplate } from "@/components/templates/tech-01/default-template";
import { PetsTemplate01 } from "@/components/templates/pets-01/pets-template-01";
import { FoodTemplate01 } from "@/components/templates/food-01/food-template-01";
import { EducationTemplate01 } from "@/components/templates/education-01/education-template-01";
import { FinanceTemplate01 } from "@/components/templates/finance-01/finance-template-01";
import { SportsTemplate01 } from "@/components/templates/sports-01/sports-template-01";
import { PoliticsTemplate01 } from "@/components/templates/politics-01/politics-template-01";
import { CustomPageRenderer } from "@/components/custom-page-renderer";
import { MainPagesRenderer } from "@/components/main-pages-renderer";
import { BlogIndexPage } from "@/components/blog-index-page";
import type { PageConfig } from "@/types";

async function findPageByCustomPath(slug: string): Promise<PageConfig | null> {
    const allPagesResult = await getAllPagesAction();
    if (allPagesResult.success) {
        return allPagesResult.data.pages.find(p => p.customPathLight === slug || p.customPathDark === slug) || null;
    }
    return null;
}

export default async function SlugPage({ params }: { params: { slug: string } }) {

  // 1. Check for a page with a custom path first (including 'blog')
  const pageWithCustomPath = await findPageByCustomPath(params.slug);
  if (pageWithCustomPath) {
      if (pageWithCustomPath.id === 'blog') {
          return <BlogIndexPage config={pageWithCustomPath} />;
      }
      // This will handle other custom pages if they are given paths
       return <CustomPageRenderer config={pageWithCustomPath} />;
  }

  // 2. Check for a template with a custom path
  const templateResult = await getTemplateByPath(params.slug);
  if (templateResult) {
    const { config, theme } = templateResult;
    switch (config.id) {
      case 'tech-template-01':
        return <TechTemplate01 config={config} theme={theme} />;
      case 'travel-template-01':
          return <TravelTemplate01 config={config} theme={theme} />;
      case 'pets-01':
          return <PetsTemplate01 config={config} theme={theme} />;
      case 'food-01':
          return <FoodTemplate01 config={config} theme={theme} />;
      case 'education-01':
          return <EducationTemplate01 config={config} theme={theme} />;
      case 'finance-01':
        return <FinanceTemplate01 config={config} theme={theme} />;
      case 'sports-01':
        return <SportsTemplate01 config={config} theme={theme} />;
      case 'politics-01':
        return <PoliticsTemplate01 config={config} theme={theme} />;
      default:
        return <DefaultTemplate />;
    }
  }

  // 3. Handle main pages by their default path (e.g. /about, /contact)
  const mainPageIds = ['about', 'contact', 'privacy', 'terms'];
  if (mainPageIds.includes(params.slug)) {
      const pageConfig = await getPageConfig(params.slug);
      if (pageConfig) {
          return <MainPagesRenderer config={pageConfig} />;
      }
  }

  // 4. Handle the dedicated blog index page by its default `/blog` path
  if (params.slug === 'blog') {
    const blogConfig = await getPageConfig('blog');
    return <BlogIndexPage config={blogConfig} />
  }

  // 5. Handle any other custom page by its regular path
  const pageConfig = await getPageConfig(params.slug);
  if (pageConfig) {
      return <CustomPageRenderer config={pageConfig} />;
  }

  // If nothing is found, return 404
  notFound();
}
