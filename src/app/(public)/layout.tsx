
'use client';

import { getActiveTemplate } from "@/lib/templates";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import type { TemplateConfig } from "@/types";
import { usePathname } from "next/navigation";
import { getTemplateByPath } from "@/lib/templates";
import Head from "next/head";

// This component dynamically renders scripts into the <head>
function AdScripts({ config }: { config: TemplateConfig | null }) {
    if (config?.ads?.enableHeadScript && config.ads.headScript) {
        return (
            <Head>
                <script async dangerouslySetInnerHTML={{ __html: config.ads.headScript }} />
            </Head>
        );
    }
    return null;
}


export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [forcedTheme, setForcedTheme] = useState<'light' | 'dark' | undefined>(undefined);
    
    useEffect(() => {
        async function fetchTemplateData() {
            setLoading(true);
            let activeConfig: TemplateConfig | null = null;
            let pathTheme: 'light' | 'dark' | undefined = undefined;
            
            // Check for a custom path first. The slug will be everything after the initial '/'.
            const slug = pathname.substring(1);
            if (slug) {
                const pathResult = await getTemplateByPath(slug);
                if (pathResult) {
                    activeConfig = pathResult.config;
                    pathTheme = pathResult.theme; // 'light' or 'dark' from the path
                }
            }

            // If no custom path was matched, fall back to the globally active template for the homepage.
            if (!activeConfig && pathname === '/') {
                activeConfig = await getActiveTemplate();
            }

            setTemplateConfig(activeConfig);
            
             if (activeConfig) {
                 // The path-based theme overrides the template's default setting.
                 setForcedTheme(pathTheme || activeConfig.themeMode);
            }

            setLoading(false);
        }

        fetchTemplateData();
    }, [pathname]);


    if (loading) {
        return null; // Or a more sophisticated loading skeleton
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme={templateConfig?.themeMode || 'system'}
            enableSystem
            forcedTheme={forcedTheme}
        >
            <AdScripts config={templateConfig} />
            {children}
        </ThemeProvider>
    );
}
