
import { getActiveTemplate } from "@/lib/templates";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { TemplateConfig } from "@/types";

export default async function PostLayout({ children }: { children: React.ReactNode }) {
    const activeTemplate = await getActiveTemplate();
    
    // Even if there's no active template, we provide a basic structure.
    const headerConfig = activeTemplate ? activeTemplate : undefined;
    const theme = activeTemplate ? activeTemplate.themeMode : 'dark';

    return (
        <div>
            {headerConfig && <TechTemplate01Header config={headerConfig} themeMode={theme} />}
            <main>{children}</main>
        </div>
    );
}
