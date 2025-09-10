
import { getTemplateByPath, getTemplateConfig } from "@/lib/templates";
import { notFound } from "next/navigation";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { TemplateConfig } from "@/types";

// Example of how you might render different templates.
// In the future, you would import your actual template components here.
const TechTemplate01 = ({ config }: { config: TemplateConfig }) => (
    <div>
        <TechTemplate01Header config={config.header} />
        <div className="p-8"><h1>Tech Template 01 (Slug Page)</h1></div>
    </div>
);

const DefaultTemplate = () => <div className="p-8"><h1>Default Landing Page</h1><p>No template active. Set one in the admin panel.</p></div>;


export default async function SlugPage({ params }: { params: { slug: string } }) {
  const templateConfig = await getTemplateByPath(params.slug);

  if (!templateConfig) {
    notFound();
  }
  
  // Fetch the full config for the component
  const fullConfig = await getTemplateConfig(templateConfig.id);
  if (!fullConfig) {
    notFound();
  }


  // Here you would add logic to determine which template component to render
  // based on the templateConfig.id or other properties.
  switch (fullConfig.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={fullConfig} />;
    // Add cases for other templates here
    // case 'travel-template-01':
    //   return <TravelTemplate01 />;
    default:
      return <DefaultTemplate />;
  }
}
