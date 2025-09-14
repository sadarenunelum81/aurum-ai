
'use client';

import { getActiveTemplate, getTemplateByPath } from "@/lib/templates";
import { useEffect, useState } from "react";
import type { TemplateConfig } from "@/types";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";


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
    const { setTheme } = useTheme();
    const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
    const [loading, setLoading] = useState(true);
    
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
            
            // 2. If no specific path template is found, fall back to the globally active template.
            if (!activeConfig) {
                activeConfig = await getActiveTemplate();
            }

            setTemplateConfig(activeConfig);
            
             if (activeConfig) {
                 const newTheme = pathTheme || activeConfig.themeMode;
                 setTheme(newTheme);
            } else {
                 // Fallback to a default theme if no template is active at all
                 setTheme('dark');
            }

            setLoading(false);
        }

        fetchTemplateData();
    }, [pathname, setTheme]);


    if (loading) {
        return null;
    }

    return (
        <>
            <AdScripts config={templateConfig} />
            {children}
        </>
    );
}
