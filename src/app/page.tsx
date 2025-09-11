
import { getActiveTemplate } from '@/lib/templates';
import { TechTemplate01 } from '@/components/templates/tech-01/tech-template-01';
import { TravelTemplate01 } from '@/components/templates/travel-01/travel-template-01';
import { DefaultTemplate } from '@/components/templates/tech-01/default-template';
import { PetsTemplate01 } from '@/components/templates/pets-01/pets-template-01';
import { FoodTemplate01 } from '@/components/templates/food-01/food-template-01';
import { EducationTemplate01 } from '@/components/templates/education-01/education-template-01';
import { FinanceTemplate01 } from '@/components/templates/finance-01/finance-template-01';

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
    case 'pets-01':
        return <PetsTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    case 'food-01':
        return <FoodTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    case 'education-01':
        return <EducationTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    case 'finance-01':
        return <FinanceTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    default:
      return <DefaultTemplate />;
  }
}
