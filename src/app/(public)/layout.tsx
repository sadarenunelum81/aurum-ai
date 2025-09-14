
'use client';

import { getActiveTemplate, getTemplateByPath } from "@/lib/templates";
import { getPageConfig } from "@/lib/pages";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import type { PageConfig, TemplateConfig } from "@/types";
import { usePathname } from "next/navigation";

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

            // 1. Check for a template with a custom path first
            if (slug) {
                const templateResult = await getTemplateByPath(slug);
                if (templateResult) {
                    activeConfig = templateResult.config;
                    pathTheme = templateResult.theme;
                }
            }
            
            // 2. If no template path, check if it's a main page (like /blog, /about)
            if (!activeConfig && slug) {
                const mainPageIds = ['blog', 'about', 'contact', 'privacy', 'terms', 'login', 'signup'];
                if (mainPageIds.includes(slug)) {
                    // For main pages, we might want a default template or a specific one
                    // Here, we load the globally active template.
                    activeConfig = await getActiveTemplate();
                }
            }
            
            // 3. If still no config and we are on the homepage, get the active template
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
