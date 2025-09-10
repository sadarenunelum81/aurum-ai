import { getActiveTemplate, getTemplateConfig } from '@/lib/templates';
import { TechTemplate01Header } from '@/components/templates/tech-01/header';
import type { TemplateConfig } from '@/types';

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

  const fullConfig = await getTemplateConfig(activeTemplate.id);
   if (!fullConfig) {
    return <DefaultTemplate />;
  }

  switch (activeTemplate.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={fullConfig} />;
    default:
      return <DefaultTemplate />;
  }
}
