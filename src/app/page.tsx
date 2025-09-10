

import { getActiveTemplate, getTemplateConfig } from '@/lib/templates';
import { TechTemplate01Header } from '@/components/templates/tech-01/header';
import type { TemplateConfig } from '@/types';


// Example of how you might render different templates.
// In the future, you would import your actual template components here.
const TechTemplate01 = ({ config }: { config: TemplateConfig }) => (
    <div>
        <TechTemplate01Header config={config.header} themeMode={config.themeMode} />
        <div className="p-8"><h1>Tech Template 01 (Active)</h1></div>
    </div>
);

const DefaultTemplate = () => <div className="p-8"><h1>Default Landing Page</h1><p>No template active. Go to Admin &gt; Template Setup to activate one.</p></div>;


export default async function HomePage() {
  const activeTemplate = await getActiveTemplate();

  if (!activeTemplate) {
    return <DefaultTemplate />;
  }

  // Fetch the full config to pass to the component
  const fullConfig = await getTemplateConfig(activeTemplate.id);
   if (!fullConfig) {
    return <DefaultTemplate />;
  }

  // Here you would add logic to determine which template component to render
  // based on the activeTemplate.id or other properties.
  switch (activeTemplate.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={fullConfig} />;
    // Add cases for other templates here
    // case 'travel-template-01':
    //   return <TravelTemplate01 />;
    default:
      return <DefaultTemplate />;
  }
}
