
import { notFound } from 'next/navigation';
import { getTemplateByPath } from '@/lib/templates';
import { getPageConfig } from '@/lib/pages';

import { TechTemplate01 } from '@/components/templates/tech-01/tech-template-01';
import { TravelTemplate01 } from '@/components/templates/travel-01/travel-template-01';
import { PetsTemplate01 } from '@/components/templates/pets-01/pets-template-01';
import { FoodTemplate01 } from '@/components/templates/food-01/food-template-01';
import { EducationTemplate01 } from '@/components/templates/education-01/education-template-01';
import { FinanceTemplate01 } from '@/components/templates/finance-01/finance-template-01';
import { SportsTemplate01 } from '@/components/templates/sports-01/sports-template-01';
import { PoliticsTemplate01 } from '@/components/templates/politics-01/politics-template-01';

import { MainPagesRenderer } from '@/components/main-pages-renderer';

export const dynamic = 'force-dynamic';

const templateMap: { [key: string]: React.ComponentType<any> } = {
    'tech-template-01': TechTemplate01,
    'travel-template-01': TravelTemplate01,
    'pets-01': PetsTemplate01,
    'food-01': FoodTemplate01,
    'education-01': EducationTemplate01,
    'finance-01': FinanceTemplate01,
    'sports-01': SportsTemplate01,
    'politics-01': PoliticsTemplate01,
};

async function fetchPageData(slug: string) {
    // 1. Check for a template with a matching custom path
    const templateResult = await getTemplateByPath(slug);
    if (templateResult) {
        const TemplateComponent = templateMap[templateResult.config.id];
        if (TemplateComponent) {
            return <TemplateComponent config={templateResult.config} theme={templateResult.theme} />;
        }
    }

    // 2. Check for a main page with a matching path (e.g., 'about', 'contact') or custom path
    const pageConfig = await getPageConfig(slug);
    if (pageConfig) {
        return <MainPagesRenderer config={pageConfig} />;
    }
    
    // Check for main pages by their custom paths as well
    const mainPages = ['about', 'contact', 'privacy', 'terms', 'blog', 'login', 'signup'];
    for (const pageId of mainPages) {
        const config = await getPageConfig(pageId);
        if (config?.customPathLight === slug || config?.customPathDark === slug) {
             return <MainPagesRenderer config={config} />;
        }
    }


    // 3. If nothing is found, return notFound
    return notFound();
}


export default async function SlugPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    // These routes have their own dedicated page.tsx files and should not be handled here.
    if (['admin', 'post', 'profile', 'posts'].includes(slug)) {
        notFound();
    }
    
    return await fetchPageData(slug);
}
