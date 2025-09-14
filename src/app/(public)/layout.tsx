
'use client';

import { getActiveTemplate } from "@/lib/templates";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import type { TemplateConfig } from "@/types";
import { usePathname } from "next/navigation";
import { getTemplateByPath } from "@/lib/templates";

// This is a server-side component for inserting scripts into the <head>
function AdScripts({ config }: { config: TemplateConfig | null }) {
    if (config?.ads?.enableHeadScript && config.ads.headScript) {
        return (
            <head>
                <script async dangerouslySetInnerHTML={{ __html: config.ads.headScript }} />
            </head>
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
            
            const slug = pathname.substring(1);
            if (slug) {
                const pathResult = await getTemplateByPath(slug);
                if (pathResult) {
                    activeConfig = pathResult.config;
                    pathTheme = pathResult.theme;
                }
            }

            if (!activeConfig && pathname === '/') {
                activeConfig = await getActiveTemplate();
            }

            setTemplateConfig(activeConfig);
            
             if (activeConfig) {
                 setForcedTheme(pathTheme || activeConfig.themeMode);
            }

            setLoading(false);
        }

        fetchTemplateData();
    }, [pathname]);


    if (loading) {
        return null;
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme={forcedTheme}
        >
            <AdScripts config={templateConfig} />
            {children}
        </ThemeProvider>
    );
}
