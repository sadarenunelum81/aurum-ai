
import type { Article, HeroSectionConfig, LatestPostsGridConfig, TemplateConfig } from "@/types";
import { getArticleByIdAction, getArticlesByStatusAction } from '@/app/actions';
import { getUserProfile } from '@/lib/auth';
// TODO: Create and import the new sections for the food template
// import { FoodTemplate01Header } from '@/components/templates/food-01/header';
// import { FoodTemplate01HeroSection } from '@/components/templates/food-01/hero-section';
// import { FoodTemplate01Footer } from '@/components/templates/food-01/footer';

const AdPlacement = ({ script }: { script?: string }) => {
    if (!script) return null;
    return <div dangerouslySetInnerHTML={{ __html: script }} />;
};


export const FoodTemplate01 = async ({ config, theme }: { config: TemplateConfig, theme: 'light' | 'dark' }) => {
    
    return (
        <div className="bg-background">
            {/* 
            TODO: Once new sections are created, fetch data and render them here.
                  This will be similar to the other main template files.
            */}
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold font-headline mb-2">Food & Recipes Template</h1>
                    <p className="text-muted-foreground">This template is under construction.</p>
                    <p className="text-sm text-muted-foreground mt-1">Configure its settings in the Admin Panel.</p>
                </div>
            </div>
        </div>
    );
};
