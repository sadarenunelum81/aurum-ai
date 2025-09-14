
'use client';

import { getActiveTemplate, getTemplateByPath } from "@/lib/templates";
import { useEffect, useState } from "react";
import type { TemplateConfig } from "@/types";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { getPageConfig } from "@/lib/pages";


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
            
            // For the homepage, always use the globally active template.
            if (pathname === '/') {
                activeConfig = await getActiveTemplate();
            }
            
            setTemplateConfig(activeConfig);
            
             // The theme is now primarily controlled by the [slug] page for custom paths.
             // This layout will only set a theme if it's the homepage with an active template,
             // or as a general fallback.
             if (activeConfig) {
                 setTheme(activeConfig.themeMode);
            } else {
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
