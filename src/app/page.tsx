

import { getActiveTemplate } from '@/lib/templates';
import { TechTemplate01 } from '@/components/templates/tech-01/tech-template-01';
import { TravelTemplate01 } from '@/components/templates/travel-01/travel-template-01';
import { DefaultTemplate } from '@/components/templates/tech-01/default-template';

export default async function HomePage() {
  const activeTemplate = await getActiveTemplate();

  if (!activeTemplate) {
    return <DefaultTemplate />;
  }

  switch (activeTemplate.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    case 'travel-template-01':
        return <TravelTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    default:
      return <DefaultTemplate />;
  }
}
