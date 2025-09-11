

import { getTemplateByPath } from "@/lib/templates";
import { notFound } from "next/navigation";
import { TechTemplate01 } from "@/components/templates/tech-01/tech-template-01";
import { DefaultTemplate } from "@/components/templates/tech-01/default-template";


export default async function SlugPage({ params }: { params: { slug: string } }) {
  const result = await getTemplateByPath(params.slug);

  if (!result) {
    notFound();
  }
  
  const { config, theme } = result;

  switch (config.id) {
    case 'tech-template-01':
      return <TechTemplate01 config={config} theme={theme} />;
    default:
      return <DefaultTemplate />;
  }
}
