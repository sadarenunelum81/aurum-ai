import { getTemplateByPath, getTemplateConfig } from "@/lib/templates";
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
  const templateConfig = await getTemplateByPath(params.slug);

  if (!templateConfig) {
    notFound();
  }
  
  const fullConfig = await getTemplateConfig(templateConfig.id);
  if (!fullConfig) {
    notFound();
  }

  switch (fullConfig.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={fullConfig} />;
    default:
      return <DefaultTemplate />;
  }
}
