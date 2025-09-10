import { getTemplateByPath } from "@/lib/templates";
import { notFound } from "next/navigation";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { TemplateConfig } from "@/types";


const TechTemplate01 = ({ config }: { config: TemplateConfig }) => (
    <div>
        <TechTemplate01Header config={config.header} themeMode={config.themeMode} />
        <div className="p-8"><h1>Tech Template 01 (Slug Page)</h1></div>
    </div>
);

const DefaultTemplate = () => <div className="p-8"><h1>Default Landing Page</h1><p>No template active. Set one in the admin panel.</p></div>;


export default async function SlugPage({ params }: { params: { slug: string } }) {
  const result = await getTemplateByPath(params.slug);

  if (!result) {
    notFound();
  }
  
  const { config, theme } = result;

  // Override the themeMode based on which path was accessed
  const configForPage: TemplateConfig = {
      ...config,
      themeMode: theme
  };


  switch (configForPage.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={configForPage} />;
    default:
      return <DefaultTemplate />;
  }
}
