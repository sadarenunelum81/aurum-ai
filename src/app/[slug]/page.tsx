

import { getTemplateByPath } from "@/lib/templates";
import { notFound } from "next/navigation";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { TechTemplate01HeroSection } from "@/components/templates/tech-01/hero-section";
import { TechTemplate01FeaturedPostsGrid } from "@/components/templates/tech-01/featured-posts-grid";
import { TemplateConfig } from "@/types";


const TechTemplate01 = ({ config, theme }: { config: TemplateConfig, theme: 'light' | 'dark' }) => (
    <div>
        <TechTemplate01Header config={config} themeMode={theme} />
        <TechTemplate01HeroSection config={config} themeMode={theme} />
        <TechTemplate01FeaturedPostsGrid config={config} themeMode={theme} />
    </div>
);

const DefaultTemplate = () => <div className="p-8"><h1>Default Landing Page</h1><p>No template active. Set one in the admin panel.</p></div>;


export default async function SlugPage({ params }: { params: { slug: string } }) {
  const result = await getTemplateByPath(params.slug);

  if (!result) {
    notFound();
  }
  
  const { config, theme } = result;

  switch (config.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={config} theme={theme} />;
    default:
      return <DefaultTemplate />;
  }
}
