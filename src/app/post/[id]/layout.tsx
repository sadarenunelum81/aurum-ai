
import { getActiveTemplate } from "@/lib/templates";
import { TechTemplate01Header } from "@/components/templates/tech-01/header";
import { TechTemplate01Footer } from "@/components/templates/tech-01/footer";
import { ThemeProvider } from "next-themes";

export default async function PostLayout({ children }: { children: React.ReactNode }) {
    const activeTemplate = await getActiveTemplate();
    
    const templateConfig = activeTemplate ? activeTemplate : undefined;
    const theme = activeTemplate ? activeTemplate.themeMode : 'dark';

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme={theme}
        >
            {templateConfig && <TechTemplate01Header config={templateConfig} themeMode={theme} />}
            <main>{children}</main>
            {templateConfig && <TechTemplate01Footer config={templateConfig} themeMode={theme} />}
        </ThemeProvider>
    );
}
