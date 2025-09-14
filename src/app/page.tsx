
import { getActiveTemplate } from '@/lib/templates';
import { TechTemplate01 } from '@/components/templates/tech-01/tech-template-01';
import { TravelTemplate01 } from '@/components/templates/travel-01/travel-template-01';
import { PetsTemplate01 } from '@/components/templates/pets-01/pets-template-01';
import { FoodTemplate01 } from '@/components/templates/food-01/food-template-01';
import { EducationTemplate01 } from '@/components/templates/education-01/education-template-01';
import { FinanceTemplate01 } from '@/components/templates/finance-01/finance-template-01';
import { SportsTemplate01 } from '@/components/templates/sports-01/sports-template-01';
import { PoliticsTemplate01 } from '@/components/templates/politics-01/politics-template-01';

export default async function HomePage() {
  const activeTemplate = await getActiveTemplate();

  if (!activeTemplate) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold font-headline mb-2">Default Landing Page</h1>
                <p className="text-muted-foreground">No template is currently active for this page.</p>
                <p className="text-sm text-muted-foreground mt-1">Go to <span className="font-mono bg-muted p-1 rounded-sm">Admin &gt; Template Setup</span> to activate one.</p>
            </div>
        </div>
    );
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
    case 'sports-01':
        return <SportsTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    case 'politics-01':
        return <PoliticsTemplate01 config={activeTemplate} theme={activeTemplate.themeMode} />;
    default:
       return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold font-headline mb-2">Default Landing Page</h1>
                <p className="text-muted-foreground">No template is currently active for this page.</p>
                <p className="text-sm text-muted-foreground mt-1">Go to <span className="font-mono bg-muted p-1 rounded-sm">Admin &gt; Template Setup</span> to activate one.</p>
            </div>
        </div>
    );
  }
}
