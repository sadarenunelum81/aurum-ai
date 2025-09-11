

import { getTemplateByPath } from "@/lib/templates";
import { notFound } from "next/navigation";
import { TechTemplate01 } from "@/components/templates/tech-01/tech-template-01";
import { TravelTemplate01 } from "@/components/templates/travel-01/travel-template-01";
import { DefaultTemplate } from "@/components/templates/tech-01/default-template";
import { PetsTemplate01 } from "@/components/templates/pets-01/pets-template-01";
import { FoodTemplate01 } from "@/components/templates/food-01/food-template-01";


export default async function SlugPage({ params }: { params: { slug: string } }) {
  const result = await getTemplateByPath(params.slug);

  if (!result) {
    notFound();
  }
  
  const { config, theme } = result;

  switch (config.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={config} theme={theme} />;
    case 'travel-template-01':
        return <TravelTemplate01 config={config} theme={theme} />;
    case 'pets-01':
        return <PetsTemplate01 config={config} theme={theme} />;
    case 'food-01':
        return <FoodTemplate01 config={config} theme={theme} />;
    default:
      return <DefaultTemplate />;
  }
}
