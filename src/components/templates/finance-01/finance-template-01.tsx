
import type { Article, HeroSectionConfig, LatestPostsGridConfig, TemplateConfig } from "@/types";
import { getArticleByIdAction, getArticlesByStatusAction } from '@/app/actions';
import { getUserProfile } from '@/lib/auth';

const AdPlacement = ({ script }: { script?: string }) => {
    if (!script) return null;
    return <div dangerouslySetInnerHTML={{ __html: script }} />;
};


export const FinanceTemplate01 = async ({ config, theme }: { config: TemplateConfig, theme: 'light' | 'dark' }) => {
    return (
        <div className="bg-background font-body">
            Under Construction
        </div>
    );
};
