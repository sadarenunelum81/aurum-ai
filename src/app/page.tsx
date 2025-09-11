

import { getActiveTemplate } from '@/lib/templates';
import { TechTemplate01Header } from '@/components/templates/tech-01/header';
import { TechTemplate01HeroSection } from '@/components/templates/tech-01/hero-section';
import { LatestPostsGrid } from '@/components/templates/tech-01/latest-posts-grid';
import { CategoriesSection } from '@/components/templates/tech-01/categories-section';
import type { TemplateConfig } from '@/types';

const TechTemplate01 = ({ config }: { config: TemplateConfig }) => (
    <div>
        <TechTemplate01Header config={config} themeMode={config.themeMode} />
        <TechTemplate01HeroSection config={config} themeMode={config.themeMode} />
        <LatestPostsGrid config={config} themeMode={config.themeMode} />
        <CategoriesSection config={config} themeMode={config.themeMode} />
    </div>
);

const DefaultTemplate = () => <div className="p-8"><h1>Default Landing Page</h1><p>No template active. Go to Admin > Template Setup to activate one.</p></div>;


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
