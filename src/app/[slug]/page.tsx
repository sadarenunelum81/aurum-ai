
import { getTemplateByPath } from "@/lib/templates";
import { getPageConfig } from "@/lib/pages";
import { notFound } from "next/navigation";
import { TechTemplate01 } from "@/components/templates/tech-01/tech-template-01";
import { TravelTemplate01 } from "@/components/templates/travel-01/travel-template-01";
import { DefaultTemplate } from "@/components/templates/tech-01/default-template";
import { PetsTemplate01 } from "@/components/templates/pets-01/pets-template-01";
import { FoodTemplate01 } from "@/components/templates/food-01/food-template-01";
import { EducationTemplate01 } from "@/components/templates/education-01/education-template-01";
import { FinanceTemplate01 } from "@/components/templates/finance-01/finance-template-01";
import { SportsTemplate01 } from "@/components/templates/sports-01/sports-template-01";
import { PoliticsTemplate01 } from "@/components/templates/politics-01/politics-template-01";
import { CustomPageRenderer } from "@/components/custom-page-renderer";

export default async function SlugPage({ params }: { params: { slug: string } }) {
  // First, try to find a template with a custom path
  const templateResult = await getTemplateByPath(params.slug);

  if (templateResult) {
    const { config, theme } = templateResult;
    switch (config.id) {
      case 'tech-template-01':
        return <TechTemplate01 config={config} theme={theme} />;
      case 'travel-template-01':
          return <TravelTemplate01 config={config} theme={theme} />;
      case 'pets-01':
          return <PetsTemplate01 config={config} theme={theme} />;
      case 'food-01':
          return <FoodTemplate01 config={config} theme={theme} />;
      case 'education-01':
          return <EducationTemplate01 config={config} theme={theme} />;
      case 'finance-01':
        return <FinanceTemplate01 config={config} theme={theme} />;
      case 'sports-01':
        return <SportsTemplate01 config={config} theme={theme} />;
      case 'politics-01':
        return <PoliticsTemplate01 config={config} theme={theme} />;
      default:
        return <DefaultTemplate />;
    }
  }

  // If no template is found, try to find a custom page
  const pageConfig = await getPageConfig(params.slug);
  if (pageConfig) {
      return <CustomPageRenderer config={pageConfig} />;
  }

  // If neither are found, return 404
  notFound();
}
